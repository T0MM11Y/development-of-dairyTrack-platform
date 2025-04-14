import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for breadcrumbs
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
    <div>
      {/* Breadcrumb Section */}
      <section className="breadcrumb__wrap">
        <div className="container custom-container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="breadcrumb__wrap__content">
                <h2 className="title">Gallery Page</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Gallery
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container py-5">
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
                    <figure
                      className="gallery-item position-relative overflow-hidden"
                      style={{
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <img
                        src={gallery.photo || "/placeholder-image.jpg"}
                        alt={gallery.tittle || `Gallery item ${index + 1}`}
                        className="w-100 h-100"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                      <figcaption
                        className="gallery-title position-absolute bottom-0 start-0 w-100 text-white text-center"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          padding: "1rem",
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
                        }}
                      >
                        {gallery.tittle || "Untitled"}
                      </figcaption>
                    </figure>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default GaleriPage;
