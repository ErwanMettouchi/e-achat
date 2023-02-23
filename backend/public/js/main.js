function displayMobileMenu() {
    const menuHamburger = document.querySelector('.menu-burger');
    const navLinks = document.querySelector('.nav-links');
    
    menuHamburger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-menu');
    })
}


function init() {
    displayMobileMenu()
}

window.onload = () => {
    init()
}