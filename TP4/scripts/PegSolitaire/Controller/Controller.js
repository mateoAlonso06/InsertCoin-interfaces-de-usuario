import { Model } from '../Model/Model.js';
import { View } from '../View/View.js';

/**
 * El Controlador.
 * Conecta los eventos del usuario con el Modelo y la Vista.
 */
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

        // Estado del Juego
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        this.personajeElegido = 'gabu';
        
        // --- ¡NUEVO! ---
        // Aquí guardamos los hints para pasárselos a la Vista
        this.hintsMovimiento = []; 
    }

    /**
     * El punto de entrada principal. Se llama cuando el DOM está listo.
     */
    async iniciarJuego() {
        console.log("Controlador: DOM listo.");

        this.modelo = new Model();
        this.vista = new View();

        try {
            // 1. Mostramos el menú y esperamos la selección.
            this.personajeElegido = await this.vista.mostrarMenuPrincipal();
            
            // 2. Cargamos los recursos.
            console.log("Controlador: Iniciando carga de recursos...");
            await this.vista.cargarRecursos();
            console.log("Controlador: ¡Recursos cargados!");

            // 3. Creamos el tablero PASÁNDOLE el personaje
            this.modelo.crearTablero(this.personajeElegido);

            // 4. Guardamos referencias
            this.canvas = this.vista.canvas;
            this.ctx = this.vista.ctx;

            // 5. Bindeamos 'this'
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.gameLoop = this.gameLoop.bind(this);
            this.reiniciarJuego = this.reiniciarJuego.bind(this);
            this.volverAlMenu = this.volverAlMenu.bind(this);

            // 6. Añadimos listeners
            console.log("Controlador: Añadiendo listener 'mousedown'...");
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.vista.botonReiniciar.addEventListener('click', this.reiniciarJuego);
            this.vista.botonVolverMenu.addEventListener('click', this.volverAlMenu);
            
            // 7. Iniciamos el Timer
            this.modelo.iniciarTimer(); 
            this.vista.actualizarTimer(this.modelo.tiempoRestante); 
            
            // 8. ¡Iniciamos el Game Loop!
            requestAnimationFrame(this.gameLoop);

        } catch (error) {
            console.error("Controlador: Error fatal. El juego no puede iniciar.", error);
        }
    }

    /**
     * ¡NUEVO! Reinicia solo el estado del juego.
     */
    reiniciarJuego() {
        console.log("Controlador: Reiniciando el juego...");
        this.modelo.reiniciar(this.personajeElegido);
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        this.fichaSeleccionada = null;
        this.hintsMovimiento = []; // Limpiamos hints
        this.modelo.iniciarTimer();
        this.vista.actualizarTimer(this.modelo.tiempoRestante);
        this.vista.menuFinJuego.classList.add('oculto');
        requestAnimationFrame(this.gameLoop); 
    }

    /**
     * ¡NUEVO! Vuelve al menú principal.
     */
    volverAlMenu() {
        console.log("Controlador: Volviendo al menú principal...");
        this.vista.menuFinJuego.classList.add('oculto');
        // Detenemos el gameLoop actual (importante)
        this.juegoTerminado = true; 
        
        // Reseteamos estados para la próxima partida
        this.estadoJuego = 'JUGANDO';
        this.fichaSeleccionada = null;
        this.hintsMovimiento = [];
        this.juegoTerminado = false;
        // Llama a iniciarJuego() de nuevo, lo que mostrará el menú principal
        // y reseteará 'juegoTerminado' a false cuando comience
        this.iniciarJuego();
    }


    /**
     * Se ejecuta al hacer clic.
     */
    handleMouseDown(e) {
        if (this.fichaSeleccionada || this.juegoTerminado) return; 

        const { fila, col } = this.vista.traducirPixelACelda(e.offsetX, e.offsetY);
        const ficha = this.modelo.getFichaEn(fila, col);
        
        if (ficha) {
            this.fichaSeleccionada = ficha;
            ficha.estaSiendoArrastrada = true;
            
            // --- ¡NUEVO! OBTENER HINTS ---
            this.hintsMovimiento = this.modelo.getMovimientosValidosPara(ficha);
            
            const xFicha = this.vista.OFFSET_X + (col * this.vista.TAMANO_CELDA);
            const yFicha = this.vista.OFFSET_Y + (fila * this.vista.TAMANO_CELDA);
            this.offsetXFicha = e.offsetX - xFicha;
            this.offsetYFicha = e.offsetY - yFicha;

            this.fichaSeleccionada.xFlotante = e.offsetX - this.offsetXFicha;
            this.fichaSeleccionada.yFlotante = e.offsetY - this.offsetYFicha;

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
        this.fichaSeleccionada.xFlotante = e.offsetX - this.offsetXFicha;
        this.fichaSeleccionada.yFlotante = e.offsetY - this.offsetYFicha;
    }

    
    /**
     * Se ejecuta al soltar el clic.
     */
    handleMouseUp(e) {
        if (!this.fichaSeleccionada) return;

        const { fila, col } = this.vista.traducirPixelACelda(
            this.fichaSeleccionada.xFlotante, 
            this.fichaSeleccionada.yFlotante
        );

        const exito = this.modelo.intentarMover(this.fichaSeleccionada, fila, col);
        
        this.fichaSeleccionada.estaSiendoArrastrada = false;
        this.fichaSeleccionada = null; 

        // --- ¡NUEVO! LIMPIAR HINTS ---
        this.hintsMovimiento = [];
        
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);

        if (exito) {
            this.verificarFinDeJuego();
        }
    }

    /**
     * Llama al modelo para ver si el juego terminó.
     */
    verificarFinDeJuego() {
        const estado = this.modelo.verificarEstadoJuego(); 

        if (estado === 'JUGANDO') {
            return; // El juego sigue
        }

        this.juegoTerminado = true;
        this.estadoJuego = estado; 
        this.modelo.detenerTimer(); 
    }

    /**
     * El bucle principal del juego (se llama 60 veces por seg).
     * @param {number} tiempoActual - El timestamp de requestAnimationFrame
     */
    gameLoop(tiempoActual) {
        
        if (!this.juegoTerminado) {
            const tiempoRestante = this.modelo.actualizarTimer(tiempoActual);
            this.vista.actualizarTimer(tiempoRestante);
            if (tiempoRestante <= 0) {
                this.juegoTerminado = true;
                this.estadoJuego = 'DERROTA_TIEMPO'; 
                this.modelo.detenerTimer();
            }
        }
        
        // --- ¡RENDER ACTUALIZADO! ---
        // 1. Dibujamos el tablero
        // ¡Le pasamos los hints a la Vista!
        this.vista.render(this.modelo.getTablero(), this.hintsMovimiento);

        // 2. Dibujamos la ficha "flotante"
        if (this.fichaSeleccionada) {
            this.vista.dibujarFichaFlotante(
                this.fichaSeleccionada.xFlotante, 
                this.fichaSeleccionada.yFlotante, 
                this.fichaSeleccionada
            );
        }

        // 3. Si el juego terminó, mostramos el menú
        if (this.juegoTerminado) {
            this.vista.mostrarMensajeFinDeJuego(this.estadoJuego);
        }

        // 4. Pedimos el siguiente frame
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

