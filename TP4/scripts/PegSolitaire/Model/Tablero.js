import { Ficha } from './Ficha.js';


export class Tablero {

    constructor(personajeElegido) {
        this.contenido = this.crearTableroInicial(personajeElegido);
        this.filas = this.contenido.length;
        this.columnas = this.contenido[0].length;
    }

    
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
                    // 1 = Ficha
                    fila.push(new Ficha(personajeElegido, f, c));
                } else if (estadoInicial[f][c] === 0) {
                    // 0 = Hueco
                    fila.push(null); 
                } else {
                    // -1 = Inválido
                    fila.push(-1); 
                }
            }
            grilla.push(fila);
        }
        
        this.contenido = grilla; 
        return grilla;
    }
    
    getContenido() {
        return this.contenido;
    }

    getFichaEn(fila, col) {
        
        if (!this._esCeldaValida(fila, col)) {
            return null;
        }
        return this.contenido[fila][col];
    }
    
    
    intentarMover(ficha, filaDestino, colDestino) {
        
        //  validar que el destino esté dentro del tablero
        if (!this._esCeldaValida(filaDestino, colDestino)) {
            return false; 
        }
        
        //  validar que la celda de destino esté vacia (null)
        if (this.contenido[filaDestino][colDestino] !== null) {
            return false; 
        }

        //  validar que sea un salto de 2 espacios (horizontal o vertical)
        const filaOrigen = ficha.fila;
        const colOrigen = ficha.col;
        
        const diffFila = Math.abs(filaOrigen - filaDestino);
        const diffCol = Math.abs(colOrigen - colDestino);

        const esSaltoHorizontal = (diffFila === 0 && diffCol === 2);
        const esSaltoVertical = (diffFila === 2 && diffCol === 0);

        if (!esSaltoHorizontal && !esSaltoVertical) {
            return false; 
        }

        //  encontrar la ficha que fue comida
        const filaMedia = (filaOrigen + filaDestino) / 2;
        const colMedia = (colOrigen + colDestino) / 2;

        //  validar que la celda del medio si tenga una ficha (sea instancia de Ficha)
        if (!(this.contenido[filaMedia][colMedia] instanceof Ficha)) {
            return false; 
        }

        //movimientos calidos
        // vaciar la celda de la ficha comida
        this.contenido[filaMedia][colMedia] = null;
        
        //  vaciar la celda de origen
        this.contenido[filaOrigen][colOrigen] = null;
        
        //  poner la ficha en el destino
        ficha.fila = filaDestino; // Actualizamos la pos interna de la ficha
        ficha.col = colDestino;
        this.contenido[filaDestino][colDestino] = ficha;

        return true; 
    }

    
    verificarEstadoJuego() {
        // revisar si quedan movimientos posibles
        if (this._hayMovimientosPosibles()) {
            return 'JUGANDO';
        }

        //  si no hay movimientos, contar fichas restantes
        let contadorFichas = 0;
        let ultimaFicha = null;

        for (let f = 0; f < this.filas; f++) {
            for (let c = 0; c < this.columnas; c++) {
                const pieza = this.contenido[f][c];
                
                if (pieza instanceof Ficha) {
                    contadorFichas++;
                    ultimaFicha = pieza;
                }
            }
        }

        // comprobar Victoria (1 ficha Y en el centro)
        if (contadorFichas === 1 && ultimaFicha.fila === 3 && ultimaFicha.col === 3) {
            return 'VICTORIA';
        } else {
            return 'DERROTA'; 
        }
    }

    
    _hayMovimientosPosibles() {
        for (let f = 0; f < this.filas; f++) {
            for (let c = 0; c < this.columnas; c++) {
                const ficha = this.contenido[f][c];
                if (ficha instanceof Ficha) {
                    // Si esta ficha puede moverse en CUALQUIER dirección,
                    // el juego no ha terminado.
                    if (this._puedeMover(ficha)) {
                        return true;
                    }
                }
            }
        }
        return false; 
    }

    /**
     * revisa si UNA ficha específica tiene movimientos.
     
     */
    _puedeMover(ficha) {
        const { fila, col } = ficha;
        
        // direcciones: [fila_destino, col_destino, fila_media, col_media]
        const posiblesSaltos = [
            [fila - 2, col, fila - 1, col], // Arriba
            [fila + 2, col, fila + 1, col], // Abajo
            [fila, col - 2, fila, col - 1], // Izquierda
            [fila, col + 2, fila, col + 1]  // Derecha
        ];

        for (const [df, dc, mf, mc] of posiblesSaltos) {
            if (!this._esCeldaValida(df, dc) || !this._esCeldaValida(mf, mc)) {
                continue; // Este salto se va del tablero
            }
            
            if (this.contenido[df][dc] === null && this.contenido[mf][mc] instanceof Ficha) {
                return true; // Se encontró un movimiento válido
            }
        }

        return false; // Esta ficha no tiene movimientos
    }

    /**
     *  verifica si una celda está dentro de los límites 7x7.
     */
    _esCeldaValida(fila, col) {
        return fila >= 0 && fila < this.filas && col >= 0 && col < this.columnas;
    }
    
    
    /**
     * devuelve un array de destinos válidos para una ficha.
     */
    getMovimientosValidosPara(ficha) {
        const movimientos = [];
        const { fila, col } = ficha;
        
        const posiblesSaltos = [
            [fila - 2, col, fila - 1, col], // Arriba
            [fila + 2, col, fila + 1, col], // Abajo
            [fila, col - 2, fila, col - 1], // Izquierda
            [fila, col + 2, fila, col + 1]  // Derecha
        ];

        for (const [df, dc, mf, mc] of posiblesSaltos) {
            if (!this._esCeldaValida(df, dc) || !this._esCeldaValida(mf, mc)) {
                continue;
            }
            
            
            if (this.contenido[df][dc] === null && this.contenido[mf][mc] instanceof Ficha) {
                movimientos.push({ fila: df, col: dc });
            }
        }
        
        return movimientos; 
    }
}

