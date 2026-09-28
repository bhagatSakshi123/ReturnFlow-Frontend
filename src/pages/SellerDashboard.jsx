import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SellerDashboard() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [disputes, setDisputes] = useState([]);

  const [message, setMessage] = useState("");
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [inspectionForm, setInspectionForm] = useState({
    condition: "GOOD",
    decision: "RESTOCK",
    remarks: ""
  });

  const [refundForm, setRefundForm] = useState({
    amount: "",
    method: "ORIGINAL_PAYMENT"
  });

  // Loading state for action buttons
  const [loadingAction, setLoadingAction] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "SELLER" && role !== "ADMIN")) {
      navigate("/login");
      return;
    }

    loadOrders();
    loadReturns();
    loadDisputes();
  }, []);

  // =========================
  // ORDERS
  // =========================

  const loadOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load orders");
    }
  };

  const markDelivered = async (id) => {
    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction(`deliver-${id}`);

      await api.put(`/orders/${id}/deliver`);

      setMessage("Order marked as delivered successfully");

      await loadOrders();

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message ||
          "Unable to mark order as delivered"
        );
      } else {
        setMessage("Unable to connect to backend");
      }
    } finally {
      setLoadingAction("");
    }
  };

  // =========================
  // RETURNS
  // =========================

  const loadReturns = async () => {
    try {
      const response = await api.get("/returns/active");
      setReturns(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load return requests");
    }
  };

  const approveReturn = async (id) => {
    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction(`approve-${id}`);

      await api.put(`/returns/${id}/approve`);

      setMessage("Return approved successfully");

      await loadReturns();

    } catch (error) {
      console.error(error);
      setMessage("Unable to approve return");
    } finally {
      setLoadingAction("");
    }
  };

  const rejectReturn = async (id) => {
    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction(`reject-${id}`);

      await api.put(
        `/returns/${id}/reject?reason=Return rejected by seller`
      );

      setMessage("Return rejected");

      await loadReturns();

    } catch (error) {
      console.error(error);
      setMessage("Unable to reject return");
    } finally {
      setLoadingAction("");
    }
  };

  const schedulePickup = async (id) => {
    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction(`pickup-${id}`);

      await api.put(`/returns/${id}/schedule-pickup`);

      setMessage("Pickup scheduled successfully");

      await loadReturns();

    } catch (error) {
      console.error(error);
      setMessage("Unable to schedule pickup");
    } finally {
      setLoadingAction("");
    }
  };

  const markReceived = async (id) => {
    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction(`received-${id}`);

      await api.put(`/returns/${id}/received`);

      setMessage("Product marked as received");

      await loadReturns();

    } catch (error) {
      console.error(error);
      setMessage("Unable to mark product as received");
    } finally {
      setLoadingAction("");
    }
  };

  // =========================
  // INSPECTION
  // =========================

  const openInspectionForm = (returnRequest) => {
    setSelectedReturn(returnRequest);

    setInspectionForm({
      condition: "GOOD",
      decision: "RESTOCK",
      remarks: ""
    });

    setMessage("");
  };

  const handleInspectionChange = (e) => {
    setInspectionForm({
      ...inspectionForm,
      [e.target.name]: e.target.value
    });
  };

  const submitInspection = async (e) => {
    e.preventDefault();

    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction("inspection");

      const inspectorId = localStorage.getItem("userId");

      await api.post("/inspections", {
        returnId: selectedReturn.id,
        inspectorId: Number(inspectorId),
        condition: inspectionForm.condition,
        decision: inspectionForm.decision,
        remarks: inspectionForm.remarks
      });

      setMessage("Inspection completed successfully");

      setSelectedReturn(null);

      await loadReturns();

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message ||
          "Unable to complete inspection"
        );
      } else {
        setMessage("Unable to connect to backend");
      }
    } finally {
      setLoadingAction("");
    }
  };

  // =========================
  // REFUND
  // =========================

  const openRefundForm = (returnRequest) => {
    setSelectedReturn(returnRequest);

    setRefundForm({
      amount: returnRequest.orderItem.price,
      method: "ORIGINAL_PAYMENT"
    });

    setMessage("");
  };

  const handleRefundChange = (e) => {
    setRefundForm({
      ...refundForm,
      [e.target.name]: e.target.value
    });
  };

  const submitRefund = async (e) => {
    e.preventDefault();

    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction("refund");

      await api.post("/refunds", {
        returnId: selectedReturn.id,
        amount: Number(refundForm.amount),
        method: refundForm.method
      });

      setMessage("Refund initiated successfully");

      setSelectedReturn(null);

      await loadReturns();

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message ||
          "Unable to initiate refund"
        );
      } else {
        setMessage("Unable to connect to backend");
      }
    } finally {
      setLoadingAction("");
    }
  };

  const completeRefund = async (returnRequest) => {
    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction(`complete-refund-${returnRequest.id}`);

      const response = await api.get(
        `/refunds/return/${returnRequest.id}`
      );

      const refund = response.data;

      await api.put(`/refunds/${refund.id}/complete`);

      setMessage("Refund completed successfully");

      await loadReturns();

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message ||
          "Unable to complete refund"
        );
      } else {
        setMessage("Unable to connect to backend");
      }
    } finally {
      setLoadingAction("");
    }
  };

  // =========================
  // DISPUTES
  // =========================

  const loadDisputes = async () => {
    try {
      const response = await api.get("/disputes");
      setDisputes(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load disputes");
    }
  };

  const updateDisputeStatus = async (id, status) => {
    if (loadingAction) {
      return;
    }

    try {
      setLoadingAction(`dispute-${id}-${status}`);

      await api.put(
        `/disputes/${id}/status?status=${status}`
      );

      setMessage(
        `Dispute status changed to ${status}`
      );

      await loadDisputes();

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          error.response.data.message ||
          "Unable to update dispute"
        );
      } else {
        setMessage("Unable to connect to backend");
      }
    } finally {
      setLoadingAction("");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <h1>ReturnFlow</h1>
          <p>Seller / Warehouse Dashboard</p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      {/* MESSAGE */}

      {message && (
        <div className="dashboard-message">
          {message}
        </div>
      )}

      {/* =========================
          ORDERS
          ========================= */}

      <section className="dashboard-section">

        <div className="section-heading">
          <h2>Customer Orders</h2>
          <span>{orders.length} Orders</span>
        </div>

        {orders.length === 0 ? (
          <div className="empty-card">
            No orders found.
          </div>
        ) : (
          <div className="card-grid">

            {orders.map((order) => (
              <div
                className="dashboard-card"
                key={order.id}
              >

                <div className="card-title-row">

                  <h3>
                    Order #{order.id}
                  </h3>

                  <span className="status-badge">
                    {order.status}
                  </span>

                </div>

                <p>
                  <strong>Customer:</strong>{" "}
                  {order.customer?.name}
                </p>

                <p>
                  <strong>Amount:</strong>{" "}
                  ₹{order.totalAmount}
                </p>

                {order.status === "PLACED" && (
                  <button
                    className="success-button"
                    disabled={loadingAction !== ""}
                    onClick={() =>
                      markDelivered(order.id)
                    }
                  >
                    {loadingAction === `deliver-${order.id}`
                      ? "Marking..."
                      : "Mark Delivered"}
                  </button>
                )}

                {order.status === "DELIVERED" && (
                  <span className="delivered-text">
                    Order delivered
                  </span>
                )}

              </div>
            ))}

          </div>
        )}

      </section>

      {/* =========================
          RETURN REQUESTS
          ========================= */}

      <section className="dashboard-section">

        <div className="section-heading">
          <h2>Return Requests</h2>
          <span>{returns.length} Active</span>
        </div>

        {returns.length === 0 ? (
          <div className="empty-card">
            No active return requests.
          </div>
        ) : (
          <div className="card-grid">

            {returns.map((returnRequest) => (
              <div
                className="dashboard-card"
                key={returnRequest.id}
              >

                <div className="card-title-row">

                  <h3>
                    Return #{returnRequest.id}
                  </h3>

                  <span className="status-badge">
                    {returnRequest.status}
                  </span>

                </div>

                <div className="return-details">

                  <p>
                    <strong>Customer:</strong>{" "}
                    {returnRequest.customer.name}
                  </p>

                  <p>
                    <strong>Product:</strong>{" "}
                    {returnRequest.orderItem.product.name}
                  </p>

                  <p>
                    <strong>Reason:</strong>{" "}
                    {returnRequest.reason}
                  </p>

                  <p>
                    <strong>Description:</strong>{" "}
                    {returnRequest.description}
                  </p>

                </div>

                <div className="action-buttons">

                  {returnRequest.status === "REQUESTED" && (
                    <>
                      <button
                        className="primary-button"
                        disabled={loadingAction !== ""}
                        onClick={() =>
                          approveReturn(returnRequest.id)
                        }
                      >
                        {loadingAction === `approve-${returnRequest.id}`
                          ? "Approving..."
                          : "Approve"}
                      </button>

                      <button
                        className="danger-button"
                        disabled={loadingAction !== ""}
                        onClick={() =>
                          rejectReturn(returnRequest.id)
                        }
                      >
                        {loadingAction === `reject-${returnRequest.id}`
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </>
                  )}

                  {returnRequest.status === "APPROVED" && (
                    <button
                      className="primary-button"
                      disabled={loadingAction !== ""}
                      onClick={() =>
                        schedulePickup(returnRequest.id)
                      }
                    >
                      {loadingAction === `pickup-${returnRequest.id}`
                        ? "Scheduling..."
                        : "Schedule Pickup"}
                    </button>
                  )}

                  {returnRequest.status === "PICKUP_SCHEDULED" && (
                    <button
                      className="primary-button"
                      disabled={loadingAction !== ""}
                      onClick={() =>
                        markReceived(returnRequest.id)
                      }
                    >
                      {loadingAction === `received-${returnRequest.id}`
                        ? "Marking..."
                        : "Mark Received"}
                    </button>
                  )}

                  {returnRequest.status === "RECEIVED" && (
                    <button
                      className="primary-button"
                      onClick={() =>
                        openInspectionForm(returnRequest)
                      }
                    >
                      Inspect Product
                    </button>
                  )}

                  {returnRequest.status === "INSPECTION_COMPLETED" && (
                    <button
                      className="primary-button"
                      onClick={() =>
                        openRefundForm(returnRequest)
                      }
                    >
                      Initiate Refund
                    </button>
                  )}

                  {returnRequest.status === "REFUND_INITIATED" && (
                    <button
                      className="success-button"
                      disabled={loadingAction !== ""}
                      onClick={() =>
                        completeRefund(returnRequest)
                      }
                    >
                      {loadingAction === `complete-refund-${returnRequest.id}`
                        ? "Completing..."
                        : "Complete Refund"}
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* =========================
          INSPECTION FORM
          ========================= */}

      {selectedReturn &&
        selectedReturn.status === "RECEIVED" && (

        <section className="form-section">

          <div className="form-card">

            <h2>Product Inspection</h2>

            <p className="muted-text">
              Return ID:{" "}
              <strong>{selectedReturn.id}</strong>
            </p>

            <p className="muted-text">
              Product:{" "}
              <strong>
                {selectedReturn.orderItem.product.name}
              </strong>
            </p>

            <form onSubmit={submitInspection}>

              <div className="form-group">

                <label>
                  Product Condition
                </label>

                <select
                  name="condition"
                  value={inspectionForm.condition}
                  onChange={handleInspectionChange}
                >
                  <option value="GOOD">Good</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="USED">Used</option>
                  <option value="DEFECTIVE">
                    Defective
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label>
                  Inspection Decision
                </label>

                <select
                  name="decision"
                  value={inspectionForm.decision}
                  onChange={handleInspectionChange}
                >
                  <option value="RESTOCK">Restock</option>
                  <option value="REPAIR">Repair</option>
                  <option value="REPLACE">Replace</option>
                  <option value="REJECT">Reject</option>
                </select>

              </div>

              <div className="form-group">

                <label>Remarks</label>

                <textarea
                  name="remarks"
                  value={inspectionForm.remarks}
                  onChange={handleInspectionChange}
                  placeholder="Enter inspection remarks"
                  required
                />

              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loadingAction !== ""}
              >
                {loadingAction === "inspection"
                  ? "Inspecting..."
                  : "Complete Inspection"}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={loadingAction !== ""}
                onClick={() =>
                  setSelectedReturn(null)
                }
              >
                Cancel
              </button>

            </form>

          </div>

        </section>
      )}

      {/* =========================
          REFUND FORM
          ========================= */}

      {selectedReturn &&
        selectedReturn.status === "INSPECTION_COMPLETED" && (

        <section className="form-section">

          <div className="form-card">

            <h2>Initiate Refund</h2>

            <p className="muted-text">
              Return ID:{" "}
              <strong>{selectedReturn.id}</strong>
            </p>

            <p className="muted-text">
              Product:{" "}
              <strong>
                {selectedReturn.orderItem.product.name}
              </strong>
            </p>

            <form onSubmit={submitRefund}>

              <div className="form-group">

                <label>
                  Refund Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={refundForm.amount}
                  onChange={handleRefundChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Refund Method
                </label>

                <select
                  name="method"
                  value={refundForm.method}
                  onChange={handleRefundChange}
                >
                  <option value="ORIGINAL_PAYMENT">
                    Original Payment
                  </option>

                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>

                  <option value="WALLET">
                    Wallet
                  </option>
                </select>

              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loadingAction !== ""}
              >
                {loadingAction === "refund"
                  ? "Initiating..."
                  : "Initiate Refund"}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={loadingAction !== ""}
                onClick={() =>
                  setSelectedReturn(null)
                }
              >
                Cancel
              </button>

            </form>

          </div>

        </section>
      )}

      {/* =========================
          CUSTOMER DISPUTES
          ========================= */}

      <section className="dashboard-section">

        <div className="section-heading">
          <h2>Customer Disputes</h2>
          <span>{disputes.length} Disputes</span>
        </div>

        {disputes.length === 0 ? (
          <div className="empty-card">
            No disputes found.
          </div>
        ) : (
          <div className="card-grid">

            {disputes.map((dispute) => (
              <div
                className="dashboard-card"
                key={dispute.id}
              >

                <div className="card-title-row">

                  <h3>
                    Dispute #{dispute.id}
                  </h3>

                  <span className="status-badge">
                    {dispute.status}
                  </span>

                </div>

                <p>
                  <strong>Customer:</strong>{" "}
                  {dispute.raisedBy?.name}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {dispute.reason}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {dispute.description}
                </p>

                <p>
                  <strong>Return ID:</strong>{" "}
                  {dispute.returnRequest?.id}
                </p>

                <div className="action-buttons">

                  {dispute.status === "OPEN" && (
                    <button
                      className="primary-button"
                      disabled={loadingAction !== ""}
                      onClick={() =>
                        updateDisputeStatus(
                          dispute.id,
                          "UNDER_REVIEW"
                        )
                      }
                    >
                      {loadingAction === `dispute-${dispute.id}-UNDER_REVIEW`
                        ? "Updating..."
                        : "Review Dispute"}
                    </button>
                  )}

                  {dispute.status === "UNDER_REVIEW" && (
                    <>
                      <button
                        className="success-button"
                        disabled={loadingAction !== ""}
                        onClick={() =>
                          updateDisputeStatus(
                            dispute.id,
                            "RESOLVED"
                          )
                        }
                      >
                        {loadingAction === `dispute-${dispute.id}-RESOLVED`
                          ? "Updating..."
                          : "Resolve"}
                      </button>

                      <button
                        className="danger-button"
                        disabled={loadingAction !== ""}
                        onClick={() =>
                          updateDisputeStatus(
                            dispute.id,
                            "REJECTED"
                          )
                        }
                      >
                        {loadingAction === `dispute-${dispute.id}-REJECTED`
                          ? "Updating..."
                          : "Reject"}
                      </button>
                    </>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default SellerDashboard;