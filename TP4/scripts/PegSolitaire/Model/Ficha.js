/**
 * Representa una ficha del juego (solo datos).
 * No sabe cómo dibujarse, solo sabe su estado.
 */
export class Ficha {
    constructor(tipo, fila, col) {
        this.tipo = tipo; // 'gabu', 'ace', 'paris'
        this.fila = fila;
        this.col = col;
        
        // Estado para el Drag and Drop
        this.estaSiendoArrastrada = false;
        this.xFlotante = 0; // Coordenada X (píxeles) donde se dibuja al flotar
        this.yFlotante = 0; // Coordenada Y (píxeles) donde se dibuja al flotar
    }
}
