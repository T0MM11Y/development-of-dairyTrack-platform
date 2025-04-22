import React, { useState } from "react";
import gambarGedung from "../../assets/image/idnt1.jpg";
import gambarTanaman from "../../assets/image/idnt2.png";
import { FaCheckCircle, FaLeaf, FaIndustry, FaTree } from "react-icons/fa";
import gambarTambahan from "../../assets/image/idnt3.webp";
import { Link } from "react-router-dom";

const IdentitasPeternakanPage = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleExpand = (cardIndex) => {
    setExpandedCard(expandedCard === cardIndex ? null : cardIndex);
  };

  return (
    <div
      style={{
        position: "relative",
        fontFamily: "'Montserrat', sans-serif",
        color: "#333",
      }}
    >
      {/* Breadcrumb Section */}
      <section className="breadcrumb__wrap">
        <div className="container custom-container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="breadcrumb__wrap__content">
                <h2 className="title">Profile</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Profile
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div
        style={{
          padding: "40px 20px",
          maxWidth: "1200px",
          margin: "0 auto",
          marginBottom: "120px",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#1abc9c",
            marginBottom: "20px",
          }}
        ></h1>

        {/* About Section */}
        <section
          className="about-section"
          style={{
            backgroundColor: "white",
            borderRadius: "15px",
            padding: "40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            marginBottom: "10",
            transform: "translateY(-50px)",
          }}
        >
          <div
            className="section-header"
            style={{
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            <h2
              style={{
                fontSize: "2.2rem",
                color: "#2c3e50",
                position: "relative",
                display: "inline-block",
                marginBottom: "15px",
              }}
            >
              Tentang <span style={{ color: "#1abc9c" }}>TSTH2</span>
              <span
                style={{
                  position: "absolute",
                  bottom: "-10px",
                  left: "0",
                  width: "100%",
                  height: "3px",
                  background: "linear-gradient(90deg, #1abc9c, #3498db)",
                  borderRadius: "3px",
                }}
              ></span>
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.8",
                color: "#555",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <b>TSTH2</b> adalah peternakan modern yang baru berdiri sejak 2021
              dan akan menjadi pelopor dalam produksi susu segar berkualitas
              tinggi di Indonesia. Dengan komitmen pada kesejahteraan hewan dan
              standar higienis yang ketat, kami menghasilkan susu segar yang
              kaya nutrisi untuk keluarga Indonesia.
            </p>
          </div>

          {/* Stats Grid */}
          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
              marginTop: "40px",
            }}
          >
            {[
              {
                icon: <FaIndustry size={40} />,
                value: "1.200+",
                description: "Ekor sapi perah dengan ras unggulan",
              },
              {
                icon: <FaTree size={40} />,
                value: "25 Ha",
                description: "Luas area peternakan dengan fasilitas modern",
              },
              {
                icon: <FaLeaf size={40} />,
                value: "15 Ton/hari",
                description: "Produksi susu segar berkualitas tinggi",
              },
              {
                icon: <FaCheckCircle size={40} />,
                value: "ISO 22000",
                description: "Sertifikasi keamanan pangan internasional",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="stat-card"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  padding: "25px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  borderBottom: "4px solid #1abc9c",
                  ":hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#e8f8f5",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 15px",
                    color: "#1abc9c",
                  }}
                >
                  {stat.icon}
                </div>
                <h3
                  style={{
                    fontSize: "2rem",
                    color: "#2c3e50",
                    marginBottom: "10px",
                  }}
                >
                  {stat.value}
                </h3>
                <p
                  style={{
                    color: "#7f8c8d",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                  }}
                >
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Visi Misi Section */}
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "30px",
            borderRadius: "10px",
            marginBottom: "40px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#2c3e50",
            }}
          >
            Visi & Misi Kami
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3
                style={{
                  color: "#2c3e50",
                  borderBottom: "2px solid #ddd",
                  paddingBottom: "10px",
                }}
              >
                Visi
              </h3>
              <p style={{ lineHeight: "1.8" }}>
                Menjadi peternakan sapi perah terdepan di Indonesia yang
                menghasilkan susu berkualitas tinggi dengan menerapkan teknologi
                modern dan praktik peternakan berkelanjutan.
              </p>
            </div>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3
                style={{
                  color: "#2c3e50",
                  borderBottom: "2px solid #ddd",
                  paddingBottom: "10px",
                }}
              >
                Misi
              </h3>
              <ul style={{ lineHeight: "1.8", paddingLeft: "20px" }}>
                <li>Menyediakan susu segar dengan nutrisi optimal</li>
                <li>Menerapkan kesejahteraan hewan terbaik</li>
                <li>Menggunakan teknologi peternakan modern</li>
                <li>Berkontribusi pada ketahanan pangan nasional</li>
                <li>Membangun kemitraan dengan peternak lokal</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Card 1 - Fasilitas Peternakan */}
          <div
            onClick={() => handleExpand(1)}
            style={{
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
              transition: "transform 0.3s",
            }}
          >
            <img
              src={gambarGedung}
              alt="Fasilitas Peternakan Modern"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />
            <div style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: "#2c3e50",
                }}
              >
                Fasilitas Peternakan Modern
              </h3>
              <p
                style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#555" }}
              >
                Kami memiliki kandang modern dengan sistem ventilasi optimal,
                tempat tidur sapi yang nyaman, dan area pemerahan yang steril
                dengan teknologi terbaru.
              </p>
              {expandedCard === 1 && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    color: "#777",
                  }}
                >
                  <p>Fasilitas kami mencakup:</p>
                  <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                    <li>Kandang komunal dengan sistem free-stall</li>
                    <li>Robot pemerah otomatis</li>
                    <li>Sistem pendingin susu instan</li>
                    <li>Laboratorium kontrol kualitas</li>
                    <li>Pabrik pakan ternak mandiri</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Card 2 - Kualitas Susu */}
          <div
            onClick={() => handleExpand(2)}
            style={{
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
              transition: "transform 0.3s",
            }}
          >
            <img
              src={gambarTanaman}
              alt="Proses Produksi Susu Berkualitas"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />
            <div style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: "#2c3e50",
                }}
              >
                Proses Produksi Susu Berkualitas
              </h3>
              <p
                style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#555" }}
              >
                Setiap tetes susu melalui proses ketat mulai dari pemerahan
                higienis, pendinginan instan, pasteurisasi, hingga pengemasan
                steril untuk menjaga kesegaran dan nutrisi.
              </p>
              {expandedCard === 2 && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    color: "#777",
                  }}
                >
                  <p>Tahap produksi kami:</p>
                  <ol style={{ paddingLeft: "20px", marginTop: "10px" }}>
                    <li>Pemerahan dengan mesin otomatis 3x sehari</li>
                    <li>Pendinginan susu hingga 4°C dalam 30 menit</li>
                    <li>Pasteurisasi HTST (72°C selama 15 detik)</li>
                    <li>Uji laboratorium untuk protein, lemak, dan bakteri</li>
                    <li>Pengemasan aseptik untuk kesegaran maksimal</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Card 3 - Program Keberlanjutan */}
          <div
            onClick={() => handleExpand(3)}
            style={{
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
              cursor: "pointer",
              transition: "transform 0.3s",
            }}
          >
            <img
              src={gambarTambahan}
              alt="Program Keberlanjutan"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />
            <div style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: "#2c3e50",
                }}
              >
                Program Keberlanjutan
              </h3>
              <p
                style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#555" }}
              >
                Kami berkomitmen pada peternakan berkelanjutan melalui
                pengolahan limbah, energi terbarukan, dan program CSR untuk
                masyarakat sekitar.
              </p>
              {expandedCard === 3 && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    color: "#777",
                  }}
                >
                  <p>Inisiatif keberlanjutan kami:</p>
                  <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                    <li>Biogas dari kotoran sapi untuk energi</li>
                    <li>Pemanfaatan limbah sebagai pupuk organik</li>
                    <li>Program adopsi sapi untuk peternak lokal</li>
                    <li>Edukasi gizi susu untuk sekolah dasar</li>
                    <li>Penanaman 5000 pohon tahunan</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div
          style={{
            marginTop: "50px",
            backgroundColor: "#e8f4f8",
            padding: "30px",
            borderRadius: "10px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#2c3e50",
            }}
          >
            Mengapa Memilih Susu Kami?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  color: "#2c3e50",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "10px", color: "#27ae60" }}>✓</span>
                Kualitas Terjamin
              </h3>
              <p style={{ marginTop: "10px" }}>
                Setiap batch susu melalui 15 titik pemeriksaan kualitas untuk
                memastikan kandungan nutrisi dan keamanan pangan.
              </p>
            </div>
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  color: "#2c3e50",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "10px", color: "#27ae60" }}>✓</span>
                Segar Langsung dari Sapi
              </h3>
              <p style={{ marginTop: "10px" }}>
                Susu diproses dalam 2 jam setelah pemerahan untuk menjaga
                kesegaran dan nutrisi alami.
              </p>
            </div>
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  color: "#2c3e50",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "10px", color: "#27ae60" }}>✓</span>
                Kesejahteraan Hewan
              </h3>
              <p style={{ marginTop: "10px" }}>
                Sapi kami hidup dalam lingkungan nyaman dengan diet seimbang dan
                perawatan kesehatan rutin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentitasPeternakanPage;
