class EntrenamientoEnCurso {
    constructor() {
        this.entrenamientoActual = null;
        this.ejercicios = [];
        this.seriesCompletadas = [];
        this.tiempoInicio = null;
        this.temporizadorActivo = false;
        this.tiempoDescanso = 60;
        this.temporizadorDescanso = null;
        this.tiempoTranscurridoInterval = null;
        this.indiceEjercicioActual = 0;
        
        this.inicializar();
    }

    inicializar() {
        this.cargarEntrenamiento();
        this.configurarEventos();
        this.iniciarTemporizadorGeneral();
    }

    cargarEntrenamiento() {
        const entrenamientoGuardado = localStorage.getItem('entrenamientoActual');
        
        if (!entrenamientoGuardado) {
            alert('No se encontró información del entrenamiento. Redirigiendo...');
            window.location.href = 'index.html';
            return;
        }

        this.entrenamientoActual = JSON.parse(entrenamientoGuardado);
        
        document.getElementById('info-dia-entrenamiento').textContent = 
            `Semana ${this.entrenamientoActual.semana}, Día ${this.entrenamientoActual.dia}: ${this.entrenamientoActual.nombreDia}`;

        this.cargarEjerciciosPorDia(this.entrenamientoActual.dia);
        this.renderizarEjercicios();
    }

