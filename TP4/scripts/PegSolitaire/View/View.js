/**
 * Representa la parte visual del juego en el Canvas.
 * Carga imágenes y las dibuja.
 * ¡AHORA TAMBIÉN CONTROLA EL MENÚ HTML!
 */
export class View { // Exporta 'View' (Inglés) para que coincida con tu Controller
    
    // Tus constantes de calibración
    TAMANO_CELDA = 66.3;
    OFFSET_X = 228;
    OFFSET_Y = 85;
    ANCHO_FICHA = 60; 
    ALTO_FICHA = 60;

    constructor() {
        this.canvas = document.getElementById('canvas-peg');
        this.canvas.width = 850;
        this.canvas.height = 575;
        this.ctx = this.canvas.getContext('2d');
        
        // Almacén para imágenes
        this.imagenes = {};

        // --- ¡NUEVO! ---
        // Buscamos los elementos del menú HTML que están en index.html
        this.menuFinJuego = document.getElementById('fin-juego-menu');
        this.tituloFinJuego = document.getElementById('fin-juego-titulo');
        this.mensajeFinJuego = document.getElementById('fin-juego-mensaje');
    }

    /**
     * Carga todas las imágenes necesarias para el juego.
     * @returns {Promise<void>}
     */
    async cargarRecursos() {
        // Rutas a tus imágenes
        const rutas = {
            'gabu': 'assets/img/peg-solitaire-utils/avatares-pegsolitaire/gabu.svg'
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
                this.imagenes[clave] = img; // Guarda la imagen cargada
            }).catch(err => {
                console.error(`Vista: Error cargando '${clave}' desde ${ruta}`, err);
            });
        }

        await Promise.all(promesasDeImagenes);
        console.log("Vista: ¡Todas las imágenes fueron cargadas!");
    }

    /**
     * Método de ayuda privado para cargar UNA imagen.
     * @param {string} src - La ruta a la imagen
     * @returns {Promise<Image>}
     */
    _cargarUnaImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error(`Fallo al cargar la imagen: ${src}`));
            img.src = src;
        });
    }

    /**
     * Dibuja el tablero con imágenes.
     * @param {Array<Array<Ficha|null>>} modeloDeTablero
     */
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
                        this.ctx.drawImage(
                            img,
                            x - (this.ANCHO_FICHA / 2), 
                            y - (this.ALTO_FICHA / 2), 
                            this.ANCHO_FICHA, 
                            this.ALTO_FICHA
                        );
                    } else {
                        // Fallback por si la imagen no carga
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, 28, 0, Math.PI * 2);
                        this.ctx.fillStyle = 'red'; 
                        this.ctx.fill();
                    }
                }
            }
        }
    }

    /**
     * Dibuja la ficha "flotante"
     * @param {number} mouseX - Posición X actual (viene de ficha.xFlotante)
     * @param {number} mouseY - Posición Y actual (viene de ficha.yFlotante)
     * @param {Ficha} ficha - La ficha que está en el aire
     */
    dibujarFichaFlotante(mouseX, mouseY, ficha) {
        const img = this.imagenes[ficha.tipo];
        const x = mouseX;
        const y = mouseY;
        
        if (img) {
            this.ctx.globalAlpha = 0.8; 
            this.ctx.drawImage(
                img,
                x - (this.ANCHO_FICHA / 2),
                y - (this.ALTO_FICHA / 2),
                this.ANCHO_FICHA,
                this.ALTO_FICHA
            );
            this.ctx.globalAlpha = 1.0;
        } 
        // (Omitimos el fallback del círculo para simplicidad)
    }

    /**
     * Traduce una coordenada de píxel (x, y) a una celda (fila, col)
     * @param {number} pixelX 
     * @param {number} pixelY 
     * @returns {{fila: number, col: number}}
     */
    traducirPixelACelda(pixelX, pixelY) {
        const col = Math.round((pixelX - this.OFFSET_X) / this.TAMANO_CELDA);
        const fila = Math.round((pixelY - this.OFFSET_Y) / this.TAMANO_CELDA);
        
        const filaValida = Math.max(0, Math.min(fila, 6));
        const colValida = Math.max(0, Math.min(col, 6));

        return { fila: filaValida, col: colValida };
    }

    // --- ¡MÉTODO ACTUALIZADO! ---
    /**
     * Muestra un mensaje de fin de juego usando el menú HTML.
     * @param {string} estado - 'VICTORIA' o 'DERROTA'
     */
    mostrarMensajeFinDeJuego(estado) {
        
        // 1. Configurar el texto
        if (estado === 'VICTORIA') {
            this.tituloFinJuego.textContent = '¡VICTORIA!';
            this.mensajeFinJuego.textContent = '¡Dejaste una sola ficha en el centro!';
            this.tituloFinJuego.style.color = '#00C853'; // Verde
        } else { // Asumir 'DERROTA'
            this.tituloFinJuego.textContent = 'FIN DEL JUEGO';
            this.mensajeFinJuego.textContent = 'No quedan más movimientos.';
            this.tituloFinJuego.style.color = '#D50000'; // Rojo
        }
        
        // 2. Mostrar el menú
        this.menuFinJuego.classList.remove('oculto');
    }
}

