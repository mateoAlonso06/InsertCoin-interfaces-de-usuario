// Loader retro para InsertCoin
document.addEventListener('DOMContentLoaded', function() {
    const loaderWrapper = document.getElementById('loader-wrapper');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    
    let progress = 0;
    const duration = 5000; // 5 segundos
    const interval = 50; // Actualización cada 50ms para suavidad
    const increment = (100 / (duration / interval));
    
    // Mensajes que van cambiando durante la carga
    const loadingMessages = [
        'PREPARANDO EXPERIENCIA RETRO',
        'CARGANDO JUEGOS CLÁSICOS',
        'INICIALIZANDO ARCADE',
        'CONECTANDO CON LOS 80S',
        'INSERTANDO MONEDA...',
        'GAME READY!'
    ];
    
    const messageElement = document.querySelector('.loading-message p');
    let messageIndex = 0;
    
    // Función para actualizar el progreso
    function updateProgress() {
        if (progress < 100) {
            progress += increment;
            
            // Asegurar que no pase del 100%
            if (progress > 100) progress = 100;
            
            // Actualizar barra de progreso
            progressBarFill.style.width = progress + '%';
            progressPercentage.textContent = Math.floor(progress) + '%';
            
            // Cambiar mensaje cada cierto porcentaje
            const newMessageIndex = Math.floor((progress / 100) * (loadingMessages.length - 1));
            if (newMessageIndex !== messageIndex && newMessageIndex < loadingMessages.length) {
                messageIndex = newMessageIndex;
                messageElement.textContent = loadingMessages[messageIndex];
            }
            
            // Continuar actualizando
            setTimeout(updateProgress, interval);
        } else {
            // Carga completada
            setTimeout(hideLoader, 500); // Pequeña pausa antes de ocultar
        }
    }
    
    // Función para ocultar el loader
    function hideLoader() {
        loaderWrapper.style.opacity = '0';
        loaderWrapper.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            loaderWrapper.style.display = 'none';
            // Mostrar el contenido principal
            document.body.style.overflow = 'auto';
        }, 500);
    }
    
    // Ocultar overflow del body mientras carga
    document.body.style.overflow = 'hidden';
    
    // Iniciar la animación de carga
    setTimeout(updateProgress, 300); // Pequeña pausa inicial para efecto
    
    // Efecto de sonido retro simulado (opcional - usando Web Audio API)
    function playRetroSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Silenciar errores de audio si no es compatible
        }
    }
    
    // Reproducir sonido al final de la carga (comentado para no molestar)
    // setTimeout(playRetroSound, duration);
});