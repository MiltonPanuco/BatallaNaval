// Estado del juego
let estadoJuego = {
    configuracion: null,
    turnoActual: 1,
    tableroJugador1: [],
    tableroJugador2: [],
    barcosJugador1: 0,
    barcosJugador2: 0,
    victorias: {
        jugador1: 0,
        jugador2: 0
    },
    juegoActivo: false,
    faseColocacion: true,
    jugadorColocando: 1,
    barcosColocados: 0,
    alertasActivas: true,
    alertaMostrandose: false
};

// Elementos de audio
let audioSoundtrack = null;
let audioIndication = null;

// Rutas de sonidos para cada personaje
const sonidosPersonajes = {
    chavo: {
        sentences: [
            'resources/sounds/game/chavo/sentence-1.mp3',
            'resources/sounds/game/chavo/sentence-2.mp3',
            'resources/sounds/game/chavo/sentence-3.mp3'
        ],
        win: 'resources/sounds/game/chavo/win.mp3'
    },
    quico: {
        sentences: [
            'resources/sounds/game/quico/sentence-1.mp3',
            'resources/sounds/game/quico/sentence-2.mp3',
            'resources/sounds/game/quico/sentence-3.mp3'
        ],
        win: 'resources/sounds/game/quico/win.mp3'
    },
    popis: {
        sentences: [
            'resources/sounds/game/popis/sentence-1.mp3',
            'resources/sounds/game/popis/sentence-2.mp3',
            'resources/sounds/game/popis/sentence-3.mp3'
        ],
        win: 'resources/sounds/game/popis/win.mp3'
    },
    'don-ramon': {
        sentences: [
            'resources/sounds/game/don-ramon/sentence-1.mp3',
            'resources/sounds/game/don-ramon/sentence-2.mp3',
            'resources/sounds/game/don-ramon/sentence-3.mp3'
        ],
        win: 'resources/sounds/game/don-ramon/win.mp3'
    }
};

// Sonidos de agua (fallo)
const sonidosFallo = [
    'resources/sounds/game/fail-1.mp3',
    'resources/sounds/game/fail-2.mp3'
];

// Función para inicializar el audio de fondo
function inicializarAudioFondo() {
    if (!audioSoundtrack) {
        audioSoundtrack = new Audio('resources/sounds/game/soundtrack.mp3');
        audioSoundtrack.loop = true;
        audioSoundtrack.volume = 0.3;
    }
}

// Función para reproducir soundtrack
function reproducirSoundtrack() {
    inicializarAudioFondo();
    audioSoundtrack.play().catch(err => console.log('Error reproduciendo soundtrack:', err));
}

// Función para reproducir sonido de indicación inicial
function reproducirIndicacion() {
    if (!audioIndication) {
        audioIndication = new Audio('resources/sounds/game/indication.mp3');
        audioIndication.volume = 0.6;
    }
    audioIndication.play().catch(err => console.log('Error reproduciendo indicación:', err));
}

// Función para reproducir sonido de fallo (agua)
function reproducirSonidoFallo() {
    const indiceAleatorio = Math.floor(Math.random() * sonidosFallo.length);
    const audio = new Audio(sonidosFallo[indiceAleatorio]);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Error reproduciendo sonido de fallo:', err));
}

// Función para identificar el personaje basándose en el nombre original de la card
function identificarPersonaje(jugador) {
    const nombreOriginal = jugador.nombre.toLowerCase();

    if (nombreOriginal.includes('chavo')) return 'chavo';
    if (nombreOriginal.includes('quico')) return 'quico';
    if (nombreOriginal.includes('popis')) return 'popis';
    if (nombreOriginal.includes('don') || nombreOriginal.includes('ramon') || nombreOriginal.includes('ramón')) return 'don-ramon';

    return null;
}

// Función para reproducir sonido aleatorio del personaje (cuando acierta)
function reproducirSonidoPersonaje(jugador) {
    const personaje = identificarPersonaje(jugador);

    if (personaje && sonidosPersonajes[personaje]) {
        const sonidos = sonidosPersonajes[personaje].sentences;
        const indiceAleatorio = Math.floor(Math.random() * sonidos.length);
        const audio = new Audio(sonidos[indiceAleatorio]);
        audio.volume = 0.7;
        audio.play().catch(err => console.log('Error reproduciendo audio:', err));
    }
}

