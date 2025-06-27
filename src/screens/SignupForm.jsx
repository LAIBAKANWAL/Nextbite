import React, { useState, useEffect } from "react";
import styles from "./SignupForm.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Validation regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Click outside handler for menu
  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (isMenuOpen && !event.target.closest("nav")) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleDocumentClick);
      }, 100);
    }

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isMenuOpen]);

  // Get current location for address
  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    
    if (!navigator.geolocation) {
      setErrors(prev => ({
        ...prev,
        address: "Geolocation is not supported by this browser"
      }));
      setIsLocationLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Using OpenStreetMap Nominatim API for reverse geocoding (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            
            setFormData(prev => ({
              ...prev,
              address: address
            }));
            
            // Clear any previous address errors
            setErrors(prev => ({
              ...prev,
              address: ""
            }));
          } else {
            throw new Error("Failed to get address");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          setErrors(prev => ({
            ...prev,
            address: "Failed to get address. Please enter manually."
          }));
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Failed to get location. Please enter address manually.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enter address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please enter address manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please enter address manually.";
            break;
        }
        
        setErrors(prev => ({
          ...prev,
          address: errorMessage
        }));
        setIsLocationLoading(false);
      },
      options
    );
  };

  // Field validation
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) {
          return "Name is required";
        }
        if (!nameRegex.test(value.trim())) {
          return "Name should contain only letters and spaces (2-50 characters)";
        }
        return "";

      case "email":
        if (!value.trim()) {
          return "Email is required";
        }
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        return "";

      case "address":
        if (!value.trim()) {
          return "Address is required";
        }
        if (value.trim().length < 10) {
          return "Please enter a complete address";
        }
        return "";

      case "password":
        if (!value) {
          return "Password is required";
        }
        if (value.length < 8) {
          return "Password must be at least 8 characters long";
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        return "";

      case "confirmPassword":
        if (!value) {
          return "Please confirm your password";
        }
        if (value !== formData.password) {
          return "Passwords do not match";
        }
        return "";

      default:
        return "";
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for touched fields
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
      }));
    }

    // Special case: validate confirm password when password changes
    if (name === "password" && touched.confirmPassword) {
      const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  // Handle form submission
 // Replace the handleSubmit function in your SignupForm component with this updated version:

const handleSubmit = async (e) => {
  e.preventDefault();

  // Mark all fields as touched
  setTouched({
    name: true,
    email: true,
    address: true,
    password: true,
    confirmPassword: true,
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
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        confirmPassword: formData.confirmPassword
      };

      // Make actual API call
      const response = await fetch("http://localhost:5000/api/createuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const json = await response.json();
      console.log(json);

      if (json.success) {
        alert("Account created successfully!");
        
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
        setTouched({});
        setErrors({});
        
        // Optional: Redirect to login page or dashboard
        // window.location.href = '/login';
        
      } else {
        // Handle API validation errors
        if (json.errors) {
          // If your API returns field-specific errors
          const apiErrors = {};
          json.errors.forEach(error => {
            // Assuming error format: { field: 'email', msg: 'Email already exists' }
            apiErrors[error.field] = error.msg;
          });
          setErrors(prev => ({ ...prev, ...apiErrors }));
        } else {
          // Generic error message
          setErrors({ submit: json.message || "Account creation failed. Please try again." });
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({ submit: "Unable to connect to server. Please check your connection and try again." });
      } else {
        setErrors({ submit: "Account creation failed. Please try again." });
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
        <div className={`${styles.foodElement} ${styles.foodElement4}`}>
          <div className={`${styles.foodImage} ${styles.foodImage4}`}></div>
        </div>

        {/* Main content */}
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <h1 className={styles.title}>Join NextbiTe!</h1>
              <p className={styles.subtitle}>
                Create your account and start your culinary journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formFields}>
              {/* Name Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`${styles.input} ${
                    errors.name ? styles.inputError : ""
                  } ${isLoading ? styles.inputDisabled : ""}`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className={styles.errorMessage}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email address"
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

              {/* Address Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="address" className={styles.label}>
                  Address
                </label>
                <div className={styles.addressContainer}>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your address or use current location"
                    className={`${styles.input} ${styles.addressInput} ${
                      errors.address ? styles.inputError : ""
                    } ${isLoading ? styles.inputDisabled : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className={styles.locationButton}
                    disabled={isLoading || isLocationLoading}
                    title="Get current location"
                  >
                    {isLocationLoading ? (
                      <div className={styles.locationSpinner}></div>
                    ) : (
                      <svg
                        className={styles.locationIcon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                        <path d="M10 2a6 6 0 00-6 6c0 1.887.454 3.665 1.257 5.234a.5.5 0 00.486.266.5.5 0 00.486-.266A9.98 9.98 0 014 8a6 6 0 1112 0c0 1.887-.454 3.665-1.257 5.234a.5.5 0 01-.486.266.5.5 0 01-.486-.266A9.98 9.98 0 0116 8a6 6 0 00-6-6z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.address && (
                  <p className={styles.errorMessage}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errors.address}
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
                    placeholder="Create a strong password"
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
                      <svg className={styles.eyeIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className={styles.eyeIcon} fill="currentColor" viewBox="0 0 20 20">
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

              {/* Confirm Password Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    className={`${styles.input} ${styles.passwordInput} ${
                      errors.confirmPassword ? styles.inputError : ""
                    } ${isLoading ? styles.inputDisabled : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggle}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <svg className={styles.eyeIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className={styles.eyeIcon} fill="currentColor" viewBox="0 0 20 20">
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
                {errors.confirmPassword && (
                  <p className={styles.errorMessage}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className={styles.termsSection}>
                <label className={styles.termsLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    disabled={isLoading}
                    required
                  />
                  <span className={styles.checkboxLabel}>
                    I agree to the{" "}
                    <a href="#" className={styles.termsLink}>
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className={styles.termsLink}>
                      Privacy Policy
                    </a>
                  </span>
                </label>
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
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Existing User Link */}
              <div className={styles.existingUserSection}>
                <span className={styles.existingUserText}>
                  Already have an account?{" "}
                </span>
                <Link to="/login">
                <button
                  type="button"
                  className={styles.signInButton}
                  disabled={isLoading}
                >
                  Sign In
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

export default SignupForm;