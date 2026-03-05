class VistaRutinaCliente {
    constructor() {
        this.diaActual = 1;
        this.inicializar();
    }

    async inicializar() {
        this.configurarAccionesRegistro();
        
        const rutinaId = document.getElementById('rutina-container')?.dataset.rutinaId;
        if (rutinaId) {
            await this.cargarDatosRutina(rutinaId);
        }
    }

    async cargarDatosRutina(idRutina) {
        try {
            const res = await fetch(`/entrenador/api/rutinas/${idRutina}/`);
            if (!res.ok) throw new Error('Error cargando rutina');
            const rutina = await res.json();

            this.renderDias(rutina.days_detail || []);
        } catch (error) {
            console.error('Error cargando datos de rutina:', error);
        }
    }

    renderDias(dias) {
        const navContainer = document.getElementById('navegacion-dias');
        const ejerciciosContainer = document.getElementById('ejercicios-container');
        if (!navContainer || !ejerciciosContainer) return;

        if (dias.length === 0) {
            ejerciciosContainer.innerHTML = '<p style="color:#666">No hay días cargados en esta rutina.</p>';
            return;
        }

        // Tabs
        navContainer.innerHTML = dias.map((dia, idx) => `
            <div class="pestaña-dia ${idx === 0 ? 'activa' : ''}" data-dia="${dia.id}">
                ${dia.name}
            </div>
        `).join('');

        // Paneles de ejercicios
        ejerciciosContainer.innerHTML = dias.map((dia, idx) => `
            <div class="ejercicios-dia ${idx === 0 ? 'activa' : ''}" id="dia-${dia.id}">
                ${dia.ejercicios.length > 0 ? dia.ejercicios.map(ej => `
                    <div class="tarjeta-ejercicio">
                        <div class="cabecera-ejercicio">
                            <div class="info-ejercicio">
                                <h3 class="nombre-ejercicio">${ej.exercise_name}</h3>
                                <div class="meta-ejercicio">
                                    ${ej.muscle_group ? `<span><i class="fas fa-running"></i> ${ej.muscle_group}</span>` : ''}
                                    <span><i class="fas fa-layer-group"></i> ${ej.type_serie}</span>
                                </div>
                            </div>
                        </div>
                        <div class="configuracion-ejercicio">
                            <h4 class="titulo-configuracion">Configuración:</h4>
                            <div class="contenedor-series">
                                ${Array.from({length: parseInt(ej.series)}, (_, i) => `
                                    <div class="tarjeta-serie">
                                        <div class="numero-serie">Serie ${i + 1}</div>
                                        <div class="detalles-serie">${ej.repetitions} reps</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('') : '<p style="color:#666">No hay ejercicios en este día.</p>'}
            </div>
        `).join('');

        // Navegación entre días
        this.configurarNavegacionDias();
    }

    configurarNavegacionDias() {
        const pestañasDias = document.querySelectorAll('.pestaña-dia');
        const ejerciciosDias = document.querySelectorAll('.ejercicios-dia');

        pestañasDias.forEach(pestaña => {
            pestaña.addEventListener('click', () => {
                pestañasDias.forEach(p => p.classList.remove('activa'));
                pestaña.classList.add('activa');
                ejerciciosDias.forEach(c => c.classList.remove('activa'));
                const idDia = pestaña.getAttribute('data-dia');
                document.getElementById(`dia-${idDia}`)?.classList.add('activa');
                this.diaActual = idDia;
            });
        });
    }

    configurarAccionesRegistro() {
        document.getElementById('btn-nuevo-registro')?.addEventListener('click', () => {
            window.location.href = '/entrenador/cliente/progreso/nuevo/';
        });
        document.getElementById('btn-ver-progreso')?.addEventListener('click', () => {
            window.location.href = '/entrenador/cliente/progreso/';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new VistaRutinaCliente());