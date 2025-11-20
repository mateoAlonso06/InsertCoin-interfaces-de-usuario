document.addEventListener('DOMContentLoaded', () => {
    
    // elementos del html
    const pajaro = document.getElementById('pajaro');
    const gameScreen = document.getElementById('flappy-game-screen'); 
    const gameOverMensaje = document.getElementById('game-over'); 
    const debugBox = document.getElementById('debug-box'); 
    const puntajeDisplay = document.getElementById('puntaje'); 

    // menu del game over
    const finalScoreText = document.getElementById('final-score');
    const btnRestart = document.getElementById('btn-restart');
    const btnMainMenu = document.getElementById('btn-main-menu');

    // menu principal
    const mainMenu = document.getElementById('main-menu');
    const btnNormal = document.getElementById('btn-normal'); 
    const btnImposible = document.getElementById('btn-imposible'); 

    // menu de victoria
    const gameWonMenu = document.getElementById('game-won');
    const finalScoreWinText = document.getElementById('final-score-win');
    const btnRestartWin = document.getElementById('btn-restart-win');
    const btnMainMenuWin = document.getElementById('btn-main-menu-win');

    // config inicial de la fisica del pajaro(ahora monstruo)
    let velocidadVertical = 0;
    const gravedad = 0.5; 
    const fuerzaSalto = -10; 
    let posicionPajaro = 250; 
    let juegoIniciado = false;
    let ultimoTiempo = 0;
    let juegoTerminado = false; 

    // modo de juego (normal o imposible)
    let modoJuego = 'normal'; 

    // config de los troncos
    const alturaHueco = 200; 
    const tiempoGeneracionTronco = 3000; 
    let ultimoTiempoTronco = 0;
    let troncosGenerados = 0; 

    // generar los elementos de fondo con spritesheets
    let generadorMurcielagos = null; 
    let generadorEsqueletos = null; 
    let generadorGoblins = null; 

    // puntaje de la aprtida y condicion para ganar el juego
    let puntaje = 0;
    let puntajeMaximo = 25;

    // constantes del hitbox del monstruo para que se mantenga grande en pantalla pero que su hitbox sea mas chica
    const birdVisualHeight = 192;
    const gameHeight = 575; 
    const paddingHorizontal = 100; 
    const paddingVertical = 70;


    
    function gameLoop(tiempoActual) {
        // No ejecutar si el juego no empezó o ya terminó (sea ganando o perdiendo)
        if (!juegoIniciado || juegoTerminado) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        //la variable delta ayuda a que la fisica del juego sea independiente del framerate, corrigiendo si hay bajones de fps el salto del monstruo
        const delta = (tiempoActual - ultimoTiempo) / 16.67; 
        ultimoTiempo = tiempoActual;

        // fisica del monstruo
        velocidadVertical += gravedad * delta;
        posicionPajaro += velocidadVertical * delta;

        //verificar limites del mapa
        if (posicionPajaro + paddingVertical < 0) {
            posicionPajaro = 0 - paddingVertical; 
            velocidadVertical = 0;
            gameOver();
        }
        
        const bottomHitbox = posicionPajaro + birdVisualHeight - paddingVertical;
        if (bottomHitbox > gameHeight) {
            posicionPajaro = gameHeight - birdVisualHeight + paddingVertical; 
            velocidadVertical = 0;
            gameOver();
        }

        // actualizar pos en pantalla del personaje
        if(pajaro) pajaro.style.top = `${posicionPajaro}px`;
        
        // genera los troncos en intervalos de tiempoo
        if (tiempoActual - ultimoTiempoTronco > tiempoGeneracionTronco) {
            generarTronco(); 
            ultimoTiempoTronco = tiempoActual; 
        }
        
        
        actualizarPuntaje(); 

        checkAllCollisions();
        
        
        requestAnimationFrame(gameLoop);
    }

    // funcion para saltar(dependemos de esta funcion para que el juego de inicio)
    function saltar(e) {
        if (e) e.preventDefault(); 
        if (juegoTerminado) return; //si termina el juego, que no salte al escuchar el click

        if (!juegoIniciado) {
            juegoIniciado = true;

            /*lo que hace el performance.now() es sincronizar los tiempos del navegador para que el monstruo
             salte de forma fluida y no aparezca en cualquier
            lado de la pantalla de repente(depende de la tasa de refresco y componentes de tu computadora)*/  
            ultimoTiempo = performance.now(); 
            ultimoTiempoTronco = performance.now(); 
            
            if(puntajeDisplay) puntajeDisplay.classList.remove('oculto'); 

            // Iniciar generadores de fondo
            generadorMurcielagos = setInterval(generarMurcielago, 7000); 
            generadorEsqueletos = setInterval(generarEsqueleto, 10000); 
            generadorGoblins = setInterval(generarGoblin, 12000); 
        }
        
        velocidadVertical = fuerzaSalto;
    }


    // funciones de navegacion 

    function empezarJuego(modo) {
        modoJuego = modo; 
        
        if (mainMenu) mainMenu.classList.add('oculto'); 
        if (pajaro) pajaro.classList.remove('oculto'); 
        saltar(null); 
    }

    function reiniciarJuego() {
        const modoActual = modoJuego; 
        resetJuego();      
        empezarJuego(modoActual); 
    }

    function irAlMenu() {
        resetJuego(); 
        modoJuego = 'normal'; // Resetear modo al volver al menú
    }

    /**
     * Limpia el estado del juego y vuelve al menú principal.
     */
    function resetJuego() {
        // 1. Resetear variables de estado
        juegoTerminado = false;
        juegoIniciado = false;
        puntaje = 0;
        velocidadVertical = 0;
        posicionPajaro = 250;
        troncosGenerados = 0;
        
        if(pajaro) {
            pajaro.classList.remove('pajaro-muerte');
            pajaro.classList.add('oculto');
            pajaro.style.top = `${posicionPajaro}px`;
        }

        //se limpia el dom de los elementos generados
        const elementosJuego = document.querySelectorAll(
            '.tronco-container, .murcielago-enemigo, .esqueleto-caminando, .goblin-atacante'
        );
        elementosJuego.forEach(el => el.remove());

        
        if(puntajeDisplay) {
            puntajeDisplay.textContent = '0';
            puntajeDisplay.classList.add('oculto');
        }

        
        if(gameScreen) gameScreen.classList.remove('pausado');

        
        if(gameOverMensaje) gameOverMensaje.classList.add('oculto');
        if(mainMenu) mainMenu.classList.remove('oculto');
        if(gameWonMenu) gameWonMenu.classList.add('oculto'); 
    }


    //funciones para generar los spritesheets de fondo
    
    function generarMurcielago() {
        if (!gameScreen) return;
        //creamos el elemento y le damos la clase del spritesheet
        const murcielago = document.createElement('div');
        murcielago.classList.add('murcielago-enemigo');
        //calculamos alturas random donde este puede aparecer
        const alturaMaxima = 300;
        const topPosition = Math.floor(Math.random() * alturaMaxima);
        murcielago.style.top = `${topPosition}px`;
        gameScreen.appendChild(murcielago);
        //una vez terminada la animacion, lo eliminamos del dom
        murcielago.addEventListener('animationend', (e) => {
            if (e.animationName === 'mover-murcielago') {
                murcielago.remove();
            }
        });
    }

    function generarEsqueleto() {
        if (!gameScreen) return;
        const esqueleto = document.createElement('div');
        esqueleto.classList.add('esqueleto-caminando');
        gameScreen.appendChild(esqueleto);
        esqueleto.addEventListener('animationend', (e) => {
            if (e.animationName === 'move-skeleton') {
                esqueleto.remove();
            }
        });
    }

    function generarGoblin() {
        if (!gameScreen) return;
        const goblin = document.createElement('div');
        goblin.classList.add('goblin-atacante');
        gameScreen.appendChild(goblin);
        goblin.addEventListener('animationend', (e) => {
            if (e.animationName === 'move-skeleton') { 
                goblin.remove();
            }
        });
    }

    function generarTronco() {
        if (!gameScreen) return;
        troncosGenerados++; 
        
        const troncoContainer = document.createElement('div');
        troncoContainer.classList.add('tronco-container');
        
        if (modoJuego === 'imposible') {
            troncoContainer.classList.add('modo-imposible-activo');
        }
        
        const troncoArriba = document.createElement('div');
        const troncoAbajo = document.createElement('div');
        troncoArriba.classList.add('tronco', 'tronco-arriba');
        troncoAbajo.classList.add('tronco', 'tronco-abajo');
        troncoContainer.dataset.scored = 'false';//es una bandera para saber si se debe sumar lo puntos
        
        //calculos para generar los troncos y el espacio del medio
        const alturaMinima = 50;
        const alturaMaxima = gameScreen.clientHeight - alturaHueco - alturaMinima;
        const alturaTroncoArriba = Math.floor(Math.random() * (alturaMaxima - alturaMinima)) + alturaMinima;
        const alturaTroncoAbajo = gameScreen.clientHeight - alturaTroncoArriba - alturaHueco;
        
        troncoArriba.style.height = `${alturaTroncoArriba}px`;
        troncoAbajo.style.height = `${alturaTroncoAbajo}px`;
        
        troncoContainer.appendChild(troncoArriba);
        troncoContainer.appendChild(troncoAbajo);
        
        if (troncosGenerados % 3 === 0) {
            const bonusKey = document.createElement('div');
            bonusKey.classList.add('bonus-key');
            const topPosition = alturaTroncoArriba + (alturaHueco / 2) - 16;
            bonusKey.style.top = `${topPosition}px`;
            bonusKey.style.left = '50px'; 
            troncoContainer.appendChild(bonusKey);
        }
        
        gameScreen.appendChild(troncoContainer);
        
        troncoContainer.addEventListener('animationend', (e) => {
            // Prevenir que el 'fade-out' borre el tronco
            if (e.animationName === 'mover-tronco') {
                troncoContainer.remove();
            }
        });
    }


    function actualizarPuntaje() {
        if (!pajaro || juegoTerminado) return; // No sumar puntos si ya ganaste/perdiste
        
        const birdHitbox = pajaro.getBoundingClientRect();
        const birdLeft = birdHitbox.left + paddingHorizontal; 
        const troncos = document.querySelectorAll('.tronco-container');

        //se calcula que la izquierda del personajes sea mayor a la derecha del tronco para sumar puntos
        for (const tronco of troncos) {
            if (tronco.dataset.scored === 'false') {
                const troncoRect = tronco.getBoundingClientRect();
                if (troncoRect.right < birdLeft) {
                    puntaje++; 
                    if(puntajeDisplay) puntajeDisplay.textContent = puntaje; 
                    tronco.dataset.scored = 'true'; 
                    
                    if (puntaje >= puntajeMaximo) {
                        gameWon();
                    }
                }
            }
        }
    }

    function checkAllCollisions() {
        if (!pajaro || juegoTerminado) return; 

        const birdRect = pajaro.getBoundingClientRect();
        //se crea un hitbox mas chico, ya que la imagen del monstruo es muy grande
        const birdHitbox = {
            left: birdRect.left + paddingHorizontal,
            right: birdRect.right - paddingHorizontal,
            top: birdRect.top + paddingVertical,
            bottom: birdRect.bottom - paddingVertical
        };

        

        const troncos = document.querySelectorAll('.tronco-container');
        for (const troncoContainer of troncos) {
            // 1. Comprobar colisión con troncos
            const troncoArriba = troncoContainer.querySelector('.tronco-arriba');
            const troncoAbajo = troncoContainer.querySelector('.tronco-abajo');
            if (troncoArriba && troncoAbajo) { 
                const arribaRect = troncoArriba.getBoundingClientRect();
                const abajoRect = troncoAbajo.getBoundingClientRect();
                if (checkCollision(birdHitbox, arribaRect) || checkCollision(birdHitbox, abajoRect)) {
                    gameOver(); 
                    return; 
                }
            }
            
            // colision con la llave del bonus y misma logica que con los troncos
            const bonusKey = troncoContainer.querySelector('.bonus-key');
            if (bonusKey) { 
                const keyRect = bonusKey.getBoundingClientRect();
                if (checkCollision(birdHitbox, keyRect)) {
                    puntaje += 5; 
                    if(puntajeDisplay) puntajeDisplay.textContent = puntaje; 
                    bonusKey.remove(); 
                    
                    if (puntaje >= puntajeMaximo) {
                        gameWon();
                    }
                }
            }
        }
    }

    function checkCollision(rect1, rect2) {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }

    function gameOver() {
        if (juegoTerminado) return; 
        juegoTerminado = true; 
        console.log("¡GAME OVER!");
        
        if(pajaro) pajaro.classList.add('pajaro-muerte'); 
        if(puntajeDisplay) puntajeDisplay.classList.add('oculto');

        clearInterval(generadorMurcielagos);
        clearInterval(generadorEsqueletos); 
        clearInterval(generadorGoblins); 

        const tiempoDeEspera = 2000; 
        setTimeout(() => {
            if(gameScreen) gameScreen.classList.add('pausado');
            if(finalScoreText) finalScoreText.textContent = `SCORE: ${puntaje}`;
            if(gameOverMensaje) gameOverMensaje.classList.remove('oculto');
        }, tiempoDeEspera); 
    }

    
    function gameWon() {
        if (juegoTerminado) return; 
        juegoTerminado = true; 

        if(puntajeDisplay) puntajeDisplay.classList.add('oculto');
        if (debugBox) debugBox.style.display = 'none';

        clearInterval(generadorMurcielagos);
        clearInterval(generadorEsqueletos); 
        clearInterval(generadorGoblins); 

        if(gameScreen) gameScreen.classList.add('pausado');
        
        if(finalScoreWinText) finalScoreWinText.textContent = `SCORE: ${puntaje}`;
        
        if(gameWonMenu) gameWonMenu.classList.remove('oculto');
    }


    // listeners
    
    if (gameScreen) {
        gameScreen.addEventListener('mousedown', saltar); 
        gameScreen.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            saltar(e);
        }, { passive: false }); 
    }

    // listeners para los botones de perder
    if (btnRestart) {
        btnRestart.addEventListener('click', reiniciarJuego);
    }
    if (btnMainMenu) {
        btnMainMenu.addEventListener('click', irAlMenu);
    }

    // listeners para el Menú Principal
    if (btnNormal) {
        btnNormal.addEventListener('click', () => empezarJuego('normal'));
    }
    if (btnImposible) {
        btnImposible.addEventListener('click', () => empezarJuego('imposible'));
    }

    // listeners para el Menú de Victoria
    if (btnRestartWin) {
        btnRestartWin.addEventListener('click', reiniciarJuego);
    }
    if (btnMainMenuWin) {
        btnMainMenuWin.addEventListener('click', irAlMenu);
    }


    if (gameScreen) {
        requestAnimationFrame(gameLoop);
    }

}); 