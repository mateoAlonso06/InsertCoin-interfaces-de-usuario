//VALIDACION PARA LOGIN
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        let valid = true;

        // Limpiar mensajes y estados de error
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('input-error');
            const errorElement = document.getElementById('error' + input.id.charAt(0).toUpperCase() + input.id.slice(1));
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    
    //Validaciones por campo 

    //Email
    let email = document.getElementById('email').value;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Patrón básico para validar email
    

    let emailInput = document.getElementById('email');
    if (email.trim() === '') {
        emailInput.classList.add('input-error');
        document.getElementById('errorEmail').textContent = 'El email es obligatorio';
        valid = false;
    } else if (!emailPattern.test(email)) {
        emailInput.classList.add('input-error');
        document.getElementById('errorEmail').textContent = 'El formato del email es incorrecto';
        valid = false;
    }

    //Password
    let passwordInput = document.getElementById('contraseña');
    let password = passwordInput.value;
    if (password.trim() === '') {
        passwordInput.classList.add('input-error');
        document.getElementById('errorPassword').textContent = 'La contraseña es obligatoria';
        valid = false;
    }

    if (!valid) {
        event.preventDefault(); // Evita el envío del formulario si hay errores
    } else {
        // Crear y mostrar overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);

        // Activar overlay con un pequeño retraso para la transición
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);

        // Crear y mostrar mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <h2>¡Registro Exitoso!</h2>
            <p>Bienvenido a InsertCoin</p>
        `;
        document.body.appendChild(successMessage);

        // Redireccionar después de la animación
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);

        event.preventDefault(); 
    }
});
});