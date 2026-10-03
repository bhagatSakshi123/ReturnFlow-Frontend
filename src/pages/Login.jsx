import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);

      if (data.role === "CUSTOMER") navigate("/customer");
      else if (data.role === "SELLER") navigate("/seller");
      else if (data.role === "ADMIN") navigate("/admin");
    } catch (error) {
      if (error.response) setMessage("Invalid email or password");
      else setMessage("Backend server is not running");
    }
  };

  return (
    <div className="auth-page auth-login-page">
      <div className="auth-top-brand">
        <span className="brand-mark">R</span>
        <strong>ReturnFlow</strong>
      </div>

      <div className="auth-login-card">
        <section className="auth-login-intro">
          <span className="eyebrow">RETURN MANAGEMENT</span>
          <h1>Everything about your return, in one place.</h1>
          <p>
            Shop, track orders, request returns and follow refunds without the clutter.
          </p>
          <div className="intro-points">
            <span>✓ Easy return requests</span>
            <span>✓ Live return status</span>
            <span>✓ Clear refund tracking</span>
          </div>
        </section>

        <section className="auth-login-form-panel">
          <div className="auth-heading">
            <span className="auth-kicker">WELCOME BACK</span>
            <h2>Sign in</h2>
            <p>Use your ReturnFlow account to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="primary-button auth-submit">
              Sign in <span>→</span>
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}

          <p className="register-text">
            New to ReturnFlow?{" "}
            <button type="button" className="link-button" onClick={() => navigate("/register")}>
              Create an account
            </button>
          </p>
        </section>
      </div>

      <p className="auth-footer">Secure return & refund management</p>
    </div>
  );
}

export default Login;
