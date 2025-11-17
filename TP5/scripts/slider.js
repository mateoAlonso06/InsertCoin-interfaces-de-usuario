document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.banner-slider-wrapper');
    const slides = Array.from(wrapper.querySelectorAll('.banner-slide'));
    const nextButton = document.querySelector('.next-arrow');
    const prevButton = document.querySelector('.prev-arrow');
    const totalSlides = slides.length;

    if (!wrapper || !nextButton || !prevButton || totalSlides === 0) {
        console.error("Slider elements not found!");
        return; // Exit if elements are missing
    }

    let currentIndex = 0; // Start with the first slide (index 0)

    function showSlide(index) {
        // Ensure index wraps around correctly
        const targetIndex = (index + totalSlides) % totalSlides;
        
        // Calculate previous and next indices relative to the targetIndex
        const prevIndex = (targetIndex - 1 + totalSlides) % totalSlides;
        const nextIndex = (targetIndex + 1) % totalSlides;

        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev', 'next', 'hide-prev', 'hide-next');
            
            if (i === targetIndex) {
                slide.classList.add('active');
            } else if (i === prevIndex) {
                slide.classList.add('prev');
            } else if (i === nextIndex) {
                slide.classList.add('next');
            } else {
                 // Determine if the slide should hide towards left or right
                 // This logic helps smoother transitions for more than 3 slides
                 // Simplified: If it was the old 'prev', hide left, otherwise hide right.
                 if ( (i - currentIndex + totalSlides) % totalSlides < totalSlides / 2 && i !== currentIndex) {
                    // It's generally 'before' the current index
                     slide.classList.add('hide-prev');
                 } else if (i !== currentIndex) {
                    // It's generally 'after' the current index
                     slide.classList.add('hide-next');
                 }
            }
        });

        currentIndex = targetIndex; // Update the current index
    }

    // --- Event Listeners ---
    nextButton.addEventListener('click', () => {
        showSlide(currentIndex + 1);
    });

    prevButton.addEventListener('click', () => {
        showSlide(currentIndex - 1);
    });

    // --- Initial Setup ---
    showSlide(currentIndex); // Show the initial slide configuration

}); // End DOMContentLoaded