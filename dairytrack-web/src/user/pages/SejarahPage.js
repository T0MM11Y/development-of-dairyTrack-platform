import React from "react";

const SejarahPage = () => {
  return (
    <div className="container custom-container">
      <div className="row justify-content-center">
        <div className="col-xl-6 col-lg-8 col-md-10">
          <div className="breadcrumb__wrap__content">
            <h2 className="title">Case Study</h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="index.html">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Portfolio
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <div className="breadcrumb__wrap__icon">
        <ul>
          <li>
            <img src="assets/img/icons/breadcrumb_icon01.png" alt="" />
          </li>
          <li>
            <img src="assets/img/icons/breadcrumb_icon02.png" alt="" />
          </li>
          <li>
            <img src="assets/img/icons/breadcrumb_icon03.png" alt="" />
          </li>
          <li>
            <img src="assets/img/icons/breadcrumb_icon04.png" alt="" />
          </li>
          <li>
            <img src="assets/img/icons/breadcrumb_icon05.png" alt="" />
          </li>
          <li>
            <img src="assets/img/icons/breadcrumb_icon06.png" alt="" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SejarahPage;
