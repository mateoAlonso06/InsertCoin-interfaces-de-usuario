document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elementos del DOM ---
    const pajaro = document.getElementById('pajaro');
    const gameScreen = document.getElementById('flappy-game-screen'); 
    const gameOverMensaje = document.getElementById('game-over'); 
    const debugBox = document.getElementById('debug-box'); 
    const puntajeDisplay = document.getElementById('puntaje'); 

    // --- Elementos del menú Game Over ---
    const finalScoreText = document.getElementById('final-score');
    const btnRestart = document.getElementById('btn-restart');
    const btnMainMenu = document.getElementById('btn-main-menu');

    // --- Elementos del Menú Principal ---
    const mainMenu = document.getElementById('main-menu');
    const btnNormal = document.getElementById('btn-normal'); 
    const btnImposible = document.getElementById('btn-imposible'); 

    // --- ¡NUEVO! Elementos del Menú de Victoria ---
    const gameWonMenu = document.getElementById('game-won');
    const finalScoreWinText = document.getElementById('final-score-win');
    const btnRestartWin = document.getElementById('btn-restart-win');
    const btnMainMenuWin = document.getElementById('btn-main-menu-win');

    // --- Configuración de Física del Pájaro ---
    let velocidadVertical = 0;
    const gravedad = 0.5; 
    const fuerzaSalto = -10; 
    let posicionPajaro = 250; 
    let juegoIniciado = false;
    let ultimoTiempo = 0;
    let juegoTerminado = false; 

    // --- Variable de Modo de Juego ---
    let modoJuego = 'normal'; // 'normal' o 'imposible'

    // --- Configuración de Troncos ---
    const alturaHueco = 200; 
    const tiempoGeneracionTronco = 3000; 
    let ultimoTiempoTronco = 0;
    let troncosGenerados = 0; 

    // --- Generadores de Fondo ---
    let generadorMurcielagos = null; 
    let generadorEsqueletos = null; 
    let generadorGoblins = null; 

    // --- Configuración de Puntaje ---
    let puntaje = 0;
    let puntajeMaximo = 25;

    // --- Constantes de Hitbox ---
    const birdVisualHeight = 192;
    const gameHeight = 575; 
    const paddingHorizontal = 100; 
    const paddingVertical = 70;


    /**
     * El "motor" del juego.
     */
    function gameLoop(tiempoActual) {
        // No ejecutar si el juego no empezó o ya terminó (sea ganando o perdiendo)
        if (!juegoIniciado || juegoTerminado) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        const delta = (tiempoActual - ultimoTiempo) / 16.67; 
        ultimoTiempo = tiempoActual;

        // --- 1. Física del Pájaro ---
        velocidadVertical += gravedad * delta;
        posicionPajaro += velocidadVertical * delta;

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

        // --- 2. Actualizar DOM del Pájaro ---
        if(pajaro) pajaro.style.top = `${posicionPajaro}px`;
        
        // --- 3. Generación de Troncos ---
        if (tiempoActual - ultimoTiempoTronco > tiempoGeneracionTronco) {
            generarTronco(); 
            ultimoTiempoTronco = tiempoActual; 
        }
        
        // --- 5. Actualizar Puntaje (y chequear victoria) ---
        actualizarPuntaje(); 

        checkAllCollisions();
        
        // --- 6. Continuar el Bucle ---
        requestAnimationFrame(gameLoop);
    }

    /**
     * Función de "Salto".
     */
    function saltar(e) {
        if (e) e.preventDefault(); 
        if (juegoTerminado) return; // No saltar si ganaste o perdiste

        if (!juegoIniciado) {
            juegoIniciado = true;
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


    // --- Funciones de Navegación ---

    function empezarJuego(modo) {
        modoJuego = modo; 
        
        if (mainMenu) mainMenu.classList.add('oculto'); 
        if (pajaro) pajaro.classList.remove('oculto'); 
        saltar(null); 
    }

    function reiniciarJuego() {
        const modoActual = modoJuego; // Guardar el modo
        resetJuego();      
        empezarJuego(modoActual); // Reiniciar en el MISMO modo
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
        
        // 2. Resetear Pájaro
        if(pajaro) {
            pajaro.classList.remove('pajaro-muerte');
            pajaro.classList.add('oculto');
            pajaro.style.top = `${posicionPajaro}px`;
        }

        // 3. Limpiar el DOM de elementos generados
        const elementosJuego = document.querySelectorAll(
            '.tronco-container, .murcielago-enemigo, .esqueleto-caminando, .goblin-atacante'
        );
        elementosJuego.forEach(el => el.remove());

        // 4. Resetear Marcadores
        if(puntajeDisplay) {
            puntajeDisplay.textContent = '0';
            puntajeDisplay.classList.add('oculto');
        }

        // 5. Resetear Escenario
        if(gameScreen) gameScreen.classList.remove('pausado');

        // 6. Cambiar Menús
        if(gameOverMensaje) gameOverMensaje.classList.add('oculto');
        if(mainMenu) mainMenu.classList.remove('oculto');
        if(gameWonMenu) gameWonMenu.classList.add('oculto'); // Ocultar menú de victoria
    }


    // --- Fábricas de Elementos ---
    
    function generarMurcielago() {
        if (!gameScreen) return;
        const murcielago = document.createElement('div');
        murcielago.classList.add('murcielago-enemigo');
        const alturaMaxima = 300;
        const topPosition = Math.floor(Math.random() * alturaMaxima);
        murcielago.style.top = `${topPosition}px`;
        gameScreen.appendChild(murcielago);
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
        troncoContainer.dataset.scored = 'false';
        
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

    // --- Lógica de Puntaje y Colisión ---

    function actualizarPuntaje() {
        if (!pajaro || juegoTerminado) return; // No sumar puntos si ya ganaste/perdiste
        
        const birdHitbox = pajaro.getBoundingClientRect();
        const birdLeft = birdHitbox.left + paddingHorizontal; 
        const troncos = document.querySelectorAll('.tronco-container');

        for (const tronco of troncos) {
            if (tronco.dataset.scored === 'false') {
                const troncoRect = tronco.getBoundingClientRect();
                if (troncoRect.right < birdLeft) {
                    puntaje++; 
                    if(puntajeDisplay) puntajeDisplay.textContent = puntaje; 
                    tronco.dataset.scored = 'true'; 
                    
                    // --- ¡CHEQUEO DE VICTORIA! ---
                    if (puntaje >= puntajeMaximo) {
                        gameWon();
                    }
                }
            }
        }
    }

    function checkAllCollisions() {
        if (!pajaro || juegoTerminado) return; // No chequear colisiones si ya terminó

        const birdRect = pajaro.getBoundingClientRect();
        const birdHitbox = {
            left: birdRect.left + paddingHorizontal,
            right: birdRect.right - paddingHorizontal,
            top: birdRect.top + paddingVertical,
            bottom: birdRect.bottom - paddingVertical
        };

        if (juegoIniciado && debugBox) {
            debugBox.style.left = `${birdHitbox.left}px`;
            debugBox.style.top = `${birdHitbox.top}px`;
            debugBox.style.width = `${birdHitbox.right - birdHitbox.left}px`;
            debugBox.style.height = `${birdHitbox.bottom - birdHitbox.top}px`;
        }

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
            
            // 2. Comprobar colisión con la llave
            const bonusKey = troncoContainer.querySelector('.bonus-key');
            if (bonusKey) { 
                const keyRect = bonusKey.getBoundingClientRect();
                if (checkCollision(birdHitbox, keyRect)) {
                    puntaje += 5; 
                    if(puntajeDisplay) puntajeDisplay.textContent = puntaje; 
                    bonusKey.remove(); 
                    
                    // --- ¡CHEQUEO DE VICTORIA (AL AGARRAR LLAVE)! ---
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
        if (debugBox) debugBox.style.display = 'none';

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

    /**
     * ¡NUEVA FUNCIÓN DE VICTORIA!
     */
    function gameWon() {
        if (juegoTerminado) return; 
        juegoTerminado = true; 
        console.log("¡GANASTE!");
        console.log("El menú de victoria es:", gameWonMenu);

        if(puntajeDisplay) puntajeDisplay.classList.add('oculto');
        if (debugBox) debugBox.style.display = 'none';

        clearInterval(generadorMurcielagos);
        clearInterval(generadorEsqueletos); 
        clearInterval(generadorGoblins); 

        // Pausar el escenario
        if(gameScreen) gameScreen.classList.add('pausado');
        
        // Actualizar el texto del puntaje
        if(finalScoreWinText) finalScoreWinText.textContent = `SCORE: ${puntaje}`;
        
        // Mostrar el menú de victoria
        if(gameWonMenu) gameWonMenu.classList.remove('oculto');
    }


    // --- Event Listeners ---
    
    if (gameScreen) {
        gameScreen.addEventListener('mousedown', saltar); 
        gameScreen.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            saltar(e);
        }, { passive: false }); 
    }

    // Listeners para los botones de Game Over
    if (btnRestart) {
        btnRestart.addEventListener('click', reiniciarJuego);
    }
    if (btnMainMenu) {
        btnMainMenu.addEventListener('click', irAlMenu);
    }

    // Listeners para el Menú Principal
    if (btnNormal) {
        btnNormal.addEventListener('click', () => empezarJuego('normal'));
    }
    if (btnImposible) {
        btnImposible.addEventListener('click', () => empezarJuego('imposible'));
    }

    // Listeners para el Menú de Victoria
    if (btnRestartWin) {
        btnRestartWin.addEventListener('click', reiniciarJuego);
    }
    if (btnMainMenuWin) {
        btnMainMenuWin.addEventListener('click', irAlMenu);
    }

    // --- ¡Arrancar el motor! ---
    if (gameScreen) {
        requestAnimationFrame(gameLoop);
    }

}); // --- Fin del DOMContentLoaded ---