    cargarEjerciciosPorDia(dia) {
        const ejerciciosPorDia = {
            1: [
                {
                    id: 1,
                    nombre: "Press de Banca",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Press+Banca",
                    musculos: "Pectorales",
                    equipo: "Barra",
                    descanso: 90,
                    descripcion: "Ejercicio básico para el desarrollo del pectoral. Acostado en un banco plano, bajar la barra al pecho y empujar hacia arriba manteniendo la espalda apoyada.",
                    series: [
                        { numero: 1, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 4, reps: "8-10", completada: false, peso: "", repsRealizadas: "" }
                    ],
                    notas: "Mantener los codos a 45° y no arquear excesivamente la espalda baja."
                },
                {
                    id: 2,
                    nombre: "Fondos en Paralelas",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Fondos",
                    musculos: "Tríceps/Pecho",
                    equipo: "Peso Corporal",
                    descanso: 60,
                    descripcion: "Ejercicio para tríceps y pectoral inferior. Mantener el torso inclinado ligeramente hacia adelante para mayor énfasis en pectoral.",
                    series: [
                        { numero: 1, reps: "10-12", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "10-12", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "10-12", completada: false, peso: "", repsRealizadas: "" }
                    ]
                },
                {
                    id: 3,
                    nombre: "Press Inclinado con Mancuernas",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Press+Inclinado",
                    musculos: "Pectorales Superiores",
                    equipo: "Mancuernas",
                    descanso: 75,
                    descripcion: "Ejercicio para desarrollar la parte superior del pectoral. En un banco inclinado, levantar las mancuernas hasta extender los brazos completamente.",
                    series: [
                        { numero: 1, reps: "10-12", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "10-12", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "8-10", completada: false, peso: "", repsRealizadas: "" }
                    ],
                    notas: "Mantener las palmas mirando hacia adelante y no bloquear los codos en la posición superior."
                },
                {
                    id: 4,
                    nombre: "Aperturas con Mancuernas",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Aperturas",
                    musculos: "Pectorales",
                    equipo: "Mancuernas",
                    descanso: 60,
                    descripcion: "Ejercicio de aislamiento para el pectoral. En un banco plano, brazos extendidos, abrir y cerrar los brazos manteniendo una ligera flexión en los codos.",
                    series: [
                        { numero: 1, reps: "12-15", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "12-15", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "12-15", completada: false, peso: "", repsRealizadas: "" }
                    ],
                    notas: "Controlar el movimiento en ambas fases, especialmente durante la bajada."
                },
                {
                    id: 5,
                    nombre: "Press Declinado con Barra",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Press+Declinado",
                    musculos: "Pectorales Inferiores",
                    equipo: "Barra",
                    descanso: 75,
                    descripcion: "Ejercicio para desarrollar la parte inferior del pectoral. En un banco declinado, bajar la barra al pecho y empujar hacia arriba.",
                    series: [
                        { numero: 1, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "8-10", completada: false, peso: "", repsRealizadas: "" }
                    ],
                    notas: "Asegurar que los pies estén bien apoyados y la barra esté controlada en todo momento."
                }
            ],
            2: [
                {
                    id: 6,
                    nombre: "Dominadas",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Dominadas",
                    musculos: "Espalda",
                    equipo: "Peso Corporal",
                    descanso: 90,
                    descripcion: "Ejercicio fundamental para el desarrollo de la espalda. Colgarse de una barra y elevar el cuerpo hasta que la barbilla supere la barra.",
                    series: [
                        { numero: 1, reps: "6-8", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "6-8", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "6-8", completada: false, peso: "", repsRealizadas: "" }
                    ]
                },
                {
                    id: 7,
                    nombre: "Remo con Barra",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Remo+Barra",
                    musculos: "Espalda Media",
                    equipo: "Barra",
                    descanso: 75,
                    descripcion: "Ejercicio para desarrollar el grosor de la espalda. Inclinado hacia adelante, tirar de la barra hacia el abdomen manteniendo la espalda recta.",
                    series: [
                        { numero: 1, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "8-10", completada: false, peso: "", repsRealizadas: "" }
                    ]
                }
            ],
            3: [
                {
                    id: 8,
                    nombre: "Sentadillas",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Sentadillas",
                    musculos: "Piernas",
                    equipo: "Barra",
                    descanso: 90,
                    descripcion: "Ejercicio fundamental para el desarrollo de piernas. Colocar la barra sobre los hombros y flexionar rodillas hasta que los muslos estén paralelos al suelo.",
                    series: [
                        { numero: 1, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "8-10", completada: false, peso: "", repsRealizadas: "" }
                    ]
                }
            ],
            4: [
                {
                    id: 9,
                    nombre: "Press Militar",
                    imagen: "https://via.placeholder.com/80/32CD32/FFFFFF?text=Press+Militar",
                    musculos: "Hombros",
                    equipo: "Barra",
                    descanso: 75,
                    descripcion: "Ejercicio para desarrollar los hombros. De pie o sentado, levantar la barra desde los hombros hasta arriba de la cabeza.",
                    series: [
                        { numero: 1, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 2, reps: "8-10", completada: false, peso: "", repsRealizadas: "" },
                        { numero: 3, reps: "8-10", completada: false, peso: "", repsRealizadas: "" }
                    ]
                }
            ]
        };

        this.ejercicios = ejerciciosPorDia[dia] || [];
        console.log(`Cargados ${this.ejercicios.length} ejercicios para el día ${dia}`);
    }

