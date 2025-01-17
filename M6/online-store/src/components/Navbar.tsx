import { Link } from 'react-router-dom';
import { DarkModeToggle } from './DarkModeToggle';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from "../context/CartContext.tsx";
import { LoginButton } from './LoginButton';
import { LogoutButton } from './LogoutButton';
import logo from "../assets/e-shop.png";

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, role, displayName } = useAuth();
    const { cartItemCount } = useCart();

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-brand">
                    <Link to="/">
                        <img src={logo as string} alt="E-Shop Logo" className="navbar-logo" />
                        <span>E-Shop</span>
                    </Link>
                    {/* Hamburger button for mobile */}
                    <button
                        className="hamburger"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation"
                    >
                        {/* Dynamic hamburger icon */}
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
                {/* Collapsable menu for mobile/Fixed for Desktop */}
                <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className="navbar-home" onClick={() => setIsMenuOpen(false)}>
                        <img src={logo as string} alt="E-Shop Logo" className="navbar-logo"/>
                        <span>E-Shop</span>
                    </Link>
                    <Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
                    <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                        🛒 Cart {cartItemCount > 0 ? <span className="cart-count">{cartItemCount}</span> : ''}
                    </Link>
                    <Link to="/orders" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                    {role === 'admin' ? (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                    ) : (
                        <div></div>
                    )}

                    {/* Navbar actions */}
                    <div className="navbar-actions">
                        <DarkModeToggle />
                    </div>
                    <div className="navbar-actions">
                        {user ? (
                            <div>
                                <Link to="/">Welcome {displayName}</Link>
                            </div>
                        ) : (
                            <div />
                        )}
                    </div>
                    <div className="navbar-actions">
                        {user ? (
                            <div>
                                <LogoutButton />
                            </div>
                        ) : (
                            <div>
                                <LoginButton />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};