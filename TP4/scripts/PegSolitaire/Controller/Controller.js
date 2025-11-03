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
        this.hintsMovimiento = []; // Array para los hints

        // Estado del Juego
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        
        // Guardamos el personaje elegido para reiniciar
        this.personajeElegido = 'gabu'; // Default

        // ID del frame para cancelarlo
        this.idFrameLoop = null;
    }

    /**
     * El punto de entrada principal. Se llama cuando el DOM está listo.
     */
    async iniciarJuego() {
        console.log("Controlador: DOM listo.");

        this.modelo = new Model();
        this.vista = new View();

        try {
            // --- ¡LÓGICA DEL MENÚ PRINCIPAL! ---
            // 1. Mostramos el menú y esperamos la selección.
            this.personajeElegido = await this.vista.mostrarMenuPrincipal();
            
            // 2. Una vez que el usuario elige y presiona "Jugar", cargamos los recursos.
            console.log("Controlador: Iniciando carga de recursos...");
            await this.vista.cargarRecursos();
            console.log("Controlador: ¡Recursos cargados!");

            // 3. Creamos el tablero PASÁNDOLE el personaje
            this.modelo.crearTablero(this.personajeElegido);

            // 4. Guardamos referencias
            this.canvas = this.vista.canvas;
            this.ctx = this.vista.ctx;

            // 5. Bindeamos 'this' (¡MUY IMPORTANTE!)
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.gameLoop = this.gameLoop.bind(this);
            this.reiniciarJuego = this.reiniciarJuego.bind(this); 
            this.volverAlMenu = this.volverAlMenu.bind(this);

            // 6. Añadimos listeners
            console.log("Controlador: Añadiendo listener 'mousedown'...");
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            
            // Listeners para los botones del menú de fin de juego
            this.vista.botonReiniciar.addEventListener('click', this.reiniciarJuego);
            this.vista.botonVolverMenu.addEventListener('click', this.volverAlMenu);

            // --- ¡AQUÍ ESTÁ TU BOTÓN DE RESET! ---
            // Listener para el botón de reset IN-GAME
            if (this.vista.resetAll) {
                this.vista.resetAll.addEventListener('click', this.reiniciarJuego);
            } else {
                console.warn("Controlador: No se encontró el botón de reset 'reset-tablero' en la Vista.");
            }
            
            // 7. Iniciamos el Timer
            this.modelo.iniciarTimer(); 
            this.vista.actualizarTimer(this.modelo.tiempoRestante); 
            
            // 8. ¡Iniciamos el Game Loop!
            this.idFrameLoop = requestAnimationFrame(this.gameLoop);

        } catch (error) {
            console.error("Controlador: Error fatal al cargar recursos. El juego no puede iniciar.", error);
        }
    }

    /**
     * Reinicia solo el estado del juego.
     */
    reiniciarJuego() {
        console.log("Controlador: Reiniciando el juego...");
        
        // Detenemos el loop anterior (si había uno)
        if (this.idFrameLoop) {
            cancelAnimationFrame(this.idFrameLoop);
            this.idFrameLoop = null;
        }

        // 1. Resetea el modelo (con el mismo personaje)
        this.modelo.reiniciar(this.personajeElegido);
        
        // 2. Resetea el estado del controlador
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        this.fichaSeleccionada = null;
        this.hintsMovimiento = []; // Limpia los hints
        
        // 3. Reinicia el timer
        this.modelo.iniciarTimer();
        this.vista.actualizarTimer(this.modelo.tiempoRestante);
        
        // 4. Oculta el menú de fin de juego (si estaba visible)
        this.vista.menuFinJuego.classList.add('oculto');
        
        // 5. Reinicia el game loop
        this.idFrameLoop = requestAnimationFrame(this.gameLoop); 
    }

    /**
     * Vuelve al menú principal.
     */
    volverAlMenu() {
        console.log("Controlador: Volviendo al menú principal...");
        
        // Detenemos el gameLoop actual (¡IMPORTANTE!)
        if (this.idFrameLoop) {
            cancelAnimationFrame(this.idFrameLoop);
            this.idFrameLoop = null;
        }
        
        // Oculta el menú de fin de juego
        this.vista.menuFinJuego.classList.add('oculto');
        
        // Reseteamos estados
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        this.fichaSeleccionada = null;
        this.hintsMovimiento = [];
        
        // Llama a iniciarJuego() de nuevo, lo que mostrará el menú principal
        this.iniciarJuego();
    }


    /**
     * Se ejecuta al hacer clic.
     */
    handleMouseDown(e) {
        if (this.fichaSeleccionada || this.juegoTerminado) return; 

        // 1. Traducir píxeles a celda
        const { fila, col } = this.vista.traducirPixelACelda(e.offsetX, e.offsetY);
        
        // 2. Pedir la ficha al modelo
        const ficha = this.modelo.getFichaEn(fila, col);
        
        // 3. Si hay ficha, ¡la "levantamos"!
        // Usamos 'instanceof Ficha' por seguridad
        if (ficha && typeof ficha.estaSiendoArrastrada !== 'undefined') {
            this.fichaSeleccionada = ficha;
            ficha.estaSiendoArrastrada = true;
            
            // --- ¡Pedimos los hints! ---
            this.hintsMovimiento = this.modelo.getMovimientosValidosPara(ficha);
            
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
        this.hintsMovimiento = []; // Limpiamos los hints

        // 4. Limpiamos los listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);

        // 5. Si el movimiento fue exitoso, chequear si el juego terminó.
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

        // ¡El juego terminó!
        this.juegoTerminado = true;
        this.estadoJuego = estado; // Guardamos 'VICTORIA' o 'DERROTA'
        this.modelo.detenerTimer(); // Detenemos el timer
    }

    /**
     * El bucle principal del juego (se llama 60 veces por seg).
     * @param {number} tiempoActual - El timestamp de requestAnimationFrame
     */
    gameLoop(tiempoActual) {
        // --- ACTUALIZAR EL TIMER ---
        if (!this.juegoTerminado) {
            // 1. Actualizamos la lógica del timer en el Modelo
            const tiempoRestante = this.modelo.actualizarTimer(tiempoActual);

            // 2. Actualizamos la Vista (HTML) con el nuevo tiempo
            this.vista.actualizarTimer(tiempoRestante);

            // 3. Verificamos si se acabó el tiempo
            if (tiempoRestante <= 0) {
                this.juegoTerminado = true;
                this.estadoJuego = 'DERROTA_TIEMPO'; 
                this.modelo.detenerTimer();
            }
        }

        // --- LÓGICA DE DIBUJADO ---
        
        // 1. Limpiamos y dibujamos el estado del tablero (Vista)
        this.vista.render(this.modelo.getTablero(), this.hintsMovimiento); // <-- Pasamos los hints

        // 2. Dibujamos la ficha "flotante" ENCIMA de todo
        if (this.fichaSeleccionada) {
            this.vista.dibujarFichaFlotante(
                this.fichaSeleccionada.xFlotante, 
                this.fichaSeleccionada.yFlotante, 
                this.fichaSeleccionada
            );
        }

        // 3. Si el juego terminó, mostramos el mensaje final
        if (this.juegoTerminado) {
            this.vista.mostrarMensajeFinDeJuego(this.estadoJuego);
        }

        // 4. Pedimos al navegador que nos llame de nuevo
        if (!this.juegoTerminado) {
            this.idFrameLoop = requestAnimationFrame(this.gameLoop);
        } else {
            this.idFrameLoop = null; // El juego terminó, no hay loop
        }
    }
}

// --- PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', () => {
    // Importamos Ficha aquí solo para la comprobación de seguridad
    // (Asegura que los imports funcionen antes de arrancar)
    import('../Model/Ficha.js').then(({ Ficha }) => {
        // Adjuntamos Ficha al scope global
        // para que 'instanceof Ficha' funcione en la Vista.
        window.Ficha = Ficha; 

        const controlador = new Controller();
        controlador.iniciarJuego(); // Este es el arranque
    }).catch(err => {
        console.error("Error crítico al cargar Ficha.js. El juego no puede arrancar.", err);
    });
});

