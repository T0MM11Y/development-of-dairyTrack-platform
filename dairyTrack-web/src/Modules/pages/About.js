import React, { useEffect } from "react";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};
const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const AnimatedSection = ({ children, variant = fadeIn, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variant}
      custom={delay}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
  const colors = {
    primary: "#E9A319",
    secondary: "#3D8D7A",
    accent: "#F15A29",
    light: "#F8F9FA",
    dark: "#212529",
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div
        className="hero-section text-white position-relative py-5"
        style={{
          background: `linear-gradient(to right, rgba(61, 141, 122, 0.9), rgba(61, 141, 122, 0.7)), url(${require("../../assets/about.png")}) no-repeat center center`,
          backgroundSize: "cover",
          minHeight: "40vh",
          padding: "100px 0",
          borderBottom: `5px solid ${colors.primary}`,
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="text-lg-start text-center">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1
                  className="display-4 fw-bold mb-3"
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    letterSpacing: "2px",
                    fontSize: "45px",
                    fontWeight: "700",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Seputar Sapi di TSTH<sup>2</sup>
                </h1>
                <div
                  className="title-bar mb-4"
                  style={{
                    width: "80px",
                    height: "4px",
                    background: colors.primary,
                  }}
                ></div>
                <p
                  className="lead mb-4"
                  style={{ fontSize: "18px", maxWidth: "600px" }}
                >
                  <i className="fas fa-paw me-2"></i>
                  TSTH<sup>2</sup> tidak hanya fokus pada tanaman herbal dan
                  hortikultura, tetapi juga menjadi pusat pengembangan dan riset
                  sapi perah. Kami berkomitmen pada inovasi peternakan sapi yang
                  berkelanjutan dan modern.
                </p>
              </motion.div>
            </Col>
            <Col lg={4} className="d-none d-lg-block">
              <motion.div
                className="text-end"
                initial="hidden"
                animate="visible"
                variants={slideInRight}
              >
                <div
                  className="icon-circle"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(5px)",
                    margin: "0 auto",
                  }}
                >
                  <i className="fas fa-paw fa-5x"></i>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* Intro Section */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} className="text-center">
            <AnimatedSection>
              <div className="mb-5">
                <h2 className="display-6 fw-bold mb-4">
                  Pusat Riset & Inovasi{" "}
                  <span style={{ color: colors.primary }}>Peternakan Sapi</span>
                </h2>
                <p
                  className="lead text-muted mb-0"
                  style={{ fontSize: "18px", lineHeight: "1.7" }}
                >
                  TSTH<sup>2</sup> mengembangkan teknologi dan manajemen
                  peternakan sapi berbasis data, nutrisi, dan kesehatan hewan.
                  Kami mendukung peternak lokal untuk meningkatkan produktivitas
                  dan kualitas sapi Indonesia.
                </p>
              </div>
            </AnimatedSection>
          </Col>
        </Row>
      </Container>
      {/* Info Cards Section */}
      <div style={{ backgroundColor: colors.light, padding: "80px 0" }}>
        <Container>
          <Row className="g-4">
            <Col lg={3} md={6}>
              <AnimatedSection variant={scaleIn} delay={0.2}>
                <Card className="h-100 shadow border-0 rounded-4 hover-lift">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="icon-circle me-3 p-3"
                        style={{
                          backgroundColor: `${colors.secondary}15`,
                          color: colors.secondary,
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-glass-whiskey fa-lg"></i>
                      </div>
                      <h3 className="mb-0 fw-bold" style={{ fontSize: "22px" }}>
                        Sapi Perah
                      </h3>
                    </div>
                    <p className="text-muted">
                      Fokus pada produksi susu berkualitas tinggi melalui
                      manajemen nutrisi, kesehatan, dan lingkungan kandang yang
                      optimal.
                    </p>
                  </Card.Body>
                </Card>
              </AnimatedSection>
            </Col>
            <Col lg={3} md={6}>
              <AnimatedSection variant={scaleIn} delay={0.3}>
                <Card className="h-100 shadow border-0 rounded-4 hover-lift">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="icon-circle me-3 p-3"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-dna fa-lg"></i>
                      </div>
                      <h3 className="mb-0 fw-bold" style={{ fontSize: "22px" }}>
                        Girolando
                      </h3>
                    </div>
                    <p className="text-muted">
                      Sapi Girolando adalah hasil persilangan antara sapi Gir
                      dan Holstein, menggabungkan ketahanan tropis dengan
                      produktivitas susu tinggi.
                    </p>
                  </Card.Body>
                </Card>
              </AnimatedSection>
            </Col>
            <Col lg={3} md={6}>
              <AnimatedSection variant={scaleIn} delay={0.4}>
                <Card className="h-100 shadow border-0 rounded-4 hover-lift">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="icon-circle me-3 p-3"
                        style={{
                          backgroundColor: `${colors.accent}15`,
                          color: colors.accent,
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-stethoscope fa-lg"></i>
                      </div>
                      <h3 className="mb-0 fw-bold" style={{ fontSize: "22px" }}>
                        Kesehatan & Nutrisi
                      </h3>
                    </div>
                    <p className="text-muted">
                      TSTH<sup>2</sup> menerapkan standar kesehatan hewan dan
                      nutrisi berbasis riset untuk memastikan kesejahteraan
                      sapi.
                    </p>
                  </Card.Body>
                </Card>
              </AnimatedSection>
            </Col>
            <Col lg={3} md={6}>
              <AnimatedSection variant={scaleIn} delay={0.5}>
                <Card className="h-100 shadow border-0 rounded-4 hover-lift">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="icon-circle me-3 p-3"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-leaf fa-lg"></i>
                      </div>
                      <h3 className="mb-0 fw-bold" style={{ fontSize: "22px" }}>
                        Lingkungan Hijau
                      </h3>
                    </div>
                    <p className="text-muted">
                      Komitmen pada keberlanjutan dengan menjaga keseimbangan
                      ekosistem dan mendukung praktik peternakan ramah
                      lingkungan.
                    </p>
                  </Card.Body>
                </Card>
              </AnimatedSection>
            </Col>
          </Row>
        </Container>
      </div>
      {/* Featured Image Section with Stats */}
      <Container className="my-5 py-5">
        <Row className="align-items-center">
          <Col lg={6}>
            <AnimatedSection variant={slideInLeft}>
              <div className="position-relative">
                <Image
                  src={require("../../assets/about.png")}
                  alt="Sapi TSTH2"
                  fluid
                  className="rounded-4 shadow"
                  style={{
                    objectFit: "contain", // Changed from contain
                    height: "400px",
                    width: "100%",
                  }}
                />
                <div
                  className="position-absolute p-3 rounded-3 shadow"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    bottom: "-20px",
                    right: "-20px",
                    maxWidth: "180px",
                  }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        color: colors.primary,
                        fontWeight: "bold",
                        fontSize: "32px",
                      }}
                    >
                      200+
                    </div>
                    <div className="text-muted" style={{ fontSize: "14px" }}>
                      Populasi Sapi
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </Col>
          <Col lg={6} className="mt-5 mt-lg-0">
            <AnimatedSection variant={slideInRight}>
              <h2 className="display-6 fw-bold mb-4">
                Inovasi Peternakan{" "}
                <span style={{ color: colors.secondary }}>Sapi Modern</span>
              </h2>
              <div
                className="mb-4"
                style={{
                  width: "60px",
                  height: "3px",
                  background: colors.primary,
                }}
              ></div>
              <p className="mb-4">
                Kami mengintegrasikan teknologi digital untuk monitoring sapi,
                pencatatan produksi susu, pertumbuhan, dan kesehatan. TSTH
                <sup>2</sup> juga aktif dalam pelatihan peternak dan
                pengembangan SDM peternakan sapi.
              </p>
              <Row className="g-4 mt-2">
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "15px",
                      }}
                    >
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div>
                      <h5
                        className="mb-1 fw-bold"
                        style={{ fontSize: "1.35rem", color: colors.dark }}
                      >
                        1000+
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Liter Susu/Hari
                      </p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        backgroundColor: `${colors.secondary}15`,
                        color: colors.secondary,
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "15px",
                      }}
                    >
                      <i className="fas fa-user-graduate"></i>
                    </div>
                    <div>
                      <h5
                        className="mb-1 fw-bold"
                        style={{ fontSize: "1.35rem", color: colors.dark }}
                      >
                        50+
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Peternak Terlatih
                      </p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        backgroundColor: `${colors.accent}15`,
                        color: colors.accent,
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "15px",
                      }}
                    >
                      <i className="fas fa-dna"></i>
                    </div>
                    <div>
                      <h5
                        className="mb-1 fw-bold"
                        style={{ fontSize: "1.35rem", color: colors.dark }}
                      >
                        10+
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Riset Genetik
                      </p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "15px",
                      }}
                    >
                      <i className="fas fa-award"></i>
                    </div>
                    <div>
                      <h5
                        className="mb-1 fw-bold"
                        style={{ fontSize: "1.35rem", color: colors.dark }}
                      >
                        5+
                      </h5>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Penghargaan Sapi
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </AnimatedSection>
          </Col>
        </Row>
      </Container>
      {/* Girolando Detail Section - NEW SECTION */}
      <div style={{ backgroundColor: colors.light, padding: "40px 0" }}>
        <Container>
          <Row className="justify-content-center mb-4">
            <Col md={10} className="text-center">
              <AnimatedSection>
                <h2 className="display-6 fw-bold mb-4">
                  Pengembangan Breed{" "}
                  <span style={{ color: colors.primary }}>Girolando</span>
                </h2>
                <div
                  className="mx-auto mb-4"
                  style={{
                    width: "80px",
                    height: "3px",
                    background: colors.primary,
                  }}
                ></div>
              </AnimatedSection>
            </Col>
          </Row>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <AnimatedSection variant={slideInLeft}>
                <div className="position-relative">
                  <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow">
                    {/* TODO: Ganti dengan URL video YouTube yang sebenarnya tentang sapi Girolando di TSTH2 */}
                    <iframe
                      src="https://www.youtube.com/embed/ajYPqE9p3LM"
                      title="Girolando Cattle Breed di TSTH2"
                      allowFullScreen
                      className="rounded-4"
                    ></iframe>
                  </div>
                  <div
                    className="position-absolute p-3 rounded-3 shadow"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      bottom: "-15px",
                      right: "-15px",
                      maxWidth: "200px",
                    }}
                  >
                    <div className="text-center">
                      <div
                        style={{
                          color: colors.secondary,
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        Breed Unggulan
                      </div>
                      <div className="text-muted" style={{ fontSize: "14px" }}>
                        TSTH<sup>2</sup>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </Col>
            <Col lg={6}>
              <AnimatedSection variant={slideInRight}>
                <h3 className="fw-bold mb-4">Karakteristik Breed Girolando</h3>
                <p>
                  Girolando dikembangkan pertama kali di Brasil dan sekarang
                  menjadi salah satu breed sapi perah utama di daerah tropis. Di
                  TSTH<sup>2</sup>, kami memilih Girolando karena keunggulannya
                  dalam hal:
                </p>

                <div className="my-4">
                  <Row className="g-3">
                    <Col sm={6}>
                      <div className="d-flex">
                        <div
                          style={{ color: colors.primary, marginRight: "10px" }}
                        >
                          <i className="fas fa-check-circle mt-1"></i>
                        </div>
                        <div>
                          <strong>Adaptabilitas Iklim</strong>
                          {/* TODO: Pastikan deskripsi ini sesuai dengan data TSTH2 */}
                          <p className="text-muted small mb-0">
                            Toleransi panas dan kelembaban tinggi di iklim
                            tropis
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="d-flex">
                        <div
                          style={{ color: colors.primary, marginRight: "10px" }}
                        >
                          <i className="fas fa-check-circle mt-1"></i>
                        </div>
                        <div>
                          <strong>Resistensi Penyakit</strong>
                          {/* TODO: Pastikan deskripsi ini sesuai dengan data TSTH2 */}
                          <p className="text-muted small mb-0">
                            Ketahanan terhadap parasit dan penyakit tropis
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="d-flex">
                        <div
                          style={{ color: colors.primary, marginRight: "10px" }}
                        >
                          <i className="fas fa-check-circle mt-1"></i>
                        </div>
                        <div>
                          <strong>Produksi Susu</strong>
                          {/* TODO: Update dengan data produksi susu rata-rata aktual di TSTH2 */}
                          <p className="text-muted small mb-0">
                            Rata-rata 15-25 liter/hari dengan kadar lemak 4-5%
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="d-flex">
                        <div
                          style={{ color: colors.primary, marginRight: "10px" }}
                        >
                          <i className="fas fa-check-circle mt-1"></i>
                        </div>
                        <div>
                          <strong>Masa Laktasi</strong>
                          {/* TODO: Update dengan data masa laktasi rata-rata aktual di TSTH2 */}
                          <p className="text-muted small mb-0">
                            Periode laktasi 275-305 hari dengan persistensi baik
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <p>
                  {/* TODO: Pastikan informasi ini akurat dan spesifik untuk TSTH2 */}
                  Di TSTH<sup>2</sup>, kami memelihara populasi Girolando dengan
                  perbandingan genetik 5/8 Holstein dan 3/8 Gir yang telah
                  terbukti optimal untuk kondisi iklim Indonesia.
                </p>

                <div className="mt-4">
                  <a
                    href="https://openknowledge.fao.org/bitstreams/94676ea4-7091-4c52-adea-d23f573d0b50/download"
                    className="btn btn-sm px-4 py-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: colors.secondary,
                      color: "white",
                    }}
                  >
                    <i className="fas fa-book-open me-2"></i>
                    Download Penelitian FAO tentang Girolando
                  </a>
                  <a
                    href="https://www.embrapa.br/en/gado-de-leite"
                    className="btn btn-outline-secondary btn-sm px-4 py-2 ms-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-external-link-alt me-2"></i>
                    Embrapa Dairy Cattle Research
                  </a>
                </div>
              </AnimatedSection>
            </Col>
          </Row>
        </Container>
      </div>
      {/* Vision & Mission Section */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.secondary}05, ${colors.primary}10)`,
          padding: "80px 0",
        }}
      >
        <Container>
          <AnimatedSection>
            <div className="text-center mb-5">
              <h2 className="display-6 fw-bold position-relative d-inline-block">
                Visi & Misi Peternakan Sapi
                <div
                  style={{
                    position: "absolute",
                    height: "4px",
                    width: "60%",
                    backgroundColor: colors.primary,
                    bottom: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderRadius: "2px",
                  }}
                ></div>
              </h2>
              <p
                className="lead text-muted mt-4 mx-auto"
                style={{ maxWidth: "700px" }}
              >
                Menjadi pusat unggulan riset, inovasi, dan pengembangan sapi di
                Indonesia.
              </p>
            </div>
          </AnimatedSection>
          <Row className="g-4">
            <Col md={5}>
              <AnimatedSection variant={slideInLeft}>
                <Card
                  className="border-0 shadow rounded-4 h-100 p-2"
                  style={{ borderLeft: `5px solid ${colors.primary}` }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="icon-circle me-3"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-lightbulb fa-lg"></i>
                      </div>
                      <h3 className="mb-0 fw-bold">Visi</h3>
                    </div>
                    <p
                      className="mb-0"
                      style={{ fontSize: "17px", lineHeight: "1.7" }}
                    >
                      Menjadi pusat riset dan inovasi peternakan sapi yang
                      menghasilkan teknologi, produk untuk mendukung ketahanan
                      pangan nasional. Kami berkomitmen untuk menjadi rujukan di
                      tingkat nasional dan regional dalam pengembangan
                      peternakan sapi yang berkelanjutan, efisien, dengan
                      integrasi teknologi modern untuk kesejahteraan peternak
                      dan kemandirian industri peternakan Indonesia.
                    </p>
                  </Card.Body>
                </Card>
              </AnimatedSection>
            </Col>
            <Col md={7}>
              <AnimatedSection variant={slideInRight}>
                <Card
                  className="border-0 shadow rounded-4 h-100 p-2"
                  style={{ borderLeft: `5px solid ${colors.secondary}` }}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="icon-circle me-3"
                        style={{
                          backgroundColor: `${colors.secondary}15`,
                          color: colors.secondary,
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-bullseye fa-lg"></i>
                      </div>
                      <h3 className="mb-0 fw-bold">Misi</h3>
                    </div>
                    <ul
                      className="list-unstyled mission-list"
                      style={{ fontSize: "17px", lineHeight: "1.7" }}
                    >
                      <li className="mb-3 d-flex">
                        <div className="me-3" style={{ color: colors.primary }}>
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div>
                          Mengembangkan sistem pemeliharaan sapi berbasis
                          teknologi dan data.
                        </div>
                      </li>
                      <li className="mb-3 d-flex">
                        <div className="me-3" style={{ color: colors.primary }}>
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div>
                          Melakukan riset nutrisi, kesehatan, dan genetika sapi
                          untuk meningkatkan produktivitas.
                        </div>
                      </li>
                      <li className="mb-3 d-flex">
                        <div className="me-3" style={{ color: colors.primary }}>
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div>
                          Meningkatkan kapasitas peternak melalui pelatihan dan
                          pendampingan.
                        </div>
                      </li>
                      <li className="d-flex">
                        <div className="me-3" style={{ color: colors.primary }}>
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div>
                          Menjadi pusat kolaborasi nasional dan internasional di
                          bidang peternakan sapi.
                        </div>
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </AnimatedSection>
            </Col>
          </Row>
        </Container>
      </div>
      <style jsx>{`
        .about-page {
          font-family: "Roboto", sans-serif;
        }
        .hover-lift {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }
        .mission-list li {
          position: relative;
          /* padding-left: 10px; Removed as d-flex and me-3 on icon container handle spacing */
        }
      `}</style>
    </div>
  );
};

export default About;
