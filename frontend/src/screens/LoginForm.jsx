import React, { useState, useEffect } from "react";
import styles from "./LoginForm.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  let navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Simple click outside handler
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // If menu is open and clicked element doesn't have navbar-related classes
      if (isMenuOpen && !event.target.closest("nav")) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      // Small delay to prevent immediate closing when opening
      setTimeout(() => {
        document.addEventListener("click", handleDocumentClick);
      }, 100);
    }

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isMenuOpen]);

  // Real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) {
          return "Email is required";
        }
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        return "";

      case "password":
        if (!value) {
          return "Password is required";
        }
        if (value.length < 8) {
          return "Password must be at least 6 characters long";
        }
        return "";

      default:
        return "";
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Mark all fields as touched
  setTouched({
    email: true,
    password: true,
  });

  // Validate form
  const formErrors = validateForm();
  setErrors(formErrors);

  // If no errors, proceed with submission
  if (Object.keys(formErrors).length === 0) {
    setIsLoading(true);

    try {
      // Prepare credentials object matching your API structure
      const credentials = {
        email: formData.email,
        password: formData.password,
      };

      // Make actual API call
      const response = await fetch("http://localhost:5000/api/loginuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const json = await response.json();
      if (json.success) {
        alert("Login successful!");
        
        // Reset form on success
        setFormData({
          email: "",
          password: "",
        });
        setTouched({});
        setErrors({});

        
        localStorage.setItem('userEmail',formData.email)
        localStorage.setItem('authToken', json.authToken)
        navigate('/')

      } else {
        // Handle login failure
        if (json.errors) {
          // If API returns field-specific errors
          const apiErrors = {};
          json.errors.forEach(error => {
            apiErrors[error.field] = error.msg;
          });
          setErrors(prev => ({ ...prev, ...apiErrors }));
        } else {
          // Generic error message
          setErrors({ 
            submit: json.message || "Invalid email or password. Please try again." 
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({ 
          submit: "Unable to connect to server. Please check your connection and try again." 
        });
      } else {
        setErrors({ submit: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  }
};
 

  return (
    <div>
      <Navbar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />

      <div className={styles.container}>
        {/* Dark overlay */}
        <div className={styles.overlay}></div>

        {/* Food elements positioned around */}
        <div className={`${styles.foodElement} ${styles.foodElement1}`}>
          <div className={`${styles.foodImage} ${styles.foodImage1}`}></div>
        </div>
        <div className={`${styles.foodElement} ${styles.foodElement2}`}>
          <div className={`${styles.foodImage} ${styles.foodImage2}`}></div>
        </div>
        <div className={`${styles.foodElement} ${styles.foodElement3}`}>
          <div className={`${styles.foodImage} ${styles.foodImage3}`}></div>
        </div>

        {/* Main content */}
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <h1 className={styles.title}>Welcome Back!</h1>
              <p className={styles.subtitle}>
                Sign in to your NextbiTe account
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formFields}>
              {/* Email Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={`${styles.input} ${
                    errors.email ? styles.inputError : ""
                  } ${isLoading ? styles.inputDisabled : ""}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className={styles.errorMessage}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    className={`${styles.input} ${styles.passwordInput} ${
                      errors.password ? styles.inputError : ""
                    } ${isLoading ? styles.inputDisabled : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg
                        className={styles.eyeIcon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className={styles.eyeIcon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={styles.errorMessage}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className={styles.rememberForgot}>
                <label className={styles.rememberLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    disabled={isLoading}
                  />
                  <span className={styles.checkboxLabel}>Remember me</span>
                </label>
                <a href="#" className={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className={styles.submitError}>
                  <p className={styles.submitErrorText}>
                    <span className={styles.submitErrorIcon}>❌</span>
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`${styles.submitButton} ${
                  isLoading ? styles.submitButtonDisabled : ""
                }`}
              >
                {isLoading ? (
                  <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* New User Link */}
              <div className={styles.newUserSection}>
                <span className={styles.newUserText}>
                  Don't have an account?{" "}
                </span>
                <Link to="/signup">
                <button
                  type="button"
                  className={styles.createAccountButton}
                  disabled={isLoading}
                >
                  Create Account
                </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginForm;
