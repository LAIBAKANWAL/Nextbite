import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import ProductSection from "../components/ProductSection";
import Footer from "../components/Footer";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Simple click outside handler
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // If menu is open and clicked element doesn't have navbar-related classes
      if (isMenuOpen && !event.target.closest("nav")) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      // Small delay to prevent immediate closing when opening
      setTimeout(() => {
        document.addEventListener("click", handleDocumentClick);
      }, 100);
    }

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isMenuOpen]);

  return (
    <div>
      <Navbar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
      <Banner />
      <ProductSection categoryName="Starter" />

      <ProductSection categoryName="Fast Food" />
      <Footer />
    </div>
  );
};

export default Home;
