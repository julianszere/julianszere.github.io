document.addEventListener("DOMContentLoaded", function() {
    function toggleSection(buttonId, sectionClass) {
        const button = document.getElementById(buttonId);
        const section = document.querySelector(`.${sectionClass}`);
        button.addEventListener("click", () => section.classList.toggle("hidden"));
    }
    toggleSection("leerButton", "leer");
    toggleSection("jugarButton", "jugar");
});
