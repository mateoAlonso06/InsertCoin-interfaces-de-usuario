// En tu archivo: scripts/carrusel-blocka.js

export let personajeSeleccionadoSrc = null;

// Referencias a los elementos del carrusel
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
let currentIndex = 0;

/**
 * Función central que actualiza la vista del carrusel y la selección.
 */
function updateCarouselView() {
    if (slides.length === 0) return;
    
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    
    // Actualiza la variable que se exportará
    personajeSeleccionadoSrc = slides[currentIndex].querySelector('img')?.src;

    // Resalta visualmente el slide actual
    slides.forEach((slide, index) => {
        if (index === currentIndex) {
            slide.querySelector('.personaje').style.borderColor = 'var(--color-accent-400)';
        } else {
            slide.querySelector('.personaje').style.borderColor = 'var(--color-neutral-100)';
        }
    });

    // Actualiza los botones
    prevButton.disabled = (currentIndex === 0);
    nextButton.disabled = (currentIndex === slides.length - 1);
}

// Eventos para los botones de navegación manual
nextButton.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
        currentIndex++;
        updateCarouselView();
    }
});
prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarouselView();
    }
});

// Inicializa la vista del carrusel al cargar la página
document.addEventListener('DOMContentLoaded', updateCarouselView);


// =======================================================
// NUEVA FUNCIÓN DE ANIMACIÓN (MUCHO MÁS SIMPLE)
// =======================================================

/**
 * Inicia una animación de ruleta y llama a una función callback cuando termina.
 */
export function iniciarSeleccionAleatoria(onCompleteCallback) {
    const duracionTotal = 2500; // 2.5 segundos de animación
    const intervalo = 100;    // Cambia de imagen cada 100ms
    
    let tiempoTranscurrido = 0;

    const animacion = setInterval(() => {
        // Mueve la selección al siguiente personaje de forma circular
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarouselView();
        
        tiempoTranscurrido += intervalo;

        // Cuando se acaba el tiempo, se detiene la animación
        if (tiempoTranscurrido >= duracionTotal) {
            clearInterval(animacion);

            // Elige el personaje final de forma 100% aleatoria
            currentIndex = Math.floor(Math.random() * slides.length);
            updateCarouselView();
            
            // Llama a la función callback con la imagen final
            onCompleteCallback(personajeSeleccionadoSrc);
        }
    }, intervalo);
}