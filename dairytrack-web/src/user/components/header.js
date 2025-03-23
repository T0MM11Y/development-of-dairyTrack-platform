import React from "react";

// Import images from the src folder
import logoBlack from "../../assets/client/img/logo/logo_black.png";
import logoWhite from "../../assets/client/img/logo/logo_white.png";
import { Link } from "react-router-dom";

function Header() {
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
                  <div className="logo">
                    <a href="index.html" className="logo__black">
                      <img src={logoBlack} alt="Logo Black" />
                    </a>
                    <a href="index.html" className="logo__white">
                      <img src={logoWhite} alt="Logo White" />
                    </a>
                  </div>
                  <div className="navbar__wrap main__menu d-none d-xl-flex">
                    <ul className="navigation">
                      <li className="active">
                        <a href="index.html">Home</a>
                      </li>
                      <li>
                        <a href="about.html">About</a>
                      </li>
                      <li>
                        <a href="services-details.html">Services</a>
                      </li>
                      <li className="menu-item-has-children">
                        <a href="#">Portfolio</a>
                        <ul className="sub-menu">
                          <li>
                            <a href="portfolio.html">Portfolio</a>
                          </li>
                          <li>
                            <a href="portfolio-details.html">
                              Portfolio Details
                            </a>
                          </li>
                        </ul>
                      </li>
                      <li className="menu-item-has-children">
                        <a href="#">Our Blog</a>
                        <ul className="sub-menu">
                          <li>
                            <a href="blog.html">Our News</a>
                          </li>
                          <li>
                            <a href="blog-details.html">News Details</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="contact.html">Contact Me</a>
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
                    <a href="index.html" className="logo__black">
                      <img src={logoBlack} alt="Logo Black" />
                    </a>
                    <a href="index.html" className="logo__white">
                      <img src={logoWhite} alt="Logo White" />
                    </a>
                  </div>
                  <div className="menu__outer">
                    {/* Here Menu Will Come Automatically Via Javascript / Same Menu as in Header */}
                  </div>
                  <div className="social-links">
                    <ul className="clearfix">
                      <li>
                        <a href="#">
                          <span className="fab fa-twitter"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fab fa-facebook-square"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fab fa-pinterest-p"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fab fa-instagram"></span>
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <span className="fab fa-youtube"></span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
              <div className="menu__backdrop"></div>
              {/* End Mobile Menu */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
