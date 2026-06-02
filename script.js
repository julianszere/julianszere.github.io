const projects = [
  {
    id: "teg",
    year: "2025",
    month: "Nov",
    title: "T.E.G. Calculator",
    url: "https://julianszere.github.io/proyectar/TEG",
    description: `
      <p>A tool for calculating tactical and strategic war scenarios in T.E.G. using advanced probability models.</p>
    `
  },
  {
    id: "biblioteca",
    year: "2024",
    month: "Apr",
    title: "The Total Library",
    url: "https://julianszere.github.io/proyectar/biblioteca",
    description: `
      <p>All syntactically compatible synonyms with Borges's text <em>The Total Library</em> generate a decillion (10⁶⁰) of possible stories that say the same thing but differently.</p>
      <p>The complete, extensive, integral, absolute, exhaustive, universal library is a demonstration of every text that could appear in the library. Borges is against it (the bluish one).</p>
    `
  },
  {
    id: "resortes",
    year: "2023",
    month: "Jun",
    title: "Minimal Springs",
    url: "https://julianszere.github.io/proyectar/resortes",
    description: `
      <p>An experimental project on minimal spring systems and their physical behavior.</p>
    `
  },
  {
    id: "pendulos",
    year: "2023",
    month: "May",
    title: "Orchestrated Pendulums",
    url: "https://julianszere.github.io/proyectar/péndulos",
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
showSection("home");
