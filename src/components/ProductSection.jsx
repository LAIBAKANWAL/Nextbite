import { useState, useEffect } from "react";
import styles from "../css/ProductSection.module.css";

const ProductSection = ({ categoryName = "Starter" }) => {
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample database data - replace with actual API call
  const sampleProducts = [
    {
      _id: "1",
      categoryName: "Starter",
      name: "Chicken Wings",
      img: "https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani.jpg",
      desc: "Crispy fried chicken wings served with your choice of sauce",
      options: [{ half: "150", full: "250" }],
    },
    {
      _id: "2",
      categoryName: "Starter",
      name: "Mozzarella Sticks",
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      desc: "Golden fried mozzarella cheese sticks served with marinara sauce",
      options: [{ half: "120", full: "200" }],
    },
    {
      _id: "3",
      categoryName: "Fast Food",
      name: "Margherita Pizza",
      img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      desc: "Classic pizza with fresh tomato sauce, mozzarella cheese, and basil",
      options: [{ regular: "220", medium: "350", large: "500" }],
    },
    {
      _id: "4",
      categoryName: "Fast Food",
      name: "Pepperoni Pizza",
      img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      desc: "Delicious pizza topped with pepperoni and mozzarella cheese",
      options: [{ regular: "280", medium: "420", large: "580" }],
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch products
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Replace this with actual API call
        // const response = await fetch(`/api/products?category=${categoryName}`)
        // const data = await response.json()

        // Filter products by category
        const filteredProducts = sampleProducts.filter(
          (product) => product.categoryName === categoryName
        );

        setProducts(filteredProducts);

        // Initialize default selections for each product
        const defaultSelections = {};
        filteredProducts.forEach((product) => {
          const optionKeys = Object.keys(product.options[0]);
          defaultSelections[product._id] = optionKeys[0]; // Select first option as default
        });
        setSelectedOptions(defaultSelections);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

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
    return product.options[0][selectedOption] || "0";
  };

  const getOptionButtons = (product) => {
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
      <section className={styles.productSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{categoryName}</h2>
          <div className={styles.loadingText}>Loading products...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={styles.productSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{categoryName}</h2>
          <div className={styles.noProductsText}>
            No products found in this category.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{categoryName}</h2>

        <div className={styles.productGrid}>
          {products.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                <img
                  src={product.img || "/placeholder.svg"}
                  alt={product.name}
                  className={styles.productImage}
                />
              </div>

              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>

                {/* Dynamic description */}
                {product.desc && (
                  <p className={styles.productDescription}>{product.desc}</p>
                )}

                {/* Dynamic Option Selection */}
                <div className={styles.optionSelector}>
                  {getOptionButtons(product).map((option) => (
                    <button
                      key={option.key}
                      className={`${styles.optionBtn} ${
                        getSelectedOption(product._id) === option.key
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => setSelectedOption(product._id, option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div className={styles.quantitySelector}>
                  <span className={styles.quantityLabel}>Quantity:</span>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => updateQuantity(product._id, -1)}
                      disabled={getQuantity(product._id) <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className={styles.quantityDisplay}>
                      {getQuantity(product._id)}
                    </span>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => updateQuantity(product._id, 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>

                <div className={styles.priceContainer}>
                  <span className={styles.price}>
                    RS{getCurrentPrice(product)}/-
                  </span>
                </div>

                <button
                  className={styles.addToCartBtn}
                  onClick={() => addToCart(product._id)}
                >
                  <i className="bi bi-cart-plus"></i>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
