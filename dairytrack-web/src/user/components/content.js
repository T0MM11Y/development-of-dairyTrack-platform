import React from "react";

// Import images from the src folder

import bannerImg from "../../assets/client/img/banner/banner_img.png";
import aboutIcon from "../../assets/client/img/icons/about_icon.png";
import "../../assets/client/css/bootstrap.min.css";

// Import service images
import servicesImg01 from "../../assets/client/img/images/services_img01.jpg";
import servicesImg02 from "../../assets/client/img/images/services_img02.jpg";
import servicesImg03 from "../../assets/client/img/images/services_img03.jpg";
import servicesImg04 from "../../assets/client/img/images/services_img04.jpg";
import servicesLightIcon01 from "../../assets/client/img/icons/services_light_icon01.png";
import servicesLightIcon02 from "../../assets/client/img/icons/services_light_icon02.png";
import servicesLightIcon03 from "../../assets/client/img/icons/services_light_icon03.png";
import servicesLightIcon04 from "../../assets/client/img/icons/services_light_icon04.png";
import servicesIcon01 from "../../assets/client/img/icons/services_icon01.png";
import servicesIcon02 from "../../assets/client/img/icons/services_icon02.png";
import servicesIcon03 from "../../assets/client/img/icons/services_icon03.png";
import servicesIcon04 from "../../assets/client/img/icons/services_icon04.png";
import wpLightIcon01 from "../../assets/client/img/icons/wp_light_icon01.png";
import wpLightIcon02 from "../../assets/client/img/icons/wp_light_icon02.png";
import wpLightIcon03 from "../../assets/client/img/icons/wp_light_icon03.png";
import wpLightIcon04 from "../../assets/client/img/icons/wp_light_icon04.png";
import wpIcon01 from "../../assets/client/img/icons/wp_icon01.png";
import wpIcon02 from "../../assets/client/img/icons/wp_icon02.png";
import wpIcon03 from "../../assets/client/img/icons/wp_icon03.png";
import wpIcon04 from "../../assets/client/img/icons/wp_icon04.png";

