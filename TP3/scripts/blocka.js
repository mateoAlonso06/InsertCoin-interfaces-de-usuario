// En tu archivo: scripts/blocka-game.js

// Importa la función de animación desde el script del carrusel.
import { iniciarSeleccionAleatoria } from './carrusel-blocka.js';

// =======================================================
// SETUP INICIAL Y ESTADO DEL JUEGO
// =======================================================
let imagenFuenteParaPiezas;
const piezas = [];
let levelActual = 0; // Índice del nivel actual (0, 1, 2)
let srcImagenActual = null;

const levels = [
    { level: 1, dificultad: 2, tiempo: 60 },
    { level: 2, dificultad: 4, tiempo: 120 },
    { level: 3, dificultad: 6, tiempo: 300 }
];

// --- Elementos del DOM ---
const menuJuego = document.getElementById('game-menu');
const menuSecundario = document.getElementById('menu-secundario');
const btnNextLevel = document.getElementById('btn-sigLevel');
const volverMenu = document.getElementById('btn-volver-menu');
const btnNiveles = document.getElementById('start-game-button');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');
const tiempoLevelDisplay = menuSecundario.querySelector('.tiempo-level');
const timerCont = document.getElementById('timer-container');
const btnAyuda = document.getElementById('btn-ayuda');
let hintUsadoEnNivel = false;
const restartLevel = document.getElementById('restart-level');
const menuTiempoTerminado = document.querySelector('.container-tiempo-terminado');
const btnMenuTiempoTerminado = document.getElementById('btn-menu-tiempo-terminado');

btnAyuda.classList.add('hidden');
menuSecundario.classList.add('hidden');
timerCont.classList.add('hidden');
menuTiempoTerminado.classList.add('hidden');

// Variables del Temporizador
let timerInterval;
let tiempoRestante = 0;

// Filtros
const filtrosDisponibles = [
    aplicarFiltroGris,
    aplicarFiltroNegativo,
    aplicarFiltroBrilloTreinta,
    aplicarFiltroBrilloSesenta
];

// =======================================================
// EVENT LISTENERS
// =======================================================

restartLevel.addEventListener('click', () => {
    iniciarJuegoCompleto(srcImagenActual, levelActual);
});

btnNiveles.addEventListener('click', () => {
    btnNiveles.disabled = true;
    levelActual = 0; // Reinicia al primer nivel (índice 0)
    iniciarSeleccionAleatoria((imagenSeleccionada) => {
        if (!imagenSeleccionada) {
            btnNiveles.disabled = false;
            return;
        }
        menuJuego.classList.add('hidden');
        
        // --- CORRECCIÓN 1 ---
        // Pasa el ÍNDICE del nivel (levelActual), no la dificultad.
        iniciarJuegoCompleto(imagenSeleccionada, levelActual); 
        // --------------------

        btnNiveles.disabled = false;
    });
});

btnNextLevel.addEventListener('click', () => {
    menuSecundario.classList.add('hidden');
    levelActual++; // Avanza al siguiente índice

    if (levelActual < levels.length) {
        const siguienteImagen = obtenerNuevaImagenAleatoria(srcImagenActual);
        if (siguienteImagen) {
            // --- CORRECCIÓN 2 ---
            // Pasa el ÍNDICE del nuevo nivel (levelActual), no la dificultad.
            iniciarJuegoCompleto(siguienteImagen, levelActual); 
            // --------------------
        } else {
            alert("Error al cargar la siguiente imagen. Volviendo al menú.");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            restaurarMenuPrincipal();
        }
    } else {
        restaurarMenuPrincipal();
    }
});

volverMenu.addEventListener('click', () => {
    stopTimer();
    menuSecundario.classList.add('hidden');
    menuJuego.classList.remove('hidden');
    timerCont.classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    restaurarMenuPrincipal();
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const piezaClickeada = piezaenPosicion(mouseX, mouseY);
    if (piezaClickeada && !piezaClickeada.bloqueada) {
        piezaClickeada.rotacion += Math.PI / 2;
        piezaClickeada.rotacion %= (2 * Math.PI);
        dibujarPiezas(imagenFuenteParaPiezas);
        verificarVictoria();
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const piezaClickeada = piezaenPosicion(mouseX, mouseY);
    if (piezaClickeada && !piezaClickeada.bloqueada) {
        piezaClickeada.rotacion -= Math.PI / 2;
        if (piezaClickeada.rotacion < 0) {
            piezaClickeada.rotacion += (2 * Math.PI);
        }
        dibujarPiezas(imagenFuenteParaPiezas);
        verificarVictoria();
    }
});

btnAyuda.addEventListener('click', () => {
    if (hintUsadoEnNivel) return;
    const piezasIncorrectas = piezas.filter(p => p.rotacion > 0.01 || p.rotacion < -0.01);
    if (piezasIncorrectas.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * piezasIncorrectas.length);
        const piezaParaAyudar = piezasIncorrectas[indiceAleatorio];
        piezaParaAyudar.rotacion = 0;
        piezaParaAyudar.bloqueada = true;
        tiempoRestante -= 5;
        if (tiempoRestante < 0) tiempoRestante = 0;
        updateTimerDisplay();
        dibujarPiezas(imagenFuenteParaPiezas);
        hintUsadoEnNivel = true;
        btnAyuda.disabled = true;
        verificarVictoria();
    } else {
        btnAyuda.disabled = true;
    }
});

