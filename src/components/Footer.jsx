// /components/Footer.jsx
import React from 'react';
import styles from '../css/Footer.module.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className={`text-white pt-5 pb-3 mt-5 ${styles.footer}`}>
      <div className="container">
        <div className="row">
          {/* About */}
          <div className="col-md-4 mb-4">
            <h5 className={styles.heading}>About Us</h5>
            <p className={styles.text}>
              We serve authentic Pakistani flavors, bringing tradition to your table with love and spice.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className={styles.heading}>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
              <Link className={styles.link} to="/">Home</Link>
              </li>
               <li>
              <Link className={styles.link} to="/login">Login</Link>
              </li>
               <li>
              <Link className={styles.link} to="/signup">Signup</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-4 mb-4">
            <h5 className={styles.heading}>Contact</h5>
            <p className={styles.text}>📍 Karachi, Pakistan</p>
            <p className={styles.text}>📞 +92 300 1234567</p>
            <p className={styles.text}>📧 NextbiTe@gmail.com</p>
          </div>
        </div>

        <hr className="bg-light" />

        <div className="text-center">
          <p className={styles.text}>&copy; {new Date().getFullYear()} NextbiTe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