// Función para reproducir sonido de victoria
function reproducirSonidoVictoria(jugador) {
    const personaje = identificarPersonaje(jugador);

    if (personaje && sonidosPersonajes[personaje]) {
        const audio = new Audio(sonidosPersonajes[personaje].win);
        audio.volume = 0.8;
        audio.play().catch(err => console.log('Error reproduciendo audio de victoria:', err));
    }
}

// Cargar configuración
document.addEventListener('DOMContentLoaded', () => {
    cargarConfiguracion();
    inicializarInterfaz();
    configurarEventos();

    // Reproducir sonido de indicación y luego soundtrack
    reproducirIndicacion();

    // Iniciar soundtrack después de la indicación
    setTimeout(() => {
        reproducirSoundtrack();
    }, 1000);
});

function cargarConfiguracion() {
    const configGuardada = localStorage.getItem('configuracionJuego');

    if (configGuardada) {
        estadoJuego.configuracion = JSON.parse(configGuardada);
    } else {
        estadoJuego.configuracion = {
            tamanoTablero: 8,
            limiteBarcos: 5,
            jugador1: {
                id: 1,
                nombre: "Chavo",
                nombrePersonalizado: "Chavo",
                color: "#ffc107",
                imagen: "resources/images/config/chavo.jpg"
            },
            jugador2: {
                id: 2,
                nombre: "Quico",
                nombrePersonalizado: "Quico",
                color: "#2196F3",
                imagen: "resources/images/config/quico.jpg"
            }
        };
    }

    iniciarNuevaRonda();
}

function inicializarInterfaz() {
    const config = estadoJuego.configuracion;

    document.getElementById('avatar1').src = config.jugador1.imagen;
    document.getElementById('avatar2').src = config.jugador2.imagen;
    document.getElementById('nombreJugador1').textContent = config.jugador1.nombrePersonalizado;
    document.getElementById('nombreJugador2').textContent = config.jugador2.nombrePersonalizado;
    document.getElementById('headerJugador1').textContent = `Tablero de ${config.jugador1.nombrePersonalizado}`;
    document.getElementById('headerJugador2').textContent = `Tablero de ${config.jugador2.nombrePersonalizado}`;

    document.querySelector('.jugador1-stats').style.borderLeft = `5px solid ${config.jugador1.color}`;
    document.querySelector('.jugador2-stats').style.borderRight = `5px solid ${config.jugador2.color}`;

    const victoriasGuardadas = localStorage.getItem('victoriasJuego');
    if (victoriasGuardadas) {
        estadoJuego.victorias = JSON.parse(victoriasGuardadas);
        actualizarMarcadorVictorias();
    }

    actualizarIndicadorTurno();
    actualizarBotonAlertas();
}

function iniciarNuevaRonda() {
    const config = estadoJuego.configuracion;
    const tamano = config.tamanoTablero;

    estadoJuego.tableroJugador1 = crearTablero(tamano);
    estadoJuego.tableroJugador2 = crearTablero(tamano);
    estadoJuego.barcosJugador1 = 0;
    estadoJuego.barcosJugador2 = 0;
    estadoJuego.turnoActual = 1;
    estadoJuego.juegoActivo = false;
    estadoJuego.faseColocacion = true;
    estadoJuego.jugadorColocando = 1;
    estadoJuego.barcosColocados = 0;
    estadoJuego.alertaMostrandose = false;

    renderizarTablero('tableroJugador1', estadoJuego.tableroJugador1, 1);
    renderizarTablero('tableroJugador2', estadoJuego.tableroJugador2, 2);

    actualizarContadorBarcos();
    actualizarIndicadorTurno();

    mostrarInstruccionesColocacion();
}

function bloquearTableros() {
    estadoJuego.alertaMostrandose = true;
    const tableros = document.querySelectorAll('.tablero');
    tableros.forEach(tablero => {
        tablero.style.pointerEvents = 'none';
        tablero.style.opacity = '0.6';
    });
}

function desbloquearTableros() {
    estadoJuego.alertaMostrandose = false;
    const tableros = document.querySelectorAll('.tablero');
    tableros.forEach(tablero => {
        tablero.style.pointerEvents = 'auto';
        tablero.style.opacity = '1';
    });
}

