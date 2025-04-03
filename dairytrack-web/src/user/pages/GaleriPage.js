import React from "react";
import sapi1 from "../../assets/image/girolando.png";
import sapi2 from "../../assets/image/gedung2.jpeg";
import sapi3 from "../../assets/image/ladangsapi.jpg";

const GaleriPage = () => {
  const imageStyle = {
    width: "40rem",
    height: "25rem",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    objectFit: "cover",
  };

  return (
    <div className="container py-5 mt-16">
      <section className="portfolio__inner">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="portfolio__inner__nav">
                {/* Bagian filter dihapus */}
              </div>
            </div>
          </div>
          <div className="portfolio__inner__active">
            <div className="portfolio__inner__item grid-item cat-two cat-three">
              <div className="row gx-0 align-items-center">
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__thumb">
                    <a href="portfolio-details.html">
                      <img src={sapi1} alt="" style={imageStyle} />
                    </a>
                  </div>
                </div>
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__content">
                    <h2 className="title">
                      <a href="portfolio-details.html">Ecommerce Product Apps</a>
                    </h2>
                    <p>
                      There are many variations of passages of Lorem Ipsum
                      available, but the majority have suffered alteration in
                      some form, by injected humour, or randomised words which
                      don't look even slightly believable.
                    </p>
                    <p>
                      If you are going to use a passage of Lorem Ipsum, you need
                      to be sure there isn't anything embarrassing hidden in the
                      middle of text
                    </p>
                    <a href="portfolio-details.html" className="link">
                      View Case Study
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="portfolio__inner__item grid-item cat-one cat-three cat-four">
              <div className="row gx-0 align-items-center">
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__thumb">
                    <a href="portfolio-details.html">
                      <img src={sapi2} alt="" style={imageStyle} />
                    </a>
                  </div>
                </div>
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__content">
                    <h2 className="title">
                      <a href="portfolio-details.html">
                        Cryptocurrency web Application
                      </a>
                    </h2>
                    <p>
                      There are many variations of passages of Lorem Ipsum
                      available, but the majority have suffered alteration in
                      some form, by injected humour, or randomised words which
                      don't look even slightly believable.
                    </p>
                    <p>
                      If you are going to use a passage of Lorem Ipsum, you need
                      to be sure there isn't anything embarrassing hidden in the
                      middle of text
                    </p>
                    <a href="portfolio-details.html" className="link">
                      View Case Study
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="portfolio__inner__item grid-item cat-one cat-four">
              <div className="row gx-0 align-items-center">
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__thumb">
                    <a href="portfolio-details.html">
                      <img src={sapi3} alt="" style={imageStyle} />
                    </a>
                  </div>
                </div>
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__content">
                    <h2 className="title">
                      <a href="portfolio-details.html">Making 3d Illustration</a>
                    </h2>
                    <p>
                      There are many variations of passages of Lorem Ipsum
                      available, but the majority have suffered alteration in
                      some form, by injected humour, or randomised words which
                      don't look even slightly believable.
                    </p>
                    <p>
                      If you are going to use a passage of Lorem Ipsum, you need
                      to be sure there isn't anything embarrassing hidden in the
                      middle of text
                    </p>
                    <a href="portfolio-details.html" className="link">
                      View Case Study
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="portfolio__inner__item grid-item cat-two">
              <div className="row gx-0 align-items-center">
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__thumb">
                    <a href="portfolio-details.html">
                      <img src={sapi1} alt="" style={imageStyle} />
                    </a>
                  </div>
                </div>
                <div className="col-lg-6 col-md-10">
                  <div className="portfolio__inner__content">
                    <h2 className="title">
                      <a href="portfolio-details.html">Hilon - Personal Portfolio</a>
                    </h2>
                    <p>
                      There are many variations of passages of Lorem Ipsum
                      available, but the majority have suffered alteration in
                      some form, by injected humour, or randomised words which
                      don't look even slightly believable.
                    </p>
                    <p>
                      If you are going to use a passage of Lorem Ipsum, you need
                      to be sure there isn't anything embarrassing hidden in the
                      middle of text
                    </p>
                    <a href="portfolio-details.html" className="link">
                      View Case Study
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pagination-wrap">
            <nav aria-label="Page navigation example">
              <ul className="pagination">
                <li className="page-item">
                  <a className="page-link" href="#">
                    <i className="far fa-long-arrow-left"></i>
                  </a>
                </li>
                <li className="page-item active">
                  <a className="page-link" href="#">
                    1
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    ...
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    <i className="far fa-long-arrow-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GaleriPage;