import React, { useState, useEffect } from "react";
import styles from "../css/Navbar.module.css";
import { Link } from "react-router-dom";

const Navbar = ({ isMenuOpen, toggleMenu, closeMenu }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to add/remove scrolled class
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg ${styles.navbarCustom} ${
      isScrolled ? styles.navbarScrolled : ""
    } position-fixed`}>
      <div className="container">
        {/* Brand */}
        <Link className={`navbar-brand ${styles.navbarBrand}`} to="/">
          NextbiTe
        </Link>

        {/* Home Navigation - moved to left side */}
        <div className="d-none d-lg-block">
          <Link className={`nav-link ${styles.navLink}`} to="/">
            Home
          </Link>
        </div>

        {/* Mobile toggle button */}
        <button
          className={`navbar-toggler ${styles.navbarToggler}`}
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className={`navbar-toggler-icon ${styles.navbarTogglerIcon}`}></span>
        </button>

        {/* Navigation items for mobile */}
        <div
          className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          id="navbarNav"
        >
          {/* Mobile Home Link */}
          <ul className={`navbar-nav d-lg-none ${styles.navbarNav}`}>
            <li className="nav-item">
              <Link 
                className={`nav-link ${styles.navLink}`} 
                to="/"
                onClick={closeMenu} // Close menu when link is clicked
              >
                Home
              </Link>
            </li>
          </ul>

          {/* Right side buttons */}
          <div className={`d-flex align-items-center flex-column flex-lg-row ms-auto ${styles.rightSection}`}>
            <i className={`bi bi-search ${styles.searchIcon}`}></i>
            <Link to="/login" className="w-100 w-lg-auto mb-2 mb-lg-0">
              <button 
                className={`btn ${styles.btnOrder} w-100`}
                onClick={closeMenu} // Close menu when button is clicked
              >
                Login
              </button>
            </Link>
             <Link to="/signup"  className="w-100 w-lg-auto mb-2 mb-lg-0">
            <button 
              className={`btn ${styles.btnOrder} w-100`}
              onClick={closeMenu} // Close menu when button is clicked
            >
              Signup
            </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;