function mostrarInstruccionesColocacion() {
    if (!estadoJuego.alertasActivas) {
        return;
    }

    const jugador = estadoJuego.jugadorColocando === 1 ?
        estadoJuego.configuracion.jugador1 :
        estadoJuego.configuracion.jugador2;

    bloquearTableros();

    Swal.fire({
        title: `${jugador.nombrePersonalizado}, coloca tus barcos`,
        html: `
            <p>Haz click en <strong>${estadoJuego.configuracion.limiteBarcos}</strong> casillas de tu tablero para colocar tus barcos</p>
            <p style="color: ${jugador.color}; font-weight: bold; margin-top: 10px;">
                Barcos colocados: 0/${estadoJuego.configuracion.limiteBarcos}
            </p>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: jugador.color,
        background: '#1a1a1a',
        color: '#ffc107',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        desbloquearTableros();
    });
}

function crearTablero(tamano) {
    const tablero = [];
    for (let i = 0; i < tamano; i++) {
        tablero[i] = [];
        for (let j = 0; j < tamano; j++) {
            tablero[i][j] = {
                tieneBarco: false,
                disparada: false
            };
        }
    }
    return tablero;
}

function renderizarTablero(idTablero, tablero, numeroJugador) {
    const contenedor = document.getElementById(idTablero);
    const tamano = tablero.length;

    contenedor.style.gridTemplateColumns = `repeat(${tamano}, 1fr)`;
    contenedor.innerHTML = '';

    for (let i = 0; i < tamano; i++) {
        for (let j = 0; j < tamano; j++) {
            const casilla = document.createElement('div');
            casilla.className = 'casilla';
            casilla.dataset.fila = i;
            casilla.dataset.columna = j;
            casilla.dataset.jugador = numeroJugador;

            casilla.addEventListener('click', () => manejarClickCasilla(i, j, numeroJugador));

            contenedor.appendChild(casilla);
        }
    }
}

function manejarClickCasilla(fila, columna, jugadorTablero) {
    if (estadoJuego.alertaMostrandose) {
        return;
    }

    // Fase de colocación de barcos
    if (estadoJuego.faseColocacion) {
        if (jugadorTablero !== estadoJuego.jugadorColocando) {
            return;
        }

        const tablero = jugadorTablero === 1 ? estadoJuego.tableroJugador1 : estadoJuego.tableroJugador2;
        const casilla = tablero[fila][columna];

        if (casilla.tieneBarco) {
            casilla.tieneBarco = false;
            estadoJuego.barcosColocados--;
            actualizarCasillaVisual(fila, columna, jugadorTablero, false);
        } else {
            if (estadoJuego.barcosColocados < estadoJuego.configuracion.limiteBarcos) {
                casilla.tieneBarco = true;
                estadoJuego.barcosColocados++;
                actualizarCasillaVisual(fila, columna, jugadorTablero, true);

                if (estadoJuego.barcosColocados === estadoJuego.configuracion.limiteBarcos) {
                    setTimeout(() => {
                        if (estadoJuego.jugadorColocando === 1) {
                            finalizarColocacionJugador1();
                        } else {
                            iniciarFaseDeJuego();
                        }
                    }, 500);
                }
            }
        }
        return;
    }

    // Fase de juego
    if (!estadoJuego.juegoActivo) return;

    if (estadoJuego.turnoActual === jugadorTablero) {
        if (estadoJuego.alertasActivas) {
            bloquearTableros();
            Swal.fire({
                icon: 'warning',
                title: '¡Atención!',
                text: 'No puedes atacar tu propio tablero',
                timer: 1200,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#ffc107',
                allowOutsideClick: false
            }).then(() => {
                desbloquearTableros();
            });
        }
        return;
    }

    const tablero = jugadorTablero === 1 ? estadoJuego.tableroJugador1 : estadoJuego.tableroJugador2;
    const casilla = tablero[fila][columna];

    if (casilla.disparada) {
        if (estadoJuego.alertasActivas) {
            bloquearTableros();
            Swal.fire({
                icon: 'info',
                title: 'Casilla ya usada',
                text: 'Esta casilla ya fue atacada',
                timer: 1200,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#ffc107',
                allowOutsideClick: false
            }).then(() => {
                desbloquearTableros();
            });
        }
        return;
    }

    casilla.disparada = true;

    const tableroId = jugadorTablero === 1 ? 'tableroJugador1' : 'tableroJugador2';
    const contenedor = document.getElementById(tableroId);
    const indiceCasilla = fila * tablero.length + columna;
    const casillaElemento = contenedor.children[indiceCasilla];

    casillaElemento.classList.add('deshabilitada');

    if (casilla.tieneBarco) {
        casillaElemento.classList.add('barco-hundido');

        if (jugadorTablero === 1) {
            estadoJuego.barcosJugador1--;
        } else {
            estadoJuego.barcosJugador2--;
        }

        actualizarContadorBarcos();

        const jugadorAtacante = estadoJuego.turnoActual === 1 ?
            estadoJuego.configuracion.jugador1 :
            estadoJuego.configuracion.jugador2;

        // Reproducir sonido del personaje que acertó
        reproducirSonidoPersonaje(jugadorAtacante);

        if (estadoJuego.alertasActivas) {
            bloquearTableros();
            Swal.fire({
                icon: 'success',
                title: '💥 ¡IMPACTO!',
                text: `${jugadorAtacante.nombrePersonalizado} ha hundido un barco`,
                timer: 1500,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#ffc107',
                allowOutsideClick: false
            }).then(() => {
                desbloquearTableros();
                if (estadoJuego.barcosJugador1 === 0 || estadoJuego.barcosJugador2 === 0) {
                    verificarFinDeJuego();
                }
            });
        } else {
            if (estadoJuego.barcosJugador1 === 0 || estadoJuego.barcosJugador2 === 0) {
                setTimeout(() => verificarFinDeJuego(), 500);
            }
        }

    } else {
        casillaElemento.classList.add('agua');

        // Reproducir sonido de fallo (agua)
        reproducirSonidoFallo();

        if (estadoJuego.alertasActivas) {
            bloquearTableros();
            Swal.fire({
                icon: 'error',
                title: '💧 ¡AGUA!',
                text: 'No había ningún barco aquí',
                timer: 1000,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#ffc107',
                allowOutsideClick: false
            }).then(() => {
                desbloquearTableros();
                cambiarTurno();
            });
        } else {
            setTimeout(() => cambiarTurno(), 500);
        }
    }
}

function actualizarCasillaVisual(fila, columna, jugadorTablero, tieneBarco) {
    const tableroId = jugadorTablero === 1 ? 'tableroJugador1' : 'tableroJugador2';
    const contenedor = document.getElementById(tableroId);
    const tamano = estadoJuego.configuracion.tamanoTablero;
    const indiceCasilla = fila * tamano + columna;
    const casillaElemento = contenedor.children[indiceCasilla];

    if (tieneBarco) {
        casillaElemento.classList.add('barco-colocado');
    } else {
        casillaElemento.classList.remove('barco-colocado');
    }
}

function finalizarColocacionJugador1() {
    estadoJuego.barcosJugador1 = estadoJuego.configuracion.limiteBarcos;
    actualizarContadorBarcos();

    if (estadoJuego.alertasActivas) {
        bloquearTableros();
        Swal.fire({
            title: '¡Listo!',
            text: `${estadoJuego.configuracion.jugador1.nombrePersonalizado} ha colocado todos sus barcos`,
            icon: 'success',
            confirmButtonText: 'Continuar',
            confirmButtonColor: '#4CAF50',
            background: '#1a1a1a',
            color: '#ffc107',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            desbloquearTableros();
            estadoJuego.jugadorColocando = 2;
            estadoJuego.barcosColocados = 0;
            ocultarBarcos(1);
            mostrarInstruccionesColocacion();
        });
    } else {
        estadoJuego.jugadorColocando = 2;
        estadoJuego.barcosColocados = 0;
        ocultarBarcos(1);
    }
}

function ocultarBarcos(jugador) {
    const tableroId = jugador === 1 ? 'tableroJugador1' : 'tableroJugador2';
    const contenedor = document.getElementById(tableroId);
    const casillas = contenedor.querySelectorAll('.barco-colocado');

    casillas.forEach(casilla => {
        casilla.classList.remove('barco-colocado');
    });
}

function iniciarFaseDeJuego() {
    estadoJuego.barcosJugador2 = estadoJuego.configuracion.limiteBarcos;
    estadoJuego.faseColocacion = false;
    estadoJuego.juegoActivo = true;
    estadoJuego.turnoActual = 1;

    actualizarContadorBarcos();
    actualizarIndicadorTurno();
    ocultarBarcos(2);

    if (estadoJuego.alertasActivas) {
        bloquearTableros();
        Swal.fire({
            title: '¡Que comience la batalla!',
            text: 'Ambos jugadores han colocado sus barcos',
            icon: 'success',
            confirmButtonText: '¡A JUGAR!',
            confirmButtonColor: '#d22626',
            background: '#1a1a1a',
            color: '#ffc107',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            desbloquearTableros();
        });
    }
}

function cambiarTurno() {
    if (!estadoJuego.juegoActivo) return;

    estadoJuego.turnoActual = estadoJuego.turnoActual === 1 ? 2 : 1;
    actualizarIndicadorTurno();

    const jugadorActual = estadoJuego.turnoActual === 1 ?
        estadoJuego.configuracion.jugador1.nombrePersonalizado :
        estadoJuego.configuracion.jugador2.nombrePersonalizado;

    if (estadoJuego.alertasActivas) {
        bloquearTableros();
        Swal.fire({
            title: 'Cambio de Turno',
            text: `Es el turno de ${jugadorActual}`,
            timer: 1200,
            showConfirmButton: false,
            background: '#1a1a1a',
            color: '#ffc107',
            icon: 'info',
            allowOutsideClick: false
        }).then(() => {
            desbloquearTableros();
        });
    }
}

function actualizarIndicadorTurno() {
    let nombreTurno, colorTurno;

    if (estadoJuego.faseColocacion) {
        nombreTurno = estadoJuego.jugadorColocando === 1 ?
            estadoJuego.configuracion.jugador1.nombrePersonalizado :
            estadoJuego.configuracion.jugador2.nombrePersonalizado;

        colorTurno = estadoJuego.jugadorColocando === 1 ?
            estadoJuego.configuracion.jugador1.color :
            estadoJuego.configuracion.jugador2.color;

        document.querySelector('.texto-turno').textContent = 'COLOCANDO BARCOS:';
    } else {
        nombreTurno = estadoJuego.turnoActual === 1 ?
            estadoJuego.configuracion.jugador1.nombrePersonalizado :
            estadoJuego.configuracion.jugador2.nombrePersonalizado;

        colorTurno = estadoJuego.turnoActual === 1 ?
            estadoJuego.configuracion.jugador1.color :
            estadoJuego.configuracion.jugador2.color;

        document.querySelector('.texto-turno').textContent = 'TURNO DE:';
    }

    document.getElementById('nombreTurnoActual').textContent = nombreTurno;
    document.getElementById('nombreTurnoActual').style.color = colorTurno;
}

function actualizarContadorBarcos() {
    document.getElementById('barcosJugador1').textContent = estadoJuego.barcosJugador1;
    document.getElementById('barcosJugador2').textContent = estadoJuego.barcosJugador2;
}

function verificarFinDeJuego() {
    if (!estadoJuego.juegoActivo) return;

    if (estadoJuego.barcosJugador1 === 0) {
        estadoJuego.juegoActivo = false;
        finalizarJuego(2);
    } else if (estadoJuego.barcosJugador2 === 0) {
        estadoJuego.juegoActivo = false;
        finalizarJuego(1);
    }
}

function finalizarJuego(ganador) {
    estadoJuego.juegoActivo = false;

    const jugadorGanador = ganador === 1 ?
        estadoJuego.configuracion.jugador1 :
        estadoJuego.configuracion.jugador2;

    const jugadorPerdedor = ganador === 1 ?
        estadoJuego.configuracion.jugador2 :
        estadoJuego.configuracion.jugador1;

    if (ganador === 1) {
        estadoJuego.victorias.jugador1++;
    } else {
        estadoJuego.victorias.jugador2++;
    }

    guardarVictorias();
    actualizarMarcadorVictorias();

    // Reproducir sonido de victoria del ganador
    reproducirSonidoVictoria(jugadorGanador);

    bloquearTableros();
    Swal.fire({
        icon: 'success',
        title: '🏆 ¡VICTORIA!',
        html: `
            <div style="padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <div style="width: 100px; height: 100px; background: ${jugadorGanador.color}; 
                                border-radius: 50%; margin: 0 auto 15px; border: 5px solid white;
                                box-shadow: 0 0 30px ${jugadorGanador.color};"></div>
                    <h2 style="color: ${jugadorGanador.color}; font-size: 2rem; margin: 10px 0;">
                        ${jugadorGanador.nombrePersonalizado}
                    </h2>
                    <p style="font-size: 1.3rem; color: #ffc107;">¡Ha ganado la batalla!</p>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                    <p style="color: #f4721e; font-size: 1.1rem;">
                        ${jugadorPerdedor.nombrePersonalizado} ha sido derrotado
                    </p>
                </div>
            </div>
        `,
        confirmButtonText: 'NUEVA RONDA',
        showCancelButton: true,
        cancelButtonText: 'VER MARCADOR',
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#2196F3',
        background: '#1a1a1a',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then((result) => {
        desbloquearTableros();
        if (result.isConfirmed) {
            iniciarNuevaRonda();
        }
    });
}

function actualizarMarcadorVictorias() {
    document.getElementById('victoriasJugador1').textContent = estadoJuego.victorias.jugador1;
    document.getElementById('victoriasJugador2').textContent = estadoJuego.victorias.jugador2;
}

function guardarVictorias() {
    localStorage.setItem('victoriasJuego', JSON.stringify(estadoJuego.victorias));
}

function actualizarBotonAlertas() {
    const btn = document.getElementById('btnToggleAlertas');
    if (estadoJuego.alertasActivas) {
        btn.textContent = 'DESACTIVAR ALERTAS';
        btn.classList.remove('alertas-off');
    } else {
        btn.textContent = 'ACTIVAR ALERTAS';
        btn.classList.add('alertas-off');
    }
}

function configurarEventos() {
    document.getElementById('btnToggleAlertas').addEventListener('click', () => {
        estadoJuego.alertasActivas = !estadoJuego.alertasActivas;
        actualizarBotonAlertas();
    });

    document.getElementById('btnNuevaRonda').addEventListener('click', () => {
        bloquearTableros();
        Swal.fire({
            title: '¿Nueva Ronda?',
            text: '¿Deseas iniciar una nueva partida?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, nueva ronda',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#666',
            background: '#1a1a1a',
            color: '#ffc107',
            allowOutsideClick: false
        }).then((result) => {
            desbloquearTableros();
            if (result.isConfirmed) {
                iniciarNuevaRonda();
            }
        });
    });

    document.getElementById('btnReiniciarMarcador').addEventListener('click', () => {
        bloquearTableros();
        Swal.fire({
            title: '⚠️ ¿Reiniciar Marcador?',
            text: 'Esto borrará todas las victorias',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reiniciar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d22626',
            cancelButtonColor: '#666',
            background: '#1a1a1a',
            color: '#ffc107',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                estadoJuego.victorias = { jugador1: 0, jugador2: 0 };
                guardarVictorias();
                actualizarMarcadorVictorias();

                Swal.fire({
                    icon: 'success',
                    title: 'Marcador Reiniciado',
                    timer: 1000,
                    showConfirmButton: false,
                    background: '#1a1a1a',
                    color: '#ffc107',
                    allowOutsideClick: false
                }).then(() => {
                    desbloquearTableros();
                });
            } else {
                desbloquearTableros();
            }
        });
    }); document.getElementById('btnSalir').addEventListener('click', () => {
        bloquearTableros();
        Swal.fire({
            title: '¿Salir del juego?',
            text: 'Regresarás al menú principal',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d22626',
            cancelButtonColor: '#666',
            background: '#1a1a1a',
            color: '#ffc107',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Detener el soundtrack antes de salir
                if (audioSoundtrack) {
                    audioSoundtrack.pause();
                    audioSoundtrack.currentTime = 0;
                }
                window.location.href = 'index.html';
            } else {
                desbloquearTableros();
            }
        });
    });}