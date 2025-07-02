import React, { useState, useEffect } from "react";
import styles from "../css/Navbar.module.css";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ isMenuOpen, toggleMenu, closeMenu }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem("authToken");
      setIsAuthenticated(!!authToken);
    };

    // Check on component mount
    checkAuth();

    // Listen for storage changes (when user logs in/out from another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case localStorage changes in same tab
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    closeMenu();
    // You might want to redirect to home or login page here
    // navigate("/login");
  };

  // Helper function to determine if a link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`${styles.navbarCustom} ${
      isScrolled ? styles.navbarScrolled : ""
    }`}>
      <div className={styles.navbarContainer}>
        {/* Brand */}
        <Link className={styles.navbarBrand} to="/">
          nextbiTe
        </Link>

        {/* Navigation Links - Left side */}
        <div className={styles.navLinks}>
          <Link 
            className={`${styles.navLink} ${
              isActiveLink("/") ? styles.active : ""
            }`} 
            to="/"
          >
            Home
          </Link>
          {/* My Orders - show only if authenticated */}
          {isAuthenticated && (
            <Link 
              className={`${styles.navLink} ${
                isActiveLink("/my-orders") ? styles.active : ""
              }`} 
              to="/my-orders"
            >
              My Orders
            </Link>
          )}
        </div>

        {/* Mobile toggle button */}
        <button
          className={styles.navbarToggler}
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className={styles.navbarTogglerIcon}></span>
        </button>

        {/* Right side buttons */}
        <div className={styles.rightSection}>
          {/* Show Login/Signup if not authenticated */}
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <button className={styles.btnSecondary}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className={styles.btnPrimary}>
                  Signup
                </button>
              </Link>
            </>
          ) : (
            /* Show Cart/Logout if authenticated */
            <>
              <Link to="/cart">
                <button className={styles.btnSecondary}>
                  My Cart
                </button>
              </Link>
              <button 
                className={styles.btnPrimary}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}>
          <Link 
            className={`${styles.mobileNavLink} ${
              isActiveLink("/") ? styles.active : ""
            }`} 
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>
          {/* My Orders - show only if authenticated */}
          {isAuthenticated && (
            <Link 
              className={`${styles.mobileNavLink} ${
                isActiveLink("/my-orders") ? styles.active : ""
              }`} 
              to="/my-orders"
              onClick={closeMenu}
            >
              My Orders
            </Link>
          )}
          
          <div className={styles.mobileButtons}>
            {/* Show Login/Signup if not authenticated */}
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <button className={styles.btnSecondary} onClick={closeMenu}>
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className={styles.btnPrimary} onClick={closeMenu}>
                    Signup
                  </button>
                </Link>
              </>
            ) : (
              /* Show Cart/Logout if authenticated */
              <>
                <Link to="/cart">
                  <button className={styles.btnSecondary} onClick={closeMenu}>
                    My Cart
                  </button>
                </Link>
                <button 
                  className={styles.btnPrimary}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;