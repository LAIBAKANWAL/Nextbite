import { useState, useEffect } from "react";

const ProductSection = ({ categoryName = "Category", products = [], loading = false }) => {
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

  // Initialize default selections for each product when products change
  useEffect(() => {

     if (products.length > 0) {
      const defaultSelections = {};
      products.forEach((product) => {
        if (product.options && product.options.length > 0) {
          const optionKeys = Object.keys(product.options[0]);
          defaultSelections[product._id] = optionKeys[0]; // Select first option as default
        }
      });
      setSelectedOptions(defaultSelections);
    }
  }, [products]);

  const getQuantity = (productId) => quantities[productId] || 1;
  const getSelectedOption = (productId) => selectedOptions[productId];

  const updateQuantity = (productId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change),
    }));
  };

  const setSelectedOption = (productId, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: option,
    }));
  };

  const getCurrentPrice = (product) => {
    const selectedOption = getSelectedOption(product._id);
    if (product.options && product.options.length > 0) {
      return product.options[0][selectedOption] || "0";
    }
    return product.price || "0";
  };

  const getOptionButtons = (product) => {
    if (!product.options || product.options.length === 0) return [];

    const options = product.options[0];
    return Object.keys(options).map((optionKey) => ({
      key: optionKey,
      label: optionKey.charAt(0).toUpperCase() + optionKey.slice(1),
      price: options[optionKey],
    }));
  };

  const addToCart = (productId) => {
    const quantity = getQuantity(productId);
    const selectedOption = getSelectedOption(productId);
    const product = products.find((p) => p._id === productId);

    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.productId === productId && item.selectedOption === selectedOption
      );

      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId && item.selectedOption === selectedOption
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId,
            quantity,
            selectedOption,
            productName: product.name,
            price: getCurrentPrice(product),
          },
        ];
      }
    });

    console.log(`Added ${quantity} ${selectedOption} ${product.name} to cart`);
  };

  if (loading) {
    return (
      <section className="py-5" style={{ backgroundColor: '#2a2a2a', minHeight: '400px' }}>
        <div className="container">
          <h2 className="text-white fw-semibold fs-2 mb-4">{categoryName}</h2>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="text-center">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-light mt-3">Loading products...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="py-5" style={{ backgroundColor: '#2a2a2a', minHeight: '300px' }}>
        <div className="container">
          <h2 className="text-white fw-semibold fs-2 mb-4">{categoryName}</h2>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
            <div className="text-center">
              <i className="bi bi-basket text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3 fs-5">No products found in this category.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5" style={{ backgroundColor: '#2a2a2a' }}>
      <div className="container">
        <h2 className="text-white fw-semibold fs-2 mb-4">{categoryName}</h2>

        <div className="row g-4">
          {products.map((product) => (
            <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{
                  backgroundColor: '#3a3a3a',
                  borderRadius: '12px',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Product Image */}
                <div
                  className="position-relative overflow-hidden"
                  style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                    borderRadius: '12px 12px 0 0'
                  }}
                >
                  <img
                    src={product.img || "https://via.placeholder.com/300x160?text=No+Image"}
                    alt={product.name}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>

                <div className="card-body p-3 d-flex flex-column">
                  {/* Product Name */}
                  <h5 className="card-title text-white fw-semibold mb-2" style={{ fontSize: '1.2rem' }}>
                    {product.name}
                  </h5>

                  {/* Product Description - FIXED HEIGHT */}
                  {product.desc && (
                    <p className="card-text text-white small mb-3" style={{
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      height: '4.2em', /* Approx 3 lines of 0.85rem text with line-height 1.4 */
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis'
                    }}>
                      {product.desc}
                    </p>
                  )}

                  {/* Dynamic Option Selection */}
                  {getOptionButtons(product).length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {getOptionButtons(product).map((option) => (
                          <button
                            key={option.key}
                            className={`btn btn-sm flex-fill ${
                              getSelectedOption(product._id) === option.key
                                ? 'btn-success'
                                : 'btn-outline-secondary'
                            }`}
                            style={{
                              minHeight: '36px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              minWidth: getOptionButtons(product).length === 2 ? 'calc(50% - 4px)' :
                                getOptionButtons(product).length === 3 ? 'calc(33.333% - 6px)' : 'auto'
                            }}
                            onClick={() => setSelectedOption(product._id, option.key)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-white small fw-medium">Quantity:</span> {/* Changed to text-white */}
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        style={{ width: '32px', height: '32px', padding: '0' }}
                        onClick={() => updateQuantity(product._id, -1)}
                        disabled={getQuantity(product._id) <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="text-white fw-semibold px-2" style={{ minWidth: '30px', textAlign: 'center' }}>
                        {getQuantity(product._id)}
                      </span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        style={{ width: '32px', height: '32px', padding: '0' }}
                        onClick={() => updateQuantity(product._id, 1)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-white fw-bold fs-5">
                      RS{getCurrentPrice(product)}/-
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    className="btn btn-success w-100 mt-auto fw-semibold text-uppercase"
                    style={{
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => addToCart(product._id)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(22, 160, 133, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '';
                    }}
                  >
                    <i className="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;