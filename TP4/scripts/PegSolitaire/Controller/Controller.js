import { Model } from '../Model/Model.js'; // Importa 'Model' (Inglés)
import { View } from '../View/View.js';   // Importa 'View' (Inglés)

class Controller {
    constructor() {
        // Propiedades que se inicializarán en iniciarJuego()
        this.modelo = null;
        this.vista = null;
        this.canvas = null;
        this.ctx = null;
        
        // Estado del Drag and Drop
        this.fichaSeleccionada = null;
        this.offsetXFicha = 0;
        this.offsetYFicha = 0;

        // ¡NUEVO! Bandera para detener el juego
        this.juegoTerminado = false;
    }

    /**
     * El punto de entrada principal. Se llama cuando el DOM está listo.
     */
    async iniciarJuego() {
        console.log("Controlador: DOM listo. Iniciando carga de recursos...");

        // Usamos los nombres de clase correctos
        this.modelo = new Model();
        this.vista = new View();

        try {
            // 1. Esperamos a que la Vista cargue todas las imágenes.
            await this.vista.cargarRecursos();
            console.log("Controlador: ¡Recursos cargados! Iniciando juego.");

            // 2. Guardamos referencias al canvas
            this.canvas = this.vista.canvas;
            this.ctx = this.vista.ctx;

            // 3. Bindeamos los 'this' para que no se pierdan en los eventos
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.gameLoop = this.gameLoop.bind(this);

            // 4. Añadimos el listener principal
            console.log("Controlador: Añadiendo listener 'mousedown'...");
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            
            // 5. ¡Iniciamos el Game Loop!
            this.gameLoop();

        } catch (error) {
            console.error("Controlador: Error fatal al cargar recursos. El juego no puede iniciar.", error);
        }
    }

    /**
     * Se ejecuta al hacer clic.
     */
    handleMouseDown(e) {
        // ¡ACTUALIZADO! Si el juego terminó o ya estamos arrastrando, no hacer nada.
        if (this.fichaSeleccionada || this.juegoTerminado) return;

        // 1. Traducir píxeles a celda
        const { fila, col } = this.vista.traducirPixelACelda(e.offsetX, e.offsetY);
        
        // 2. Pedir la ficha al modelo
        const ficha = this.modelo.getFichaEn(fila, col);
        
        // 3. Si hay ficha, ¡la "levantamos"!
        if (ficha) {
            this.fichaSeleccionada = ficha;
            ficha.estaSiendoArrastrada = true;
            
            // Calculamos el offset del clic DENTRO de la ficha
            const xFicha = this.vista.OFFSET_X + (col * this.vista.TAMANO_CELDA);
            const yFicha = this.vista.OFFSET_Y + (fila * this.vista.TAMANO_CELDA);
            this.offsetXFicha = e.offsetX - xFicha;
            this.offsetYFicha = e.offsetY - yFicha;

            // Actualizamos la pos flotante inicial
            this.fichaSeleccionada.xFlotante = e.offsetX - this.offsetXFicha;
            this.fichaSeleccionada.yFlotante = e.offsetY - this.offsetYFicha;

            // Añadimos los listeners para mover y soltar
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('mouseleave', this.handleMouseUp);
        }
    }

    /**
     * Se ejecuta al mover el mouse (solo si se está arrastrando).
     */
    handleMouseMove(e) {
        if (!this.fichaSeleccionada) return;

        // Actualizamos la posición "flotante" de la ficha
        this.fichaSeleccionada.xFlotante = e.offsetX - this.offsetXFicha;
        this.fichaSeleccionada.yFlotante = e.offsetY - this.offsetYFicha;
    }

    
    /**
     * Se ejecuta al soltar el clic.
     */
    handleMouseUp(e) {
        if (!this.fichaSeleccionada) return;

        // 1. Traducir píxeles a celda de destino
        const { fila, col } = this.vista.traducirPixelACelda(
            this.fichaSeleccionada.xFlotante, 
            this.fichaSeleccionada.yFlotante
        );

        // 2. Intentar mover la ficha en el modelo
        const exito = this.modelo.intentarMover(this.fichaSeleccionada, fila, col);

        // 3. "Soltamos" la ficha (pase lo que pase)
        this.fichaSeleccionada.estaSiendoArrastrada = false;
        this.fichaSeleccionada = null; // Dejamos de arrastrar

        // 4. Limpiamos los listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);

        // 5. ¡AQUÍ ESTÁ LA NUEVA LÓGICA!
        // Si el movimiento fue exitoso, chequear si el juego terminó.
        if (exito) {
            this.verificarFinDeJuego();
        }
    }

    /**
     * ¡NUEVO! Llama al modelo para ver si el juego terminó.
     */
    verificarFinDeJuego() {
        // usa el método que existe en Model
        const estado = this.modelo.verificarVictoria(); // <-- corregido

        if (estado === 'JUGANDO') {
            return;
        }

        this.juegoTerminado = true;
        this.vista.mostrarMensajeFinDeJuego(estado);
    }

    /**
     * El bucle principal del juego (se llama 60 veces por seg).
     */
    gameLoop() {
        // 1. Limpiamos y dibujamos el estado del tablero (Vista)
        this.vista.render(this.modelo.getTablero());

        // 2. Dibujamos la ficha "flotante" ENCIMA de todo
        if (this.fichaSeleccionada) {
            // ¡LLAMADA CORREGIDA!
            // Pasamos los 3 args que la Vista (en tu Canvas) espera: (mouseX, mouseY, ficha)
            this.vista.dibujarFichaFlotante(
                this.fichaSeleccionada.xFlotante, 
                this.fichaSeleccionada.yFlotante, 
                this.fichaSeleccionada
            );
        }

        // 3. Pedimos al navegador que nos llame de nuevo
        // ¡ACTUALIZADO! Si el juego no ha terminado, sigue el bucle.
        if (!this.juegoTerminado) {
            requestAnimationFrame(this.gameLoop);
        }
    }
}

// --- PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', () => {
    const controlador = new Controller();
    controlador.iniciarJuego(); // Este es el arranque
});

