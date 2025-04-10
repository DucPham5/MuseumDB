import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "../styles/artworks.css";

const Artworks = () => { 
  // Retrieve exhibitionId from URL using react router's useParams hook
  const { exhibitionId } = useParams();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://museumdb.onrender.com/artworks?exhibition_id=${exhibitionId}`); // http://localhost:5000/artworks?exhibition_id=${exhibitionId}
        if (!response.ok) { // https://museumdb.onrender.com/artworks?exhibition_id=${exhibitionId}
          throw new Error("Failed to fetch artworks");
        }
        const data = await response.json();
        setArtworks(data);
        // Set the first artwork as selected if available
        if (data.length > 0) {
          setSelectedArtwork(data[0]);
        }
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [exhibitionId]);

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading artworks...</div>;
  }

  if (artworks.length === 0) {
    return (
      <main className="main">
        <div className="container" style={{ padding: "20px", textAlign: "center" }}>
          <h2>No artworks available for this exhibition.</h2>
        </div>
      </main>
    );
  }

  // Handler for when a slide is clicked. Updates the selected artwork.
  const handleSlideClick = (artwork) => {
    setSelectedArtwork(artwork);
  };


  return (
    <main className="main">
      <div className="container">
        <Swiper
          modules={[Pagination]}
          grabCursor={true}
          centeredSlides={true}
          slideToClickedSlide={true}
          slidesPerView="auto"
          speed={800}
          pagination={{ clickable: true }}
          breakpoints={{
            320: { spaceBetween: 40 },
            650: { spaceBetween: 30 },
            1000: { spaceBetween: 20 },
          }}
        >
          {artworks.map((artwork) => (
            <SwiperSlide
              key={artwork.Artwork_ID}
              onClick={() => handleSlideClick(artwork)}
              className={selectedArtwork && selectedArtwork.Artwork_ID === artwork.Artwork_ID ? "active-slide" : ""}
            >
              {artwork.artwork_image ? (
                <img className="img" src={artwork.artwork_image} alt={artwork.Title} />
              ) : (
                <img className="img" src="/default_image.jpg" alt="Default Artwork" />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Details section below the slider */}
        {selectedArtwork && (
          <div
            className="artwork-details"
            style={{
              marginTop: "20px",
              textAlign: "center",
              padding: "20px",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 style={{ fontWeight: "bold" }}>{selectedArtwork.Title}</h2>
            <p>
              <strong>Artist:</strong> {selectedArtwork.Artist_Name}
            </p>
            <p>{selectedArtwork.description}</p>
            <p>
              <strong>Year Created:</strong> {selectedArtwork.Year_Created} |{" "}
              <strong>Year Acquired:</strong> {selectedArtwork.Year_Acquired}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Artworks;