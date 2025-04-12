import React, { useEffect, useState } from "react";
import { getGalleries, getGalleryPhoto } from "../../api/peternakan/gallery";

const GaleriPage = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const galleriesRes = await getGalleries();

      // Ambil foto untuk setiap galeri
      const galleriesWithPhotos = await Promise.all(
        galleriesRes.map(async (gallery) => {
          try {
            const photoRes = await getGalleryPhoto(gallery.id);
            return { ...gallery, photo: photoRes.photo_url };
          } catch {
            return { ...gallery, photo: null }; // Fallback jika foto tidak tersedia
          }
        })
      );

      setGalleries(galleriesWithPhotos);
      setError("");
    } catch (err) {
      console.error("Failed to fetch galleries:", err.message);
      setError(
        "Failed to fetch galleries. Please ensure the API server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  return (
    <div className="container py-5 mt-16">
      <section className="portfolio__inner">
        <div className="container">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Loading gallery data...</p>
            </div>
          ) : galleries.length === 0 ? (
            <p className="text-gray-500 text-center">
              No gallery data available.
            </p>
          ) : (
            <div className="row g-4">
              {galleries.map((gallery, index) => (
                <div className="col-md-4 col-sm-6" key={gallery.id}>
                  <div
                    className="gallery-item position-relative overflow-hidden"
                    style={{
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={gallery.photo || "/placeholder-image.jpg"}
                      alt={gallery.tittle || `Gallery ${index + 1}`}
                      className="w-100 h-100"
                      style={{
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                    <div
                      className="gallery-title position-absolute top-50 start-50 translate-middle text-white text-center"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.25rem",
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                      }}
                    >
                      {gallery.tittle || "Untitled"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GaleriPage;
