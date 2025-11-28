// Jugadores predeterminados
const jugadoresPredeterminados = [
    { id: 1, nombre: "Chavo", imagen: "resources/images/config/chavo.jpg", colorDefault: "#ffc107" },
    { id: 2, nombre: "Quico", imagen: "resources/images/config/quico.jpg", colorDefault: "#2196F3" },
    { id: 3, nombre: "Don Ramón", imagen: "resources/images/config/don-ramon.jpg", colorDefault: "#4CAF50" },
    { id: 4, nombre: "Popis", imagen: "resources/images/config/popis.jpg", colorDefault: "#E91E63" }
];

// Colores disponibles para elegir
const coloresDisponibles = [
    { nombre: "Amarillo", hex: "#ffc107" },
    { nombre: "Azul", hex: "#2196F3" },
    { nombre: "Verde", hex: "#4CAF50" },
    { nombre: "Rosa", hex: "#E91E63" },
    { nombre: "Naranja", hex: "#FF5722" },
    { nombre: "Morado", hex: "#9C27B0" },
    { nombre: "Rojo", hex: "#d22626" },
    { nombre: "Cyan", hex: "#00BCD4" }
];

// Estado de la configuración
let configuracion = {
    tamanoTablero: 8,
    limiteBarcos: 5,
    jugador1: null,
    jugador2: null,
    musicaActiva: true,
    narradorActivo: true
};

// Audio
let audioFondo = null;
let audioIndication = null;
let audioTablero = {
    6: new Audio('resources/sounds/config/6x6.mp3'),
    8: new Audio('resources/sounds/config/8x8.mp3'),
    10: new Audio('resources/sounds/config/10x10.mp3')
};

// Audios de jugadores
let audioJugadores = {
    1: new Audio('resources/sounds/game/chavo/win.mp3'),
    2: new Audio('resources/sounds/game/quico/win.mp3'),
    3: new Audio('resources/sounds/game/don-ramon/win.mp3'),
    4: new Audio('resources/sounds/game/popis/win.mp3')
};

// Audio de jugador y tablero actualmente reproduciéndose
let audioJugadorActual = null;
let audioTableroActual = null;

// Inicializar configuración al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    inicializarConfiguracion();
    inicializarAudio();
});

function inicializarAudio() {
    // Audio de fondo (soundtrack)
    audioFondo = new Audio('resources/sounds/config/soundtrack.mp3');
    audioFondo.loop = true;
    audioFondo.volume = 0.2;

    // Audio de indicación (al cargar)
    audioIndication = new Audio('resources/sounds/config/indication.mp3');
    audioIndication.volume = 0.6;

    // Reproducir indicación cuando la página esté completamente cargada
    window.addEventListener('load', () => {
        audioIndication.play().catch(err => console.log('Error al reproducir indication:', err));

        // Después de la indicación, iniciar soundtrack
        audioIndication.addEventListener('ended', () => {
            if (configuracion.musicaActiva) {
                audioFondo.play().catch(err => console.log('Error al reproducir soundtrack:', err));
            }
        });
    });

    // Configurar volumen de audios de tablero
    Object.values(audioTablero).forEach(audio => {
        audio.volume = 0.6;
    });

    // Configurar volumen de audios de jugadores
    Object.values(audioJugadores).forEach(audio => {
        audio.volume = 0.6;
    });
}

function inicializarConfiguracion() {
    renderizarJugadores();
    configurarEventos();
}

// Renderizar selector de jugadores
function renderizarJugadores() {
    const contenedor = document.getElementById('listaJugadores');

    contenedor.innerHTML = `
        <div class="selector-jugadores">
            ${jugadoresPredeterminados.map(jugador => `
                <div class="jugador-card" data-id="${jugador.id}" onclick="seleccionarJugador(${jugador.id})">
                    <div class="jugador-avatar">
                        <img src="${jugador.imagen}" alt="${jugador.nombre}">
                    </div>
                    <div class="jugador-nombre">${jugador.nombre}</div>
                    <div class="etiqueta-jugador"></div>
                </div>
            `).join('')}
        </div>
    `;
}

// Seleccionar jugador
function seleccionarJugador(id) {
    const jugador = jugadoresPredeterminados.find(j => j.id === id);

    // Si ya está seleccionado como jugador 1, deseleccionarlo (SIN AUDIO)
    if (configuracion.jugador1?.id === id) {
        configuracion.jugador1 = null;
        actualizarUI();
        ocultarPersonalizacion();
        return;
    }

    // Si ya está seleccionado como jugador 2, deseleccionarlo (SIN AUDIO)
    if (configuracion.jugador2?.id === id) {
        configuracion.jugador2 = null;
        actualizarUI();
        ocultarPersonalizacion();
        return;
    }

    // Reproducir audio del jugador SOLO cuando se selecciona (no al deseleccionar)
    if (configuracion.narradorActivo) {
        reproducirAudioJugador(id);
    }

    // Asignar a jugador 1 si está vacío
    if (!configuracion.jugador1) {
        configuracion.jugador1 = {
            ...jugador,
            nombrePersonalizado: jugador.nombre,
            color: jugador.colorDefault
        };
        mostrarPersonalizacion(1);
    }
    // Asignar a jugador 2 si está vacío
    else if (!configuracion.jugador2) {
        configuracion.jugador2 = {
            ...jugador,
            nombrePersonalizado: jugador.nombre,
            color: jugador.colorDefault
        };
        mostrarPersonalizacion(2);
    }
    // Si ambos están llenos, reemplazar jugador 1
    else {
        configuracion.jugador1 = {
            ...jugador,
            nombrePersonalizado: jugador.nombre,
            color: jugador.colorDefault
        };
        mostrarPersonalizacion(1);
    }

    actualizarUI();
}

