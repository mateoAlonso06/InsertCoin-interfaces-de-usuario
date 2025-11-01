import { Tablero } from './Tablero.js';

/**
 * El Modelo principal.
 * Contiene el tablero y el estado del juego (timer).
 */
export class Model {
    constructor() {
        this.tablero = null; 
        
        // Lógica del Timer
        this.tiempoRestante = 200; // 200 segundos
        this.ultimoTiempo = 0;
        this.timerActivo = false;
    }

    /**
     * Crea una nueva instancia del tablero con el personaje elegido.
     * @param {string} personajeElegido - 'gabu', 'ace', o 'paris'
     */
    crearTablero(personajeElegido) {
        // Pasamos el personaje al constructor del Tablero
        this.tablero = new Tablero(personajeElegido);
    }
    
    /**
     * Reinicia el tablero y el timer.
     * @param {string} personajeElegido 
     */
    reiniciar(personajeElegido) {
        // Le pedimos al tablero que se reinicie con el personaje
        this.tablero.crearTableroInicial(personajeElegido);
        this.iniciarTimer(); // Resetea el timer
    }

    // --- Métodos del Tablero (Delegación) ---
    
    getTablero() {
        return this.tablero.getContenido();
    }
    
    getFichaEn(fila, col) {
        return this.tablero.getFichaEn(fila, col);
    }
    
    intentarMover(ficha, filaDestino, colDestino) {
        return this.tablero.intentarMover(ficha, filaDestino, colDestino);
    }

    verificarEstadoJuego() {
        return this.tablero.verificarEstadoJuego();
    }

    // --- ¡NUEVO MÉTODO PASSTHROUGH PARA HINTS! ---
    /**
     * Le pide al tablero los movimientos válidos para una ficha.
     * @param {Ficha} ficha 
     * @returns {Array<{fila: number, col: number}>}
     */
    getMovimientosValidosPara(ficha) {
        return this.tablero.getMovimientosValidosPara(ficha);
    }

    // --- Métodos del Timer ---

    iniciarTimer() {
        this.tiempoRestante = 200;
        this.timerActivo = true;
        this.ultimoTiempo = 0;
    }

    detenerTimer() {
        this.timerActivo = false;
    }

    /**
     * Actualiza el timer. Es llamado 60 veces por seg por el Controller.
     * @param {number} tiempoActual - El timestamp de requestAnimationFrame
     * @returns {number} El tiempo restante en segundos
     */
    actualizarTimer(tiempoActual) {
        if (!this.timerActivo) return Math.floor(this.tiempoRestante);

        if (this.ultimoTiempo === 0) {
            this.ultimoTiempo = tiempoActual;
            return Math.floor(this.tiempoRestante);
        }

        const delta = (tiempoActual - this.ultimoTiempo) / 1000; // en segundos

        if (delta >= 1) {
            this.tiempoRestante -= Math.floor(delta);
            this.ultimoTiempo = tiempoActual;
            
            if (this.tiempoRestante < 0) {
                this.tiempoRestante = 0;
                this.detenerTimer();
            }
        }
        
        return Math.floor(this.tiempoRestante);
    }
}

