document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginFormContainer = document.getElementById('login-form');
    const registerFormContainer = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordLink = document.getElementById('forgot-password');
    
    // Cambiar a formulario de registro
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginFormContainer.classList.remove('active');
        registerFormContainer.classList.add('active');
    });
    
    // Cambiar a formulario de login
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerFormContainer.classList.remove('active');
        loginFormContainer.classList.add('active');
    });
    
    // Manejar envío del formulario de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Validación básica
        if (!username || !password) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        // Aquí iría la lógica de autenticación
        console.log('Iniciando sesión con:', { username, password });
        
        // Simulación de login exitoso
        alert('¡Inicio de sesión exitoso!');
        
        // Limpiar formulario
        loginForm.reset();
    });
    
    // Manejar envío del formulario de registro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const dni = document.getElementById('dni').value;
        const experience = document.getElementById('experience').value;
        const objective = document.getElementById('objective').value;
        const injuries = document.getElementById('injuries').value;
        
        // Validación básica
        if (!name || !dni || !experience || !objective || !injuries) {
            alert('Por favor, completa todos los campos');
            return;
        }
        
        // Aquí iría la lógica de registro
        console.log('Registrando usuario:', { name, dni, experience, objective, injuries });
        
        // Simulación de registro exitoso
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        
        // Cambiar a formulario de login
        registerFormContainer.classList.remove('active');
        loginFormContainer.classList.add('active');
        
        // Limpiar formulario
        registerForm.reset();
    });
    
    // Manejar "Olvidé mi contraseña"
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('que garron amigo hace memoria, la funcion todavia esta en desarrollo');
    });
    
    // Mejorar la experiencia de usuario con los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        // Asegurar que el placeholder esté vacío para que funcione la animación del label
        input.setAttribute('placeholder', ' ');
        
        // Manejar el enfoque y desenfoque para mantener el label en su posición
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.classList.remove('focused');
            }
        });
        
        // Verificar si hay valores al cargar la página (por si el navegador autocompleta)
        if (input.value) {
            input.parentNode.classList.add('focused');
        }
    });
});