    renderizarEjercicios() {
        const contenedor = document.getElementById('carrusel-interno');
        const indicadores = document.getElementById('indicadores-carrusel');
        contenedor.innerHTML = '';
        indicadores.innerHTML = '';

        console.log('Renderizando ejercicios:', this.ejercicios);

        this.ejercicios.forEach((ejercicio, index) => {
            const ejercicioElement = document.createElement('div');
            ejercicioElement.className = `slide-ejercicio ${index === 0 ? 'activo' : ''}`;
            ejercicioElement.id = `ejercicio-${ejercicio.id}`;
            ejercicioElement.dataset.indice = index;
            
            ejercicioElement.innerHTML = `
                <div class="ejercicio-entrenamiento tarjeta">
                    <div class="cabecera-ejercicio">
                        <img src="${ejercicio.imagen}" alt="${ejercicio.nombre}" class="imagen-ejercicio">
                        <div class="info-ejercicio">
                            <h3 class="nombre-ejercicio">${ejercicio.nombre}</h3>
                            <div class="meta-ejercicio">
                                <span><i class="fas fa-running"></i> ${ejercicio.musculos}</span>
                                <span><i class="fas fa-dumbbell"></i> ${ejercicio.equipo}</span>
                                <span><i class="fas fa-clock"></i> ${ejercicio.descanso}s descanso</span>
                            </div>
                        </div>
                    </div>
                    <p class="descripcion-ejercicio">${ejercicio.descripcion}</p>
                    <div class="configuracion-ejercicio">
                        <h4 class="titulo-configuracion">Configuración:</h4>
                        <div class="contenedor-series" id="series-${ejercicio.id}">
                            ${this.renderizarSeries(ejercicio)}
                        </div>
                    </div>
                    ${ejercicio.notas ? `
                        <div class="notas-ejercicio">
                            <div class="titulo-notas">Notas del entrenador:</div>
                            <div class="contenido-notas">${ejercicio.notas}</div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            contenedor.appendChild(ejercicioElement);
            console.log(`Ejercicio ${index} creado: ${ejercicio.nombre}`);
            
            // Crear indicador para este ejercicio
            const indicador = document.createElement('div');
            indicador.className = `indicador-carrusel ${index === 0 ? 'activo' : ''}`;
            indicador.dataset.indice = index;
            indicador.addEventListener('click', () => {
                this.cambiarEjercicio(index);
            });
            indicadores.appendChild(indicador);
        });

        this.configurarEventosSeries();
        this.actualizarContadores();
        this.actualizarControlesCarrusel();
    }

