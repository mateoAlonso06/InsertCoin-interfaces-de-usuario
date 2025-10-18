// navbar.js

const burger = document.querySelector('.menu_burger');
const menu = document.querySelector('.menu_categorias');
const profileIcon = document.querySelector('.icon_profile');
const profileMenu = document.querySelector('.menu-profile');

burger.addEventListener('click', function() {
    menu.classList.toggle('open');
});

profileIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    profileMenu.classList.toggle('open');
});

document.addEventListener('click', function(e) {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove('open');
    }
    if (!profileMenu.contains(e.target) && !profileIcon.contains(e.target)) {
        profileMenu.classList.remove('open');
    }
});

    
