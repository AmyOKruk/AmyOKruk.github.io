// Paste your published Google Sheet CSV URL here.
// See instructions in the README or chat for how to get this URL.
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRdtHvQXax93x-ywEDLcFvOvWs8PCPbtKm5HdVLhQ61pkRaVs5AlUrCju6d2doa3DBmQZaTQJsnOaYw/pub?gid=0&single=true&output=csv";

// Parse a CSV string into an array of objects using the first row as headers.
// Handles quoted fields that contain commas.
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = (values[i] || "").trim();
      return obj;
    }, {});
  });
}

function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function renderProjects(projects) {
  const wrapper = document.getElementById("project-wrapper");
  if (!wrapper) return;
  if (!projects.length) {
    wrapper.innerHTML = "<p>No projects found.</p>";
    return;
  }
  // The first row of thumbnails is above the fold; load those eagerly and
  // let everything below lazy-load. Dimensions are hinted via CSS aspect-ratio
  // (see .project img) so cards reserve space and don't shift as images arrive.
  wrapper.innerHTML = projects.map((p, i) => `
    <a target="_blank" rel="noopener" href="${escapeHTML(p.link)}" class="project">
      <img alt="${escapeHTML(p.alt)}" src="/images/main/${escapeHTML(p.image)}"
           loading="${i < 3 ? "eager" : "lazy"}" decoding="async">
      <strong>${escapeHTML(p.title)}</strong>
      <span>${escapeHTML(p.description)}</span>
    </a>
  `).join("");
}

function loadProjects() {
  const wrapper = document.getElementById("project-wrapper");
  if (!wrapper) return; // not on the homepage

  if (!SHEET_CSV_URL) {
    wrapper.innerHTML =
      "<p>Add your Google Sheet CSV URL to <code>js/index.js</code> to load projects.</p>";
    return;
  }

  // Allow the browser to reuse a cached copy so repeat visits don't re-fetch
  // the sheet on every load.
  fetch(SHEET_CSV_URL)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch sheet");
      return res.text();
    })
    .then(text => renderProjects(parseCSV(text)))
    .catch(() => {
      wrapper.innerHTML =
        "<p>Couldn't load projects. Check the CSV URL in <code>js/index.js</code>.</p>";
    });
}

function highlightNav() {
  const match = window.location.href.match(/[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/gi);
  const page = match ? match[0] : "index.html";

  const map = {
    "writing.html": ".nav-writing",
    "art.html": ".nav-art",
    "index.html": ".nav-projects",
  };
  const selector = map[page] || ".nav-about";
  const active = document.querySelector(selector);
  if (active) active.classList.add("nav-select");
}

function setupNavHover() {
  const navItems = document.querySelectorAll(".nav");
  const header = document.querySelector(".header");

  navItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
      navItems.forEach(n => n.classList.remove("nav-select"));
      item.classList.add("nav-select");
    });
    item.addEventListener("mouseleave", () => {
      item.classList.remove("nav-select");
    });
  });

  if (header) {
    header.addEventListener("mouseleave", () => {
      navItems.forEach(n => n.classList.remove("nav-select"));
      highlightNav();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  highlightNav();
  setupNavHover();
});
