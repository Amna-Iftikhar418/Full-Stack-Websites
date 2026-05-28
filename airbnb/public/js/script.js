
(function () {
  'use strict'


  var forms = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

const btn = document.getElementById("pills-home-tab");
const content = document.getElementById("pills-tabContent");

if (btn && content) {
  btn.addEventListener("click", function tabs() {
    content.style.display = "block";
  });
}

window.navSearchState = window.navSearchState || { location: "", checkIn: "", checkOut: "", guests: 0, counters: {} };

document.querySelectorAll(".hideable-navbar-tabs-content-pane3-main-div-content").forEach((section) => {
  let count = 0;
  let demo = section.querySelector("p");
  let incBtn = section.querySelector(".increment");
  let decBtn = section.querySelector(".decrement");
  let key = (section.querySelector("h3") && section.querySelector("h3").textContent || "").trim().toLowerCase();

  function updateDisplay() {
    demo.textContent = count;
    if (key) window.navSearchState.counters[key] = count;
    const c = window.navSearchState.counters;
    window.navSearchState.guests = (c.adults || 0) + (c.children || 0);
    const whoLabel = document.getElementById("nav-who-label");
    if (whoLabel) {
      const total = window.navSearchState.guests;
      whoLabel.textContent = total > 0 ? `${total} guest${total !== 1 ? "s" : ""}` : "";
    }
  }

  incBtn.addEventListener("click", () => { count++; updateDisplay(); });
  decBtn.addEventListener("click", () => { if (count > 0) count--; updateDisplay(); });
  updateDisplay();
});

document.addEventListener("DOMContentLoaded", () => {
  const monthYear = document.getElementById("month-year");
  const daysContainer = document.getElementById("days");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const selectedDateEl = document.getElementById("selected-date");
  const addListingLink = document.getElementById("addListingLink");

  if (!monthYear || !daysContainer || !prev || !next) return;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let current = new Date();
  const today = new Date();
  let rangeStart = null;
  let rangeEnd = null;

  function toISO(y, m, d) {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }

  function fmtDate(dt) {
    return `${months[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`;
  }

  function updateDateState() {
    const ci = rangeStart ? toISO(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate()) : "";
    const co = rangeEnd ? toISO(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate()) : "";
    window.navSearchState.checkIn = ci;
    window.navSearchState.checkOut = co;
    delete window.navSearchState.date;

    let label = "";
    if (rangeStart && rangeEnd) {
      label = `${fmtDate(rangeStart)} → ${fmtDate(rangeEnd)}`;
    } else if (rangeStart) {
      label = fmtDate(rangeStart);
    }
    if (selectedDateEl) selectedDateEl.textContent = label || "No date selected";
    const dateLabel = document.getElementById("nav-date-label");
    if (dateLabel) dateLabel.textContent = label;
    if (addListingLink && ci) addListingLink.href = `/listings/new?date=${ci}`;
  }

  function renderCalendar() {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${months[month]} ${year}`;
    daysContainer.innerHTML = "";

    const prevLast = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      daysContainer.innerHTML += `<div class="fade">${prevLast - i + 1}</div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
      const dateObj = new Date(year, month, i);
      const classes = [];
      if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) classes.push("today");
      if (rangeStart && dateObj.getTime() === rangeStart.getTime()) classes.push("range-start");
      if (rangeEnd && dateObj.getTime() === rangeEnd.getTime()) classes.push("range-end");
      if (rangeStart && rangeEnd && dateObj > rangeStart && dateObj < rangeEnd) classes.push("in-range");
      daysContainer.innerHTML += `<div class="${classes.join(" ")}" data-day="${i}" data-month="${month}" data-year="${year}">${i}</div>`;
    }

    const nextDays = 42 - (firstDay + lastDate);
    for (let i = 1; i <= nextDays; i++) {
      daysContainer.innerHTML += `<div class="fade">${i}</div>`;
    }

    document.querySelectorAll("#days div:not(.fade)").forEach(day => {
      day.addEventListener("click", () => {
        const d = parseInt(day.dataset.day, 10);
        const m = parseInt(day.dataset.month, 10);
        const y = parseInt(day.dataset.year, 10);
        const clicked = new Date(y, m, d);

        if (!rangeStart || (rangeStart && rangeEnd)) {
          rangeStart = clicked;
          rangeEnd = null;
        } else {
          if (clicked > rangeStart) {
            rangeEnd = clicked;
          } else if (clicked < rangeStart) {
            rangeEnd = rangeStart;
            rangeStart = clicked;
          }
          // same day click resets
        }
        updateDateState();
        renderCalendar();
      });
    });
  }

  renderCalendar();

  prev.addEventListener("click", () => {
    current.setMonth(current.getMonth() - 1);
    renderCalendar();
  });

  next.addEventListener("click", () => {
    current.setMonth(current.getMonth() + 1);
    renderCalendar();
  });
});

