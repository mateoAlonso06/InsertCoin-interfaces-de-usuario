document.addEventListener('DOMContentLoaded', () => {

    const track = document.querySelector('.carousel-track');
    if (!track) return; // Si no hay carrusel en la página, no hace nada

    const slides = Array.from(track.children);
    const nextButton = document.getElementById('next-btn');
    const prevButton = document.getElementById('prev-btn');
    const slideWidth = slides[0].getBoundingClientRect().width;
    let currentIndex = 0;

    // Función para mover el carrusel a un slide específico
    const moveToSlide = (targetIndex) => {
        track.style.transform = 'translateX(-' + slideWidth * targetIndex + 'px)';
        currentIndex = targetIndex;
        updateArrows();
    };

    // Función para actualizar el estado de los botones (activado/desactivado)
    const updateArrows = () => {
        if (currentIndex === 0) {
            prevButton.disabled = true;
        } else {
            prevButton.disabled = false;
        }

        if (currentIndex === slides.length - 1) {
            nextButton.disabled = true;
        } else {
            nextButton.disabled = false;
        }
    };

    // Evento para el botón "Siguiente"
    nextButton.addEventListener('click', () => {
        if (currentIndex < slides.length - 1) {
            moveToSlide(currentIndex + 1);
        }
    });

    // Evento para el botón "Anterior"
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            moveToSlide(currentIndex - 1);
        }
    });

    // Inicializa el estado de los botones al cargar la página
    updateArrows();
});