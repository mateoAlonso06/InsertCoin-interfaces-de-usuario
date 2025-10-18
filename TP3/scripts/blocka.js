// En tu archivo: scripts/blocka-game.js

// Importa la función de animación desde el script del carrusel.
import { iniciarSeleccionAleatoria } from './carrusel-blocka.js';

// =======================================================
// SETUP INICIAL Y ESTADO DEL JUEGO
// =======================================================
let dificultadSeleccionada = 2;
let imagenFuenteParaPiezas;
const piezas = [];

const levels = [1,2,3];

const menuJuego = document.getElementById('game-menu');
const botonesDificultad = document.querySelectorAll('.difficulty-btn');
const botonJugar = document.getElementById('play-button');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// =======================================================
// NUEVO: ARRAY CON LAS FUNCIONES DE FILTRO
// =======================================================
const filtrosDisponibles = [
    aplicarFiltroGris,
    aplicarFiltroNegativo,
    aplicarFiltroBrilloTreinta,
    aplicarFiltroBrilloSesenta
];


// =======================================================
// EVENT LISTENERS (SIN CAMBIOS)
// =======================================================

// Clics para rotar piezas
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const piezaClickeada = piezaenPosicion(mouseX, mouseY);

    if (piezaClickeada) {
        piezaClickeada.rotacion += Math.PI / 2;
        piezaClickeada.rotacion %= (2 * Math.PI);
        dibujarPiezas(imagenFuenteParaPiezas);
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const piezaClickeada = piezaenPosicion(mouseX, mouseY);

    if (piezaClickeada) {
        piezaClickeada.rotacion -= Math.PI / 2;
        if (piezaClickeada.rotacion < 0) {
            piezaClickeada.rotacion += (2 * Math.PI);
        }
        dibujarPiezas(imagenFuenteParaPiezas);
    }
});

// Selección de dificultad
botonesDificultad.forEach(btn => {
    btn.addEventListener('click', () => {
        botonesDificultad.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        dificultadSeleccionada = parseInt(btn.dataset.difficulty);
    });
});

// Evento principal: Clic en "Jugar"
botonJugar.addEventListener('click', () => {
    botonJugar.disabled = true;
    iniciarSeleccionAleatoria((imagenSeleccionada) => {
        menuJuego.classList.add('hidden');
        iniciarJuegoCompleto(imagenSeleccionada, dificultadSeleccionada);
        botonJugar.disabled = false;
    });
});


// =======================================================
// FUNCIONES DEL NÚCLEO DEL JUEGO
// =======================================================

function iniciarJuegoCompleto(srcDeImagen, dificultad) {
    const imagenJuego = new Image();
    imagenJuego.src = srcDeImagen;
    imagenJuego.onload = () => {
        imagenFuenteParaPiezas = crearImagenFiltrada(imagenJuego);
        iniciarPiezas(imagenFuenteParaPiezas, dificultad);
        dibujarPiezas(imagenFuenteParaPiezas);
    };
}

// --- MODIFICADO: Ahora usa el array de filtros ---
function crearImagenFiltrada(image) {
    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d');
    
    const tamanoPuzzle = 500;
    bufferCanvas.width = tamanoPuzzle;
    bufferCanvas.height = tamanoPuzzle;

    bufferCtx.drawImage(image, 0, 0, tamanoPuzzle, tamanoPuzzle);
    
    const imageData = bufferCtx.getImageData(0, 0, tamanoPuzzle, tamanoPuzzle);

    // --- LÓGICA PARA ELEGIR Y APLICAR UN FILTRO ALEATORIO ---
    
    // 1. Elige un índice aleatorio del array.
    const indiceAleatorio = Math.floor(Math.random() * filtrosDisponibles.length);
    
    // 2. Obtiene la función de filtro de esa posición.
    const filtroAleatorio = filtrosDisponibles[indiceAleatorio];
    
    // 3. Ejecuta la función de filtro seleccionada, pasándole los datos de la imagen.
    filtroAleatorio(imageData);

    // --- FIN DE LA LÓGICA ALEATORIA ---

    bufferCtx.putImageData(imageData, 0, 0);

    return bufferCanvas;
}

function iniciarPiezas(image, dificultad) {
    piezas.length = 0;
    const anchoTotal = image.width;
    const altoTotal = image.height;
    const anchoPieza = anchoTotal / dificultad;
    const altoPieza = altoTotal / dificultad;
    const posXInicial = (canvas.width - anchoTotal) / 2;
    const posYInicial = (canvas.height - altoTotal) / 2;

    for (let fila = 0; fila < dificultad; fila++) {
        for (let col = 0; col < dificultad; col++) {
            piezas.push({
                sx: col * anchoPieza, sy: fila * altoPieza,
                sWidth: anchoPieza, sHeight: altoPieza,
                dx: posXInicial + col * anchoPieza, dy: posYInicial + fila * altoPieza,
                dWidth: anchoPieza, dHeight: altoPieza,
                rotacion: 0
            });
        }
    }

    const angulos = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
    for (const pieza of piezas) {
        pieza.rotacion = angulos[Math.floor(Math.random() * angulos.length)];
    }

    if (piezas.every(p => p.rotacion === 0)) {
        piezas[0].rotacion = Math.PI / 2;
    }
}

function dibujarPiezas(image) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const pieza of piezas) {
        const centroX = pieza.dx + pieza.dWidth / 2;
        const centroY = pieza.dy + pieza.dHeight / 2;
        ctx.save();
        ctx.translate(centroX, centroY);
        ctx.rotate(pieza.rotacion);
        ctx.drawImage(image, pieza.sx, pieza.sy, pieza.sWidth, pieza.sHeight, -pieza.dWidth / 2, -pieza.dHeight / 2, pieza.dWidth, pieza.dHeight);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(-pieza.dWidth / 2, -pieza.dHeight / 2, pieza.dWidth, pieza.dHeight);
        ctx.restore();
    }
}

function piezaenPosicion(mouseX, mouseY) {
    for (const pieza of piezas) {
        if (esPosicionValida(pieza, mouseX, mouseY)) {
            return pieza;
        }
    }
    return null;
}

function esPosicionValida(pieza, mouseX, mouseY) {
    return mouseX >= pieza.dx && mouseX <= pieza.dx + pieza.dWidth &&
           mouseY >= pieza.dy && mouseY <= pieza.dy + pieza.dHeight;
}

// =======================================================
// FILTROS
// =======================================================

function aplicarFiltroGris(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] * 0.299;
        const g = data[i + 1] * 0.587;
        const b = data[i + 2] * 0.114;
        const gris = (r + g + b);
        data[i] = gris;
        data[i + 1] = gris;
        data[i + 2] = gris;
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

function aplicarFiltroBrilloSesenta(imageData) {
    const data = imageData.data;
    const cantidadBrillo = 255 * 0.60;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + cantidadBrillo);
        data[i + 1] = Math.min(255, data[i + 1] + cantidadBrillo);
        data[i + 2] = Math.min(255, data[i + 2] + cantidadBrillo);
    }
}

function aplicarFiltroNegativo(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = (255 - data[i]);
        data[i + 1] = (255 - data[i + 1]);
        data[i + 2] = (255 - data[i + 2]);
    }
}