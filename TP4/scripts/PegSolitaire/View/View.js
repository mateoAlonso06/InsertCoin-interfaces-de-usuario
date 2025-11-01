/**
 * Representa la parte visual del juego en el Canvas.
 * Carga imágenes, las dibuja, y actualiza el HTML.
 */
export class View {
    
    // Tus constantes de calibración
    TAMANO_CELDA = 66.3;
    OFFSET_X = 228;
    OFFSET_Y = 85;

    // Define el tamaño de tus imágenes
    ANCHO_FICHA = 60;
    ALTO_FICHA = 60;

    constructor() {
        this.canvas = document.getElementById('canvas-peg');
        
        // --- Elementos HTML del Menú Principal ---
        this.menuPrincipal = document.querySelector('.menu-principal-peg');
        this.botonesPersonaje = document.querySelectorAll('.personaje-container');
        this.botonJugar = document.getElementById('play-peg');
        
        // --- Elementos HTML del Menú de Fin de Juego (¡ACTUALIZADOS!) ---
        this.menuFinJuego = document.getElementById('fin-juego-menu');
        this.tituloFinJuego = document.getElementById('fin-juego-titulo');
        this.mensajeFinJuego = document.getElementById('fin-juego-mensaje');
        // ¡CAMBIO! Buscamos los dos botones nuevos
        this.botonReiniciar = document.getElementById('button-reiniciar-peg'); 
        this.botonVolverMenu = document.getElementById('button-volver-menu'); 

        this.timerDisplay = document.getElementById('timer-display');
        
        // --- Comprobaciones de seguridad ---
        // (Actualizada para los nuevos botones)
        if (!this.canvas || !this.menuPrincipal || !this.botonJugar || !this.menuFinJuego || !this.botonReiniciar || !this.botonVolverMenu) {
            console.error("Vista Error: No se encontraron uno o más elementos HTML esenciales (canvas, menús o botones).");
            // Mostramos qué falta:
            if (!this.botonReiniciar) console.error("Falta: #button-reiniciar-peg");
            if (!this.botonVolverMenu) console.error("Falta: #button-volver-menu");
            return;
        }

        this.canvas.width = 850;
        this.canvas.height = 575;
        this.ctx = this.canvas.getContext('2d');
        
        // Almacén de imágenes
        this.imagenes = {};
    }

    // --- Métodos de Menú ---

    /**
     * Muestra el menú de selección de personaje.
     * @returns {Promise<string>} Una promesa que se resuelve con el 'tipo' de personaje elegido.
     */
    mostrarMenuPrincipal() {
        return new Promise((resolve) => {
            console.log("Vista: Mostrando menú principal...");
            this.menuPrincipal.classList.remove('oculto');
            this.canvas.classList.add('oculto'); // Ocultamos el juego
            this.timerDisplay.classList.add('oculto');
            this.menuFinJuego.classList.add('oculto'); // Nos aseguramos que el menú final esté oculto

            let personajeSeleccionado = 'gabu'; // Default

            // 1. Lógica de selección de personaje
            this.botonesPersonaje.forEach(boton => {
                const clickHandler = () => {
                    this.botonesPersonaje.forEach(b => b.classList.remove('selected'));
                    boton.classList.add('selected');
                    personajeSeleccionado = boton.dataset.tipo;
                    console.log(`Vista: Personaje seleccionado: ${personajeSeleccionado}`);
                };
                boton.addEventListener('click', clickHandler);
            });

            // 2. Lógica del botón "Jugar"
            const jugarClickHandler = () => {
                console.log("Vista: Botón 'Jugar' presionado.");
                this.ocultarMenuPrincipal();
                this.mostrarJuego();
                resolve(personajeSeleccionado); // Devolvemos el personaje
            };
            // Usamos { once: true } para que el listener se borre solo
            this.botonJugar.addEventListener('click', jugarClickHandler, { once: true }); 
        });
    }

    ocultarMenuPrincipal() {
        if (this.menuPrincipal) this.menuPrincipal.classList.add('oculto');
    }

    mostrarJuego() {
        if (this.canvas) this.canvas.classList.remove('oculto');
        if (this.timerDisplay) this.timerDisplay.classList.remove('oculto');
    }

    // --- Métodos del Timer ---
    
