const projects = [
  {
    id: "teg",
    title: "Calculadora del Plan Táctico y Estratégico de la Guerra",
    link: "https://julianszere.github.io/proyectar/TEG",
    description: "en el juego de mesa TEG, dado un país atacante y uno defensor con N y M ejércitos, ¿cuál es la probabilidad de conquistar el país tras sucesivos ataques? Calculado de manera analítica."
  },
  {
    id: "biblioteca",
    title: "La Biblioteca Total",
    link: "https://julianszere.github.io/proyectar/biblioteca",
    description: "todos los sinónimos posibles de cada palabra en el cuento La biblioteca total de Jorge Luis Borges. Por cada click un cuento nuevo. En total, un decillón (10^60) de cuentos posibles."
  },
  {
    id: "resortes",
    title: "Resortes Mínimos",
    link: "https://julianszere.github.io/proyectar/resortes",
    description: "La ecuación a minimizar en un ajuste lineal es matemáticamente idéntica al potencial elástico de una serie de resortes que se estiran entre una barra y un punto fijo. Como las leyes de Newton se pueden expresar como la minimización del lagrangiano que contiene a esa expresión, el problema de resolver la dinámica de una barra enganchada a resortes es idéntico al de ajustar una recta."
  },
  {
    id: "pendulos",
    title: "Péndulos orquestrados",
    link: "https://julianszere.github.io/proyectar/péndulos",
    description: "péndulos desacoplados de longitudes específicas que forman un lindo patrón."
  },
  {
    id: "fortunas",
    title: "Galletas de la fortuna",
    link: "https://julianszere.github.io/proyectar/fortunas",
    description: "pensamientos flotantes"
  },
  {
    id: "fotos",
    title: "Fotografías",
    link: "https://julianszere.github.io/mirar",
    description: "una colección de imágenes."
  }
];

function createProject({ id, title, link, description }) {
  const li = document.createElement('li');
  li.className = 'project-item';

  li.innerHTML = `
    <div class="project-header">
      <button class="project-title" aria-expanded="false" aria-controls="desc-${id}">
        ${title}
      </button>
      <a class="project-link" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${title}"></a>
    </div>
    <div class="project-description hidden" id="desc-${id}">
      ${description}
    </div>
  `;

  return li;
}

const projectList = document.getElementById('project-list');
projects.forEach(project => {
  projectList.appendChild(createProject(project));
});


document.querySelectorAll('.project-title').forEach(button => {
button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const targetId = button.getAttribute('aria-controls');
    const desc = document.getElementById(targetId);

    button.setAttribute('aria-expanded', String(!expanded));
    desc.classList.toggle('hidden');
});
});


