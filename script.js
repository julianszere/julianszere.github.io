document.querySelectorAll('.toggle-arrow').forEach(button => {
button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.textContent = expanded ? '▶' : '▼';

    const content = button.nextElementSibling;
    content.classList.toggle('expanded');
});
});