// Mostrar panel de personalización
function mostrarPersonalizacion(numeroJugador) {
    const jugador = numeroJugador === 1 ? configuracion.jugador1 : configuracion.jugador2;

    Swal.fire({
        title: `Personalizar Jugador ${numeroJugador}`,
        html: `
            <div style="text-align: left; padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #ffc107; font-weight: bold;">
                        Nombre del Jugador:
                    </label>
                    <input 
                        type="text" 
                        id="nombreJugador" 
                        value="${jugador.nombrePersonalizado}"
                        maxlength="20"
                        style="width: 100%; padding: 10px; border: 2px solid #f4721e; border-radius: 8px; 
                               background: rgba(0,0,0,0.5); color: #ffc107; font-size: 1rem;"
                        placeholder="Ingresa un nombre">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 12px; color: #ffc107; font-weight: bold;">
                        Color del Jugador:
                    </label>
                    <div id="selectorColores" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                        ${coloresDisponibles.map(color => `
                            <div class="color-opcion ${color.hex === jugador.color ? 'color-seleccionado' : ''}" 
                                 data-color="${color.hex}"
                                 onclick="seleccionarColorTemp('${color.hex}')"
                                 style="width: 100%; height: 50px; background: ${color.hex}; 
                                        border: 3px solid ${color.hex === jugador.color ? '#fff' : 'transparent'}; 
                                        border-radius: 8px; cursor: pointer; transition: all 0.3s ease;
                                        box-shadow: ${color.hex === jugador.color ? '0 0 15px rgba(255,255,255,0.5)' : 'none'};">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d22626',
        cancelButtonColor: '#666',
        background: '#1a1a1a',
        didOpen: () => {
            // Enfocar el input de nombre
            document.getElementById('nombreJugador').focus();
        },
        preConfirm: () => {
            const nombre = document.getElementById('nombreJugador').value.trim();
            const colorSeleccionado = document.querySelector('.color-seleccionado');

            if (!nombre) {
                Swal.showValidationMessage('El nombre no puede estar vacío');
                return false;
            }

            return {
                nombre: nombre,
                color: colorSeleccionado ? colorSeleccionado.dataset.color : jugador.color
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (numeroJugador === 1) {
                configuracion.jugador1.nombrePersonalizado = result.value.nombre;
                configuracion.jugador1.color = result.value.color;
            } else {
                configuracion.jugador2.nombrePersonalizado = result.value.nombre;
                configuracion.jugador2.color = result.value.color;
            }
            actualizarUI();
        }
    });
}

// Función auxiliar para seleccionar color temporalmente en el modal
window.seleccionarColorTemp = function (colorHex) {
    document.querySelectorAll('.color-opcion').forEach(opcion => {
        opcion.classList.remove('color-seleccionado');
        opcion.style.border = '3px solid transparent';
        opcion.style.boxShadow = 'none';
    });

    const opcionSeleccionada = document.querySelector(`[data-color="${colorHex}"]`);
    if (opcionSeleccionada) {
        opcionSeleccionada.classList.add('color-seleccionado');
        opcionSeleccionada.style.border = '3px solid #fff';
        opcionSeleccionada.style.boxShadow = '0 0 15px rgba(255,255,255,0.5)';
    }
};

// Ocultar personalización
function ocultarPersonalizacion() {
    // Esta función se puede usar si necesitas lógica adicional al deseleccionar
}

// Reproducir audio del jugador
function reproducirAudioJugador(id) {
    // Si hay un audio reproduciéndose, detenerlo
    if (audioJugadorActual) {
        audioJugadorActual.pause();
        audioJugadorActual.currentTime = 0;
    }

    // Reproducir el nuevo audio
    const audio = audioJugadores[id];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Error al reproducir audio jugador:', err));
        audioJugadorActual = audio;
    }
}

