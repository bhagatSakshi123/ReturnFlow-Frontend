import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "CUSTOMER"
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/auth/register", formData);
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      navigate("/customer");
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || "Registration failed");
      } else {
        setMessage("Backend server is not running");
      }
    }
  };

  return (
    <div className="auth-page auth-register-page">
      <div className="auth-register-card">
        <section className="register-side">
          <div className="brand-lockup">
            <span className="brand-mark">R</span>
            <span>ReturnFlow</span>
          </div>

          <div className="register-side-copy">
            <span className="eyebrow">JOIN RETURNFLOW</span>
            <h1>A simpler way to handle shopping returns.</h1>
            <p>
              Create your customer account and keep your purchases, return requests and refunds together.
            </p>
          </div>

          <div className="register-benefits">
            <div><strong>01</strong><span>Buy & track orders</span></div>
            <div><strong>02</strong><span>Request returns easily</span></div>
            <div><strong>03</strong><span>Follow your refund</span></div>
          </div>
        </section>

        <section className="register-form-panel">
          <div className="register-form-top">
            <div>
              <span className="auth-kicker">CREATE ACCOUNT</span>
              <h2>Let's get started</h2>
              <p>Enter your details to create your customer account.</p>
            </div>
            <button type="button" className="back-link" onClick={() => navigate("/login")}>
              ← Sign in
            </button>
          </div>

          <form onSubmit={handleRegister} className="auth-form register-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
              </div>
            </div>

            <div className="form-group">
              <label>Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" autoComplete="new-password" required />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input name="address" value={formData.address} onChange={handleChange} placeholder="Your address" />
            </div>

            <button type="submit" className="primary-button auth-submit">
              Create account <span>→</span>
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}
        </section>
      </div>

      <p className="auth-footer">Your account stays protected with ReturnFlow authentication</p>
    </div>
  );
}

export default Register;
