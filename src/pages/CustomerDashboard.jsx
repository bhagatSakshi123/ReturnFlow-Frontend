import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);

  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  const [returnReason, setReturnReason] = useState("DAMAGED");
  const [returnDescription, setReturnDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const [disputeReturnId, setDisputeReturnId] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Loading states
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReturns, setLoadingReturns] = useState(false);

  const [buyingProductId, setBuyingProductId] = useState(null);
  const [loadingReturnForm, setLoadingReturnForm] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  useEffect(() => {
    if (!token || role !== "CUSTOMER") {
      navigate("/login");
      return;
    }

    loadProducts();
    loadOrders();
    loadReturns();
  }, [token, role, navigate]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setError("");

      const response = await api.get("/products");
      setProducts(response.data);
    } catch (err) {
      setError("Unable to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);

      const response = await api.get("/orders");
      const customerOrders = response.data.filter(
        (order) => String(order.customer?.id) === String(userId)
      );

      setOrders(customerOrders);
    } catch (err) {
      setError("Unable to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadReturns = async () => {
    try {
      setLoadingReturns(true);

      const response = await api.get("/returns/customer");
      setReturns(response.data);
    } catch (err) {
      setError("Unable to load returns.");
    } finally {
      setLoadingReturns(false);
    }
  };

  const buyProduct = async (product) => {
    if (buyingProductId !== null) {
      return;
    }

    try {
      setBuyingProductId(product.id);
      setMessage("");
      setError("");

      const orderResponse = await api.post("/orders", {
        customer: {
          id: Number(userId)
        },
        orderDate: new Date().toISOString(),
        totalAmount: product.price,
        status: "PLACED"
      });

      const orderId = orderResponse.data.id;

      await api.post("/order-items", {
        order: {
          id: orderId
        },
        product: {
          id: product.id
        },
        quantity: 1,
        price: product.price
      });

      setMessage(
        `Order #${orderId} placed successfully.`
      );

      await loadOrders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to place the order."
      );
    } finally {
      setBuyingProductId(null);
    }
  };

  const openReturnForm = async (order) => {
    if (loadingReturnForm) {
      return;
    }

    try {
      setLoadingReturnForm(true);
      setMessage("");
      setError("");

      const response = await api.get(
        `/order-items/order/${order.id}`
      );

      if (!response.data || response.data.length === 0) {
        setError("No order item found for this order.");
        return;
      }

      setSelectedOrderItem(response.data[0]);

      setReturnReason("DAMAGED");
      setReturnDescription("");
      setEvidenceUrl("");
    } catch (err) {
      setError("Unable to open return form.");
    } finally {
      setLoadingReturnForm(false);
    }
  };

  const submitReturn = async (event) => {
    event.preventDefault();

    if (submittingReturn) {
      return;
    }

    if (!selectedOrderItem) {
      setError("Please select an order first.");
      return;
    }

    try {
      setSubmittingReturn(true);
      setMessage("");
      setError("");

      await api.post("/returns", {
        orderItemId: selectedOrderItem.id,
        reason: returnReason,
        description: returnDescription,
        evidenceUrl: evidenceUrl
      });

      setMessage("Return request submitted successfully.");

      setSelectedOrderItem(null);
      setReturnDescription("");
      setEvidenceUrl("");

      await loadReturns();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit return request."
      );
    } finally {
      setSubmittingReturn(false);
    }
  };

  const openDisputeForm = (returnId) => {
    setDisputeReturnId(returnId);
    setDisputeReason("");
    setDisputeDescription("");
    setMessage("");
    setError("");
  };

  const submitDispute = async (event) => {
    event.preventDefault();

    if (submittingDispute) {
      return;
    }

    if (!disputeReturnId) {
      setError("Invalid return selected.");
      return;
    }

    try {
      setSubmittingDispute(true);
      setMessage("");
      setError("");

      await api.post("/disputes", {
        returnRequest: {
          id: disputeReturnId
        },
        raisedBy: {
          id: Number(userId)
        },
        reason: disputeReason,
        description: disputeDescription
      });

      setMessage("Dispute submitted successfully.");

      setDisputeReturnId(null);
      setDisputeReason("");
      setDisputeDescription("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit dispute."
      );
    } finally {
      setSubmittingDispute(false);
    }
  };

  const getReturnSteps = (status) => {
  const steps = [
    { key: "REQUESTED", label: "Return Requested" },
    { key: "APPROVED", label: "Approved" },
    { key: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
    { key: "RECEIVED", label: "Product Received" },
    { key: "INSPECTION_COMPLETED", label: "Inspection Completed" },
    { key: "REFUND_INITIATED", label: "Refund Initiated" },
    { key: "REFUNDED", label: "Refund Completed" }
  ];

  const statusIndex = steps.findIndex(
    (step) => step.key === status
  );

  return steps.map((step, index) => ({
    ...step,
    completed: statusIndex >= index
  }));
};

const hasReturnForOrder = (orderId) => {
  return returns.some(
    (returnRequest) =>
      returnRequest.orderItem?.order?.id === orderId
  );
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">R</span>
          <div><strong>ReturnFlow</strong><small>Customer</small></div>
        </div>
        <nav className="sidebar-nav">
              <a href="#products" className="sidebar-nav-item active"><span className="sidebar-dot">⌂</span>Overview</a>
              <a href="#products" className="sidebar-nav-item"><span className="sidebar-dot">▦</span>Products</a>
              <a href="#orders" className="sidebar-nav-item"><span className="sidebar-dot">▣</span>Orders</a>
              <a href="#returns" className="sidebar-nav-item"><span className="sidebar-dot">↩</span>My Returns</a>
              <a href="#disputes" className="sidebar-nav-item"><span className="sidebar-dot">!</span>Disputes</a>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-status"><span></span><div><strong>System online</strong><small>All services operational</small></div></div>
        </div>
      </aside>
      <div className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>ReturnFlow</h1>
          <p>Customer Dashboard</p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <main>

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        {error && (
          <div className="dashboard-message error-text">
            {error}
          </div>
        )}

        {/* PRODUCTS */}

        <section id="products" className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>Available Products</h2>
              <p>Browse products and place an order.</p>
            </div>
          </div>

          {loadingProducts ? (
            <div className="empty-card">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="empty-card">
              No products available.
            </div>
          ) : (
            <div className="card-grid">

              {products.map((product) => (
                <div
                  className="dashboard-card product-card"
                  key={product.id}
                >

                  <div className="product-icon">
                    🛍️
                  </div>

                  <h3>{product.name}</h3>

                  <p className="muted-text">
                    {product.description}
                  </p>

                  <h3>₹{product.price}</h3>

                  <p className="muted-text">
                    Return window: {product.returnWindowDays} days
                  </p>

                  <button
                    className="card-button primary-button"
                    disabled={buyingProductId === product.id}
                    onClick={() => buyProduct(product)}
                  >
                    {buyingProductId === product.id
                      ? "Processing..."
                      : "Buy Now"}
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>


        {/* ORDERS */}

        <section id="orders" className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>My Orders</h2>
              <p>Track your purchased products.</p>
            </div>
          </div>

          {loadingOrders ? (
            <div className="empty-card">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-card">
              You have not placed any orders yet.
            </div>
          ) : (
            <div className="card-grid">

              {orders.map((order) => (

                <div
                  className="dashboard-card"
                  key={order.id}
                >

                  <div className="card-title-row">
                    <h3>Order #{order.id}</h3>

                    <span
                      className={`status-badge ${
                        order.status === "DELIVERED"
                          ? "success"
                          : ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p>
                    Amount: ₹{order.totalAmount}
                  </p>

                  <p className="muted-text">
                    Order Date:{" "}
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleString()
                      : "N/A"}
                  </p>

                  {order.deliveryDate && (
                    <p className="muted-text">
                      Delivered:{" "}
                      {new Date(
                        order.deliveryDate
                      ).toLocaleString()}
                    </p>
                  )}

                  {order.status === "DELIVERED" &&
  !hasReturnForOrder(order.id) && (

    <button
      className="card-button secondary-button"
      disabled={loadingReturnForm}
      onClick={() => openReturnForm(order)}
    >
      {loadingReturnForm
        ? "Loading..."
        : "Request Return"}
    </button>

  )}
    {order.status === "DELIVERED" &&
  hasReturnForOrder(order.id) && (
    <p className="delivered-text">
      Return request already submitted.
    </p>
  )}

                </div>

              ))}

            </div>
          )}

        </section>


        {/* RETURN FORM */}

        {selectedOrderItem && (

          <section id="request-return" className="dashboard-section">

            <div className="section-heading">
              <div>
                <h2>Request a Return</h2>
                <p>
                  Submit a return request for Order Item #
                  {selectedOrderItem.id}
                </p>
              </div>
            </div>

            <form
              className="form-card"
              onSubmit={submitReturn}
            >

              <div className="form-section">

                <label>Return Reason</label>

                <select
                  value={returnReason}
                  onChange={(e) =>
                    setReturnReason(e.target.value)
                  }
                  disabled={submittingReturn}
                >
                  <option value="DAMAGED">
                    Damaged
                  </option>

                  <option value="WRONG_PRODUCT">
                    Wrong Product
                  </option>

                  <option value="POOR_QUALITY">
                    Poor Quality
                  </option>

                  <option value="DID_NOT_LIKE">
                    Did Not Like
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>

              </div>


              <div className="form-section">

                <label>Description</label>

                <textarea
                  value={returnDescription}
                  onChange={(e) =>
                    setReturnDescription(e.target.value)
                  }
                  placeholder="Explain why you want to return the product..."
                  rows="4"
                  disabled={submittingReturn}
                />

              </div>


              <div className="form-section">

                <label>Evidence URL</label>

                <input
                  type="text"
                  value={evidenceUrl}
                  onChange={(e) =>
                    setEvidenceUrl(e.target.value)
                  }
                  placeholder="Optional image/evidence URL"
                  disabled={submittingReturn}
                />

              </div>


              <div className="action-buttons">

                <button
                  type="submit"
                  className="card-button primary-button"
                  disabled={submittingReturn}
                >
                  {submittingReturn
                    ? "Submitting..."
                    : "Submit Return"}
                </button>

                <button
                  type="button"
                  className="card-button secondary-button"
                  disabled={submittingReturn}
                  onClick={() => setSelectedOrderItem(null)}
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>

        )}


        {/* RETURNS */}

        {/* RETURNS */}

<section id="returns" className="dashboard-section">

  <div className="section-heading">
    <div>
      <h2>My Returns</h2>
      <p>Track your return and refund status.</p>
    </div>
  </div>

  {loadingReturns ? (
    <div className="empty-card">
      Loading returns...
    </div>
  ) : returns.length === 0 ? (
    <div className="empty-card">
      No return requests yet.
    </div>
  ) : (
    <div className="card-grid">

      {returns.map((returnRequest) => {

        const steps = getReturnSteps(
          returnRequest.status
        );

        return (
          <div
            className="dashboard-card"
            key={returnRequest.id}
          >

            <div className="card-title-row">

              <h3>
                Return #{returnRequest.id}
              </h3>

              <span
                className={`status-badge ${
                  returnRequest.status === "REFUNDED"
                    ? "success"
                    : returnRequest.status === "REJECTED"
                    ? "danger"
                    : ""
                }`}
              >
                {returnRequest.status}
              </span>

            </div>

            <p>
              Reason: {returnRequest.reason}
            </p>

            <p className="muted-text">
              {returnRequest.description}
            </p>


            {/* RETURN TRACKING */}

            <div className="return-tracking">

              <h4>Return Tracking</h4>

              {returnRequest.status === "REJECTED" ? (

                <div className="tracking-rejected">
                  <span>✕</span>
                  <div>
                    <strong>Return Rejected</strong>

                    {returnRequest.rejectionReason && (
                      <p>
                        {returnRequest.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

              ) : (

                <div className="tracking-list">

                  {steps.map((step) => (

                    <div
                      className={`tracking-step ${
                        step.completed
                          ? "completed"
                          : ""
                      }`}
                      key={step.key}
                    >

                      <div className="tracking-icon">
                        {step.completed ? "✓" : "○"}
                      </div>

                      <span>
                        {step.label}
                      </span>

                    </div>

                  ))}

                </div>

              )}

            </div>


            {/* DISPUTE */}

            {returnRequest.status === "REFUNDED" && (
              <button
                className="card-button secondary-button"
                onClick={() =>
                  openDisputeForm(returnRequest.id)
                }
              >
                Raise Dispute
              </button>
            )}

          </div>
        );

      })}

    </div>
  )}

</section>


        {/* DISPUTE FORM */}

        {disputeReturnId && (

          <section id="disputes" className="dashboard-section">

            <div className="section-heading">
              <div>
                <h2>Raise Dispute</h2>
                <p>
                  Dispute for Return #{disputeReturnId}
                </p>
              </div>
            </div>

            <form
              className="form-card"
              onSubmit={submitDispute}
            >

              <div className="form-section">

                <label>Reason</label>

                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) =>
                    setDisputeReason(e.target.value)
                  }
                  placeholder="Enter dispute reason"
                  required
                  disabled={submittingDispute}
                />

              </div>


              <div className="form-section">

                <label>Description</label>

                <textarea
                  value={disputeDescription}
                  onChange={(e) =>
                    setDisputeDescription(e.target.value)
                  }
                  placeholder="Explain your dispute..."
                  rows="4"
                  required
                  disabled={submittingDispute}
                />

              </div>


              <div className="action-buttons">

                <button
                  type="submit"
                  className="card-button primary-button"
                  disabled={submittingDispute}
                >
                  {submittingDispute
                    ? "Submitting..."
                    : "Submit Dispute"}
                </button>

                <button
                  type="button"
                  className="card-button secondary-button"
                  disabled={submittingDispute}
                  onClick={() => setDisputeReturnId(null)}
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>

        )}

      </main>

      </div>
    </div>
  );
}

export default CustomerDashboard;