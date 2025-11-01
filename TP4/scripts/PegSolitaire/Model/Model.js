import { Tablero } from './Tablero.js';

/**
 * El Modelo principal.
 * Contiene el tablero y el estado del juego (timer).
 */
export class Model {
    constructor() {
        // No creamos el tablero aquí.
        // Esperamos a que el Controller nos diga qué personaje usar.
        this.tablero = null; 
        
        // Lógica del Timer
        this.tiempoRestante = 200; // 2 minutos
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

    // --- Métodos del Timer ---

    iniciarTimer() {
        this.tiempoRestante = 200; // Resetea a 2 minutos
        this.timerActivo = true;
        this.ultimoTiempo = 0; // Se seteará en el primer frame del gameLoop
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

        // Inicializamos el 'ultimoTiempo' en el primer frame
        if (this.ultimoTiempo === 0) {
            this.ultimoTiempo = tiempoActual;
            return Math.floor(this.tiempoRestante);
        }

        // Calculamos el tiempo que pasó (delta time)
        const delta = (tiempoActual - this.ultimoTiempo) / 1000; // en segundos

        // Solo restamos 1 segundo cuando 'delta' acumula 1s
        // Usamos >= 1 para ser seguros
        if (delta >= 1) {
            this.tiempoRestante -= Math.floor(delta); // Resta los segundos que pasaron
            this.ultimoTiempo = tiempoActual; // Reseteamos el contador
            
            if (this.tiempoRestante < 0) {
                this.tiempoRestante = 0;
                this.detenerTimer();
            }
        }
        
        return Math.floor(this.tiempoRestante);
    }
}

