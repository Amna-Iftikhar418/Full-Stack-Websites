import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./SignIn.css";

export default function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [flashMessage, setFlashMessage] = useState("");
  const [input, setInput] = useState({ email: "", password: "" });

  const getValue = (event) => {
    const { name, value } = event.target;
    setInput({ ...input, [name]: value });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input)
      });

      const data = await res.json();

      if (res.ok) {
        setFlashMessage(data.message);
        setInput({ email: "", password: "" });
        setTimeout(() => navigate("/"), 1500);
      } else {
        setFlashMessage(data.message || "Login failed!");
        setTimeout(() => setFlashMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setFlashMessage("Something went wrong!");
    }
  };

  return (
    <div className="picture">
      <div className="signin-overlay">
        <Link style={{ textDecoration: "none" }} to="/"> <h1>NETFLIX</h1></Link>

        <div className="signIn-form">
          <h2>Sign In</h2>

          {flashMessage && (
            <div className="alert alert-info text-center">{flashMessage}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                placeholder="name@example.com"
                name="email"
                value={input.email}
                onChange={getValue}
              />
              <label htmlFor="floatingEmail">Email address</label>
            </div>

            <div className="form-floating mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="floatingPassword"
                placeholder="Password"
                name="password"
                value={input.password}
                onChange={getValue}
                style={{ color: "white" }}
              />
              <label htmlFor="floatingPassword">Password</label>

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-solid fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </button>
            </div>

            <button className="signin-btn">Sign In</button>

            <p className="signup-link-text">
              New to Netflix? <Link to="/signup" style={{ color: "white", textDecoration: "none" }}>Sign up now</Link>.
            </p>

            <p className="formlast-para">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
