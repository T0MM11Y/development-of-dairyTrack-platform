import React from "react";
import "./../App.css";
import logoImage from "./../assets/frontend/images/my-farm.png";
import cuteCowImage from "./../assets/frontend/images/cute_cow.png";
import freshMilkImage from "./../assets/frontend/images/fresh milk.png";
import curdPouchImage from "./../assets/frontend/images/curd-pouch.png";
import deliveryPicImage from "./../assets/frontend/images/delivery-pic.png";
import allMilkImage from "./../assets/frontend/images/all-milk-img.png";
import skimMilkImage from "./../assets/frontend/images/skim milk.jpg";
import otherMilkImage from "./../assets/frontend/images/other milk.jpg";
import allCurdImage from "./../assets/frontend/images/all curd img.png";
import handWatchImage from "./../assets/frontend/images/hand watch.png";
import guaranteedImage from "./../assets/frontend/images/guaranteed.png";

function App() {
  return (
    <div>
      <nav id="navbar">
        <input type="checkbox" id="check" />
        <label htmlFor="check" className="checkbtn">
          <i className="fas fa-bars"></i>
        </label>
        <img className="logo-image" src={logoImage} alt="logo-image" />
        <ul>
          <li className="item">
            <a href="#home">Home</a>
          </li>
          <li className="item">
            <a href="Login page/index.html">Login</a>
          </li>
          <li className="item">
            <a href="SignUp page/index.html">Sign Up</a>
          </li>
          <li className="item">
            <a href="Contact me/index.html">Contact Us</a>
          </li>
          <li className="item">
            <a href="about us/about.html">About Us</a>
          </li>
        </ul>
      </nav>

      <section id="home" className="home">
        <div>
          <h1>DISCOVER THE PUREST TASTE OF NATURE</h1>
          <br />
          <p>
            Welcome to My Milk Farm, where nature's bounty comes to life in
            every drop of milk.
          </p>
          <p>Start your day with the purest essence of nature.</p>
          <p>
            Experience the joy of farm-fresh milk delivered right to your
            doorstep.
          </p>
          <p>
            From our happy and healthy cows to your breakfast table, we ensure
            only the best reaches your family.
          </p>
        </div>
        <button className="btn">
          <a href="Address/index.html">Order Now</a>
        </button>
        <img className="cow" src={cuteCowImage} alt="" />
      </section>

      <section className="delivery-process">
        <div className="milk">
          <img className="milk-img" src={freshMilkImage} alt="" height="200" />
          <h3>Fresh Milk</h3>
          <br />
          <p>Enjoy our carefully collected</p>
          <p>and quality-checked fresh milk.</p>
        </div>

        <div className="curd">
          <img className="curd-img" src={curdPouchImage} alt="" height="160" />
          <h3>Fresh Curd</h3>
          <br />
          <p>Savor our healthy and</p>
          <p>delicious farm-fresh curd.</p>
        </div>

        <div className="delivry-girl">
          <img className="delivery-girl-img" src={deliveryPicImage} alt="" />
          <h3>Safe Delivery</h3>
          <br />
          <p>Our safe delivery process for</p>
          <p>a hygienic product at your door.</p>
        </div>
      </section>

      <section className="product">
        <h2>Milk Product</h2>
        <section className="product-container">
          <div className="all-milk product-item">
            <img
              style={{ backgroundPosition: "center" }}
              className="all-milk-img"
              src={allMilkImage}
              alt=""
              height="400"
            />
            <hr />
            <h3>All Milk</h3>
            <br />
            <p>
              Indulge in the rich and creamy taste of our All Milk. It's perfect
              for drinking, cooking, and making your favorite dairy treats.
              Sourced from happy cows, it's the purest milk you can find.
            </p>
            <button className="btn">
              <a href="payment/index.html">Order Now</a>
            </button>
          </div>

          <div className="low-fat-milk product-item">
            <img
              className="low-fat-img"
              src={skimMilkImage}
              alt=""
              height="200"
            />
            <hr />
            <h3>Low Fat Milk</h3>
            <br />
            <p>
              Looking for a healthier option? Try our Low Fat Milk, a delicious
              choice for those who prefer a lighter milk without compromising on
              taste. It's a great option for your daily nutritional needs.
            </p>
            <button className="btn">
              <a href="payment/index.html">Order Now</a>
            </button>
          </div>

          <div className="other-milk product-item">
            <img
              className="other-milk-img"
              src={otherMilkImage}
              alt=""
              height="200"
            />
            <hr />
            <h3>Other Milk</h3>
            <br />
            <p>
              Explore our range of Other Milk varieties, including flavored milk
              and more specialty options. Each one is crafted with care to offer
              a unique and delightful milk experience.
            </p>
            <button className="btn">
              <a href="payment/index.html">Order Now</a>
            </button>
          </div>

          <div className="all-curd product-item">
            <img
              className="all-curd-img"
              src={allCurdImage}
              alt=""
              height="200"
            />
            <hr />
            <h3>All Curd</h3>
            <br />
            <p>
              Experience the smooth and velvety texture of our All Curd. Made
              using traditional methods, our curd is rich in probiotics and adds
              a delightful tang to your meals and snacks.
            </p>
            <button className="btn">
              <a href="payment/index.html">Order Now</a>
            </button>
          </div>
        </section>
      </section>
      <hr />

      <section className="guaranteed-section">
        <h1>We Guaranteed You</h1>
        <div className="watch">
          <img src={handWatchImage} alt="watch image" height="230" />
          <p>On-time every time guaranteed</p>
        </div>
        <div className="guaranteed">
          <img src={guaranteedImage} alt="guaranteed-logo img" height="150" />
          <p style={{ marginTop: "20px" }}>
            Freshness you can trust on my farm
          </p>
        </div>
      </section>

      <section className="section-contact-us">
        <button className="contact-btn">
          <a href="Contact me/index.html">Contact Us</a>
        </button>
        <div className="social-media">
          <a className="social" href="#">
            <i className="fa fa-linkedin-square"></i>
          </a>
          <a className="social" href="#">
            <i className="fa fa-twitter"></i>
          </a>
          <a className="social" href="#">
            <i className="fa-brands fa-square-instagram"></i>
          </a>
        </div>
        <div className="copyright">
          <p>copyright@2022 My Milk Farm</p>
        </div>
      </section>
    </div>
  );
}

export default App;
