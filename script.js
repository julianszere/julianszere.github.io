async function loadMenu() {
  const placeholder = document.getElementById("menu-placeholder");
  try {
    const res = await fetch("/menu.html");
    if (!res.ok) throw new Error("Failed to load menu");
    placeholder.innerHTML = await res.text();
    document.body.classList.remove("loading");
  } catch (e) {
    console.error(e);
    document.body.classList.remove("loading");
  }
}

const projects = [
  {
    id: "teg",
    year: "2025",
    month: "Nov.",
    title: "Calculadora T.E.G.",
    url: "https://julianszere.github.io/proyectar/TEG",
    description: `
      <p>Una herramienta para calcular escenarios tácticos y estratégicos de guerra con modelos avanzados.</p>
    `
  },
  {
    id: "biblioteca",
    year: "2024",
    month: "Abr.",
    title: "La Biblioteca Total",
    url: "https://julianszere.github.io/proyectar/biblioteca",
    description: `
      <p>Todos los sinónimos sintácticamente compatibles con el texto La Biblioteca Total de Borges generan un decillón (10^60) de cuentos posibles para decir lo mismo pero distino</p>
      <p>La biblioteca total, completa, extensa, integral, cabal, general, universal, absoluta, exhaustiva, global, etcétera es una demostración de todos los textos que podrían aparecer en la biblioteca. Borges está encontra (lo azulado)</p>    `
  },
  {
    id: "resortes",
    year: "2023",
    month: "Jun.",
    title: "Resortes Mínimos",
    url: "https://julianszere.github.io/proyectar/resortes",
    description: `
      <p>Proyecto experimental sobre sistemas de resortes mínimos y su comportamiento físico.</p>
    `
  },
  {
    id: "pendulos",
    year: "2023",
    month: "May.",
    title: "Péndulos Orquestrados",
    url: "https://julianszere.github.io/proyectar/péndulos",
    description: `
      <p>Simulación y estudio de péndulos sincronizados con patrones orquestales.</p>
    `
  }
];

function loadProjects() {
  const projectList = document.getElementById("project-list");
  
  projects.forEach(project => {
    const li = document.createElement("li");
    li.className = "project-item";
    li.innerHTML = `
      <div class="project-header">
        <span class="project-date">${project.month} ${project.year}</span>
        <a href="#" class="project-title" data-id="${project.id}">${project.title}</a>
      </div>
    `;
    
    // Attach click handler directly
    li.querySelector(".project-title").addEventListener("click", e => {
      e.preventDefault();
      showProjectDetail(project.id);
    });
    
    projectList.appendChild(li);
  });
}

function showProjectDetail(id) {
  const detailSection = document.getElementById("project-detail");
  const projectList = document.getElementById("project-list");
  const project = projects.find(p => p.id === id);

  if (!project) {
    detailSection.innerHTML = "<p>Proyecto no encontrado.</p>";
    detailSection.style.display = "block";
    projectList.style.display = "none";
    return;
  }

  projectList.style.display = "none";
  detailSection.style.display = "block";
  detailSection.innerHTML = `
    <h2><span class="back-arrow" onclick="showProjectList()">←</span> <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-title-link">${project.title}</a> (${project.year})</h2>
    <div>${project.description}</div>
  `;
  detailSection.scrollIntoView({ behavior: "smooth" });
}

function showProjectList() {
  const detailSection = document.getElementById("project-detail");
  const projectList = document.getElementById("project-list");
  
  detailSection.style.display = "none";
  projectList.style.display = "block";
  projectList.scrollIntoView({ behavior: "smooth" });
}

loadMenu();
loadProjects();
