

import React from "react";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import { Link } from "react-router-dom";
import styles from "./MyCart.module.css";

const MyCart = ({ isModal = false, onClose }) => {
  let dispatch = useDispatchCart();
  let data = useCart();

  const handleCheckout = async () => {
    try {
      let userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        alert("Please login first");
        return;
      }

      if (!data || data.length === 0) {
        alert("Your cart is empty");
        return;
      }

        const response = await fetch("/api/orderData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderData: data,
          email: userEmail,
          orderDate: new Date().toDateString(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        dispatch({ type: "CLEAR_CART" });
        alert("Order placed successfully!");
        if (isModal && onClose) {
          onClose();
        }
      } else {
        console.error("Order failed:", result);
        alert("Failed to place order: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Error placing order: " + error.message);
    }
  };

  // Calculate total price
  const totalPrice = data.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Handle continue shopping - close modal and navigate to home
  const handleContinueShopping = () => {
    if (isModal && onClose) {
      onClose(); // Close the modal
    }
    // Navigation will be handled by Link component
  };

  return (
    <div className={isModal ? "p-3" : "container-fluid py-4 min-vh-100"}>
      <div className="row justify-content-center">
        <div className="col-12">
          <h1
            className="text-center mb-4 fw-bold"
            style={{
              color: "#82ae46",
            }}
          >
            <i className="bi bi-cart me-2"></i>My Cart
          </h1>

          {data.length === 0 ? (
            // Empty Cart
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-cart-x display-1 text-white"></i>
              </div>
              <h3 className="mb-3 text-white">Your Cart is Empty!</h3>
              <p className="text-white mb-4">
                Add some delicious items to your cart
              </p>
              <Link to="/" onClick={handleContinueShopping}>
                <button
                  className="btn btn-lg"
                  style={{
                    backgroundColor: "#82ae46",
                    color: "white",
                  }}
                >
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          ) : (
            // Cart with Items
            <div className="row">
              {/* Cart Items */}
              <div className="col-lg-8">
                <div className="card shadow">
                  <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">Cart Items ({data.length})</h5>
                  </div>
                  <div className="card-body p-0">
                    {data.map((item, index) => (
                      <div key={item.id || index} className="p-3 border-bottom">
                        <div className="row align-items-center">
                          {/* Item Image */}
                          <div
                            className={`col-3 col-md-2 ${styles.itemimagecontainer}`}
                          >
                            <img
                              src={item.img || "/api/placeholder/80/80"}
                              alt={item.name}
                              className="img-fluid rounded"
                              style={{ maxHeight: "80px", objectFit: "cover" }}
                            />
                          </div>

                          {/* Item Details */}
                          <div className="col-9 col-md-4">
                            <h6 className="mb-1">{item.name}</h6>
                            <small className="text-muted">
                              Option: {item.selectedOption}
                            </small>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-6 col-md-3">
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                  dispatch({
                                    type: "UPDATE_QUANTITY",
                                    id: item.id,
                                    quantity: item.quantity - 1,
                                    selectedOption: item.selectedOption,
                                  })
                                }
                              >
                                -
                              </button>
                              <span className="mx-3 fw-bold">
                                {item.quantity}
                              </span>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() =>
                                  dispatch({
                                    type: "UPDATE_QUANTITY",
                                    id: item.id,
                                    quantity: item.quantity + 1,
                                    selectedOption: item.selectedOption,
                                  })
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Price and Remove */}
                          <div className="col-6 col-md-3">
                            <div className="d-flex align-items-center justify-content-between">
                              <div
                                className="fw-bold"
                                style={{
                                  color: "#82ae46",
                                }}
                              >
                                RS{item.price * item.quantity}
                              </div>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  dispatch({
                                    type: "REMOVE_FROM_CART",
                                    id: item.id,
                                  })
                                }
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="col-lg-4">
                <div className="card shadow">
                  <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">Order Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between py-2">
                      <span>Items ({data.length})</span>
                      <span>RS{totalPrice}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span>Delivery Fee</span>
                      <span>RS50</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span>Tax (5%)</span>
                      <span>RS{Math.round(totalPrice * 0.05)}</span>
                    </div>
                    <div className="d-flex justify-content-between py-3 mt-2">
                      <strong>Total Price</strong>
                      <strong
                        className="fs-4"
                        style={{
                          color: "#82ae46",
                        }}
                      >
                        RS{totalPrice + 50 + Math.round(totalPrice * 0.05)}
                      </strong>
                    </div>
                    <button
                      className="btn w-100 mt-3 btn-lg text-white"
                      style={{
                        backgroundColor: "#82ae46",
                      }}
                      onClick={handleCheckout}
                    >
                      <i className="bi bi-credit-card me-2"></i>Proceed to
                      Checkout
                    </button>
                    <div className="text-center mt-3">
                      <Link to="/" onClick={handleContinueShopping}>
                        <button className="btn btn-outline-secondary">
                          ← Continue Shopping
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCart;
