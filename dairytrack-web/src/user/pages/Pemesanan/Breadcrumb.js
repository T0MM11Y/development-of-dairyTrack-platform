// PemesananComponents/Breadcrumb.jsx
import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = () => {
  return (
    <section className="breadcrumb__wrap">
      <div className="container custom-container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8 col-md-10">
            <div className="breadcrumb__wrap__content">
              <h2 className="title">Pemesanan</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/">Home</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/products">Products</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Pemesanan
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;