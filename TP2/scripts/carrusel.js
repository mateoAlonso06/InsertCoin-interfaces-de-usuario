// 1. Selecciona TODOS los contenedores principales (.principal-container)
const contenedoresCarrusel = document.querySelectorAll('.principal-container');

// 2. Itera sobre cada uno de ellos para aplicar la lógica individualmente
contenedoresCarrusel.forEach((contenedor) => {
    // A. Encuentra el contenedor de la fila de desplazamiento (la 'fila' de tu código original)
    const fila = contenedor.querySelector('.carousel-container');
    
    // B. Encuentra las flechas dentro de ESTE carrusel específico
    const flechaIzquierda = contenedor.querySelector('.left-arrow');
    const flechaDerecha = contenedor.querySelector('.right-arrow');

    // C. Aplica el evento de la flecha derecha
    flechaDerecha.addEventListener('click', () => {
        // Desplaza ESTA fila por su propio ancho
        fila.scrollLeft += fila.offsetWidth; 
    });

    // D. Aplica el evento de la flecha izquierda
    flechaIzquierda.addEventListener('click', () => {
        // Desplaza ESTA fila por su propio ancho
        fila.scrollLeft -= fila.offsetWidth;
    });
});
