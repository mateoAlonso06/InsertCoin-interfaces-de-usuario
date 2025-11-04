import { Model } from '../Model/Model.js';
import { View } from '../View/View.js';

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
        this.hintsMovimiento = []; 

        // Estado del Juego
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        
        // Guardamos el personaje elegido para reiniciar
        this.personajeElegido = 'gabu'; // Default

        this.idFrameLoop = null;
    }

    /**
     * se vaa iniciar el juego en el momento que el usuario haya seleccionado el personaje
     * y hecho click en jugar
     */
    async iniciarJuego() {
    
        this.modelo = new Model();
        this.vista = new View();

        try {
            // logica del menu principal
            // se muestra el menu y esperamos la seleccion del personajee
            this.personajeElegido = await this.vista.mostrarMenuPrincipal();
            
            //  despues de elegir y clickear en jugar, se cargan los recursos para el juego
            await this.vista.cargarRecursos();

            //  se crea el tablero en el modelo
            this.modelo.crearTablero(this.personajeElegido);

            //  Guardamos referencias
            this.canvas = this.vista.canvas;
            this.ctx = this.vista.ctx;

            // se bindean los los metodos para poder mantener el contexto del controller
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.gameLoop = this.gameLoop.bind(this);
            this.reiniciarJuego = this.reiniciarJuego.bind(this); 
            this.volverAlMenu = this.volverAlMenu.bind(this);

            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            
            // listeners para los botones del menú de fin de juego
            this.vista.botonReiniciar.addEventListener('click', this.reiniciarJuego);
            this.vista.botonVolverMenu.addEventListener('click', this.volverAlMenu);

            // listener para el botón de reset 
            if (this.vista.resetAll) {
                this.vista.resetAll.addEventListener('click', this.reiniciarJuego);
            } 
            
            this.modelo.iniciarTimer(); 
            this.vista.actualizarTimer(this.modelo.tiempoRestante); 
            
            //se inicia el loop del juego 
            this.idFrameLoop = requestAnimationFrame(this.gameLoop);

        } catch (error) {
            console.error("controlador: el juego no puede iniciar.", error);
        }
    }

    /**
     * Reinicia solo el estado del juego.
     */
    reiniciarJuego() {
        // paramos el loop
        if (this.idFrameLoop) {
            cancelAnimationFrame(this.idFrameLoop);
            this.idFrameLoop = null;
        }

        //  resetea el modelo (con el mismo personaje)
        this.modelo.reiniciar(this.personajeElegido);
        
        //  resetea el estado del controlador
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        this.fichaSeleccionada = null;
        this.hintsMovimiento = []; 
        
        //  reinicia el timer
        this.modelo.iniciarTimer();
        this.vista.actualizarTimer(this.modelo.tiempoRestante);
        
        //  oculta el menú de fin de juego (si estaba visible)
        this.vista.menuFinJuego.classList.add('oculto');
        
        //  reinicia el game loop
        this.idFrameLoop = requestAnimationFrame(this.gameLoop); 
    }

    /**
     * vuelve al menú principal.
     */
    volverAlMenu() {
        // paramos el gameLoop actual 
        if (this.idFrameLoop) {
            cancelAnimationFrame(this.idFrameLoop);
            this.idFrameLoop = null;
        }
        
        // oculta el menú de fin de juego
        this.vista.menuFinJuego.classList.add('oculto');
        
        // reseteamos estados
        this.juegoTerminado = false;
        this.estadoJuego = 'JUGANDO';
        this.fichaSeleccionada = null;
        this.hintsMovimiento = [];
        
        // se vuelve a mostrar el menu principal
        this.iniciarJuego();
    }


    /**
     * se ejecuta al hacer clic.
     */
    handleMouseDown(e) {
        //e es el evento que entre tanta info que trae, tiene el offsetX y offsetY
        if (this.fichaSeleccionada || this.juegoTerminado) return; 

        //  traducir píxeles a celda
        //obtenemos las coordenadas logicas del click
        const { fila, col } = this.vista.traducirPixelACelda(e.offsetX, e.offsetY);
        
        //  pedir la ficha al modelo
        const ficha = this.modelo.getFichaEn(fila, col);
        
        // si hay ficha, la seleccionamos para poder arrastrarla
        // nos aseguramos que lo que agarramos sea una ficha y no un espacio vacio(null 0 o -1)
        if (ficha && typeof ficha.estaSiendoArrastrada !== 'undefined') {
            this.fichaSeleccionada = ficha;
            ficha.estaSiendoArrastrada = true;
            
            //pedimos los movimientos posibles para la ficha seleccioanda
            this.hintsMovimiento = this.modelo.getMovimientosValidosPara(ficha);
            
            // Calculamos el offset del clic DENTRO de la ficha
            const xFicha = this.vista.OFFSET_X + (col * this.vista.TAMANO_CELDA);
            const yFicha = this.vista.OFFSET_Y + (fila * this.vista.TAMANO_CELDA);
            this.offsetXFicha = e.offsetX - xFicha;
            this.offsetYFicha = e.offsetY - yFicha;

            /*
            usamos el ffset que calculamos para asi tener de referencia el centro y que la ficha
            flotando, se dibuje en referencia a eso y noen referencia al mouse*/ 
            this.fichaSeleccionada.xFlotante = e.offsetX - this.offsetXFicha;
            this.fichaSeleccionada.yFlotante = e.offsetY - this.offsetYFicha;

            // se agregan los nuevos eventos que vamos a necesitar escuchar
            //mientras arrastramos la ficha
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('mouseleave', this.handleMouseUp);
        }
    }

    
    handleMouseMove(e) {
        if (!this.fichaSeleccionada) return;

        // vamos actualizando la pos de la ficha mientras esta esta flotando
        this.fichaSeleccionada.xFlotante = e.offsetX - this.offsetXFicha;
        this.fichaSeleccionada.yFlotante = e.offsetY - this.offsetYFicha;
    }

    
    /**
     * se ejecuta al soltar el clic.
     */
    handleMouseUp(e) {
        if (!this.fichaSeleccionada) return;

        //  traducir píxeles a celda de destino
        const { fila, col } = this.vista.traducirPixelACelda(
            this.fichaSeleccionada.xFlotante, 
            this.fichaSeleccionada.yFlotante
        );

        //nos dice si el movimiento es exitoso o no
        const exito = this.modelo.intentarMover(this.fichaSeleccionada, fila, col);
        
        // uan vez soltamos, reiniciamos el estadode arrastre
        //y si el movimiento fue exitoso, el modelo se actualiza y por lo tanto el a vista tambien o viceversa
        this.fichaSeleccionada.estaSiendoArrastrada = false;
        this.fichaSeleccionada = null; // Dejamos de arrastrar
        this.hintsMovimiento = []; // Limpiamos los hints

        // limpiamos los listeners
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);

        //  si el movimiento fue exitoso, chequear si el juego terminó.
        if (exito) {
            this.verificarFinDeJuego();
        }
    }

    /**
     * llama al modelo para ver si el juego termino
     */
    verificarFinDeJuego() {
        const estado = this.modelo.verificarEstadoJuego(); 

        if (estado === 'JUGANDO') {
            return;
        }

        this.juegoTerminado = true;
        this.estadoJuego = estado; 
        this.modelo.detenerTimer(); 
    }

    /**
     * el bucle principal del juego (se llama 60 veces por seg).
     */
    gameLoop(tiempoActual) {
        //tiempoActual es el timestamp que nos da requestAnimationFrame
        if (!this.juegoTerminado) {
            //  actualizamos la lógica del timer en el Modelo
            const tiempoRestante = this.modelo.actualizarTimer(tiempoActual);

            // actualizamos la Vista  con el nuevo tiempo
            this.vista.actualizarTimer(tiempoRestante);

            //  verificamos si se acabó el tiempo
            if (tiempoRestante <= 0) {
                this.juegoTerminado = true;
                this.estadoJuego = 'DERROTA_TIEMPO'; 
                this.modelo.detenerTimer();
            }
        }

        //  limpiamos y dibujamos el estado del tablero
        this.vista.render(this.modelo.getTablero(), this.hintsMovimiento); 

        //  dibujamos la ficha "flotante" ENCIMA de todo
        if (this.fichaSeleccionada) {
            this.vista.dibujarFichaFlotante(
                this.fichaSeleccionada.xFlotante, 
                this.fichaSeleccionada.yFlotante, 
                this.fichaSeleccionada
            );
        }

        //si termino el juego, mostrarmos el menu de fin del juego con sus mensajes dependiendo del estado
        if (this.juegoTerminado) {
            this.vista.mostrarMensajeFinDeJuego(this.estadoJuego);
        }

        // pedimos al navegador que nos llame de nuevo
        if (!this.juegoTerminado) {
            this.idFrameLoop = requestAnimationFrame(this.gameLoop);
        } else {
            this.idFrameLoop = null;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    import('../Model/Ficha.js').then(({ Ficha }) => {
        window.Ficha = Ficha; 

        const controlador = new Controller();
        controlador.iniciarJuego(); 
    }).catch(err => {
        console.error("Error crítico al cargar Ficha.js. El juego no puede arrancar.", err);
    });
});

