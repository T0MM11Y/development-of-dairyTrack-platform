import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { motion } from "framer-motion"; // Optional - add this package for animations

const About = () => {
  // Define consistent styling variables
  const primaryColor = "#E9A319"; // gold - matching Blog page
  const greyColor = "#6c757d"; // grey - matching Blog page

  return (
    <Container fluid className="p-0">
      {/* Hero Section */}
      <div
        className="text-white py-5"
        style={{
          background: greyColor,
          padding: "60px 0",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8} className="text-md-start text-center">
              <h1
                className="display-4 fw-bold mb-2"
                style={{
                  fontFamily: "Roboto, monospace",
                  letterSpacing: "1.5px",
                  fontSize: "40px",
                  fontWeight: "600",
                }}
              >
                Tentang TSTH2
              </h1>
              <p className="lead mb-4">
                <i className="fas fa-leaf me-2"></i>
                Taman Sains Teknologi Herbal dan Hortikultura Indonesia
              </p>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <div className="text-end">
                <i className="fas fa-seedling fa-5x"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        <Row className="mb-5">
          {/* Overview Section */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header
                className="py-3"
                style={{
                  background: greyColor,
                  color: "white",
                }}
              >
                <h3 className="m-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Sekilas TSTH2
                </h3>
              </Card.Header>
              <Card.Body>
                <p className="lead">
                  Indonesian Herbal and Horticulture Science Techno Park
                </p>
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <i
                      className="fas fa-check-circle me-2"
                      style={{ color: primaryColor }}
                    ></i>
                    Inisiatif pemerintah sebagai pusat riset herbal hortikultura
                    terdepan di Indonesia
                  </li>
                  <li className="mb-3">
                    <i
                      className="fas fa-check-circle me-2"
                      style={{ color: primaryColor }}
                    ></i>
                    Berada di bawah KEMENDIKTISAINTEK dengan tata kelola
                    bekerjasama dengan Institut Teknologi Del
                  </li>
                  <li className="mb-3">
                    <i
                      className="fas fa-check-circle me-2"
                      style={{ color: primaryColor }}
                    ></i>
                    Didukung oleh konsorsium riset nasional dan internasional
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          {/* Image - Aerial View */}
          <Col lg={6} className="mb-4">
            <div className="rounded shadow-sm overflow-hidden h-100">
              <img
                src={require("../../assets/aerial.png")}
                alt="Aerial view of TSTH2"
                className="img-fluid w-100 h-100 object-fit-cover"
                style={{ minHeight: "300px" }}
              />
            </div>
          </Col>
        </Row>

        <Row className="mb-5">
          {/* Location and Facilities */}
          <Col lg={6} className="mb-4 order-lg-2">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header
                className="py-3"
                style={{
                  background: greyColor,
                  color: "white",
                }}
              >
                <h3 className="m-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Lokasi dan Fasilitas
                </h3>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <h5 style={{ color: primaryColor }}>Informasi Lokasi</h5>
                  <ul>
                    <li>Dibangun sejak 2021 (15 Ha)</li>
                    <li>
                      Bagian dari KHDTK Penelitian dan Pengembangan Kehutanan
                      (500 Ha)
                    </li>
                    <li>Kabupaten Humbang Hasundutan, Sumatera Utara</li>
                    <li>Ketinggian: 1.400 - 1.480 mdpl</li>
                    <li>
                      Dekat dengan Danau Toba, Dolok Sanggul, dan Bandara
                      Silangit
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 style={{ color: primaryColor }}>Fasilitas Utama</h5>
                  <Row>
                    <Col md={6}>
                      <ul>
                        <li>Gedung Riset Pertanian</li>
                        <li>Gedung Riset Herbal</li>
                        <li>Greenhouse</li>
                        <li>Screenhouse (3 unit)</li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul>
                        <li>Pilot Plant Ekstraksi</li>
                        <li>Biofertilizer Pilot Plant</li>
                        <li>Gedung Manajemen</li>
                        <li>Guest House</li>
                      </ul>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Facilities Image */}
          <Col lg={6} className="mb-4 order-lg-1">
            <div className="rounded shadow-sm overflow-hidden h-100">
              <img
                src={require("../../assets/facility.png")}
                alt="Fasilitas TSTH2"
                className="img-fluid w-100 h-100 object-fit-cover"
                style={{ minHeight: "300px" }}
              />
            </div>
          </Col>
        </Row>

        {/* Vision & Mission */}
        <Row className="mb-5">
          <Col lg={12}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header
                className="py-3"
                style={{
                  background: greyColor,
                  color: "white",
                }}
              >
                <h3 className="m-0">
                  <i className="fas fa-bullseye me-2"></i>
                  Visi & Misi
                </h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={7} className="order-md-1">
                    <div className="mb-4">
                      <h4 style={{ color: primaryColor }}>Visi</h4>
                      <div
                        className="p-3 rounded mb-4"
                        style={{
                          backgroundColor: "#fff9e6",
                          borderLeft: `4px solid ${primaryColor}`,
                        }}
                      >
                        <p className="mb-0">
                          Menjadi pusat riset herbal hortikultura terdepan di
                          Indonesia yang menghasilkan inovasi dan teknologi
                          berdaya saing global, berkelanjutan dan berdampak
                          sosial.
                        </p>
                      </div>

                      <h4 style={{ color: primaryColor }}>Misi</h4>
                      <ol className="ps-3">
                        <li className="mb-2">
                          Mengembangkan benih herbal dan hortikultura yang
                          memenuhi standar internasional dan ramah lingkungan
                        </li>
                        <li className="mb-2">
                          Membangun fasilitas riset terintegrasi untuk
                          pengembangan teknologi pascapanen herbal berkelanjutan
                        </li>
                        <li className="mb-2">
                          Meningkatkan kolaborasi dan koordinasi antara lembaga
                          riset, universitas, pemerintah dan industri
                        </li>
                        <li className="mb-2">
                          Mengembangkan prioritas riset herbal nasional dan
                          global dengan mempertimbangkan keberlanjutan
                        </li>
                        <li className="mb-2">
                          Menghasilkan inovasi dan teknologi yang berdampak pada
                          kesejahteraan masyarakat dan lingkungan
                        </li>
                      </ol>
                    </div>
                  </Col>

                  <Col md={5} className="order-md-2">
                    {/* Research Activity Image */}
                    <div className="rounded shadow-sm overflow-hidden h-100">
                      <img
                        src={require("../../assets/visiMisi.png")}
                        alt="Aktivitas Penelitian TSTH2"
                        className="img-fluid w-100 h-100 object-fit-cover"
                        style={{ minHeight: "400px" }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Biodiversitas Section */}
        <Row className="mb-5">
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header
                className="py-3"
                style={{
                  background: greyColor,
                  color: "white",
                }}
              >
                <h3 className="m-0">
                  <i className="fas fa-leaf me-2"></i>
                  Konteks Biodiversitas dan Ekonomi
                </h3>
              </Card.Header>
              <Card.Body>
                <p className="mb-3">
                  Indonesia merupakan negara biodiversitas terbesar di dunia
                  dengan fokus pada tanaman herbal dan hortikultura yang
                  memiliki nilai ekonomi tinggi.
                </p>

                <h5 style={{ color: primaryColor }}>Komoditas Unggulan</h5>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <Badge
                    bg="light"
                    text="dark"
                    className="p-2"
                    style={{
                      fontWeight: "500",
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    Jahe
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="p-2"
                    style={{
                      fontWeight: "500",
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    Kunyit
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="p-2"
                    style={{
                      fontWeight: "500",
                      letterSpacing: "1px",
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    Temulawak
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="p-2"
                    style={{
                      fontWeight: "500",
                      letterSpacing: "1px",

                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    Kentang
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="p-2"
                    style={{
                      fontWeight: "500",
                      letterSpacing: "1px",

                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    Bawang Merah
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="p-2"
                    style={{
                      fontWeight: "500",
                      letterSpacing: "1px",

                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    Bawang Putih
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="p-2"
                    style={{
                      fontWeight: "500",
                      letterSpacing: "1px",

                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    Nilam
                  </Badge>
                </div>

                <div className="alert alert-warning">
                  <i className="fas fa-chart-line me-2"></i>
                  Data produktivitas dan nilai ekonomi komoditas dapat dilihat
                  pada laporan tahunan kami.
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Plants Image - Displaying all commodities */}
          <Col md={6} className="mb-4">
            <div className="rounded shadow-sm overflow-hidden h-100">
              <img
                src={require("../../assets/commodity.png")}
                alt="Komoditas Unggulan TSTH2"
                className="img-fluid w-100 h-100 object-fit-cover"
                style={{
                  minHeight: "400px",
                  objectPosition: "center",
                }}
              />
              <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white p-3">
                <p className="small mb-0 text-center">
                  <i className="fas fa-seedling me-2"></i>
                  Komoditas unggulan: Jahe, Kunyit, Temulawak, Kentang, Bawang
                  Merah, dan Nilam
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Full-width panorama image */}
      </Container>

      {/* Custom CSS for animations and effects */}
      <style jsx>{`
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        .badge {
          transition: all 0.3s ease;
        }
        .badge:hover {
          background-color: ${primaryColor} !important;
          color: white !important;
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default About;
