import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import "./Home.css"
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const location = useLocation();
  let [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const [flashMessage, setFlashMessage] = useState(location.state?.flash || "");



  let [inputValue, setinputValue] = useState({
    email: ""
  })
  let setValue = (event) => {
    let { name, value } = event.target;
    setinputValue({ ...inputValue, [name]: value })
  }

  let getLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputValue.email })
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        setFlashMessage(data.message);
        setIsLoggedIn(true);
      } else {
        setFlashMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setFlashMessage("Server error, try again later.");
    }
  };


  let handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        setFlashMessage("Successfully logged out!");
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    async function checkSession() {
      const res = await fetch("http://localhost:5000/check-session", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (data.loggedIn) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
    checkSession();
  }, []);

  return (
    <>
      <div className="homepage">


        <div className="homepage-content">
          {flashMessage && (
            <div className="alert alert-success alert-dismissible fade show text-center">
              {flashMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setFlashMessage("")}>
              </button>
            </div>
          )}
          <div className="navbar">
            <h1>NETFLIX</h1>
            <button><Link to="/signin" style={{ textDecoration: "none", color: "white" }}>Sign In</Link></button>
          </div>
          <div className="hero-content">
            <h1>Unlimited movies, TV shows, and more</h1>
            <h4>Starts at Rs 250. Cancel anytime.</h4>
            <p>Ready to watch? Enter your email to create or restart your membership.</p>

            {!isLoggedIn ? (
              <form onSubmit={(e) => { e.preventDefault(); navigate("/signin"); }}>
                <div className="form-floating mb-3 form-btn">
                  <input
                    type="email"
                    name='email'
                    className="form-control"
                    value={inputValue.email}
                    id="floatingInput"
                    placeholder="name@example.com"
                    onChange={setValue}
                  />
                  <label htmlFor="floatingInput">Email address</label>
                  <button type="submit" className='btn btn-danger'>Get Started</button>

                </div>

              </form>) : (
              <button onClick={handleLogout} className="btn btn-danger text-white">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