function Content() {
  return (
    <main>
      <div>
        <section className="banner">
          <div className="container custom-container">
            <div className="row align-items-center justify-content-center justify-content-lg-between">
              <div className="col-lg-6 order-0 order-lg-2">
                <div className="banner__img text-center text-xxl-end">
                  <img src={bannerImg} alt="Banner" />
                </div>
              </div>
              <div className="col-xl-5 col-lg-6">
                <div className="banner__content">
                  <h2 className="title wow fadeInUp" data-wow-delay=".2s">
                    <span>Optimize Your Dairy Farm</span> <br /> with DairyTrack
                  </h2>
                  <p className="wow fadeInUp" data-wow-delay=".4s">
                    DairyTrack is a comprehensive platform designed to
                    streamline your dairy farm operations and boost productivity
                  </p>
                  <a
                    href="about.html"
                    className="btn banner__btn wow fadeInUp"
                    data-wow-delay=".6s"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="scroll__down">
            <a href="#aboutSection" className="scroll__link">
              Scroll down
            </a>
          </div>
          <div className="banner__video">
            <a
              href="https://www.youtube.com/watch?v=XHOmBV4js_E"
              className="popup-video"
            >
              <i className="fas fa-play"></i>
            </a>
          </div>
        </section>

        <section id="aboutSection" className="about">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <ul className="about__icons__wrap">
                  <li>
                    <a href="services.html#service01">
                      <img
                        src={servicesLightIcon01}
                        alt="Services Icon 01"
                        className="about__icon"
                      />
                    </a>
                    <a href="services.html#service01">
                      <img
                        src={servicesIcon01}
                        alt="Services Icon 01"
                        className="about__icon__dark"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="services.html#service02">
                      <img
                        src={servicesLightIcon02}
                        alt="Services Icon 02"
                        className="about__icon"
                      />
                    </a>
                    <a href="services.html#service02">
                      <img
                        src={servicesIcon02}
                        alt="Services Icon 02"
                        className="about__icon__dark"
                      />
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-6">
                <div className="about__content">
                  <div className="section__title">
                    <span className="sub-title">01 - About DairyTrack</span>
                    <h2 className="title">
                      Transform your dairy farm management with cutting-edge
                      technology
                    </h2>
                  </div>
                  <div className="about__exp">
                    <div className="about__exp__icon">
                      <img src={aboutIcon} alt="About Icon" />
                    </div>
                    <div className="about__exp__content">
                      <p>
                        5+ Years of Experience in <br /> Dairy Farm Management
                        Solutions
                      </p>
                    </div>
                  </div>
                  <p className="desc">
                    DairyTrack is a smart dairy farm management platform that
                    helps farmers efficiently track and manage milk production,
                    cow health, feed scheduling, and milk sales. Our platform
                    provides real-time insights and analytics to optimize dairy
                    operations.
                  </p>
                  <a href="about.html" className="btn">
                    Explore Features
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New services section */}
        <section className="services">
          <div className="container">
            <div className="services__title__wrap">
              <div className="row align-items-center justify-content-between">
                <div className="col-xl-5 col-lg-6 col-md-8">
                  <div className="section__title">
                    <span className="sub-title">02 - Our Services</span>
                    <h2 className="title">
                      Comprehensive Dairy Farm Management
                    </h2>
                  </div>
                </div>
                <div className="col-xl-5 col-lg-6 col-md-4">
                  <div className="services__arrow"></div>
                </div>
              </div>
            </div>
            <div className="row gx-0 services__active">
              {/* Service items */}
              {[
                {
                  imgSrc: servicesImg01,
                  lightIcon: servicesLightIcon01,
                  darkIcon: servicesIcon01,
                  title: "Milk Production Monitoring",
                  description:
                    "Track and analyze milk production data for individual cows and the entire herd.",
                  list: [
                    "Real-time data collection",
                    "Production trends analysis",
                    "Individual cow performance",
                    "Automated alerts",
                  ],
                },
                {
                  imgSrc: servicesImg02,
                  lightIcon: servicesLightIcon02,
                  darkIcon: servicesIcon02,
                  title: "Cow Health Tracking",
                  description:
                    "Monitor the health status of your herd and receive timely alerts for potential issues.",
                  list: [
                    "Health record management",
                    "Vaccination schedules",
                    "Disease prevention",
                    "Veterinary appointment tracking",
                  ],
                },
                {
                  imgSrc: servicesImg03,
                  lightIcon: servicesLightIcon03,
                  darkIcon: servicesIcon03,
                  title: "Feed Management",
                  description:
                    "Optimize feed schedules and monitor consumption to improve milk production efficiency.",
                  list: [
                    "Feed inventory tracking",
                    "Nutritional analysis",
                    "Consumption monitoring",
                    "Cost optimization",
                  ],
                },
                {
                  imgSrc: servicesImg04,
                  lightIcon: servicesLightIcon04,
                  darkIcon: servicesIcon04,
                  title: "Financial Analytics",
                  description:
                    "Gain insights into your farm's financial performance and identify areas for improvement.",
                  list: [
                    "Revenue tracking",
                    "Expense management",
                    "Profit analysis",
                    "Financial reporting",
                  ],
                },
              ].map((service, index) => (
                <div className="col-xl-3" key={index}>
                  <div className="services__item">
                    <div className="services__thumb">
                      <a href="services-details.html">
                        <img src={service.imgSrc} alt="" />
                      </a>
                    </div>
                    <div className="services__content">
                      <div className="services__icon">
                        <img className="light" src={service.lightIcon} alt="" />
                        <img className="dark" src={service.darkIcon} alt="" />
                      </div>
                      <h3 className="title">
                        <a href="services-details.html">{service.title}</a>
                      </h3>
                      <p>{service.description}</p>
                      <ul className="services__list">
                        {service.list.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                      <a
                        href="services-details.html"
                        className="btn border-btn"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New work process section */}
        <section className="work__process">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-6 col-lg-8">
                <div className="section__title text-center">
                  <span className="sub-title">03 - How It Works</span>
                  <h2 className="title">
                    Streamline Your Dairy Farm Operations in Four Easy Steps
                  </h2>
                </div>
              </div>
            </div>
            <div className="row work__process__wrap">
              {[
                {
                  step: "Step - 01",
                  lightIcon: wpLightIcon01,
                  darkIcon: wpIcon01,
                  title: "Data Collection",
                  description:
                    "Gather real-time data from various sources on your farm.",
                },
                {
                  step: "Step - 02",
                  lightIcon: wpLightIcon02,
                  darkIcon: wpIcon02,
                  title: "Analysis",
                  description:
                    "Process and analyze data to generate actionable insights.",
                },
                {
                  step: "Step - 03",
                  lightIcon: wpLightIcon03,
                  darkIcon: wpIcon03,
                  title: "Optimization",
                  description:
                    "Implement data-driven strategies to improve farm performance.",
                },
                {
                  step: "Step - 04",
                  lightIcon: wpLightIcon04,
                  darkIcon: wpIcon04,
                  title: "Monitoring",
                  description:
                    "Continuously track progress and adjust strategies as needed.",
                },
              ].map((process, index) => (
                <div className="col" key={index}>
                  <div className="work__process__item">
                    <span className="work__process_step">{process.step}</span>
                    <div className="work__process__icon">
                      <img className="light" src={process.lightIcon} alt="" />
                      <img className="dark" src={process.darkIcon} alt="" />
                    </div>
                    <div className="work__process__content">
                      <h4 className="title">{process.title}</h4>
                      <p>{process.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Content;
