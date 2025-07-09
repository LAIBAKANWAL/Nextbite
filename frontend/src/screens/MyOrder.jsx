
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const MyOrder = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fetch order data from API
  const fetchMyOrder = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        throw new Error("User email not found. Please login again.");
      }

      const response = await fetch(`/api/myOrderData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setOrderData(data.orderData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrder();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort orders by date (latest first)
  const getSortedOrders = () => {
    if (!orderData.orderData || orderData.orderData.length === 0) return [];

    return [...orderData.orderData].sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return dateB - dateA; // Latest first (descending order)
    });
  };

  const handleStartShopping = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <>
        <Navbar
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
              >
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="ms-3">Loading your orders...</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="alert alert-danger" role="alert">
                <h5 className="alert-heading">Error!</h5>
                <p>{error}</p>
                <button
                  className="btn btn-outline-danger"
                  onClick={fetchMyOrder}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!orderData.orderData || orderData.orderData.length === 0) {
    return (
      <>
        <Navbar
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="text-center mt-4">
                <div className="mb-5 mt-5">
                  <i className="bi bi-bag display-1 text-muted"></i>
                </div>
                <h3 className="text-muted">No Orders Found</h3>
                <p className="text-muted">You haven't placed any orders yet.</p>
                <button
                  className="btn"
                  style={{
                    backgroundColor: "#82ae46",
                    color:"white"
                  }}
                  onClick={handleStartShopping}
                >
                  Start Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const sortedOrders = getSortedOrders();

  return (
    <>
      <Navbar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
      <style>{`
        .btn-outline-custom {
          border: 1px solid #82ae46;
          color: #82ae46;
          background-color: transparent;
          transition: all 0.3s;
        }
        .btn-outline-custom:hover {
          background-color: #82ae46;
          color: white;
        }
      `}</style>

      <div className="container mt-5 pt-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">My Orders</h2>
              <button className="btn btn-outline-custom" onClick={fetchMyOrder}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {sortedOrders.map((order, orderIndex) => (
          <div key={orderIndex} className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h5 className="mb-0">
                        Order #{sortedOrders.length - orderIndex}
                      </h5>
                      {orderIndex === 0 && (
                        <span
                          className="badge ms-2"
                          style={{
                            backgroundColor: "#82ae46",
                          }}
                        >
                          Latest
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="row">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="col-lg-6 col-xl-4 mb-3">
                          <div className="card h-100 border-0 bg-light">
                            <div className="card-body">
                              <div className="row g-0">
                                <div className="col-4">
                                  <img
                                    src={item.img || "/api/placeholder/80/80"}
                                    alt={item.name}
                                    className="img-fluid rounded"
                                    style={{
                                      height: "80px",
                                      objectFit: "cover",
                                      width: "100%",
                                    }}
                                  />
                                </div>
                                <div className="col-8 ps-3">
                                  <h6 className="card-title mb-1">
                                    {item.name}
                                  </h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">
                                      {item.des}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-1">
                                    <span className="text-muted small">
                                      Qty: {item.qty || 1}
                                    </span>
                                    <span className="fw-bold">
                                      RS
                                      {(
                                        (item.price || 0) * (item.qty || 1)
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <p className="text-muted">
                          No items found in this order
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Total */}
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="border-top pt-3">
                        <div className="row justify-content-end">
                          <div className="col-md-4">
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="mb-0">Total Amount:</h5>
                              <h5
                                className="mb-0"
                                style={{
                                  color: "#82ae46",
                                }}
                              >
                                RS
                                {order.items && order.items.length > 0
                                  ? order.items
                                      .reduce(
                                        (total, item) =>
                                          total +
                                          (item.price || 0) * (item.qty || 1),
                                        0
                                      )
                                      .toFixed(2)
                                  : "0.00"}
                              </h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-transparent">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        Ordered on {formatDate(order.orderDate)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
};

export default MyOrder;
