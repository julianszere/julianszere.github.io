async function loadMenu() {
  const placeholder = document.getElementById("menu-placeholder");
  try {
    const res = await fetch("/menu.html");
    if (!res.ok) throw new Error("Failed to load menu");
    placeholder.innerHTML = await res.text();

    document.body.classList.remove("loading");

    setupTabs();
  } catch (e) {
    console.error(e);
    document.body.classList.remove("loading");
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();

      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove("active"));

      // Add active to clicked tab
      tab.classList.add("active");

      // Show related tab content
      const tabName = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
      const content = document.getElementById(tabName);
      if (content) content.classList.add("active");

      if (tabName === "proyectos") {
        // ✅ If returning to Proyectos tab, restore the list and clear detail
        clearProjectDetail();
        showProjectList();
      } else {
        // ✅ If going to other tabs, hide list + detail
        hideProjectList();
        clearProjectDetail();
      }
    });
  });
}

const projects = [
  {
    id: "teg",
    year: "2025",
    month: "Nov.",
    title: "Calculadora T.E.G.",
    description: `
      <p>Una herramienta para calcular escenarios tácticos y estratégicos de guerra con modelos avanzados.</p>
      <p><a href="https://julianszere.github.io/proyectar/TEG" target="_blank" rel="noopener noreferrer">Visitar proyecto</a></p>
    `
  },
  {
    id: "biblioteca",
    year: "2024",
    month: "Abr.",
    title: "La Biblioteca Total",
    description: `
      <p>Todos los sinónimos sintácticamente compatibles con el texto La Biblioteca Total de Borges generan un decillón (10^60) de cuentos posibles para decir lo mismo pero distino</p>
      <p>La biblioteca total, completa, extensa, integral, cabal, general, universal, absoluta, exhaustiva, global, etcétera es una demostración de todos los textos que podrían aparecer en la biblioteca. Borges está encontra (lo azulado)</p>    `
  },
  {
    id: "resortes",
    year: "2023",
    month: "Jun.",
    title: "Resortes Mínimos",
    description: `
      <p>Proyecto experimental sobre sistemas de resortes mínimos y su comportamiento físico.</p>
      <p><a href="https://julianszere.github.io/proyectar/resortes" target="_blank" rel="noopener noreferrer">Visitar proyecto</a></p>
    `
  },
  {
    id: "pendulos",
    year: "2023",
    month: "May.",
    title: "Péndulos Orquestrados",
    description: `
      <p>Simulación y estudio de péndulos sincronizados con patrones orquestales.</p>
      <p><a href="https://julianszere.github.io/proyectar/péndulos" target="_blank" rel="noopener noreferrer">Visitar proyecto</a></p>
    `
  }
];

// Build the project list with clickable titles
function createProject({ id, year, month, title }) {
  const li = document.createElement("li");
  li.className = "project-item";

  li.innerHTML = `
    <div class="project-header">
      <span class="project-date">${month} ${year}</span>
      <a href="#" class="project-title" data-id="${id}">${title}</a>
    </div>
  `;

  return li;
}

function loadProjects() {
  const projectList = document.getElementById("project-list");
  projects.forEach(project => {
    projectList.appendChild(createProject(project));
  });

  // Attach click handlers on project titles
  projectList.querySelectorAll(".project-title").forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const projectId = anchor.getAttribute("data-id");
      showProjectDetail(projectId);
    });
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

  // Hide list, show detail
  projectList.style.display = "none";
  detailSection.style.display = "block";

  detailSection.innerHTML = `
    <h2>${project.title} (${project.year})</h2>
    <div>${project.description}</div>
  `;

  detailSection.scrollIntoView({ behavior: "smooth" });

  // 🔹 Make Proyectos tab look INACTIVE while in detail view
  const proyectosTab = document.querySelector('.tab[data-tab="proyectos"]');
  if (proyectosTab) proyectosTab.classList.remove("active");
}

function clearProjectDetail() {
  const detailSection = document.getElementById("project-detail");
  detailSection.innerHTML = "";
  detailSection.style.display = "none";
}

function showProjectList() {
  const projectList = document.getElementById("project-list");
  const proyectosTab = document.querySelector('.tab[data-tab="proyectos"]');
  projectList.style.display = "block";

  // ✅ Restore active styling when back to list
  if (proyectosTab) proyectosTab.classList.add("active");
}

function hideProjectList() {
  document.getElementById("project-list").style.display = "none";
}

// Load menu and projects
loadMenu();
loadProjects();
