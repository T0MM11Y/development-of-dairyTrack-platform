import React from "react";
import girolando from "../../assets/image/header1.png";
import gambarGedung from "../../assets/image/gedung2.jpeg";
import gambarTanaman from "../../assets/image/gedung2.jpeg"; // Import gambar tanaman

const IdentitasPeternakanPage = () => {
  return (
    <div style={{ position: "relative" }}>
      <img
        src={girolando}
        alt="Sapi Girolando"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          objectPosition: "50% 30%",
          marginTop: "64px",
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
                <span>
                  Gedung TSTH2 saat ini. Pusat penelitian dan pengembangan tanaman
                  herbal dan hortikultura.
                </span>
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", padding: "10px", borderRadius: "8px" }}> {/* Kotak untuk gambar kedua dan teksnya */}
              <p
                style={{
                  fontStyle: "",
                  textAlign: "right",
                  color: "black",
                  fontSize: "0.9rem",
                  marginRight: "20px",
                }}
              >
                <span>
                  Gedung TSTH2 saat ini. Pusat penelitian dan pengembangan tanaman
                  herbal dan hortikultura.
                </span>
              </p>
              <p
                style={{
                  fontStyle: "",
                  textAlign: "right",
                  color: "black",
                  fontSize: "0.9rem",
                  marginRight: "20px",
                }}
              ></p>
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
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <h4 style={{ fontWeight: "600" }}>Lokasi:</h4>
          <p>
            Jl. Sapi Perah No. 123, Desa Ternak, Kecamatan Subur, Kabupaten
            Sejahtera
          </p>
        </div>

        <div style={{ marginTop: "16px" }}>
          <h4 style={{ fontWeight: "600" }}>Kontak:</h4>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li>0812-3456-7890</li>
            <li>✉ email@peternakansejahtera.com</li>
            <li>www.peternakansejahtera.com</li>
            <li>Instagram: @peternakansejahtera</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IdentitasPeternakanPage;