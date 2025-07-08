
import React, { useState, useEffect } from "react";
import styles from "./SignupForm.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

   let navigate = useNavigate()
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // NEW STATE: For the terms and conditions checkbox
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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
      setErrors((prev) => ({
        ...prev,
        address: "Geolocation is not supported by this browser",
      }));
      setIsLocationLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;

            setFormData((prev) => ({
              ...prev,
              address: address,
            }));

            setErrors((prev) => ({
              ...prev,
              address: "",
            }));
          } else {
            throw new Error("Failed to get address");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          setErrors((prev) => ({
            ...prev,
            address: "Failed to get address. Please enter manually.",
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
          default:
            break;
        }

        setErrors((prev) => ({
          ...prev,
          address: errorMessage,
        }));
        setIsLocationLoading(false);
      },
      options
    );
  };

  // Field validation (keeping it synchronous for client-side validation)
  const validateField = (name, value, formData = {}) => {
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
    const { name, value, type, checked } = e.target;

    // Handle checkbox separately
    if (type === "checkbox") {
      setAgreeToTerms(checked);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Real-time validation for touched fields
      if (touched[name]) {
        const fieldError = validateField(name, value, formData);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }

      // Special case: validate confirm password when password changes
      if (name === "password" && touched.confirmPassword) {
        const confirmPasswordError = validateField(
          "confirmPassword",
          formData.confirmPassword,
          { ...formData, password: value }
        );
        setErrors((prev) => ({
          ...prev,
          confirmPassword: confirmPasswordError,
        }));
      }

      // Clear submit error AND duplicate email error when user makes changes to email field
      if (name === "email") {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email; // Clear existing email error including duplicate
          delete newErrors.submit; // Clear general submit error as well
          return newErrors;
        });
      } else if (errors.submit) {
        // Clear general submit error for other fields
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.submit;
          return newErrors;
        });
      }
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldError = validateField(name, value, formData);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });

    // Add validation for terms and conditions checkbox
    if (!agreeToTerms) {
        newErrors.terms = "You must agree to the Terms & Conditions";
    }

    return newErrors;
  };

  // Handle form submission
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
        const credentials = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address,
        };

        const response = await fetch("/api/createUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const json = await response.json();

        if (response.ok && json.success) {
          alert("Account created successfully!");
          setFormData({
            name: "",
            email: "",
            address: "",
            password: "",
            confirmPassword: "",
          });
          setTouched({});
          setErrors({});
          // NEW: Reset checkbox state on successful signup
          setAgreeToTerms(false);
          navigate('/login')
        } else {
          // Check if there are 'errors' array from express-validator
          if (json.errors && Array.isArray(json.errors)) {
            const apiErrors = {};
            json.errors.forEach((error) => {
              const fieldName = error.path; // Corrected: using error.path
              const errorMessage = error.msg;

              if (fieldName === "email" && errorMessage === "Email already in use") {
                apiErrors.email = "This email is already registered. Please use a different email or try logging in.";
              } else {
                apiErrors[fieldName] = errorMessage;
              }
            });

            setErrors((prev) => ({ ...prev, ...apiErrors }));

            if (apiErrors.email) {
              const emailField = document.querySelector('input[name="email"]');
              if (emailField) {
                emailField.focus();
                emailField.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }
          }
          // The 'else if (json.message)' block is still useful for other generic errors,
          // but the primary duplicate email error will now be caught by the 'json.errors' block.
          else if (json.message) {
            if (json.message.toLowerCase().includes("email already in use")) {
              setErrors((prev) => ({
                ...prev,
                email: "This email is already registered. Please use a different email or try logging in.",
              }));
              const emailField = document.querySelector('input[name="email"]');
              if (emailField) {
                emailField.focus();
                emailField.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            } else {
              setErrors({ submit: json.message });
            }
          } else {
            setErrors({ submit: "Account creation failed. Please try again." });
          }
        }
      } catch (error) {
        console.error("Signup error:", error);
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          setErrors({ submit: "Unable to connect to server. Please check your connection and try again." });
        } else if (error.name === "SyntaxError") {
          setErrors({ submit: "Server response error. Please try again." });
        } else {
          setErrors({ submit: "Account creation failed. Please try again." });
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Focus on the first error field
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        // Special handling for terms error, focus on checkbox
        if (firstErrorField === "terms") {
            const termsCheckbox = document.querySelector(`input[type="checkbox"]`);
            if (termsCheckbox) {
                termsCheckbox.focus();
                termsCheckbox.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } else {
            const fieldElement = document.querySelector(`input[name="${firstErrorField}"]`);
            if (fieldElement) {
                fieldElement.focus();
                fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
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
                        <path d="M10 12a2 0 100-4 2 2 0 000 4z" />
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
                        <path d="M10 12a2 0 100-4 2 2 0 000 4z" />
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
                    // NEW: Bind checked state and onChange handler
                    checked={agreeToTerms}
                    onChange={handleChange}
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
                {/* NEW: Display terms error if it exists */}
                {errors.terms && (
                  <p className={styles.errorMessage}>
                    <span className={styles.errorIcon}>⚠️</span>
                    {errors.terms}
                  </p>
                )}
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