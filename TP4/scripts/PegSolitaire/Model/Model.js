import { Tablero } from './Tablero.js';


export class Model {
    constructor() {
        this.tablero = null; 
        
        this.tiempoRestante = 0; // 200 segundos
        this.ultimoTiempo = 0;
        this.timerActivo = false;
    }

    
    crearTablero(personajeElegido) {
        this.tablero = new Tablero(personajeElegido);
    }
    
    
    reiniciar(personajeElegido) {
        this.tablero.crearTableroInicial(personajeElegido);
        this.iniciarTimer(); 
    }

    
    
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

    
    getMovimientosValidosPara(ficha) {
        return this.tablero.getMovimientosValidosPara(ficha);
    }

    // --- metodos del Timer ---

    iniciarTimer() {
        this.tiempoRestante = 500;
        this.timerActivo = true;
        this.ultimoTiempo = 0;
    }

    detenerTimer() {
        this.timerActivo = false;
    }

    
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