    renderizarSeries(ejercicio) {
        return ejercicio.series.map(serie => `
            <div class="tarjeta-serie ${serie.completada ? 'completada' : ''}" id="serie-${ejercicio.id}-${serie.numero}">
                <div class="info-serie">
                    <div class="numero-serie">Serie ${serie.numero}</div>
                    <div class="detalles-serie">${serie.reps} reps</div>
                </div>
                <div class="inputs-serie">
                    <input type="number" class="input-entrenamiento" id="peso-${ejercicio.id}-${serie.numero}" 
                           placeholder="Peso (kg)" value="${serie.peso}" ${serie.completada ? 'disabled' : ''}>
                    <input type="number" class="input-entrenamiento" id="reps-${ejercicio.id}-${serie.numero}" 
                           placeholder="Reps" value="${serie.repsRealizadas}" ${serie.completada ? 'disabled' : ''}>
                    <button class="btn-confirmar-serie" id="btn-confirmar-${ejercicio.id}-${serie.numero}" 
                            ${serie.completada ? 'disabled' : ''}>
                        ${serie.completada ? '<i class="fas fa-check"></i>' : 'Confirmar'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    configurarEventos() {
        document.getElementById('btn-pausar-entrenamiento').addEventListener('click', () => {
            this.togglePausa();
        });

        document.getElementById('btn-terminar-entrenamiento').addEventListener('click', () => {
            this.terminarEntrenamiento();
        });

        document.getElementById('btn-anterior').addEventListener('click', () => {
            this.ejercicioAnterior();
        });

        document.getElementById('btn-siguiente').addEventListener('click', () => {
            this.ejercicioSiguiente();
        });

        this.configurarEventosSeries();
    }

    configurarEventosSeries() {
        this.ejercicios.forEach(ejercicio => {
            ejercicio.series.forEach(serie => {
                const btnConfirmar = document.getElementById(`btn-confirmar-${ejercicio.id}-${serie.numero}`);
                if (btnConfirmar && !serie.completada) {
                    btnConfirmar.addEventListener('click', () => {
                        this.confirmarSerie(ejercicio.id, serie.numero);
                    });
                }
            });
        });
    }

    cambiarEjercicio(indice) {
        console.log(`Cambiando al ejercicio ${indice + 1}: ${this.ejercicios[indice].nombre}`);
        
        // Ocultar ejercicio actual
        document.querySelectorAll('.slide-ejercicio').forEach(slide => {
            slide.classList.remove('activo');
        });
        
        // Mostrar nuevo ejercicio
        const nuevoEjercicio = document.getElementById(`ejercicio-${this.ejercicios[indice].id}`);
        if (nuevoEjercicio) {
            nuevoEjercicio.classList.add('activo');
        } else {
            console.error(`No se encontró el ejercicio con ID: ejercicio-${this.ejercicios[indice].id}`);
        }
        
        // Actualizar indicadores
        document.querySelectorAll('.indicador-carrusel').forEach((indicador, i) => {
            indicador.classList.toggle('activo', i === indice);
        });
        
        this.indiceEjercicioActual = indice;
        this.actualizarControlesCarrusel();
        this.actualizarContadores();
    }

    ejercicioAnterior() {
        if (this.indiceEjercicioActual > 0) {
            this.cambiarEjercicio(this.indiceEjercicioActual - 1);
        }
    }

    ejercicioSiguiente() {
        if (this.indiceEjercicioActual < this.ejercicios.length - 1) {
            this.cambiarEjercicio(this.indiceEjercicioActual + 1);
        }
    }

    actualizarControlesCarrusel() {
        const btnAnterior = document.getElementById('btn-anterior');
        const btnSiguiente = document.getElementById('btn-siguiente');
        
        btnAnterior.disabled = this.indiceEjercicioActual === 0;
        btnSiguiente.disabled = this.indiceEjercicioActual === this.ejercicios.length - 1;
        
        console.log(`Controles: anterior=${!btnAnterior.disabled}, siguiente=${!btnSiguiente.disabled}`);
    }

    confirmarSerie(ejercicioId, numeroSerie) {
        const ejercicio = this.ejercicios.find(e => e.id === ejercicioId);
        const serie = ejercicio.series.find(s => s.numero === numeroSerie);
        
        const pesoInput = document.getElementById(`peso-${ejercicioId}-${numeroSerie}`);
        const repsInput = document.getElementById(`reps-${ejercicioId}-${numeroSerie}`);
        
        const peso = pesoInput.value;
        const repsRealizadas = repsInput.value;
        
        if (!peso || !repsRealizadas) {
            alert('Por favor, ingresa tanto el peso como las repeticiones realizadas.');
            return;
        }
        
        serie.completada = true;
        serie.peso = peso;
        serie.repsRealizadas = repsRealizadas;
        
        const serieElement = document.getElementById(`serie-${ejercicioId}-${numeroSerie}`);
        serieElement.classList.add('completada');
        
        pesoInput.disabled = true;
        repsInput.disabled = true;
        
        const btnConfirmar = document.getElementById(`btn-confirmar-${ejercicioId}-${numeroSerie}`);
        btnConfirmar.innerHTML = '<i class="fas fa-check"></i>';
        btnConfirmar.disabled = true;
        
        this.seriesCompletadas.push({
            ejercicioId: ejercicioId,
            serieNumero: numeroSerie,
            peso: peso,
            reps: repsRealizadas,
            timestamp: new Date().toISOString()
        });
        
        this.actualizarContadores();
        
        if (!this.esUltimaSerie(ejercicioId, numeroSerie)) {
            this.iniciarTemporizadorDescanso(ejercicio.descanso);
        } else {
            this.marcarEjercicioCompletado(ejercicioId);
        }
    }

    esUltimaSerie(ejercicioId, numeroSerie) {
        const ejercicio = this.ejercicios.find(e => e.id === ejercicioId);
        const ultimaSerie = ejercicio.series[ejercicio.series.length - 1];
        return numeroSerie === ultimaSerie.numero;
    }

    marcarEjercicioCompletado(ejercicioId) {
        const ejercicioElement = document.getElementById(`ejercicio-${ejercicioId}`);
        ejercicioElement.classList.add('completado');
        
        // Si este ejercicio está completado, pasar al siguiente si existe
        const ejercicioIndex = this.ejercicios.findIndex(e => e.id === ejercicioId);
        if (ejercicioIndex < this.ejercicios.length - 1) {
            this.cambiarEjercicio(ejercicioIndex + 1);
        }
        
        this.actualizarContadores();
    }

    iniciarTemporizadorDescanso(segundos) {
        this.tiempoDescanso = segundos;
        const temporizadorElement = document.getElementById('temporizador-descanso');
        const tiempoRestanteElement = document.getElementById('tiempo-restante');
        
        temporizadorElement.classList.add('activo');
        
        let tiempoRestante = segundos;
        this.actualizarTiempoRestante(tiempoRestante, tiempoRestanteElement);
        
        this.temporizadorDescanso = setInterval(() => {
            tiempoRestante--;
            this.actualizarTiempoRestante(tiempoRestante, tiempoRestanteElement);
            
            if (tiempoRestante <= 0) {
                clearInterval(this.temporizadorDescanso);
                temporizadorElement.classList.remove('activo');
                this.mostrarNotificacion('¡Tiempo de descanso terminado!');
            }
        }, 1000);
    }

    actualizarTiempoRestante(segundos, elemento) {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        elemento.textContent = `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }

    iniciarTemporizadorGeneral() {
        this.tiempoInicio = new Date();
        
        this.tiempoTranscurridoInterval = setInterval(() => {
            const ahora = new Date();
            const diferencia = Math.floor((ahora - this.tiempoInicio) / 1000);
            
            const minutos = Math.floor(diferencia / 60);
            const segundos = diferencia % 60;
            
            document.getElementById('tiempo-transcurrido').textContent = 
                `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }, 1000);
    }

    actualizarContadores() {
        const totalSeries = this.ejercicios.reduce((total, ejercicio) => total + ejercicio.series.length, 0);
        const seriesCompletadas = this.ejercicios.reduce((total, ejercicio) => 
            total + ejercicio.series.filter(s => s.completada).length, 0);
        
        const ejerciciosCompletados = this.ejercicios.filter(ejercicio => 
            ejercicio.series.every(s => s.completada)).length;
        const totalEjercicios = this.ejercicios.length;
        
        document.getElementById('contador-series').textContent = `${seriesCompletadas}/${totalSeries}`;
        document.getElementById('contador-ejercicios').textContent = `${this.indiceEjercicioActual + 1}/${totalEjercicios}`;
    }

    togglePausa() {
        const btnPausar = document.getElementById('btn-pausar-entrenamiento');
        
        if (this.temporizadorActivo) {
            this.temporizadorActivo = false;
            btnPausar.innerHTML = '<i class="fas fa-pause"></i> Pausar';
            this.iniciarTemporizadorGeneral();
        } else {
            this.temporizadorActivo = true;
            btnPausar.innerHTML = '<i class="fas fa-play"></i> Reanudar';
            clearInterval(this.tiempoTranscurridoInterval);
        }
    }

    mostrarNotificacion(mensaje) {
        const notificacion = document.getElementById('notificacion');
        notificacion.textContent = mensaje;
        notificacion.classList.add('activa');
        
        setTimeout(() => {
            notificacion.classList.remove('activa');
        }, 3000);
    }

    terminarEntrenamiento() {
        const confirmar = confirm('¿Estás seguro de que quieres terminar el entrenamiento?');
        if (!confirmar) return;

        const registro = {
            semana: this.entrenamientoActual.semana,
            dia: this.entrenamientoActual.dia,
            fecha: new Date().toISOString().split('T')[0],
            duracion: document.getElementById('tiempo-transcurrido').textContent,
            seriesCompletadas: this.seriesCompletadas,
            completado: true
        };
        
        const registrosExistentes = JSON.parse(localStorage.getItem('registrosEntrenamiento') || '[]');
        registrosExistentes.push(registro);
        localStorage.setItem('registrosEntrenamiento', JSON.stringify(registrosExistentes));
        
        localStorage.removeItem('entrenamientoActual');
        
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EntrenamientoEnCurso();
});