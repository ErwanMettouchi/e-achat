function displayMobileMenu() {
    const menuHamburger = document.querySelector('.menu-burger');
    const navLinks = document.querySelector('.nav-links');

    menuHamburger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-menu');
    })
}

function showPassword() {
    const password = document.querySelector('#password');
    const eye = document.querySelector('#showPassword');

    eye.addEventListener('click', (e) => {
        e.preventDefault();
        password.type === 'password' ? password.type = 'text' : password.type = 'password';
        eye.classList.toggle('fa-eye');
    })
}

function reduceDescription() {
    const description = document.querySelectorAll('.product-description');
        for (d of description) {
                d.textContent = d.textContent.slice(0, 150) + '...';
        }
}


function init() {
    reduceDescription();
    displayMobileMenu();
    showPassword();
}

window.onload = () => {
    init()
}