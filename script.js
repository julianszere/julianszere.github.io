const projects = [
  {
    id: "teg",
    year: "2025",
    month: "Nov",
    title: "T.E.G. Calculator",
    url: "https://julianszere.github.io/projects/TEG",
    detailUrl: "./projects/TEG/teg_probability_calculator.html",
    description: `
      <p>A tool for calculating tactical and strategic war scenarios in T.E.G. using advanced probability models.</p>
    `
  },
  {
    id: "doppler",
    year: "2024",
    month: "Oct",
    title: "Doppler Lights",
    url: "https://julianszere.github.io/projects/doppler",
    detailUrl: "./projects/doppler/index.html",
    description: `
      <p>What any photograph would look like to an observer moving at a relativistic speed — Doppler wavelength shift and aberration applied pixel by pixel.</p>
    `
  },
  {
    id: "springs",
    year: "2023",
    month: "Jun",
    title: "Least Springs",
    url: "https://julianszere.github.io/projects/springs",
    detailUrl: "./projects/springs/index.html",
    description: `
      <p>Fitting a regression line by least squares is physically identical to finding the equilibrium of a rigid rod held by springs.</p>
    `
  },
  {
    id: "pendulos",
    year: "2023",
    month: "May",
    title: "Orchestrated Pendulums",
    url: "https://julianszere.github.io/projects/pendulums",
    detailUrl: "./projects/pendulums/index.html",
    description: `
      <p>Simulation and study of synchronized pendulums with orchestral patterns.</p>
    `
  }
];

function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll("nav a[data-section], .site-name[data-section]").forEach(a => {
    a.classList.toggle("active", a.dataset.section === name);
  });

  const section = document.getElementById("section-" + name);
  if (section) section.classList.add("active");

  if (name !== "projects") showProjectList();
}

function loadProjects() {
  const list = document.getElementById("project-list");
  projects.forEach(project => {
    const li = document.createElement("li");
    li.className = "project-item";
    li.innerHTML = `
      <span class="project-date">${project.month} ${project.year}</span>
      <a href="#" data-id="${project.id}">${project.title}</a>
    `;
    li.querySelector("a").addEventListener("click", e => {
      e.preventDefault();
      showProjectDetail(project.id);
    });
    list.appendChild(li);
  });
}

function showProjectDetail(id) {
  const project = projects.find(p => p.id === id);
  if (!project) return;

  if (project.detailUrl) {
    window.location.href = project.detailUrl;
    return;
  }

  document.getElementById("project-list").style.display = "none";
  const detail = document.getElementById("project-detail");
  detail.style.display = "block";
  detail.innerHTML = `
    <p><a href="#" id="back-link">← back</a></p>
    <p><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a> (${project.year})</p>
    ${project.description}
  `;
  detail.querySelector("#back-link").addEventListener("click", e => {
    e.preventDefault();
    showProjectList();
  });
}

function showProjectList() {
  const list = document.getElementById("project-list");
  const detail = document.getElementById("project-detail");
  if (list) list.style.display = "";
  if (detail) detail.style.display = "none";
}

function wireLinks() {
  document.addEventListener("click", e => {
    const target = e.target.closest("[data-section]");
    if (!target) return;
    e.preventDefault();
    showSection(target.dataset.section);
  });
}

loadProjects();
wireLinks();

const initialSection = window.location.hash.replace("#", "") || "home";
showSection(initialSection);
