
document.addEventListener("DOMContentLoaded", function() {
  const mapDiv = document.getElementById("map");

  if (mapDiv) {
    const lat = parseFloat(mapDiv.dataset.lat);
    const lng = parseFloat(mapDiv.dataset.lng);
    const title = mapDiv.dataset.title;
    const location = mapDiv.dataset.location;

    const map = L.map("map", {
      scrollWheelZoom: true,
      worldCopyJump: true,
      zoomControl: true
    }).setView([lat, lng], 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #c40310, #e83b47);
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 15px rgba(196, 3, 16, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <i class="fa-solid fa-location-dot" style="color: white; font-size: 18px;"></i>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    const escapeHtml = (str) => {
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    };
    const popupContent = `
      <div style="text-align: center; padding: 8px;">
        <strong style="color: #c40310; font-size: 15px; display: block; margin-bottom: 6px;">${escapeHtml(title)}</strong>
        <span style="color: #6c757d; font-size: 13px;">
          <i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i>${escapeHtml(location)}
        </span>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 250,
      closeButton: false,
      className: 'custom-popup'
    });

    marker.on("mouseover", function () {
      this.openPopup();
    });

    marker.on("mouseout", function () {
      this.closePopup();
    });

    window.addEventListener("resize", () => {
      map.invalidateSize();
    });
  }
});
