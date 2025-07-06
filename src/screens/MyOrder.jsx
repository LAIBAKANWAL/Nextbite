import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MyOrder = () => {
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
      const userEmail = localStorage.getItem('userEmail');
      console.log(userEmail)
      
      if (!userEmail) {
        throw new Error('User email not found. Please login again.');
      }

      const response = await fetch('http://localhost:5000/api/myorderData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-warning text-dark',
      'confirmed': 'bg-info text-white',
      'preparing': 'bg-primary text-white',
      'delivered': 'bg-success text-white',
      'cancelled': 'bg-danger text-white'
    };
    return statusClasses[status?.toLowerCase()] || 'bg-secondary text-white';
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
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="spinner-border text-primary" role="status">
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

  if (!orderData.length) {
    console.log('No orders found. OrderData:', orderData); // Debug log
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
              <div className="text-center">
                <div className="mb-4">
                  <i className="fas fa-shopping-bag fa-5x text-muted"></i>
                </div>
                <h3 className="text-muted">No Orders Found</h3>
                <p className="text-muted">You haven't placed any orders yet.</p>
                <button className="btn btn-primary">
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

  return (
    <>
      <Navbar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">My Orders</h2>
              <button 
                className="btn btn-outline-primary"
                onClick={fetchMyOrder}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {orderData.map((order, orderIndex) => (
          <div key={orderIndex} className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h5 className="mb-0">
                        Order #{orderIndex + 1}
                      </h5>
                      <small className="text-muted">
                        {formatDate(order.orderDate)}
                      </small>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <span className={`badge ${getStatusBadge(order.status)} px-3 py-2`}>
                        {order.status || 'Pending'}
                      </span>
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
                                    src={item.img || '/api/placeholder/80/80'} 
                                    alt={item.name}
                                    className="img-fluid rounded"
                                    style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                                  />
                                </div>
                                <div className="col-8 ps-3">
                                  <h6 className="card-title mb-1">{item.name}</h6>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">
                                      {item.des}
                                    </span>
                                    <span className="fw-bold text-primary">
                                      ${item.price || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-1">
                                    <span className="text-muted small">
                                      Qty: {item.qty || 1}
                                    </span>
                                    <span className="fw-bold">
                                      ${((item.price || 0) * (item.qty || 1)).toFixed(2)}
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
                        <p className="text-muted">No items found in this order</p>
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
                              <h5 className="mb-0 text-primary">
                                ${order.items && order.items.length > 0
                                  ? order.items
                                      .reduce((total, item) => total + ((item.price || 0) * (item.qty || 1)), 0)
                                      .toFixed(2)
                                  : '0.00'
                                }
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
                        <i className="fas fa-clock me-1"></i>
                        Ordered on {formatDate(order.orderDate)}
                      </small>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <i className="fas fa-eye me-1"></i>
                        View Details
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <i className="fas fa-download me-1"></i>
                        Download Receipt
                      </button>
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