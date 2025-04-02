import React from "react";
import girolando from "../../assets/image/header1.png";
import gambarGedung from "../../assets/image/gedung2.jpeg";
import gambarTanaman from "../../assets/image/gedung2.jpeg";
import gambarTambahan from "../../assets/image/gedung2.jpeg";

const IdentitasPeternakanPage = () => {
  return (
    <div style={{ position: "relative" }}>
      {/* Gambar header dengan margin top yang disesuaikan */}
      <img
        src={girolando}
        alt="Sapi Girolando"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          objectPosition: "50% 30%",
          marginTop: "120px", // Sesuaikan nilai ini sesuai tinggi header
        }}
      />

      <div style={{ padding: "20px", marginTop: "20px" }}>
        <p
          style={{
            fontSize: "1.9rem",
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "'Montserrat', sans-serif",
            color: "black",
            fontStyle: "italic",
          }}
        >
          Peternakan Sapi Perah Pertama di Indonesia!
        </p>
        <div style={{ padding: "0 50px" }}>
          <p
            style={{
              fontStyle: "",
              textAlign: "center",
              color: "black",
            }}
          >
            <b>Taman Sains dan Teknologi Herbal dan Hortikultura</b> adalah pusat penelitian dan pengembangan yang fokus
            pada tanaman herbal dan hortikultura. Program ini direncanakan untuk
            mendukung SDGs dan membangun pertanian berkelanjutan untuk
            ketahanan pangan dan ekonomi nasional.
          </p>
          <div style={{ marginTop: "40px" }}>
            {/* Kotak pertama */}
            <div style={{ display: "flex", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", padding: "10px", borderRadius: "8px" }}>
              <img
                src={gambarGedung}
                alt="Gedung TSTH2"
                style={{
                  width: "350px",
                  height: "auto",
                  marginRight: "20px",
                }}
              />
              <p
                style={{
                  fontWeight: 900,
                  fontSize: "1rem",
                  textAlign: "left",
                  color: "black",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ backgroundColor: "", padding: "5px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
                  Gedung TSTH2 saat ini. Pusat penelitian dan pengembangan tanaman
                  herbal dan hortikultura.
                </span>
              </p>
            </div>
            {/* Kotak kedua */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", padding: "10px", borderRadius: "8px" }}>
              <p
                style={{
                  fontStyle: "",
                  textAlign: "right",
                  color: "black",
                  fontSize: "0.9rem",
                  marginRight: "20px",
                }}
              >
                <span style={{ backgroundColor: "", padding: "5px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
                  Penelitian tanaman herbal dan hortikultura untuk pertanian
                  berkelanjutan.
                </span>
              </p>
              <img
                src={gambarTanaman}
                alt="Tanaman Herbal"
                style={{
                  width: "350px",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </div>
            {/* Kotak ketiga */}
            <div style={{ display: "flex", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", padding: "10px", borderRadius: "8px", marginTop: "20px" }}>
              <img
                src={gambarTambahan}
                alt="Fasilitas Baru"
                style={{
                  width: "350px",
                  height: "auto",
                  marginRight: "20px",
                }}
              />
              <p
                style={{
                  fontWeight: 900,
                  fontSize: "1rem",
                  textAlign: "left",
                  color: "black",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ backgroundColor: "", padding: "5px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
                  Fasilitas terbaru untuk penelitian dan pengembangan lebih lanjut.
                </span>
              </p>
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: "20px", color: "black" }}>
            <b>Taman Sains dan Teknologi Herbal dan Hortikultura</b> adalah pusat penelitian dan pengembangan yang fokus
            pada tanaman herbal dan hortikultura. Program ini direncanakan untuk
            mendukung SDGs dan membangun pertanian berkelanjutan untuk
            ketahanan pangan dan ekonomi nasional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IdentitasPeternakanPage;