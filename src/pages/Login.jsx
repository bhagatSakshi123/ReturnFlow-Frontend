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

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password
      });

      const data = response.data;

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user role
      localStorage.setItem("role", data.role);

      // Save user ID
      localStorage.setItem("userId", data.userId);

      setMessage("Login successful!");

      // Redirect according to role
      if (data.role === "CUSTOMER") {
        navigate("/customer");
      } else if (data.role === "SELLER") {
        navigate("/seller");
      } else if (data.role === "ADMIN") {
        navigate("/admin");
      }

    } catch (error) {
      if (error.response) {
        setMessage("Invalid email or password");
      } else {
        setMessage("Backend server is not running");
      }
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1 className="logo">
          ReturnFlow
        </h1>

        <p className="auth-subtitle">
          Smart Return & Refund Management
        </p>

        <h2>Login</h2>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            Login
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="register-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>

      </div>

    </div>
  );
}

export default Login;