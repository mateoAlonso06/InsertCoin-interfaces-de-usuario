document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.game-category-section');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;

    const cards = track.querySelectorAll('.game-card');
    const prevButton = carousel.querySelector('.carousel-prev');
    const nextButton = carousel.querySelector('.carousel-next');
    let cardWidth = 0;
    let currentIndex = 0;

    function updateCarousel() {
      if (cards.length === 0) return;
      // Recalculate card width on update
      cardWidth = cards[0].offsetWidth + parseInt(window.getComputedStyle(cards[0]).marginRight);
      
      const visibleCards = Math.floor(carousel.querySelector('.carousel-list').offsetWidth / cardWidth);
      const maxIndex = cards.length > visibleCards ? cards.length - visibleCards : 0;

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      if (currentIndex < 0) {
        currentIndex = 0;
      }

      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      
      // Show/hide buttons
      prevButton.style.display = currentIndex > 0 ? 'flex' : 'none';
      nextButton.style.display = currentIndex < maxIndex ? 'flex' : 'none';
    }

    nextButton.addEventListener('click', () => {
      const visibleCards = Math.floor(carousel.querySelector('.carousel-list').offsetWidth / cardWidth);
      if (currentIndex < cards.length - visibleCards) {
        currentIndex++;
        updateCarousel();
      }
    });

    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    // Initial setup
    window.addEventListener('resize', updateCarousel);
    
    // Use a small timeout to ensure all images are loaded and widths are correct
    setTimeout(updateCarousel, 100);
  });
});
