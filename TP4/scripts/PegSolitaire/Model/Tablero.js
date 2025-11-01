import { Ficha } from './Ficha.js';

/**
 * El Tablero.
 * Gestiona la grilla 2D, la lógica de movimientos y el estado de victoria.
 */
export class Tablero {

    /**
     * Acepta el personaje elegido para crear las fichas correctas.
     * @param {string} personajeElegido 
     */
    constructor(personajeElegido) {
        this.contenido = this.crearTableroInicial(personajeElegido);
        this.filas = this.contenido.length;
        this.columnas = this.contenido[0].length;
    }

    /**
     * (Re)Crea la grilla 7x7 inicial.
     * @param {string} personajeElegido - 'gabu', 'ace', o 'paris'
     * @returns {Array<Array<Ficha|null>>}
     */
    crearTableroInicial(personajeElegido) {
        const grilla = [];
        // Estado estándar del tablero
        const estadoInicial = [
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1],
            [ 1,  1, 1, 1, 1,  1,  1],
            [ 1,  1, 1, 0, 1,  1,  1], // Fila 3, Col 3 es el hueco
            [ 1,  1, 1, 1, 1,  1,  1],
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1]
        ];

        for (let f = 0; f < 7; f++) {
            const fila = [];
            for (let c = 0; c < 7; c++) {
                if (estadoInicial[f][c] === 1) {
                    // ¡USA EL PERSONAJE ELEGIDO!
                    fila.push(new Ficha(personajeElegido, f, c));
                } else {
                    // Es 0 (hueco) o -1 (inválido), ambos son 'null' en nuestra grilla
                    fila.push(null); 
                }
            }
            grilla.push(fila);
        }
        // Actualizamos el contenido de la instancia actual si ya existía
        this.contenido = grilla; 
        return grilla;
    }
    
    getContenido() {
        return this.contenido;
    }

    getFichaEn(fila, col) {
        // Verificación de límites
        if (!this._esCeldaValida(fila, col)) {
            return null;
        }
        return this.contenido[fila][col];
    }
    
    /**
     * Lógica principal del movimiento.
     * @returns {boolean} - true si el movimiento fue exitoso, false si no.
     */
    intentarMover(ficha, filaDestino, colDestino) {
        
        // 1. Validar que el destino esté DENTRO del tablero
        if (!this._esCeldaValida(filaDestino, colDestino)) {
            return false; // Fuera del tablero
        }
        
        // 2. Validar que la celda de destino esté VACÍA
        if (this.contenido[filaDestino][colDestino] !== null) {
            // console.log("¡BUG PREVENIDO! Destino ocupado."); // (Para depuración)
            return false; // Destino ocupado
        }

        // 3. Validar que sea un salto de 2 espacios (horizontal o vertical)
        const filaOrigen = ficha.fila;
        const colOrigen = ficha.col;
        
        const diffFila = Math.abs(filaOrigen - filaDestino);
        const diffCol = Math.abs(colOrigen - colDestino);

        const esSaltoHorizontal = (diffFila === 0 && diffCol === 2);
        const esSaltoVertical = (diffFila === 2 && diffCol === 0);

        if (!esSaltoHorizontal && !esSaltoVertical) {
            return false; // No es un salto de 2 espacios
        }

        // 4. Encontrar la ficha "comida" (la del medio)
        const filaMedia = (filaOrigen + filaDestino) / 2;
        const colMedia = (colOrigen + colDestino) / 2;

        // 5. Validar que la celda del medio SÍ tenga una ficha
        if (this.contenido[filaMedia][colMedia] === null) {
            return false; // Saltaste sobre un hueco
        }

        // --- ¡MOVIMIENTO VÁLIDO! ---
        
        // 1. Vaciar la celda de la ficha comida
        this.contenido[filaMedia][colMedia] = null;
        
        // 2. Vaciar la celda de origen
        this.contenido[filaOrigen][colOrigen] = null;
        
        // 3. Poner la ficha en el destino
        ficha.fila = filaDestino; // Actualizamos la pos interna de la ficha
        ficha.col = colDestino;
        this.contenido[filaDestino][colDestino] = ficha;

        return true; // ¡Éxito!
    }

    /**
     * Verifica si el juego terminó (Victoria o Derrota).
     * @returns {string} 'JUGANDO', 'VICTORIA', o 'DERROTA'
     */
    verificarEstadoJuego() {
        // 1. Revisar si quedan movimientos posibles
        if (this._hayMovimientosPosibles()) {
            return 'JUGANDO';
        }

        // 2. Si no hay movimientos, contar fichas restantes
        let fichasRestantes = 0;
        let ultimaFicha = null;

        for (let f = 0; f < this.filas; f++) {
            for (let c = 0; c < this.columnas; c++) {
                if (this.contenido[f][c] !== null) {
                    fichasRestantes++;
                    ultimaFicha = this.contenido[f][c];
                }
            }
        }

        // 3. Comprobar Victoria (1 ficha Y en el centro)
        if (fichasRestantes === 1 && ultimaFicha.fila === 3 && ultimaFicha.col === 3) {
            return 'VICTORIA';
        } else {
            return 'DERROTA'; // No hay movimientos y no ganaste
        }
    }

    /**
     * Helper: Revisa todo el tablero buscando al menos 1 movimiento válido.
     */
    _hayMovimientosPosibles() {
        for (let f = 0; f < this.filas; f++) {
            for (let c = 0; c < this.columnas; c++) {
                const ficha = this.contenido[f][c];
                if (ficha !== null) {
                    // Si esta ficha puede moverse en CUALQUIER dirección,
                    // el juego no ha terminado.
                    if (this._puedeMover(ficha)) {
                        return true;
                    }
                }
            }
        }
        return false; // No se encontró ningún movimiento
    }

    /**
     * Helper: Revisa si UNA ficha específica tiene movimientos.
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
            
            // --- ¡AQUÍ ESTÁ EL ARREGLO! ---
            // 2. ¿Está el destino VACÍO y la celda media OCUPADA?
            // Usamos acceso directo al array (más rápido y seguro)
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

