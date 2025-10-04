const fila = document.querySelector('.carousel-container');
const cards = document.querySelectorAll('.game-card');
const flechaIzquierda = document.getElementById('left-arrow');
const flechaDerecha = document.getElementById('right-arrow');

//eventos de las flechas para poder mover el carrusel
flechaDerecha.addEventListener('click', () => {
  //suma a partir de la pos actual + el tamanio del contenedor
  fila.scrollLeft += fila.offsetWidth;
});

flechaIzquierda.addEventListener('click', () => {
  //igual que el de arriba pero la logica es restar
  fila.scrollLeft -= fila.offsetWidth;
});

