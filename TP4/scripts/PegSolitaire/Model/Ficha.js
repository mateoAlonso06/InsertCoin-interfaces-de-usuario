/**
 * Representa una ficha del juego (solo datos).
 * No sabe cómo dibujarse, solo sabe su estado.
 */
export class Ficha {
    constructor(tipo, fila, col) {
        this.tipo = tipo; // 'gabu', 'ace', 'paris'
        this.fila = fila;
        this.col = col;
        
        // estado para el Drag and Drop
        this.estaSiendoArrastrada = false;
        this.xFlotante = 0; // coordenada X (píxeles) donde se dibuja al flotar
        this.yFlotante = 0; // coordenada Y (píxeles) donde se dibuja al flotar
    }
}
