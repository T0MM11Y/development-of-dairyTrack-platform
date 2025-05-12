import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../frontend/controllers/authController'; // Import login function from authController

const Header = () => {
    const [showModal, setShowModal] = useState(false);
    const [username, setUsername] = useState(''); // State for username
    const [password, setPassword] = useState(''); // State for password
    const [errorMessage, setErrorMessage] = useState(''); // State for error message

    const toggleModal = () => {
        setShowModal(!showModal);
        setErrorMessage(''); // Clear error message when modal is toggled
    };

    const handleLogin = async () => {
        const result = await login(username, password);
        if (result.success) {
            alert('Login successful!');
            toggleModal(); // Close modal on successful login
        } else {
            setErrorMessage(result.message || 'Login failed. Please try again.');
        }
    };

    return (
        <>
            <header>
                <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">                    <div className="container">
                        {/* Logo */}
                        <Link className="navbar-brand" to="/">
                            <img
                                src="logo.png" // Ganti dengan path logo Anda
                                alt="Logo"
                                width="30"
                                height="30"
                                className="d-inline-block align-text-top logo-bg-white"
                            />
                            DairyTrack
                        </Link>

                        {/* Toggle button for mobile view */}
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarResponsive"
                            aria-controls="navbarResponsive"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        {/* Navigation Links */}
                        <div className="collapse navbar-collapse" id="navbarResponsive">
                            <ul className="navbar-nav ms-auto">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Home</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profile">Profile</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/blog">Blog</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/produk">Produk</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/galeri">Galeri</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/pemesanan">Pemesanan</Link>
                                </li>
                            </ul>

                            {/* Login Button */}
                            <button
                                className="btn btn-primary btn-sm ms-lg-3"
                                onClick={toggleModal}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Login Modal */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content material-modal">
                            <div className="modal-header">
                                <h5 className="modal-title">Login</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={toggleModal}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    {errorMessage && (
                                        <div className="alert alert-danger" role="alert">
                                            {errorMessage}
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={handleLogin}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary w-100 mt-2"
                                    onClick={toggleModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;