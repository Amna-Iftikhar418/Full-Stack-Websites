import 'bootstrap/dist/css/bootstrap.min.css';
import faq from "./Data/Faq"
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"
import "./FAQ.css"
export default function FAQ() {
  const location = useLocation();

  let [flashMessage, setFlashMessage] = useState(location.state?.flash || "")
  let [isLoggedIn, setIsLoggedIn] = useState(false)
  const [state, setState] = useState(null)

  const toggle = (id) => {
    if (state == id) {
      setState(null)
    }
    else {
      setState(id)
    }
  }

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
  }, [])
  return (
    <div className="faq-box">
      <h2>Frequently Ask Questions</h2>
      {faq.map((value, i) => {
        return (
          <div className="faq-content" key={i}>
            <h4 onClick={() => toggle(i)}>{value.question} <span>{state === i ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-plus"></i>}</span> </h4>
            <p className={`hide ${state === i ? "show" : "hide"}`}>{value.answer}</p>
          </div>
        )
      })}

      <p className='faq-para'>Ready to watch? Enter your email to create or restart your membership.</p>
      {!isLoggedIn ? (
        <Link to="/signin" style={{ display: "flex", justifyContent: "center" }}>
          <button className='btn btn-danger'>
            <i className="fa-solid fa-right-to-bracket" style={{ marginRight: "8px" }}></i>
            Sign In
          </button>
        </Link>
      ) : (
        <button onClick={handleLogout} className="btn btn-danger text-white">
          Logout
        </button>
      )}

    </div>
  )
}
