
export class View {
    
    // se define el tamaño de la celda y la pocision de la ficha para que coincida con el tablero de la imagen
    //se hace adivinando los numeros magicos para que coincidan
    TAMANO_CELDA = 66.3;
    OFFSET_X = 228;
    OFFSET_Y = 85;//85

    // tamaño que van a tener las fichas
    ANCHO_FICHA = 60;
    ALTO_FICHA = 60;

    constructor() {
        this.canvas = document.getElementById('canvas-peg');
        
        //los elementos principales dle html
        this.menuPrincipal = document.querySelector('.menu-principal-peg');
        this.botonesPersonaje = document.querySelectorAll('.personaje-container');
        this.botonJugar = document.getElementById('play-peg');
        
        // elementos varios que se utilizan para menu,reiniciar el juego, etc
        this.menuFinJuego = document.getElementById('fin-juego-menu');
        this.tituloFinJuego = document.getElementById('fin-juego-titulo');
        this.botonReiniciar = document.getElementById('button-reiniciar-peg'); 
        this.botonVolverMenu = document.getElementById('button-volver-menu'); 
        this.mensajeFinJuego = document.getElementById('fin-juego-mensaje');
        this.timerDisplay = document.getElementById('timer-display');
        this.resetAll = document.getElementById('reset-tablero');

        this.canvas.width = 850;
        this.canvas.height = 575;
        this.ctx = this.canvas.getContext('2d');
        
        // donde guardamos las imagenes de los personajes
        this.imagenes = {};
    }

    // metodo del menu principal
    //devuelve una promesa en la cual le dice al controller, esperame hasta que el usuario eleija un personaje
    //"yo te prometo que voy a devolver algo"
    mostrarMenuPrincipal() {
        return new Promise((resolve) => {
            console.log("Vista: Mostrando menú principal...");
            this.menuPrincipal.classList.remove('oculto');
            this.canvas.classList.add('oculto'); 
            this.timerDisplay.classList.add('oculto');
            this.menuFinJuego.classList.add('oculto'); 

            let personajeSeleccionado = 'gabu'; // Default

            // Lógica de selección de personaje
            this.botonesPersonaje.forEach(boton => {
                const clickHandler = () => {
                    this.botonesPersonaje.forEach(b => b.classList.remove('selected'));
                    boton.classList.add('selected');
                    //con el dataset obetenemos el valor del atriubuto en el html
                    personajeSeleccionado = boton.dataset.tipo;
                };
                boton.addEventListener('click', clickHandler);
            });

            // una vez seleccionado el persoaje, al hacer click en jugar terminados devolviendo la promesa
            //el once:true lo que hace es limpiar el event listener despues de la primera vez que se hace click
            //esto puede evitar bugs si el menu se utiliza mucho
            const jugarClickHandler = () => {
                console.log("Vista: Botón 'Jugar' presionado.");
                this.ocultarMenuPrincipal();
                this.mostrarJuego();
                resolve(personajeSeleccionado);
            };
            this.botonJugar.addEventListener('click', jugarClickHandler, { once: true }); 
        });
    }

    ocultarMenuPrincipal() {
        if (this.menuPrincipal) this.menuPrincipal.classList.add('oculto');
    }

    mostrarJuego() {
        if (this.canvas) this.canvas.classList.remove('oculto');
        if (this.timerDisplay) this.timerDisplay.classList.remove('oculto');
    }

    //metodo para el timer
    
