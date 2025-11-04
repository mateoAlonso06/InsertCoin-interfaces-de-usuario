// En tu archivo nuevo: scripts/carrusel-info.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Selecciona los elementos por sus IDs únicos
    const infoTrack = document.getElementById('info-track');
    const infoPrevBtn = document.getElementById('info-prev-btn');
    const infoNextBtn = document.getElementById('info-next-btn');

    // 2. Si no encuentra los elementos de este carrusel, no hace nada.
    if (!infoTrack || !infoPrevBtn || !infoNextBtn) {
        return; 
    }

    const slides = Array.from(infoTrack.children);
    if (slides.length === 0) return; // No hay slides

    let currentIndex = 0;
    const slideWidth = slides[0].getBoundingClientRect().width;

    /**
     * Mueve el carrusel de info y actualiza los botones
     */
    function updateInfoCarousel() {
        infoTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        infoPrevBtn.disabled = (currentIndex === 0);
        infoNextBtn.disabled = (currentIndex === slides.length - 1);
    }

    // 3. Evento para el botón "Siguiente"
    infoNextBtn.addEventListener('click', () => {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
            updateInfoCarousel();
        }
    });

    // 4. Evento para el botón "Anterior"
    infoPrevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateInfoCarousel();
        }
    });

    // 5. Inicializa la vista del carrusel (deshabilita "anterior")
    updateInfoCarousel();
});