// =======================================================
// LÓGICA DEL TEMPORIZADOR
// =======================================================
function startTimer(limiteSegundos) {
    tiempoRestante = limiteSegundos;
    stopTimer();
    updateTimerDisplay();
    timerInterval = setInterval(timerTick, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function timerTick() {
    tiempoRestante--;
    updateTimerDisplay();
    if (tiempoRestante <= 0) {
        stopTimer();
        gameOverPorTiempo();
    }
}

function updateTimerDisplay() {
    if (!timerDisplay) return;
    const displayTime = Math.max(0, tiempoRestante);
    const minutos = Math.floor(displayTime / 60).toString().padStart(2, '0');
    const segundos = (displayTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutos}:${segundos}`;
}

function gameOverPorTiempo() {
    menuTiempoTerminado.classList.remove('hidden');
    btnMenuTiempoTerminado.addEventListener('click', () => {
        restaurarMenuPrincipal();
        menuTiempoTerminado.classList.add('hidden');
    }, { once: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function restaurarMenuPrincipal() {
    menuJuego.classList.remove('hidden');
    menuSecundario.classList.add('hidden');
    btnAyuda.classList.add('hidden');
    timerCont.classList.add('hidden');
    stopTimer();
}

// =======================================================
// FUNCIONES DEL NÚCLEO DEL JUEGO
// =======================================================

// --- CORRECCIÓN 3 ---
// El segundo parámetro AHORA es 'numeroDeNivel' (el índice 0, 1, o 2)
function iniciarJuegoCompleto(srcDeImagen, numeroDeNivel) {
    // Protección
    if (numeroDeNivel < 0 || numeroDeNivel >= levels.length) {
        console.error(`Índice de nivel inválido: ${numeroDeNivel}`);
        restaurarMenuPrincipal();
        return;
    }

    // --- CORRECCIÓN 4 ---
    // Obtiene la config usando el ÍNDICE (levelActual)
    const configLevel = levels[numeroDeNivel]; 
    const dificultad = configLevel.dificultad;
    const tiempoLimite = configLevel.tiempo;
    // --------------------

    timerCont.classList.remove('hidden');
    startTimer(tiempoLimite);

    hintUsadoEnNivel = false;
    btnAyuda.disabled = false;
    piezas.forEach(p => p.bloqueada = false);
    btnAyuda.classList.remove('hidden');
    srcImagenActual = srcDeImagen;

    const imagenJuego = new Image();
    imagenJuego.crossOrigin = "Anonymous";
    imagenJuego.src = srcDeImagen;

    imagenJuego.onload = () => {
        imagenFuenteParaPiezas = crearImagenFiltrada(imagenJuego);
        iniciarPiezas(imagenFuenteParaPiezas, dificultad); // Pasa la dificultad correcta
        dibujarPiezas(imagenFuenteParaPiezas);
    };
    imagenJuego.onerror = () => {
        stopTimer();
        alert(`Error al cargar la imagen: ${srcDeImagen}.`);
        restaurarMenuPrincipal();
    };
}

function verificarVictoria() {
    if (piezas.length === 0) return;
    const ganado = piezas.every(p => p.rotacion < 0.01 && p.rotacion > -0.01);
    if (ganado) {
        stopTimer();
        if (tiempoLevelDisplay) {
            tiempoLevelDisplay.textContent = timerDisplay.textContent;
        }
        menuSecundario.classList.remove('hidden');
        if (levelActual >= levels.length - 1) {
            btnNextLevel.style.display = 'none';
        } else {
            btnNextLevel.style.display = 'block';
        }
    }
}

function obtenerNuevaImagenAleatoria(srcAExcluir) {
    const todasLasImagenes = Array.from(document.querySelectorAll('.carousel-track .personaje img'));
    if (todasLasImagenes.length === 0) { console.error("No images found in carousel."); return null; }
    const imagenesDisponibles = todasLasImagenes.filter(img => img.src !== srcAExcluir);
    if (imagenesDisponibles.length > 0) {
        return imagenesDisponibles[Math.floor(Math.random() * imagenesDisponibles.length)].src;
    } else {
        return todasLasImagenes[Math.floor(Math.random() * todasLasImagenes.length)].src;
    }
}

function crearImagenFiltrada(image) {
    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d');
    const tamanoPuzzle = 400;
    bufferCanvas.width = tamanoPuzzle; bufferCanvas.height = tamanoPuzzle;
    bufferCtx.drawImage(image, 0, 0, tamanoPuzzle, tamanoPuzzle);
    try {
        const imageData = bufferCtx.getImageData(0, 0, tamanoPuzzle, tamanoPuzzle);
        const indiceAleatorio = Math.floor(Math.random() * filtrosDisponibles.length);
        const filtroAleatorio = filtrosDisponibles[indiceAleatorio];
        if (filtroAleatorio) {
            console.log("Aplicando filtro:", filtroAleatorio.name);
            filtroAleatorio(imageData);
            bufferCtx.putImageData(imageData, 0, 0);
        }
    } catch (e) { console.error("Error applying filter (CORS?):", e); }
    return bufferCanvas;
}

function iniciarPiezas(image, dificultad) {
    piezas.length = 0;
    const anchoTotal = image.width, altoTotal = image.height;
    if (dificultad <= 0) dificultad = 2;
    const anchoPieza = anchoTotal / dificultad, altoPieza = altoTotal / dificultad;
    const posXInicial = (canvas.width - anchoTotal) / 2;
    const margenSuperiorDeseado = 50;
    const posYInicial = margenSuperiorDeseado;
    for (let fila = 0; fila < dificultad; fila++) {
        for (let col = 0; col < dificultad; col++) {
            piezas.push({
                sx: col * anchoPieza, sy: fila * altoPieza, sWidth: anchoPieza, sHeight: altoPieza,
                dx: posXInicial + col * anchoPieza, dy: posYInicial + fila * altoPieza, dWidth: anchoPieza, dHeight: altoPieza,
                rotacion: 0
            });
        }
    }
    const angulos = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
    for (const pieza of piezas) {
        pieza.rotacion = angulos[Math.floor(Math.random() * angulos.length)];
    }
    if (piezas.every(p => p.rotacion < 0.01 && p.rotacion > -0.01)) {
        if (piezas.length > 0) piezas[Math.floor(Math.random() * piezas.length)].rotacion = angulos[1 + Math.floor(Math.random() * 3)];
    }
}

function dibujarPiezas(image) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!image) { console.error("No image source provided to drawPieces"); return; }
    for (const pieza of piezas) {
        const centroX = pieza.dx + pieza.dWidth / 2, centroY = pieza.dy + pieza.dHeight / 2;
        ctx.save();
        ctx.translate(centroX, centroY);
        ctx.rotate(pieza.rotacion);
        if (pieza.bloqueada) {
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = '#00ff00';
        } else {
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = 'black';
        }
        try {
            ctx.drawImage(image, pieza.sx, pieza.sy, pieza.sWidth, pieza.sHeight, -pieza.dWidth / 2, -pieza.dHeight / 2, pieza.dWidth, pieza.dHeight);
        } catch (e) { console.error("Error drawing piece:", e); ctx.fillStyle = 'red'; ctx.fillRect(-pieza.dWidth / 2, -pieza.dHeight / 2, pieza.dWidth, pieza.dHeight); }
        ctx.lineWidth = 2;
        ctx.strokeRect(-pieza.dWidth / 2, -pieza.dHeight / 2, pieza.dWidth, pieza.dHeight);
        ctx.restore();
    }
}

function piezaenPosicion(mouseX, mouseY) {
    for (const pieza of piezas) {
        if (esPosicionValida(pieza, mouseX, mouseY)) return pieza;
    }
    return null;
}

function esPosicionValida(pieza, mouseX, mouseY) {
    if (typeof pieza.dx !== 'number') return false;
    return mouseX >= pieza.dx && mouseX <= pieza.dx + pieza.dWidth &&
           mouseY >= pieza.dy && mouseY <= pieza.dy + pieza.dHeight;
}

// =======================================================
// FILTROS
// =======================================================
function aplicarFiltroGris(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gris = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
        data[i] = data[i + 1] = data[i + 2] = gris;
    }
}

function aplicarFiltroBrilloTreinta(imageData) {
    const data = imageData.data;
    const cantidadBrillo = 255 * 0.30;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + cantidadBrillo);
        data[i + 1] = Math.min(255, data[i + 1] + cantidadBrillo);
        data[i + 2] = Math.min(255, data[i + 2] + cantidadBrillo);
    }
}

function aplicarFiltroNegativo(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
}

function aplicarFiltroBrilloSesenta(imageData) {
    const data = imageData.data;
    const cantidadBrillo = 255 * 0.60;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + cantidadBrillo);
        data[i + 1] = Math.min(255, data[i + 1] + cantidadBrillo);
        data[i + 2] = Math.min(255, data[i + 2] + cantidadBrillo);
    }
}