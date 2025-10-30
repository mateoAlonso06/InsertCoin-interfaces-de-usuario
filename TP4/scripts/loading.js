// Loading simple para InsertCoin
document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    const loader = document.getElementById('loader-wrapper');
    const progressBar = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const messageText = document.getElementById('loading-message');
    
    // Variables de control
    let progress = 0;
    
    // Mensajes que cambian durante la carga
    const messages = [
        'CARGANDO JUEGOS...',
        'PREPARANDO ARCADE...',
        'INSERTANDO MONEDA...',
        'LISTO PARA JUGAR!'
    ];
    
    // Función principal que actualiza el progreso
    function updateLoader() {
        // Incrementar progreso
        progress += 2; // 2% cada vez
        
        // Actualizar barra de progreso
        progressBar.style.width = progress + '%';
        
        // Actualizar texto del porcentaje
        progressText.textContent = progress + '%';
        
        // Cambiar mensaje según el progreso
        if (progress <= 25) {
            messageText.textContent = messages[0];
        } else if (progress <= 50) {
            messageText.textContent = messages[1];
        } else if (progress <= 75) {
            messageText.textContent = messages[2];
        } else {
            messageText.textContent = messages[3];
        }
        
        // Si no llegó al 100%, continuar
        if (progress < 100) {
            setTimeout(updateLoader, 100); // Cada 100ms
        } else {
            // Ocultar loader cuando termine
            setTimeout(hideLoader, 500);
        }
    }
    
    // Función para ocultar el loader
    function hideLoader() {
        loader.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Bloquear scroll mientras carga
    document.body.style.overflow = 'hidden';
    
    // Iniciar carga después de 500ms
    setTimeout(updateLoader, 500);
});