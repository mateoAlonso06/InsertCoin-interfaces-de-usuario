import { Tablero } from './Tablero.js';


export class Model {
    constructor() {
        
        this.tablero = new Tablero();
        
        // Aquí podrías añadir estadoJuego, timer, puntuación, etc.
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

    verificarVictoria(){
         return this.tablero.verificarEstadoJuego();
    }
}

