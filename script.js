async function loadMenu() {
  const placeholder = document.getElementById("menu-placeholder");
  try {
    const res = await fetch("/menu.html");
    if (!res.ok) throw new Error("Failed to load menu");
    placeholder.innerHTML = await res.text();

    // Remove loading class so page shows content with styles
    document.body.classList.remove("loading");

    // Setup tab click handlers AFTER menu is loaded
    setupTabs();
  } catch (e) {
    console.error(e);
    document.body.classList.remove("loading"); // show anyway if error
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
      if(content) content.classList.add("active");
    });
  });
}

const projects = [
  {
    id: "teg",
    date: "Nov. 2025",
    title: "Calculadora del Plan Táctico y Estratégico de la Guerra",
    link: "https://julianszere.github.io/proyectar/TEG",
  },
  {
    id: "biblioteca",
    date: "Abr. 2024",
    title: "La Biblioteca Total",
    link: "https://julianszere.github.io/proyectar/biblioteca",
  },
  {
    id: "resortes",
    date: "Jun. 2023",
    title: "Resortes Mínimos",
    link: "https://julianszere.github.io/proyectar/resortes",
  },
  {
    id: "pendulos",
    date: "May. 2023",
    title: "Péndulos Orquestrados",
    link: "https://julianszere.github.io/proyectar/péndulos",
  }
];

function createProject({ date, title, link }) {
  const li = document.createElement("li");
  li.className = "project-item";
  li.innerHTML = `
    <div class="project-header">
      <span class="project-date">${date}</span>
      <a class="project-title" href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
    </div>
  `;
  return li;
}

function loadProjects() {
  const projectList = document.getElementById("project-list");
  projects.forEach(project => {
    projectList.appendChild(createProject(project));
  });
}

loadMenu();
loadProjects();