// Actualizar interfaz
function actualizarUI() {
    const cards = document.querySelectorAll('.jugador-card');

    cards.forEach(card => {
        const id = parseInt(card.dataset.id);
        const etiqueta = card.querySelector('.etiqueta-jugador');

        card.classList.remove('seleccionado');
        etiqueta.textContent = '';
        card.style.boxShadow = '';

        if (configuracion.jugador1?.id === id) {
            card.classList.add('seleccionado');
            etiqueta.textContent = `JUGADOR 1: ${configuracion.jugador1.nombrePersonalizado}`;
            card.style.boxShadow = `0 5px 25px ${configuracion.jugador1.color}`;
            card.style.borderColor = configuracion.jugador1.color;
        } else if (configuracion.jugador2?.id === id) {
            card.classList.add('seleccionado');
            etiqueta.textContent = `JUGADOR 2: ${configuracion.jugador2.nombrePersonalizado}`;
            card.style.boxShadow = `0 5px 25px ${configuracion.jugador2.color}`;
            card.style.borderColor = configuracion.jugador2.color;
        }
    });

    // Habilitar/deshabilitar botón de inicio
    const btnInicio = document.querySelector('.btn-config-listo');
    if (configuracion.jugador1 && configuracion.jugador2) {
        btnInicio.disabled = false;
    } else {
        btnInicio.disabled = true;
    }
}

// Seleccionar tamaño de tablero
function seleccionarTamano(tamano) {
    configuracion.tamanoTablero = tamano;

    document.querySelectorAll('.btn-tablero').forEach(btn => {
        btn.classList.remove('activo');
    });

    event.target.classList.add('activo');

    // Reproducir audio del tamaño seleccionado solo si el narrador está activo
    if (configuracion.narradorActivo && audioTablero[tamano]) {
        // Si hay un audio de tablero reproduciéndose, detenerlo
        if (audioTableroActual) {
            audioTableroActual.pause();
            audioTableroActual.currentTime = 0;
        }

        // Reproducir el nuevo audio
        audioTablero[tamano].currentTime = 0;
        audioTablero[tamano].play().catch(err => console.log('Error al reproducir audio tablero:', err));
        audioTableroActual = audioTablero[tamano];
    }
}

// Configurar eventos
function configurarEventos() {
    // Botones de tamaño de tablero
    document.querySelectorAll('.btn-tablero').forEach((btn, index) => {
        const tamanos = [6, 8, 10];
        btn.onclick = () => seleccionarTamano(tamanos[index]);
    });

    // Input de límite de barcos (máximo 8)
    const inputBarcos = document.getElementById('limiteBarcos');
    inputBarcos.max = 8;
    inputBarcos.addEventListener('change', (e) => {
        let valor = parseInt(e.target.value);
        if (valor > 8) valor = 8;
        if (valor < 1) valor = 1;
        e.target.value = valor;
        configuracion.limiteBarcos = valor;
    });

    // Toggle música
    document.getElementById('toggleMusica').addEventListener('change', (e) => {
        configuracion.musicaActiva = e.target.checked;

        if (e.target.checked) {
            audioFondo.play().catch(err => console.log('Error al reproducir música:', err));
        } else {
            audioFondo.pause();
        }
    });

    // Toggle narrador
    document.getElementById('toggleNarrador').addEventListener('change', (e) => {
        configuracion.narradorActivo = e.target.checked;
    });

    // Botón iniciar partida
    document.querySelector('.btn-config-listo').addEventListener('click', iniciarPartida);
}

// Iniciar partida
function iniciarPartida() {
    if (!configuracion.jugador1 || !configuracion.jugador2) {
        Swal.fire({
            icon: 'warning',
            title: '¡Atención!',
            text: 'Debes seleccionar 2 jugadores para comenzar',
            confirmButtonColor: '#d22626',
            background: '#1a1a1a',
            color: '#ffc107'
        });
        return;
    }

    console.log('Configuración final:', configuracion);

    // Detener audio de fondo
    audioFondo.pause();

    Swal.fire({
        icon: 'success',
        title: '¡Batalla Lista!',
        html: `
            <div style="padding: 20px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <div style="width: 60px; height: 60px; background: ${configuracion.jugador1.color}; 
                                    border-radius: 50%; margin: 0 auto 10px; border: 3px solid white;"></div>
                        <strong style="color: ${configuracion.jugador1.color};">${configuracion.jugador1.nombrePersonalizado}</strong>
                    </div>
                    <strong style="font-size: 1.5rem;">VS</strong>
                    <div style="text-align: center;">
                        <div style="width: 60px; height: 60px; background: ${configuracion.jugador2.color}; 
                                    border-radius: 50%; margin: 0 auto 10px; border: 3px solid white;"></div>
                        <strong style="color: ${configuracion.jugador2.color};">${configuracion.jugador2.nombrePersonalizado}</strong>
                    </div>
                </div>
                <p>Tablero: ${configuracion.tamanoTablero}x${configuracion.tamanoTablero}</p>
                <p>Barcos: ${configuracion.limiteBarcos}</p>
            </div>
        `,
        confirmButtonColor: '#d22626',
        confirmButtonText: '¡A JUGAR!',
        background: '#1a1a1a',
        color: '#ffc107'
    }).then(() => {
        iniciarJuego();
    });
}

// Función para iniciar el juego
function iniciarJuego() {
    // Guardar configuración en localStorage
    localStorage.setItem('configuracionJuego', JSON.stringify(configuracion));
    
    // Redirigir a la página del juego
    window.location.href = 'juego.html';
}