// scroll

window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  const navdiv = document.querySelector(".navdiv");
  const searchform = document.querySelector(".search-form");
  const tabcontent = document.querySelector(".tab-content");
  const navimages = document.querySelector(".navbar-images");

  if (!navbar) return;

  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
    if (navdiv) navdiv.classList.add("hidden");
    if (searchform) searchform.classList.add("show-form");
    if (navimages) navimages.classList.add("hide-images");
    if (tabcontent) tabcontent.classList.add("hidden");
  } else {
    navbar.classList.remove("scrolled");
    if (navdiv) navdiv.classList.remove("hidden");
    if (searchform) searchform.classList.remove("show-form");
    if (navimages) navimages.classList.remove("hide-images");
    if (tabcontent) tabcontent.classList.remove("hidden");
  }
});




document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.remove("show", "active");
  });

  let activeTab = null;

  document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
    tab.addEventListener("click", function (e) {
      const targetPane = document.querySelector(tab.dataset.bsTarget);


      if (activeTab === tab) {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
        targetPane.classList.remove("show", "active");
        activeTab = null;
        e.preventDefault();
        return;
      }


      document.querySelectorAll('[data-bs-toggle="pill"]').forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tab-pane").forEach(pane => {
        pane.classList.remove("show", "active");
      });

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      targetPane.classList.add("show", "active");

      activeTab = tab;
    });
  });
});
// Navbar search (Where/Date/Who → Search button)
document.addEventListener("DOMContentLoaded", function () {
  window.navSearchState = window.navSearchState || { location: "", date: "", guests: 0, counters: {} };

  const whereInput = document.getElementById("nav-where-input");
  const suggestions = document.querySelectorAll("#nav-where-suggestions li");
  const searchBtn = document.getElementById("pills-search-tab");

  suggestions.forEach((li) => {
    li.style.cursor = "pointer";
    li.addEventListener("click", function () {
      const loc = li.dataset.location || li.textContent.trim();
      window.navSearchState.location = loc;
      if (whereInput) whereInput.value = loc;
      suggestions.forEach((s) => s.classList.remove("selected-suggestion"));
      li.classList.add("selected-suggestion");
      const whereLabel = document.getElementById("nav-where-label");
      if (whereLabel) whereLabel.textContent = loc;
    });
  });

  if (whereInput) {
    whereInput.addEventListener("input", function () {
      window.navSearchState.location = whereInput.value.trim();
      const whereLabel = document.getElementById("nav-where-label");
      if (whereLabel) whereLabel.textContent = whereInput.value.trim();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const s = window.navSearchState;
      const params = new URLSearchParams();
      if (s.location) params.set("location", s.location);
      if (s.checkIn) params.set("checkIn", s.checkIn);
      if (s.checkOut) params.set("checkOut", s.checkOut);
      if (s.guests && s.guests > 0) params.set("guests", s.guests);
      window.location.href = "/listings/search" + (params.toString() ? "?" + params.toString() : "");
    });
  }
});

// toggle button
let taxswitch = document.getElementById("flexSwitchCheckDefault");
if (taxswitch) taxswitch.addEventListener("click", () => {
  let taxes = document.getElementsByClassName("tax-info");
  for (let info of taxes) {
    if (info.style.display != "inline") {
      info.style.display = "inline"
    }
    else {
      info.style.display = "none"
    }
  }
});
