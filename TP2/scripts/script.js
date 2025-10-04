document.addEventListener('DOMContentLoaded', () => {
  // Seleccionar la sección "Recomendados" específicamente
  const recomendadosSection = document.querySelector('.game-category-section:nth-of-type(2)');

  if (recomendadosSection) {
    const flechaIzquierda = recomendadosSection.querySelector('#flecha-izquierda');
    const flechaDerecha = recomendadosSection.querySelector('#flecha-derecha');
    const gameCardsWrapper = recomendadosSection.querySelector('.game-cards-wrapper');

    // Evento para el botón de la flecha derecha
    flechaDerecha.addEventListener('click', () => {
      // Calculamos el ancho de una tarjeta + el gap para el desplazamiento
      const cardWidth = gameCardsWrapper.querySelector('.game-card').offsetWidth;
      const gap = parseFloat(getComputedStyle(gameCardsWrapper).gap) || 20; // 20px como fallback
      
      gameCardsWrapper.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    });

    // Evento para el botón de la flecha izquierda
    flechaIzquierda.addEventListener('click', () => {
      // Calculamos el ancho de una tarjeta + el gap para el desplazamiento
      const cardWidth = gameCardsWrapper.querySelector('.game-card').offsetWidth;
      const gap = parseFloat(getComputedStyle(gameCardsWrapper).gap) || 20;

      gameCardsWrapper.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      });
    });
  }
});