import React from "react";
import Home from "./screens/Home";
import LoginForm from "./screens/LoginForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupForm from "./screens/SignupForm";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<LoginForm />} />
          <Route exact path="/signup" element={<SignupForm />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
