import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner"; // Import Banner
import ProductSection from "../components/ProductSection";
import Footer from "../components/Footer";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [foodData, setFoodData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State to hold search query from Banner

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle search query change from Banner
  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  // Fetch food data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5000/api/foodData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract food items and categories from response
        const foodItems = data[0] || [];
        const foodCategories = data[1] || [];

        setFoodData(foodItems);
        setCategories(foodCategories);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simple click outside handler
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

  // Filter products by category AND search query
  const getProductsByCategory = (categoryName) => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();

    return foodData.filter((product) => {
      // const matchesCategory = product.CategoryName === categoryName ||
      //                         product.categoryName === categoryName ||
      //                         product.category === categoryName;

      const matchesCategory = product.categoryName === categoryName;

      // If there's a search query, filter by name or description as well
      const matchesSearch =
        lowerCaseSearchQuery === "" ||
        (product.name &&
          product.name.toLowerCase().includes(lowerCaseSearchQuery)) ||
        (product.desc &&
          product.desc.toLowerCase().includes(lowerCaseSearchQuery));

      return matchesCategory && matchesSearch;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
        {/* Pass setSearchQuery to Banner */}
        <Banner setSearchQuery={handleSearchQueryChange} />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted fs-5">Loading food data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
        {/* Pass setSearchQuery to Banner */}
        <Banner setSearchQuery={handleSearchQueryChange} />
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3"></i>
            <p className="text-danger fs-5 mb-3">
              Error loading food data: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-lg"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
      {/* Pass setSearchQuery to Banner */}
      <Banner setSearchQuery={handleSearchQueryChange} />

      {/* Dynamic Category Rendering */}
      {categories.length > 0 ? (
        categories.map((category, index) => {
          {
            /* const categoryProducts = getProductsByCategory(category.CategoryName || category.categoryName || category.name); */
          }

          const categoryProducts = getProductsByCategory(category.categoryName);
      
          // Only render ProductSection if there are products in this category matching the search
          if (categoryProducts.length > 0) {
            return (
              <ProductSection
                // key={`${category.CategoryName || category.categoryName || category.name}-${index}`}
                key={`${category.categoryName}-${index}`}
                categoryName={category.categoryName}
                products={categoryProducts}
                loading={false}
              />
            );
          }
          return null; // Don't render category section if no products match search
        })
      ) : (
        // Fallback: If no categories found (or no products after filtering), show message
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <i
                className="bi bi-search text-muted"
                style={{ fontSize: "4rem" }}
              ></i>
              <h3 className="text-muted mt-3">
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "No categories found"}
              </h3>
              <p className="text-muted">
                {searchQuery
                  ? "Please try a different search term or check for typos."
                  : "We couldn't find any food categories at the moment. Please try refreshing the page."}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;
