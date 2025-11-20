class VistaRutinaCliente {
    constructor() {
        this.diaActual = 1;
        this.inicializar();
    }

    inicializar() {
        this.configurarNavegacionDias();
        this.configurarAccionesRegistro();
        this.calcular10RM(100, 8);
    }

    configurarNavegacionDias() {
        const pestañasDias = document.querySelectorAll('.pestaña-dia');
        const ejerciciosDias = document.querySelectorAll('.ejercicios-dia');
        
        pestañasDias.forEach(pestaña => {
            pestaña.addEventListener('click', () => {
                pestañasDias.forEach(p => p.classList.remove('activa'));
                pestaña.classList.add('activa');
                
                ejerciciosDias.forEach(contenido => contenido.classList.remove('activa'));
                
                const idDia = pestaña.getAttribute('data-dia');
                document.getElementById(`dia-${idDia}`).classList.add('activa');
                this.diaActual = idDia;
            });
        });
    }

    configurarAccionesRegistro() {
        const btnNuevoRegistro = document.getElementById('btn-nuevo-registro');
        const btnVerHistorial = document.getElementById('btn-ver-historial');

        if (btnNuevoRegistro) {
            btnNuevoRegistro.addEventListener('click', () => {
                window.location.href = 'nuevo-registro.html';
            });
        }

        if (btnVerHistorial) {
            btnVerHistorial.addEventListener('click', () => {
                this.abrirVistaHistorial();
            });
        }
    }

    abrirVistaHistorial() {
        console.log('Abrir vista de historial');
        alert('Funcionalidad de historial en desarrollo');
    }

    calcular10RM(peso, repeticiones) {
        const oneRM = peso * (1 + repeticiones / 30);
        const tenRM = oneRM / (1 + 10 / 30);
        const roundedRM = Math.round(tenRM);
        
        console.log(`10RM calculado para ${peso}kg x ${repeticiones} reps: ${roundedRM}kg`);
        return roundedRM;
    }

    async cargarDatosRutina(idRutina) {
        try {
            console.log('Cargando datos de rutina para ID:', idRutina);
        } catch (error) {
            console.error('Error cargando datos de rutina:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VistaRutinaCliente();
});