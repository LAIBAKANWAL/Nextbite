import React, { useState, useEffect } from "react";
import styles from "../css/Banner.module.css";

// Accept setSearchQuery prop
const Banner = ({ setSearchQuery }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // Use local state for input control

  // Sample images - replace with your actual image URLs
  const images = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://img.freepik.com/free-photo/top-view-chicken-pizza-with-yellow-cherry-tomatoes-bell-pepper-board_141793-3972.jpg?semt=ais_hybrid&w=740",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80",
  ];


  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const clearSearch = () => {
    setLocalSearchQuery(""); // Clear local input
    setSearchQuery(""); // Clear parent's search query
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query); // Update local input state
    setSearchQuery(query); // Propagate to parent Home component immediately
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search query is already being updated on each keystroke
    // If you need to trigger something *only* on submit, add it here.
    // console.log("Search submitted:", localSearchQuery);
  };

  const handleBannerClick = (e) => {
    // Don't close menu if clicking on interactive elements
    if (
      e.target.closest(`.${styles.searchForm}`) ||
      e.target.closest(`.${styles.navButton}`) ||
      e.target.closest(`.${styles.indicators}`)
    ) {
      return;
    }
  };

  return (
    <div className={styles.bannerContainer} onClick={handleBannerClick}>
      {/* Carousel Images */}
      <div className={styles.carousel}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`${styles.slide} ${
              index === currentSlide ? styles.active : ""
            }`}
          >
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}

        {/* Overlay gradient */}
        <div className={styles.overlay}></div>
      </div>

      {/* Search Bar Overlay */}
      <div className={styles.searchOverlay}>
        <div className={styles.searchContainer}>
          <h1 className={styles.bannerTitle}>Find Your Perfect Recipe</h1>
          <p className={styles.bannerSubtitle}>
            Discover delicious recipes from around the world
          </p>

          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputGroup}>
              <input
                type="text"
                placeholder="Search for recipes, ingredients, or cuisines..."
                value={localSearchQuery} // Use local state for value
                onChange={handleSearchChange} // Use new handler
                className={styles.searchInput}
              />
              {localSearchQuery && ( // Check localSearchQuery for clear button
                <button
                  type="button"
                  onClick={clearSearch}
                  className={styles.clearButton}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
              {/* <button type="submit" className={styles.searchButton}>
                <i className="bi bi-search"></i>
                <span className={styles.searchButtonText}>Search</span>
              </button> */}
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <button
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <i className="bi bi-chevron-right"></i>
      </button>

      {/* Slide Indicators */}
      <div className={styles.indicators}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${
              index === currentSlide ? styles.activeIndicator : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Banner;