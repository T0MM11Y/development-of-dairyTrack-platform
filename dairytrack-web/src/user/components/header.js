import React from "react";
import logoBlack from "../../assets/client/img/logo/logo.png";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header>
      <div id="sticky-header" className="menu__area transparent-header">
        <div className="container custom-container">
          <div className="row">
            <div className="col-12">
              <div className="mobile__nav__toggler">
                <i className="fas fa-bars"></i>
              </div>
              <div className="menu__wrap">
                <nav className="menu__nav">
                  <div className="logo lg">
                    <Link to="/" className="logo__black">
                      <img
                        src={logoBlack}
                        alt="Logo Black"
                        style={{ height: "100%", width: "auto" }} // Atur ukuran sesuai kebutuhan
                      />
                    </Link>
                  </div>

                  <div className="navbar__wrap main__menu d-none d-xl-flex">
                    <ul className="navigation">
                      <li className={isActive("/") ? "active" : ""}>
                        <Link to="/">Home</Link>
                      </li>
                      <li
                        className={
                          isActive("/identitas-peternakan") ? "active" : ""
                        }
                      >
                        <Link to="/identitas-peternakan">Profil</Link>
                      </li>

                      <li className={isActive("/blog") ? "active" : ""}>
                        <Link to="/blog">Blog</Link>
                      </li>
                      <li className={isActive("/produk") ? "active" : ""}>
                        <Link to="/produk">Produk</Link>
                      </li>
                      <li className={isActive("/galeri") ? "active" : ""}>
                        <Link to="/galeri">Galeri</Link>
                      </li>
                      <li className={isActive("/pemesanan") ? "active" : ""}>
                        <Link to="/pemesanan">Pemesanan</Link>
                      </li>
                    </ul>
                  </div>

                  <div className="header__btn d-none d-md-block">
                    <Link to="/login" className="btn">
                      Login
                    </Link>
                  </div>
                </nav>
              </div>

              {/* Mobile Menu */}
              <div className="mobile__menu">
                <nav className="menu__box">
                  <div className="close__btn">
                    <i className="fal fa-times"></i>
                  </div>
                  <div className="nav-logo">
                    <Link to="/" className="logo__black">
                      <img src={logoBlack} alt="Logo Black" />
                    </Link>
                  </div>
                  <ul className="navigation clearfix">
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <Link to="/identitas-peternakan">Profil</Link>
                    </li>
                    <li>
                      <Link to="/sejarah">Sejarah</Link>
                    </li>
                    <li>
                      <Link to="/fasilitas">Fasilitas</Link>
                    </li>
                    <li>
                      <Link to="/blog">Blog</Link>
                    </li>
                    <li>
                      <Link to="/produk">Produk</Link>
                    </li>
                    <li>
                      <Link to="/galeri">Galeri</Link>
                    </li>
                    <li>
                      <Link to="/pemesanan">Contact Us</Link>
                    </li>
                    <li>
                      <Link to="/login">Login</Link>
                    </li>
                  </ul>
                  <div className="social-links">
                    <ul className="clearfix">
                      <li>
                        <button>
                          <span className="fab fa-twitter"></span>
                        </button>
                      </li>
                      <li>
                        <button>
                          <span className="fab fa-facebook-square"></span>
                        </button>
                      </li>
                      <li>
                        <button>
                          <span className="fab fa-pinterest-p"></span>
                        </button>
                      </li>
                      <li>
                        <button>
                          <span className="fab fa-instagram"></span>
                        </button>
                      </li>
                      <li>
                        <button>
                          <span className="fab fa-youtube"></span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
              <div className="menu__backdrop"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
