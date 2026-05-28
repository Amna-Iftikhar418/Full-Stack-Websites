
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Home from "./Home"
import Carousel from "./Carousel"
import Frame from "./Frame"
import FAQ from "./FAQ"
import SignUp from "./SignUp"
import SignIn from "./SignIn"
import Footer from "./Footer"

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Carousel />
              <Frame />
              <FAQ />
              <Footer />
            </>
          }
        />


        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  )
}

export default App
