document.addEventListener("DOMContentLoaded", function() {
    const sections = [
        { title: "fotos", url: "https://julianszere.github.io/mirar/" },
        { title: "ideas", url: "https://julianszere.github.io/pensar/" },
    ];

    const toggleSections = [
        {
            title: "textos",
            buttonId: "leerButton",
            contentClass: "leer",
            links: [
                {
                    url: "https://julianszere.github.io/leer/Biblioteca-Total/",
                    text: "La biblioteca total",
                    tooltip: "Todos los sinónimos para cada palabra del cuento La biblioteca total de Jorge Luis Borges. En total, un decillón (10^60) de cuentos posibles."
                }
            ]
        },
        {
            title: "juegos",
            buttonId: "jugarButton",
            contentClass: "jugar",
            links: [
                {
                    url: "https://julianszere.github.io/jugar/Péndulos",
                    text: "Péndulos",
                    tooltip: "Péndulos de longitudes específicas que forman un lindo patrón."
                }
            ]
        }
    ];

    const linksContainer = document.querySelector(".links");

    // Add static sections
    sections.forEach(section => {
        const linkItem = document.createElement("div");
        linkItem.className = "link-item";
        linkItem.innerHTML = `<a href="${section.url}">${section.title}</a>`;
        linksContainer.appendChild(linkItem);
    });

    // Add toggle sections with dynamic links and tooltips
    toggleSections.forEach(section => {
        const linkItem = document.createElement("div");
        linkItem.className = "link-item";
        linkItem.innerHTML = `
            <a href="#" id="${section.buttonId}" class="toggle-button">${section.title}</a>
            <div class="${section.contentClass} hidden">
                ${section.links.map(link => `
                    <div class="leer-item">
                        <div class="tooltip">
                            <div class="link-container">
                                <a class="link-text" href="${link.url}">${link.text}</a>
                                <i class="info-icon">ℹ️</i>
                            </div>
                            <span class="tooltiptext">${link.tooltip}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        linksContainer.appendChild(linkItem);

        // Add event listener for toggle button
        document.getElementById(section.buttonId).addEventListener("click", (event) => {
            event.preventDefault();
            document.querySelector(`.${section.contentClass}`).classList.toggle("hidden");
        });
    });
});
