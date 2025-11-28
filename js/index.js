const musicaMenu = new Audio("resources/sounds/menu/soundtrack.mp3");
musicaMenu.loop = true;
musicaMenu.volume = 0.5;

const btnMusica = document.getElementById("btnMusica");
let musicaActiva = true;

musicaMenu.play().catch(() => {
    document.addEventListener("click", () => musicaMenu.play(), { once: true });
});

btnMusica.addEventListener("click", () => {
    musicaActiva = !musicaActiva;
    musicaActiva ? musicaMenu.play() : musicaMenu.pause();
    btnMusica.textContent = musicaActiva ? "Música: ON" : "Música: OFF";
});