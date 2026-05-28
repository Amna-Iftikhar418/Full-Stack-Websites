
import { useRef, useState, useEffect } from "react";
import "./Carousel.css";
import Film from "./Data/Film";

export default function Carousel() {
  const VISIBLE = 4;
  const trackRef = useRef(null);
  const itemsRef = useRef([]);
  const [start, setStart] = useState(0);
  const [selectedFilm, setSelectedFilm] = useState(null); 

  const total = Film.length;
  const maxStart = Math.max(0, total - VISIBLE);

  const updatePosition = () => {
    if (!trackRef.current || !itemsRef.current[start]) return;
    const left = itemsRef.current[start].offsetLeft;
    trackRef.current.style.transform = `translateX(-${left}px)`;
  };

  const move = (direction) => {
    const remainder = total % VISIBLE;
    const lastPage = Math.max(0, total - VISIBLE);

    if (direction > 0) {
      setStart((prev) => Math.min(lastPage, prev + VISIBLE));
    } else {
      setStart((prev) => {
        if (prev === lastPage && remainder !== 0) {
          return Math.max(0, Math.floor(lastPage / VISIBLE) * VISIBLE);
        } else {
          return Math.max(0, prev - VISIBLE);
        }
      });
    }
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [start]);

  return (
    <>
       <div className="red-border ">
        
      <div className="blue-shadow"></div>
    
      <div className="carousel">
        {start > 0 && (
          <button className="nav prev" onClick={() => move(-1)}>
            &#10094;
          </button>
        )}

        <div className="viewport">
          <div className="track" ref={trackRef}>
            {Film.map((film, i) => (
              <div
                className="item"
                key={i}
                ref={(el) => (itemsRef.current[i] = el)}
              >
                <div className="number">{i + 1}</div>
                <img
                  src={film.image}
                  alt={film.title}
                  onClick={() => setSelectedFilm(film)} 
                />
              </div>
            ))}
          </div>
        </div>

        {start < maxStart && (
          <button className="nav next" onClick={() => move(1)}>
            &#10095;
          </button>
        )}
      </div>
</div>
   
      {selectedFilm && (
        <div className="modal-overlay" onClick={() => setSelectedFilm(null)}>
          <div
            className="modal"
            style={{ backgroundImage: `url(${selectedFilm.image})` }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="close" onClick={() => setSelectedFilm(null)}>
              &times;
            </span>

            <div className="modal-content">
              <h2 className="title">{selectedFilm.title}</h2>
              <p>
                <strong>Year:</strong> {selectedFilm.year}
              </p>
              <p>
                <strong>Type:</strong> {selectedFilm.type}
              </p>
              <p>
                <strong>Genres:</strong> {selectedFilm.genres.join(", ")}
              </p>
              <p>
                <strong>Adult:</strong> {selectedFilm.adult}
              </p>
              <p style={{color:"orange", }}>{selectedFilm.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
