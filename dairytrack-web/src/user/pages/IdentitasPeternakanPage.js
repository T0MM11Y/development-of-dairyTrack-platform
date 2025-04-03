import React, { useState } from "react";
import girolando from "../../assets/image/header1.png";
import gambarGedung from "../../assets/image/gedung2.jpeg";
import gambarTanaman from "../../assets/image/gedung2.jpeg";
import gambarTambahan from "../../assets/image/gedung2.jpeg";

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
      {/* Header Image */}
      <img
        src={girolando}
        alt="Sapi Girolando"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          objectPosition: "50% 30%",
          marginTop: "180px",
        }}
      />

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
            fontSize: "2.5rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "20px",
          }}
        >
          Peternakan Sapi Perah Pertama di Indonesia!
        </h1>

        {/* Description */}
        <p
          style={{
            textAlign: "center",
            fontSize: "1.1rem",
            lineHeight: "1.8",
            color: "#555",
            marginBottom: "40px",
          }}
        >
          <b>Taman Sains dan Teknologi Herbal dan Hortikultura</b> adalah pusat
          penelitian dan pengembangan yang fokus pada tanaman herbal dan
          hortikultura. Program ini direncanakan untuk mendukung SDGs dan
          membangun pertanian berkelanjutan untuk ketahanan pangan dan ekonomi
          nasional. Kami berkomitmen untuk memberikan inovasi terbaik di bidang
          pertanian dan peternakan.
        </p>

        {/* Statistik Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "40px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", color: "#2c3e50" }}>500+</h2>
            <p style={{ fontSize: "1rem", color: "#555" }}>
              Jumlah Sapi yang kami miliki terus bertambah setiap tahunnya untuk
              mendukung produksi susu berkualitas.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", color: "#2c3e50" }}>100 Ha</h2>
            <p style={{ fontSize: "1rem", color: "#555" }}>
              Lahan yang luas ini digunakan untuk peternakan dan penelitian
              tanaman herbal.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", color: "#2c3e50" }}>10 Ton</h2>
            <p style={{ fontSize: "1rem", color: "#555" }}>
              Produksi susu segar setiap bulan untuk memenuhi kebutuhan pasar
              lokal dan nasional.
            </p>
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
          {/* Card 1 */}
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
            }}
          >
            <img
              src={gambarGedung}
              alt="Gedung TSTH2"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                transition: "transform 0.3s",
              }}
            />
            <div style={{ padding: "20px" }}>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Gedung TSTH2
              </p>
              <p
                style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#555" }}
              >
                Pusat penelitian dan pengembangan tanaman herbal dan
                hortikultura. Gedung ini dilengkapi dengan fasilitas modern
                untuk mendukung berbagai penelitian.
              </p>
              {expandedCard === 1 && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    color: "#777",
                  }}
                >
                  Informasi tambahan tentang Gedung TSTH2. Gedung ini memiliki
                  fasilitas modern untuk mendukung penelitian tentang tanaman
                  herbal
                </p>
              )}
            </div>
          </div>

          {/* Card 2 */}
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
            }}
          >
            <img
              src={gambarTanaman}
              alt="Tanaman Herbal"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                transition: "transform 0.3s",
              }}
            />
            <div style={{ padding: "20px" }}>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Tanaman Herbal
              </p>
              <p
                style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#555" }}
              >
                Penelitian tanaman herbal dan hortikultura untuk pertanian
                berkelanjutan. Tanaman ini digunakan untuk berbagai inovasi di
                bidang kesehatan dan pangan.
              </p>
              {expandedCard === 2 && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    color: "#777",
                  }}
                >
                  Informasi tambahan tentang tanaman herbal. Tanaman ini
                  digunakan untuk berbagai penelitian inovatif.
                </p>
              )}
            </div>
          </div>

          {/* Card 3 */}
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
            }}
          >
            <img
              src={gambarTambahan}
              alt="Fasilitas Baru"
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                transition: "transform 0.3s",
              }}
            />
            <div style={{ padding: "20px" }}>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Fasilitas Baru
              </p>
              <p
                style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "#555" }}
              >
                Fasilitas terbaru untuk penelitian dan pengembangan lebih
                lanjut. Kami terus berinovasi untuk memberikan hasil terbaik dan
                berkualitas
              </p>
              {expandedCard === 3 && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    color: "#777",
                  }}
                >
                  Informasi tambahan tentang fasilitas baru. Fasilitas ini
                  dirancang untuk mendukung inovasi di bidang peternakan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Testimoni Section */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", color: "#2c3e50" }}>Testimoni</h2>
          <p style={{ fontSize: "1rem", color: "#555", marginBottom: "20px" }}>
            Apa kata pengunjung tentang peternakan kami? Kami selalu menerima
            masukan untuk terus berkembang.
          </p>
          <blockquote
            style={{
              fontStyle: "italic",
              color: "#777",
              borderLeft: "4px solid #2c3e50",
              paddingLeft: "20px",
              margin: "20px auto",
              maxWidth: "800px",
            }}
          >
            "Peternakan ini sangat inovatif dan memberikan pengalaman yang luar
            biasa. Saya sangat terinspirasi!" - Pengunjung
          </blockquote>
        </div>

        {/* Footer Text */}
        <p
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontSize: "1rem",
            lineHeight: "1.8",
            color: "#555",
          }}
        >
          <b>Taman Sains dan Teknologi Herbal dan Hortikultura</b> adalah pusat
          penelitian dan pengembangan yang fokus pada tanaman herbal dan
          hortikultura. Program ini direncanakan untuk mendukung SDGs dan
          membangun pertanian berkelanjutan untuk ketahanan pangan dan ekonomi
          nasional. Kami percaya bahwa inovasi adalah kunci keberhasilan.
        </p>
      </div>
    </div>
  );
};

export default IdentitasPeternakanPage;
