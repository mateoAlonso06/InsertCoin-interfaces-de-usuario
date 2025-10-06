// Selecciona todos los carruseles que existan en la página
const carruseles = document.querySelectorAll('.recommended-games');

carruseles.forEach(carrusel => {
  const fila = carrusel.querySelector('.carousel-container');
  const games = carrusel.querySelectorAll('.game-card');
  const flechaIzquierda = carrusel.querySelector('.left-arrow');
  const flechaDerecha = carrusel.querySelector('.right-arrow');

  // ✅ Mostrar todas las cards al cargar (sin animar aún)
  games.forEach(game => {
    game.style.opacity = '1';
    game.style.transform = 'translateY(0)';
  });

  // --- Función para animar las cards en cascada ---
  function animarGames() {
    games.forEach((game, i) => {
      game.classList.remove('animar');
      void game.offsetWidth; // reinicia animación
      setTimeout(() => {
        game.classList.add('animar');
      }); 
    });
  }

  // --- Movimiento y animación mientras se desliza ---
  flechaDerecha.addEventListener('click', () => {
    fila.scrollLeft += fila.offsetWidth;
    animarGames(); // activa animación solo para este carrusel
  });

  flechaIzquierda.addEventListener('click', () => {
    fila.scrollLeft -= fila.offsetWidth;
    animarGames(); // activa animación solo para este carrusel
  });
});
