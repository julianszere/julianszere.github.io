document.addEventListener("DOMContentLoaded", function() {
    // Get the leer button and leer section
    const leerButton = document.getElementById("leerButton");
    const leerSection = document.querySelector(".leer");

    // Toggle the visibility of the leer section when the button is clicked
    leerButton.addEventListener("click", function() {
        if (leerSection.style.display === "none" || leerSection.style.display === "") {
            leerSection.style.display = "block";
        } else {
            leerSection.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Get the jugar button and jugar section
    const jugarButton = document.getElementById("jugarButton");
    const jugarSection = document.querySelector(".jugar");

    // Toggle the visibility of the jugar section when the button is clicked
    jugarButton.addEventListener("click", function() {
        if (jugarSection.style.display === "none" || jugarSection.style.display === "") {
            jugarSection.style.display = "block";
        } else {
            jugarSection.style.display = "none";
        }
    });
});