    actualizarTimer(tiempoTotalSegundos) {
        const minutos = Math.floor(tiempoTotalSegundos / 60);
        const segundos = tiempoTotalSegundos % 60;
        const minFormateados = String(minutos).padStart(2, '0');
        const segFormateados = String(segundos).padStart(2, '0');
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `Tiempo: ${minFormateados}:${segFormateados}`;
        }
    }

    // --- Métodos de Carga de Recursos ---

    async cargarRecursos() {
        const rutas = {
            'gabu': 'assets/img/peg-solitaire-utils/avatares-pegsolitaire/gabu.svg',
            'paris': 'assets/img/peg-solitaire-utils/avatares-pegsolitaire/paris.jpeg',
            'ace': 'assets/img/peg-solitaire-utils/avatares-pegsolitaire/ace.jpeg'
        };

        const promesasDeImagenes = [];
        const claves = Object.keys(rutas);
        //recorremos las rutas y a medidad que se van cargando indiividualmente las imagenes, las vamos guardando
        for (const clave of claves) {
            const ruta = rutas[clave];
            const promesa = this.cargarUnaImagen(ruta);
            promesasDeImagenes.push(promesa);
            
            promesa.then(img => {
                this.imagenes[clave] = img;
            }).catch(err => {
                console.error(`Vista: Error cargando '${clave}' desde ${ruta}`, err);
            });
        }
        await Promise.all(promesasDeImagenes);
    }

    cargarUnaImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error(`Fallo al cargar la imagen: ${src}`));
            img.src = src;
        });
    }

    // funcion que renderiza el tablero con las fichas

    render(modeloDeTablero, hints) {
        //reiniciamos para poder redibujar encima
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let fila = 0; fila < 7; fila++) {
            for (let col = 0; col < 7; col++) {
                
                //obtenemos cada pieza
                const pieza = modeloDeTablero[fila][col];
                
                if (pieza !== null && !pieza.estaSiendoArrastrada) { 
                    //dibujamos las piezas en los lugares que deben de ir
                    const img = this.imagenes[pieza.tipo];
                    //traduccion a pixeles
                    const x = this.OFFSET_X + (col * this.TAMANO_CELDA);
                    const y = this.OFFSET_Y + (fila * this.TAMANO_CELDA);
                    
                    //hacemos que la iamgen sea circular, ya que estaban cuadradas por defecto
                    if (img) {
                        this.ctx.save();
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, this.ANCHO_FICHA / 2, 0, Math.PI * 2);
                        this.ctx.closePath();
                        this.ctx.clip();
                        this.ctx.drawImage(
                            img,
                            x - (this.ANCHO_FICHA / 2), 
                            y - (this.ALTO_FICHA / 2), 
                            this.ANCHO_FICHA, 
                            this.ALTO_FICHA
                        );
                        //sin esto, se dibujarian todas encima de todas
                        this.ctx.restore();
                    }
                }
            }
        }

        // Dibujamos los hints siempre y cuando estos existan
        if (hints && hints.length > 0) {
            this.dibujarHints(hints);
        }
    }

    
     // Dibuja la ficha que está siendo arrastrada.
     
    dibujarFichaFlotante(mouseX, mouseY, ficha) {
        const img = this.imagenes[ficha.tipo];
        const x = mouseX;
        const y = mouseY;
        
        if (img) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.ANCHO_FICHA / 2, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.clip();
            this.ctx.drawImage(
                img,
                x - (this.ANCHO_FICHA / 2),
                y - (this.ALTO_FICHA / 2),
                this.ANCHO_FICHA,
                this.ALTO_FICHA
            );
            this.ctx.restore();
        } else {
            // si por alguna razon se rompe la ruta de la imagen o nos olvidamos de agregarla,
            //tenemos este else como un backup para dibujar una ficha generica y darnos cuenta donde esta el error de dibujado
            this.ctx.beginPath();
            this.ctx.arc(x, y, 28, 0, Math.PI * 2);
            this.ctx.fillStyle = 'green';
            this.ctx.globalAlpha = 0.8;
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
    }

     
    
     // Dibuja los hints (flechas rebotantes) en las celdas de destino.
    
    dibujarHints(hints) {
        // Calculamos un "rebote" vertical usando una onda sinusoidal.
        // Date.now() / 150 controla la velocidad del rebote.
        // Math.sin(...) va de -1 a 1.
        // Lo multiplicamos por 5 para que rebote 5px hacia arriba.
        const yOffset = -5 + (Math.sin(Date.now() / 150) * 5); 

        for (const hint of hints) {
            const x = this.OFFSET_X + (hint.col * this.TAMANO_CELDA);
            const y = this.OFFSET_Y + (hint.fila * this.TAMANO_CELDA);
            
            // Dibujamos una flecha en la celda (x, y) con el rebote (yOffset)
            // La flecha se dibuja encima de la celda
            this._dibujarFlecha(x, y + yOffset - 25); // -25px para que este arriba de la celda
        }
    }

    //Dibuja una flecha simple apuntando hacia abajo.
     
    _dibujarFlecha(x, y) {
        const size = 10; // Tamaño de la flecha
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.9)'; // Color dorado
        this.ctx.beginPath();
        this.ctx.moveTo(x, y); // Punta de abajo
        this.ctx.lineTo(x - size, y - size); // Esquina sup-izq
        this.ctx.lineTo(x + size, y - size); // Esquina sup-der
        this.ctx.closePath();
        this.ctx.fill();
    }


    // metodo que traduce de pixel a celda
    //
    traducirPixelACelda(pixelX, pixelY) {
        /*//pixelx =distintancia en pixeles desde la esquina izq superior del canvas
        //this.offsetx es el "espacio vacío" (el margen) que medimos desde el borde izquierdo (X=0)
        //hasta el centro de la primera columna (columna 0).
        -en la resta se obtiene la distancia relativa del click
        -dividimos por el tamaño de la celda para obtener la columna
        -redondeamos para obtener la columna más cercana
        */
        const col = Math.round((pixelX - this.OFFSET_X) / this.TAMANO_CELDA);
        //pixelY =distintancia en pixeles desde la esquina izq superior del canvas
        //aplica la misma logica que para al columna
        const fila = Math.round((pixelY - this.OFFSET_Y) / this.TAMANO_CELDA);

        //verificamos que el click sea dentro de los limites del tablero
        //si da mayor a 6, quiere decir que estamos fuera de los limites del mismo
        const filaValida = Math.max(0, Math.min(fila, 6));
        const colValida = Math.max(0, Math.min(col, 6));
        //devolvemos las coordenadas para que el controller se la pase al model
        return { fila: filaValida, col: colValida };
    }

    mostrarMensajeFinDeJuego(estado) {
        

        if (estado === 'VICTORIA') {
            this.tituloFinJuego.textContent = '¡VICTORIA!';
            this.tituloFinJuego.style.color = '#00C853'; // Verde
            this.mensajeFinJuego.textContent = '¡Dejaste una sola ficha en el centro!';
        } else if (estado === 'DERROTA_TIEMPO') {
            this.tituloFinJuego.textContent = '¡SE ACABÓ EL TIEMPO!';
            this.tituloFinJuego.style.color = '#D50000'; // Rojo
            this.mensajeFinJuego.textContent = '¡Más suerte la próxima!';
        } else { // DERROTA
            this.tituloFinJuego.textContent = 'FIN DEL JUEGO';
            this.tituloFinJuego.style.color = '#D50000'; // Rojo
            this.mensajeFinJuego.textContent = 'No quedan más movimientos.';
        }
        
        this.menuFinJuego.classList.remove('oculto');
    }

    
    

}

