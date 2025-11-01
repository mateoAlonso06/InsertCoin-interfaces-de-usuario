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
        
        // --- Elementos HTML del Menú de Fin de Juego ---
        this.menuFinJuego = document.getElementById('fin-juego-menu');
        this.tituloFinJuego = document.getElementById('fin-juego-titulo');
        this.botonReiniciar = document.getElementById('button-reiniciar-peg'); 
        this.botonVolverMenu = document.getElementById('button-volver-menu'); 
        this.mensajeFinJuego = document.getElementById('fin-juego-mensaje');
        this.timerDisplay = document.getElementById('timer-display');
        
        // --- Comprobaciones de seguridad ---
        if (!this.canvas || !this.menuPrincipal || !this.botonJugar || !this.menuFinJuego || !this.botonReiniciar || !this.botonVolverMenu) {
            console.error("Vista Error: No se encontraron uno o más elementos HTML esenciales (canvas, menús o botones).");
            return;
        }

        this.canvas.width = 850;
        this.canvas.height = 575;
        this.ctx = this.canvas.getContext('2d');
        
        // Almacén de imágenes
        this.imagenes = {};
    }

    // --- Métodos de Menú ---

    mostrarMenuPrincipal() {
        return new Promise((resolve) => {
            console.log("Vista: Mostrando menú principal...");
            this.menuPrincipal.classList.remove('oculto');
            this.canvas.classList.add('oculto'); 
            this.timerDisplay.classList.add('oculto');
            this.menuFinJuego.classList.add('oculto'); 

            let personajeSeleccionado = 'gabu'; // Default

            // Lógica de selección de personaje
            this.botonesPersonaje.forEach(boton => {
                const clickHandler = () => {
                    this.botonesPersonaje.forEach(b => b.classList.remove('selected'));
                    boton.classList.add('selected');
                    personajeSeleccionado = boton.dataset.tipo;
                    console.log(`Vista: Personaje seleccionado: ${personajeSeleccionado}`);
                };
                boton.addEventListener('click', clickHandler);
            });

            // Lógica del botón "Jugar"
            const jugarClickHandler = () => {
                console.log("Vista: Botón 'Jugar' presionado.");
                this.ocultarMenuPrincipal();
                this.mostrarJuego();
                resolve(personajeSeleccionado);
            };
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

    // --- Métodos de Dibujado (¡ACTUALIZADOS!) ---

    /**
     * Dibuja el tablero Y LOS HINTS.
     * @param {Array<Array<Ficha|null>>} modeloDeTablero
     * @param {Array<{fila: number, col: number}>} hints - ¡NUEVO!
     */
    render(modeloDeTablero, hints) {
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
                    }
                }
            }
        }

        // --- ¡NUEVO! ---
        // Dibujamos los hints ENCIMA del tablero
        if (hints && hints.length > 0) {
            this.dibujarHints(hints);
        }
    }

    /**
     * Dibuja la ficha que está siendo arrastrada.
     */
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
            // Fallback
            this.ctx.beginPath();
            this.ctx.arc(x, y, 28, 0, Math.PI * 2);
            this.ctx.fillStyle = 'green';
            this.ctx.globalAlpha = 0.8;
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
    }

     // --- ¡NUEVA FUNCIÓN DE HINTS DE FLECHA ANIMADOS! ---
    /**
     * Dibuja los hints (flechas rebotantes) en las celdas de destino.
     * @param {Array<{fila: number, col: number}>} hints 
     */
    dibujarHints(hints) {
        // Calculamos un "rebote" vertical usando una onda sinusoidal.
        // Date.now() / 150 controla la velocidad del rebote.
        // Math.sin(...) va de -1 a 1.
        // Lo multiplicamos por 5 para que rebote 5px hacia arriba.
        const yOffset = -5 + (Math.sin(Date.now() / 150) * 5); // Rango [-10, 0]

        for (const hint of hints) {
            const x = this.OFFSET_X + (hint.col * this.TAMANO_CELDA);
            const y = this.OFFSET_Y + (hint.fila * this.TAMANO_CELDA);
            
            // Dibujamos una flecha en la celda (x, y) con el rebote (yOffset)
            // La flecha se dibuja "encima" de la celda
            this._dibujarFlecha(x, y + yOffset - 25); // -25px para que esté arriba del hueco
        }
    }

    /**
     * Helper: Dibuja una flecha simple apuntando hacia abajo.
     */
    _dibujarFlecha(x, y) {
        const size = 10; // Tamaño de la flecha
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.9)'; // Color dorado
        this.ctx.beginPath();
        this.ctx.moveTo(x, y); // Punta de abajo
        this.ctx.lineTo(x - size, y - size); // Esquina sup-izq
        this.ctx.lineTo(x + size, y - size); // Esquina sup-der
        this.ctx.closePath();
        this.ctx.fill();
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
        
        this.menuFinJuego.classList.remove('oculto');
    }
}

