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

function renderProjects(projects) {
  const wrapper = document.getElementById("project-wrapper");
  if (!projects.length) {
    wrapper.innerHTML = "<p>No projects found.</p>";
    return;
  }
  wrapper.innerHTML = projects.map(p => `
    <a target="_blank" href="${p.link}" class="project">
      <img alt="${p.alt}" src="/images/main/${p.image}">
      <strong>${p.title}</strong>
      <span>${p.description}</span>
    </a>
  `).join("");
}

function loadProjects() {
  if (!SHEET_CSV_URL) {
    document.getElementById("project-wrapper").innerHTML =
      "<p>Add your Google Sheet CSV URL to <code>js/index.js</code> to load projects.</p>";
    return;
  }

  fetch(SHEET_CSV_URL, { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch sheet");
      return res.text();
    })
    .then(text => renderProjects(parseCSV(text)))
    .catch(() => {
      document.getElementById("project-wrapper").innerHTML =
        "<p>Couldn't load projects. Check the CSV URL in <code>js/index.js</code>.</p>";
    });
}

$(document).ready(function () {
  loadProjects();

  function selected() {
    var url = window.location.href;
    var page = url.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/gi);
    if (page == null) { page = "index.html"; }

    if (page == "index.html") {
      $(".nav-projects").addClass('nav-select');
    } else if (page == "writing.html") {
      $(".nav-writing").addClass('nav-select');
    } else if (page == "art.html") {
      $(".nav-art").addClass('nav-select');
    } else {
      $(".nav-about").addClass('nav-select');
    }
  }

  selected();

  $(".nav").on('mouseenter', function () {
    $(".nav").removeClass('nav-select');
    $(this).addClass('nav-select');
  });
  $(".nav").on('mouseleave', function () {
    $(this).removeClass('nav-select');
  });
  $(".header").on('mouseleave', function () {
    selected();
    $(this).removeClass('nav-select');
  });
});