    actualizarTimer(tiempoTotalSegundos) {
        const minutos = Math.floor(tiempoTotalSegundos / 60);
        const segundos = tiempoTotalSegundos % 60;
        const minFormateados = String(minutos).padStart(2, '0');
        const segFormateados = String(segundos).padStart(2, '0');
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `Tiempo: ${minFormateados}:${segFormateados}`;
        }
    }

    // --- Métodos de Carga de Recursos ---

    async cargarRecursos() {
        const rutas = {
            'gabu': 'assets/img/peg-solitaire-utils/avatares-pegsolitaire/gabu.svg',
            'paris': 'assets/img/peg-solitaire-utils/avatares-pegsolitaire/paris.jpeg',
            'ace': 'assets/img/peg-solitaire-utils/avatares-pegsolitaire/ace.jpeg'
        };

        const promesasDeImagenes = [];
        const claves = Object.keys(rutas);
        console.log("Vista: Iniciando carga de imágenes...");

        for (const clave of claves) {
            const ruta = rutas[clave];
            const promesa = this._cargarUnaImagen(ruta);
            promesasDeImagenes.push(promesa);
            
            promesa.then(img => {
                console.log(`Vista: Imagen '${clave}' cargada.`);
                this.imagenes[clave] = img;
            }).catch(err => {
                console.error(`Vista: Error cargando '${clave}' desde ${ruta}`, err);
            });
        }
        await Promise.all(promesasDeImagenes);
        console.log("Vista: ¡Todas las imágenes fueron cargadas!");
    }

    _cargarUnaImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error(`Fallo al cargar la imagen: ${src}`));
            img.src = src;
        });
    }

    // --- Métodos de Dibujado (con Clipping Circular) ---

    render(modeloDeTablero) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let fila = 0; fila < 7; fila++) {
            for (let col = 0; col < 7; col++) {
                
                const pieza = modeloDeTablero[fila][col];
                
                if (pieza !== null && !pieza.estaSiendoArrastrada) { 
                    
                    const img = this.imagenes[pieza.tipo];
                    const x = this.OFFSET_X + (col * this.TAMANO_CELDA);
                    const y = this.OFFSET_Y + (fila * this.TAMANO_CELDA);

                    if (img) {
                        this.ctx.save();
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, this.ANCHO_FICHA / 2, 0, Math.PI * 2);
                        this.ctx.closePath();
                        this.ctx.clip();
                        this.ctx.drawImage(
                            img,
                            x - (this.ANCHO_FICHA / 2), 
                            y - (this.ALTO_FICHA / 2), 
                            this.ANCHO_FICHA, 
                            this.ALTO_FICHA
                        );
                        this.ctx.restore();
                    } else {
                        // Fallback (círculo rojo de error)
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, 28, 0, Math.PI * 2);
                        this.ctx.fillStyle = 'red';
                        this.ctx.fill();
                    }
                }
            }
        }
    }

    dibujarFichaFlotante(mouseX, mouseY, ficha) {
        const img = this.imagenes[ficha.tipo];
        const x = mouseX;
        const y = mouseY;
        
        if (img) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.ANCHO_FICHA / 2, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.clip();
            this.ctx.drawImage(
                img,
                x - (this.ANCHO_FICHA / 2),
                y - (this.ALTO_FICHA / 2),
                this.ANCHO_FICHA,
                this.ALTO_FICHA
            );
            this.ctx.restore();
        } else {
            // Fallback (círculo)
            this.ctx.beginPath();
            this.ctx.arc(x, y, 28, 0, Math.PI * 2);
            this.ctx.fillStyle = 'green';
            this.ctx.globalAlpha = 0.8;
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
    }

    // --- Métodos de UI y Traducción ---

    traducirPixelACelda(pixelX, pixelY) {
        const col = Math.round((pixelX - this.OFFSET_X) / this.TAMANO_CELDA);
        const fila = Math.round((pixelY - this.OFFSET_Y) / this.TAMANO_CELDA);
        const filaValida = Math.max(0, Math.min(fila, 6));
        const colValida = Math.max(0, Math.min(col, 6));
        return { fila: filaValida, col: colValida };
    }

    mostrarMensajeFinDeJuego(estado) {
        // Comprobación de seguridad
        if (!this.menuFinJuego || !this.tituloFinJuego || !this.mensajeFinJuego) {
            console.error("Vista Error: No se pueden mostrar los elementos del menú de fin de juego porque no se encontraron en el constructor.");
            return;
        }

        if (estado === 'VICTORIA') {
            this.tituloFinJuego.textContent = '¡VICTORIA!';
            this.tituloFinJuego.style.color = '#00C853'; // Verde
            this.mensajeFinJuego.textContent = '¡Dejaste una sola ficha en el centro!';
        } else if (estado === 'DERROTA_TIEMPO') {
            this.tituloFinJuego.textContent = '¡SE ACABÓ EL TIEMPO!';
            this.tituloFinJuego.style.color = '#D50000'; // Rojo
            this.mensajeFinJuego.textContent = '¡Más suerte la próxima!';
        } else { // DERROTA
            this.tituloFinJuego.textContent = 'FIN DEL JUEGO';
            this.tituloFinJuego.style.color = '#D50000'; // Rojo
            this.mensajeFinJuego.textContent = 'No quedan más movimientos.';
        }
        
        // Mostramos el menú
        this.menuFinJuego.classList.remove('oculto');
    }

    // --- Nuevos Métodos para la Lógica del Juego ---

    /**
     * Verifica si el juego ha terminado, ya sea por victoria o derrota.
     */
    verificarFinDeJuego() {
        // Lógica simplificada para determinar el fin del juego
        const hayMovimientosDisponibles = this.modelo.hayMovimientosDisponibles();
        const hayUnaSolaFicha = this.modelo.contarFichas() === 1;

        if (hayUnaSolaFicha) {
            console.log("Vista: ¡Victoria detectada!");
            this.mostrarMensajeFinDeJuego('VICTORIA');
        } else if (!hayMovimientosDisponibles) {
            console.log("Vista: Derrota detectada (sin movimientos disponibles).");
            this.mostrarMensajeFinDeJuego('DERROTA');
        } else {
            console.log("Vista: El juego continúa...");
        }
    }
}

