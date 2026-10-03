import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadUsers();
    loadProducts();
    loadDisputes();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load users");
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load products");
    }
  };

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
    try {
      await api.put(
        `/disputes/${id}/status?status=${status}`
      );

      setMessage("Dispute status updated successfully");
      loadDisputes();

    } catch (error) {
      console.error(error);
      setMessage("Unable to update dispute status");
    }
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
          <div><strong>ReturnFlow</strong><small>Admin</small></div>
        </div>
        <nav className="sidebar-nav">
              <a href="#overview" className="sidebar-nav-item active"><span className="sidebar-dot">⌂</span>Overview</a>
              <a href="#users" className="sidebar-nav-item"><span className="sidebar-dot">♙</span>Users</a>
              <a href="#products" className="sidebar-nav-item"><span className="sidebar-dot">▦</span>Products</a>
              <a href="#disputes" className="sidebar-nav-item"><span className="sidebar-dot">!</span>Disputes</a>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-status"><span></span><div><strong>System online</strong><small>All services operational</small></div></div>
        </div>
      </aside>
      <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <h1>ReturnFlow</h1>
          <p>Admin Dashboard</p>
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

      {/* SUMMARY */}

      <section id="overview" className="dashboard-section">

        <div className="section-heading">
          <h2>Overview</h2>
        </div>

        <div className="card-grid">

          <div className="dashboard-card admin-stat-card">
            <div className="admin-stat-icon">
              👥
            </div>

            <div>
              <p>Total Users</p>
              <h2>{users.length}</h2>
            </div>
          </div>

          <div className="dashboard-card admin-stat-card">
            <div className="admin-stat-icon">
              📦
            </div>

            <div>
              <p>Total Products</p>
              <h2>{products.length}</h2>
            </div>
          </div>

          <div className="dashboard-card admin-stat-card">
            <div className="admin-stat-icon">
              ⚠️
            </div>

            <div>
              <p>Total Disputes</p>
              <h2>{disputes.length}</h2>
            </div>
          </div>

        </div>

      </section>

      {/* USERS */}

      <section id="users" className="dashboard-section">

        <div className="section-heading">
          <h2>Users</h2>
          <span>{users.length} Users</span>
        </div>

        {users.length === 0 ? (
          <div className="empty-card">
            No users found.
          </div>
        ) : (
          <div className="card-grid">

            {users.map((user) => (
              <div
                className="dashboard-card"
                key={user.id}
              >

                <div className="card-title-row">

                  <h3>{user.name}</h3>

                  <span className="status-badge">
                    {user.role}
                  </span>

                </div>

                <p>
                  <strong>ID:</strong> {user.id}
                </p>

                <p>
                  <strong>Email:</strong> {user.email}
                </p>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* PRODUCTS */}

      <section id="products" className="dashboard-section">

        <div className="section-heading">
          <h2>Products</h2>
          <span>{products.length} Products</span>
        </div>

        {products.length === 0 ? (
          <div className="empty-card">
            No products found.
          </div>
        ) : (
          <div className="card-grid">

            {products.map((product) => (
              <div
                className="product-card"
                key={product.id}
              >

                <div className="product-icon">
                  📦
                </div>

                <h3>{product.name}</h3>

                <h3>
                  ₹{product.price}
                </h3>

                <span
                  className={
                    product.returnable
                      ? "status-badge success"
                      : "status-badge danger"
                  }
                >
                  {product.returnable
                    ? "Returnable"
                    : "Non-returnable"}
                </span>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* DISPUTES */}

      <section id="disputes" className="dashboard-section">

        <div className="section-heading">
          <h2>Disputes</h2>
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
                  <strong>Reason:</strong>{" "}
                  {dispute.reason}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {dispute.description}
                </p>

                <div className="action-buttons">

                  {dispute.status === "OPEN" && (
                    <button
                      className="primary-button"
                      onClick={() =>
                        updateDisputeStatus(
                          dispute.id,
                          "UNDER_REVIEW"
                        )
                      }
                    >
                      Start Review
                    </button>
                  )}

                  {dispute.status === "UNDER_REVIEW" && (
                    <>
                      <button
                        className="success-button"
                        onClick={() =>
                          updateDisputeStatus(
                            dispute.id,
                            "RESOLVED"
                          )
                        }
                      >
                        Resolve
                      </button>

                      <button
                        className="danger-button"
                        onClick={() =>
                          updateDisputeStatus(
                            dispute.id,
                            "REJECTED"
                          )
                        }
                      >
                        Reject
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
    </div>
  );
}

export default AdminDashboard;