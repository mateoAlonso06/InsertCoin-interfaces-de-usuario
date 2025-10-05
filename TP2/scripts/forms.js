document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signup-form').addEventListener('submit', function(event) {
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

    //Nombre
    let nombreInput = document.getElementById('nombre');
    let nombre = nombreInput.value;
    if (nombre.trim() === '') {
        nombreInput.classList.add('input-error');
        document.getElementById('errorNombre').textContent = 'El nombre es obligatorio';
        valid = false;
    }   

    //Apellido
    let apellidoInput = document.getElementById('apellido');
    let apellido = apellidoInput.value;
    if (apellido.trim() === '') {
        apellidoInput.classList.add('input-error');
        document.getElementById('errorApellido').textContent = 'El apellido es obligatorio';
        valid = false;
    }

    
    //Edad
    let edadInput = document.getElementById('edad');
    let edad = edadInput.value;
    if (edad.trim() === '' || edad <= 0 || !Number.isInteger(Number(edad))) {
        edadInput.classList.add('input-error');
        document.getElementById('errorEdad').textContent = 'La edad es obligatoria';
        valid = false;
    }

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

    //Repetir Password
    let repetirPasswordInput = document.getElementById('repetir-contraseña');
    let repetirPassword = repetirPasswordInput.value;
    if (repetirPassword.trim() === '') {
        repetirPasswordInput.classList.add('input-error');
        document.getElementById('errorRepetirPassword').textContent = 'Debe repetir la contraseña';
        valid = false;
    } else if (password !== repetirPassword) {
        repetirPasswordInput.classList.add('input-error');
        document.getElementById('errorRepetirPassword').textContent = 'Las contraseñas no coinciden';
        valid = false;
    }

    if (!valid) 
        event.preventDefault(); // Evita el envío del formulario si hay errores
    
});
});