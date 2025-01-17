import { Link } from 'react-router-dom';
import { SocialIcons } from './SocialIcons'; // Optional social media component

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">

                    {/* Company Info */}
                    <div className="footer-section">
                        <h3 className="footer-heading">E-Shop</h3>
                        <p className="footer-text">
                            Your one-stop shop for all things tech and lifestyle.
                        </p>
                        <SocialIcons /> {/* Optional */}
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h3 className="footer-heading">Quick Links</h3>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="footer-section">
                        <h3 className="footer-heading">Help</h3>
                        <ul className="footer-links">
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/shipping">Shipping Policy</Link></li>
                            <li><Link to="/returns">Returns & Refunds</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter (Optional) */}
                    <div className="footer-section">
                        <h3 className="footer-heading">Newsletter</h3>
                        <form className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Your email"
                                required
                            />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} E-Shop. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};