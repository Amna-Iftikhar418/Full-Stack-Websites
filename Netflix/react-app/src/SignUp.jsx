import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css';
import "./SignUp.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function SignUp() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(false);
  const [flashMessage, setFlashMessage] = useState("");
  const [input, setInput] = useState({ email: "", password: "" });


  const getValue = (event) => {
    const { name, value } = event.target;
    setInput({ ...input, [name]: value });
  };


  const save = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input)
      });

      const data = await res.json();

      if (res.ok) {

        setFlashMessage(data.message || "Signup successful ");
        navigate("/", { state: { flash: data.message || "Signup successful!" } });

        setInput({ email: "", password: "" });
      } else {
        setFlashMessage(data.message || "Signup failed!");
        setTimeout(() => {
          setFlashMessage("");
        }, 3000);

      }
    } catch (err) {
      console.error(err);
      setFlashMessage("Something went wrong!");
    }
  };


  return (
    <div className="picture">
      <div className="signup-overlay">
        <Link style={{ textDecoration: "none" }} to="/"> <h1>NETFLIX</h1></Link>

        <div className="signUp-form">
          <h2>Sign Up</h2>


          {flashMessage && (
            <div className="alert alert-info text-center">{flashMessage}</div>
          )}

          <form onSubmit={save}>

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="floatingInput"
                placeholder="name@example.com"
                name="email"
                value={input.email}
                onChange={getValue}
              />
              <label htmlFor="floatingInput">Email address</label>
            </div>


            <div className="form-floating mb-3 position-relative">
              <input
                type={status ? "text" : "password"}
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
                onClick={() => setStatus(!status)}
              >
                {status ? (
                  <i className="fa-solid fa-eye"></i>
                ) : (
                  <i className="fa-solid fa-eye-slash"></i>
                )}
              </button>
            </div>

            <button className="signin-btn">Sign Up</button>
            <h2 style={{ textAlign: "center", color: "grey" }}>OR</h2>
            <button type="button" className="signin-code">
              Use Sign In Code
            </button>

          
            <p className="formlast-para">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
