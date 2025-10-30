import { Ficha } from './Ficha.js';


export class Tablero {
    constructor() {
        // Usamos null para "hueco" o "inválido"
        this.contenido = this.crearTableroInicial();

        // <-- Inicializar dimensiones del tablero para que los loops funcionen -->
        this.filas = this.contenido.length;
        this.columnas = this.contenido[0] ? this.contenido[0].length : 0;
    }

    
    crearTableroInicial() {
        const tablero = [];
        // El estado inicial estándar del Peg Solitaire
        const estadoInicial = [
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1],
            [ 1,  1, 1, 1, 1,  1,  1],
            [ 1,  1, 1, 0, 1,  1,  1], // 0 = hueco
            [ 1,  1, 1, 1, 1,  1,  1],
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1]
        ];

        for (let f = 0; f < 7; f++) {
            const fila = [];
            for (let c = 0; c < 7; c++) {
                const estado = estadoInicial[f][c];
                if (estado === 1) {
                    // ¡Aquí puedes variar los tipos!
                    // Por ahora, todas son 'gabu'
                    fila.push(new Ficha('gabu', f, c));
                } else {
                    // Si es 0 (hueco) o -1 (inválido), ponemos null
                    fila.push(null);
                }
            }
            tablero.push(fila);
        }
        return tablero;
    }

    
    getContenido() {
        return this.contenido;
    }

   
    getFichaEn(fila, col) {
        // Guarda de seguridad
        if (fila < 0 || fila > 6 || col < 0 || col > 6) {
            return null;
        }
        return this.contenido[fila][col];
    }

    
    intentarMover(ficha, filaDestino, colDestino) {
        
        // 1. Validar que el destino está dentro del tablero
        if (filaDestino < 0 || filaDestino > 6 || colDestino < 0 || colDestino > 6) {
            return false; // Movimiento fuera del tablero
        }

        // 2. Validar que la celda de destino esté vacia
        if (this.contenido[filaDestino][colDestino] !== null) {
            return false; // Destino ocupado
        }

        const filaOrigen = ficha.fila;
        const colOrigen = ficha.col;
        
        // 3. Validar que sea un salto de 2 casillas 
        const diffFila = filaDestino - filaOrigen;
        const diffCol = colDestino - colOrigen;
        
        const esSaltoHorizontal = (Math.abs(diffCol) === 2 && diffFila === 0);
        const esSaltoVertical = (Math.abs(diffFila) === 2 && diffCol === 0);

        if (!esSaltoHorizontal && !esSaltoVertical) {
            return false; // No es un salto de 2 casillas
        }

        // 4. Encontrar la celda "comida" (la del medio)
        const filaMedia = filaOrigen + (diffFila / 2);
        const colMedia = colOrigen + (diffCol / 2);

        // 5. Validar que la celda "comida" TENGA una ficha
        if (this.contenido[filaMedia][colMedia] === null) {
            return false; // No se puede saltar sobre un hueco
        }

        // ¡MOVIMIENTO VÁLIDO!
        // 6. Ejecutar el movimiento
        
        // a. Poner la ficha en el destino
        this.contenido[filaDestino][colDestino] = ficha;
        ficha.fila = filaDestino; // Actualizamos la posición interna de la ficha
        ficha.col = colDestino;
        
        // b. Vaciar la celda de origen
        this.contenido[filaOrigen][colOrigen] = null;
        
        // c. "Comer" la ficha del medio
        this.contenido[filaMedia][colMedia] = null;

        return true;
    }



     verificarEstadoJuego() {
        // 1. Verificamos si queda algún movimiento posible
        if (this._hayMovimientosPosibles()) {
            return 'JUGANDO';
        }

        // 2. Si no hay movimientos, contamos cuántas fichas quedan
        let contadorFichas = 0;
        let ultimaFicha = null;
        for (let f = 0; f < this.filas; f++) {
            for (let c = 0; c < this.columnas; c++) {
                if (this.contenido[f][c] !== null) {
                    contadorFichas++;
                    ultimaFicha = this.contenido[f][c];
                }
            }
        }

        // 3. Verificamos la condición de victoria (tu lógica)
        if (contadorFichas === 1 && ultimaFicha.fila === 3 && ultimaFicha.col === 3) {
            return 'VICTORIA';
        }

        // 4. Si no es victoria y no hay movimientos, es derrota
        return 'DERROTA';
    }

    /**
     * Helper: Revisa todo el tablero buscando al menos un movimiento válido.
     * @returns {boolean}
     */
    _hayMovimientosPosibles() {
        for (let f = 0; f < this.filas; f++) {
            for (let c = 0; c < this.columnas; c++) {
                const ficha = this.contenido[f][c];
                if (ficha !== null) {
                    // Si encontramos una ficha, vemos si se puede mover
                    if (this._puedeMover(ficha)) {
                        return true; // Encontramos un movimiento, el juego sigue
                    }
                }
            }
        }
        return false; // No se encontró ningún movimiento
    }

    /**
     * Helper: Verifica si UNA ficha específica tiene algún movimiento válido
     * (arriba, abajo, izquierda, derecha).
     * @param {Ficha} ficha
     * @returns {boolean}
     */
    _puedeMover(ficha) {
        const { fila, col } = ficha;
        
        // Direcciones: [fila_destino, col_destino, fila_media, col_media]
        const posiblesSaltos = [
            [fila - 2, col, fila - 1, col], // Arriba
            [fila + 2, col, fila + 1, col], // Abajo
            [fila, col - 2, fila, col - 1], // Izquierda
            [fila, col + 2, fila, col + 1]  // Derecha
        ];

        for (const [df, dc, mf, mc] of posiblesSaltos) {
            // 1. ¿Están el destino y la celda media DENTRO del tablero?
            if (!this._esCeldaValida(df, dc) || !this._esCeldaValida(mf, mc)) {
                continue; // Este salto se va del tablero
            }
            
            // 2. ¿Está el destino VACÍO y la celda media OCUPADA?
            if (this.contenido[df][dc] === null && this.contenido[mf][mc] !== null) {
                return true; // ¡Se encontró un movimiento válido!
            }
        }

        return false; // Esta ficha no tiene movimientos
    }


    /**
     * Helper: Verifica si una celda está dentro de los límites 7x7.
     */
    _esCeldaValida(fila, col) {
        return fila >= 0 && fila < this.filas && col >= 0 && col < this.columnas;
    }
    
    
}


