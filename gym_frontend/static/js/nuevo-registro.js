class NuevoRegistro {
    constructor() {
        this.registros = this.obtenerRegistros();
        this.rutina = this.obtenerRutina();
        this.inicializar();
    }

    inicializar() {
        this.configurarEventos();
        this.cargarOpcionesSemanas();
        this.cargarOpcionesDias();
        this.seleccionarProximoEntrenamiento();
        this.actualizarProgreso();
        this.actualizarInfoDia();
    }

    obtenerRegistros() {
        // Datos de ejemplo - en producción vendrían de una API
        return [
            { semana: 1, dia: 1, completado: true, fecha: '2023-05-15' },
            { semana: 1, dia: 2, completado: true, fecha: '2023-05-17' },
            { semana: 3, dia: 1, completado: true, fecha: '2023-05-29' }
        ];
    }

    obtenerRutina() {
        return {
            totalSemanas: 8,
            diasPorSemana: 4,
            dias: {
                1: { nombre: "Pecho y Tríceps", ejercicios: ["Press de banca", "Fondos en paralelas", "Extensiones de tríceps", "Flexiones"] },
                2: { nombre: "Espalda y Bíceps", ejercicios: ["Dominadas", "Remo con barra", "Curl de bíceps", "Jalón al pecho"] },
                3: { nombre: "Piernas", ejercicios: ["Sentadillas", "Peso muerto", "Extensiones de cuadriceps", "Femorales"] },
                4: { nombre: "Hombros y Abdomen", ejercicios: ["Press militar", "Elevaciones laterales", "Encogimientos", "Plancha"] }
            }
        };
    }

    calcularProximoEntrenamiento() {
        if (this.registros.length === 0) {
            return { semana: 1, dia: 1 };
        }

        const ultimoRegistro = this.registros
            .filter(reg => reg.completado)
            .sort((a, b) => {
                if (a.semana !== b.semana) return b.semana - a.semana;
                return b.dia - a.dia;
            })[0];

        if (!ultimoRegistro) {
            return { semana: 1, dia: 1 };
        }

        let proximaSemana = ultimoRegistro.semana;
        let proximoDia = ultimoRegistro.dia + 1;

        // Buscar próximo día no completado
        while (proximaSemana <= this.rutina.totalSemanas) {
            while (proximoDia <= this.rutina.diasPorSemana) {
                if (!this.diaFueCompletado(proximaSemana, proximoDia)) {
                    return { semana: proximaSemana, dia: proximoDia };
                }
                proximoDia++;
            }
            proximaSemana++;
            proximoDia = 1;
        }

        // Si todos los días están completados, sugerir el último día
        return { 
            semana: this.rutina.totalSemanas, 
            dia: this.rutina.diasPorSemana 
        };
    }

    seleccionarProximoEntrenamiento() {
        const proximo = this.calcularProximoEntrenamiento();
        const selectSemana = document.getElementById('select-semana');
        const selectDia = document.getElementById('select-dia');
        
        if (selectSemana && selectDia) {
            selectSemana.value = proximo.semana;
            selectDia.value = proximo.dia;
            this.actualizarInfoDia();
        }
    }

    cargarOpcionesSemanas() {
        const select = document.getElementById('select-semana');
        if (!select) return;
        
        select.innerHTML = '';
        
        for (let semana = 1; semana <= this.rutina.totalSemanas; semana++) {
            const option = document.createElement('option');
            option.value = semana;
            option.textContent = `Semana ${semana}`;
            
            // Marcar semanas completadas
            const progresoSemana = this.obtenerProgresoSemana(semana);
            if (progresoSemana.porcentaje === 100) {
                option.textContent += ' ✓';
            }
            
            select.appendChild(option);
        }
    }

    cargarOpcionesDias() {
        const select = document.getElementById('select-dia');
        if (!select) return;
        
        select.innerHTML = '';
        
        for (let dia = 1; dia <= this.rutina.diasPorSemana; dia++) {
            const option = document.createElement('option');
            option.value = dia;
            
            const semanaActual = parseInt(document.getElementById('select-semana')?.value || 1);
            const estaCompletado = this.diaFueCompletado(semanaActual, dia);
            const marcador = estaCompletado ? ' ✓' : '';
            
            option.textContent = `Día ${dia}: ${this.rutina.dias[dia].nombre}${marcador}`;
            select.appendChild(option);
        }
    }

    actualizarInfoDia() {
        const semana = parseInt(document.getElementById('select-semana')?.value || 1);
        const dia = parseInt(document.getElementById('select-dia')?.value || 1);
        
        const infoDia = this.rutina.dias[dia];
        const tituloDia = document.getElementById('titulo-dia');
        const ejerciciosDia = document.getElementById('ejercicios-dia');
        
        if (tituloDia && ejerciciosDia && infoDia) {
            tituloDia.textContent = `Día ${dia}: ${infoDia.nombre}`;
            ejerciciosDia.textContent = 
                `${infoDia.ejercicios.length} ejercicios • ${infoDia.ejercicios.join(', ')}`;
        }
    }

    actualizarProgreso() {
        const totalDias = this.rutina.totalSemanas * this.rutina.diasPorSemana;
        const diasCompletados = this.registros.filter(reg => reg.completado).length;
        const semanasCompletadas = new Set(
            this.registros.filter(reg => reg.completado).map(reg => reg.semana)
        ).size;
        
        const porcentajeProgreso = (diasCompletados / totalDias) * 100;
        
        // Actualizar UI
        const barraProgreso = document.getElementById('barra-progreso');
        const semanasCompletadasElem = document.getElementById('semanas-completadas');
        const diasCompletadosElem = document.getElementById('dias-completados');
        const progresoTotalElem = document.getElementById('progreso-total');
        
        if (barraProgreso) barraProgreso.style.width = `${porcentajeProgreso}%`;
        if (semanasCompletadasElem) semanasCompletadasElem.textContent = semanasCompletadas;
        if (diasCompletadosElem) diasCompletadosElem.textContent = diasCompletados;
        if (progresoTotalElem) progresoTotalElem.textContent = `${Math.round(porcentajeProgreso)}%`;
    }

    configurarEventos() {
        // Navegación - solo botón volver
        document.getElementById('btn-volver')?.addEventListener('click', () => {
            window.history.back();
        });

        // Cambios en selección
        document.getElementById('select-semana')?.addEventListener('change', () => {
            this.cargarOpcionesDias();
            this.actualizarInfoDia();
        });

        document.getElementById('select-dia')?.addEventListener('change', () => {
            this.actualizarInfoDia();
        });

        // Iniciar entrenamiento - CORREGIDO
        document.getElementById('btn-iniciar-entrenamiento')?.addEventListener('click', () => {
            this.iniciarEntrenamiento();
        });
    }

    iniciarEntrenamiento() {
        const semana = parseInt(document.getElementById('select-semana')?.value || 1);
        const dia = parseInt(document.getElementById('select-dia')?.value || 1);
        
        const entrenamientoSeleccionado = {
            semana: semana,
            dia: dia,
            nombreDia: this.rutina.dias[dia]?.nombre || 'Entrenamiento',
            fecha: new Date().toISOString().split('T')[0]
        };
        
        console.log('Iniciando entrenamiento:', entrenamientoSeleccionado);
        
        // Guardar en localStorage para la página de entrenamiento
        localStorage.setItem('entrenamientoActual', JSON.stringify(entrenamientoSeleccionado));
        
        // CORREGIDO: Redirigir a página de entrenamiento
        window.location.href = 'entrenamiento.html';
    }

    diaFueCompletado(semana, dia) {
        return this.registros.some(reg => 
            reg.semana === semana && reg.dia === dia && reg.completado
        );
    }

    obtenerProgresoSemana(semana) {
        const diasCompletados = this.registros.filter(reg => 
            reg.semana === semana && reg.completado
        ).length;
        
        return {
            completados: diasCompletados,
            total: this.rutina.diasPorSemana,
            porcentaje: (diasCompletados / this.rutina.diasPorSemana) * 100
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NuevoRegistro();
});