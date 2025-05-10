import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-logo">Game Hub</div>
          <div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Store</a>
            <a href="#" className="footer-link">Community</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>
        <div className="footer-separator"></div>
        <div className="footer-bottom">
          <p className="copyright">© 2025 Game Hub. All rights reserved. All trademarks are property of their respective owners in the US and other countries.</p>
          <p className="legal-links">
            <a href="#">Privacy Policy</a> | <a href="#">Legal</a> | <a href="#"> Game Hub Subscriber Agreement</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;