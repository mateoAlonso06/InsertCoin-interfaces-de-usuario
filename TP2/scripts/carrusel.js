// 1. Selecciona TODOS los contenedores principales (.principal-container)
const contenedoresCarrusel = document.querySelectorAll('.principal-container');

// 2. Itera sobre cada uno de ellos
contenedoresCarrusel.forEach((contenedor) => {
    const fila = contenedor.querySelector('.carousel-container');
    const tarjetas = contenedor.querySelectorAll('.game-card');
    const flechaIzquierda = contenedor.querySelector('.left-arrow');
    const flechaDerecha = contenedor.querySelector('.right-arrow');
    
    // Índice para rastrear la posición actual (empieza en la tarjeta 0)
    let indiceActual = 0;
    const totalTarjetas = tarjetas.length;
    // Cuántas tarjetas se muestran a la vez. Ajusta este número.
    const tarjetasPorVista = 6; 

    // Función para actualizar la posición, la visibilidad de las flechas Y LAS CLASES DE ANIMACIÓN
    const actualizarCarrusel = () => {
        // A. Calcular la posición de scroll
        // Mueve una sola tarjeta (calculando su ancho + margen)
        const anchoTarjeta = tarjetas[0].offsetWidth + (parseFloat(getComputedStyle(tarjetas[0]).marginRight) * 5);

        // Aplica el desplazamiento suave
        fila.scrollLeft = indiceActual * anchoTarjeta;
        
        // B. GESTIONAR LAS CLASES DE ANIMACIÓN ⬅️ AQUI ESTÁ EL CAMBIO CLAVE
        tarjetas.forEach((tarjeta, index) => {
            // Si el índice de la tarjeta está en el rango visible (entre indiceActual y el final de la vista)
            if (index >= indiceActual && index < indiceActual + tarjetasPorVista) {
                // Si está visible, aplicamos la clase para que se anime
                tarjeta.classList.add('visible-animated');
            } else {
                // Si no está visible, quitamos la clase
                tarjeta.classList.remove('visible-animated');
            }
        });

        // C. Ocultar/Mostrar flechas (con opacidad)
        flechaIzquierda.style.opacity = indiceActual > 0 ? '1' : '0.3';
        flechaDerecha.style.opacity = indiceActual < totalTarjetas - tarjetasPorVista ? '1' : '0.3';
    };

    // Evento de la flecha derecha
    flechaDerecha.addEventListener('click', () => {
        if (indiceActual < totalTarjetas - tarjetasPorVista) {
            indiceActual++;
            actualizarCarrusel();
        }
    });

    // Evento de la flecha izquierda
    flechaIzquierda.addEventListener('click', () => {
        if (indiceActual > 0) {
            indiceActual--;
            actualizarCarrusel();
        }
    });
    
    // Inicializa la posición y visibilidad de las flechas al cargar
    actualizarCarrusel();
});