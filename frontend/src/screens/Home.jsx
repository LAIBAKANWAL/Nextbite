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

        // 1. Fetch Food Items
        const foodItemsResponse = await fetch("/api/foodData", {
          method: "POST", // Or 'GET', based on your api/foodData.js
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!foodItemsResponse.ok) {
          const errorDetails = await foodItemsResponse.json();
          throw new Error(
            `HTTP error! Status: ${foodItemsResponse.status}. Details: ${
              errorDetails.message || JSON.stringify(errorDetails)
            }`
          );
        }
        const foodItemsData = await foodItemsResponse.json();

        // 2. Fetch Food Categories
        const foodCategoriesResponse = await fetch("/api/foodCategory", {
          method: "POST", // Or 'GET', based on your api/foodCategory.js
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!foodCategoriesResponse.ok) {
          const errorDetails = await foodCategoriesResponse.json();
          throw new Error(
            `HTTP error! Status: ${foodCategoriesResponse.status}. Details: ${
              errorDetails.message || JSON.stringify(errorDetails)
            }`
          );
        }
        const foodCategoriesData = await foodCategoriesResponse.json();

        // Assuming both API endpoints return { success: true, data: [...] }
        if (foodItemsData.success && foodCategoriesData.success) {
          setFoodData(foodItemsData.data || []); // Access 'data' key for food items
          setCategories(foodCategoriesData.data || []); // Access 'data' key for food categories
        } else {
          // This case handles if success: false is returned by the API but HTTP status is OK
          throw new Error("API reported failure for food data or categories.");
        }
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
              className="btn btn-lg text-white"
              style={{ backgroundColor: "#82ae46" }}
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
