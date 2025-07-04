document.querySelectorAll('.project-title').forEach(button => {
button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const targetId = button.getAttribute('aria-controls');
    const desc = document.getElementById(targetId);

    button.setAttribute('aria-expanded', String(!expanded));
    desc.classList.toggle('hidden');
});
});