// =============================================================================
// LÓGICA ESENCIAL - SE MANTENDRÁ AL CONECTAR CON BD REAL
// =============================================================================

class GestorProgreso {
    constructor() {
        this.registros = this.obtenerRegistros();
        this.ejercicios = this.obtenerEjercicios();
        this.ejercicioSeleccionado = null;
        this.grafico = null;
        
        this.inicializar();
    }

    inicializar() {
        this.configurarEventos();
        this.cargarSelectorEjercicios();
    }

    configurarEventos() {
        document.getElementById('btn-volver').addEventListener('click', () => {
            window.history.back();
        });

        document.getElementById('select-ejercicio').addEventListener('change', (e) => {
            this.ejercicioSeleccionado = parseInt(e.target.value);
            this.mostrarProgresoEjercicio();
        });
    }

    cargarSelectorEjercicios() {
        const select = document.getElementById('select-ejercicio');
        select.innerHTML = '<option value="">-- Elegir ejercicio --</option>';

        this.ejercicios.forEach(ejercicio => {
            const option = document.createElement('option');
            option.value = ejercicio.id;
            option.textContent = ejercicio.nombre;
            select.appendChild(option);
        });
    }

    mostrarProgresoEjercicio() {
        if (!this.ejercicioSeleccionado) {
            this.limpiarVista();
            return;
        }

        const datosEjercicio = this.obtenerDatosProgreso(this.ejercicioSeleccionado);
        this.actualizarResumen(datosEjercicio);
        this.renderizarGrafico(datosEjercicio);
        this.renderizarHistorial(datosEjercicio);
    }

    obtenerDatosProgreso(ejercicioId) {
        const registrosEjercicio = this.registros.filter(registro => 
            registro.seriesCompletadas.some(serie => serie.ejercicioId === ejercicioId)
        );

        // Agrupar por semana
        const datosPorSemana = {};
        
        registrosEjercicio.forEach(registro => {
            const semana = registro.semana;
            if (!datosPorSemana[semana]) {
                datosPorSemana[semana] = {
                    semana: semana,
                    fecha: registro.fecha,
                    series: []
                };
            }

            // Filtrar series del ejercicio específico
            const seriesEjercicio = registro.seriesCompletadas.filter(
                serie => serie.ejercicioId === ejercicioId
            );

            datosPorSemana[semana].series.push(...seriesEjercicio);
        });

        return Object.values(datosPorSemana).sort((a, b) => a.semana - b.semana);
    }

    actualizarResumen(datosEjercicio) {
        if (datosEjercicio.length === 0) {
            document.getElementById('mejor-peso').textContent = '-';
            document.getElementById('mejor-10rm').textContent = '-';
            document.getElementById('total-sesiones').textContent = '0';
            document.getElementById('progreso-peso').textContent = '0%';
            return;
        }

        // Calcular mejor peso y mejor 10RM
        let mejorPeso = 0;
        let mejor10RM = 0;

        datosEjercicio.forEach(semana => {
            semana.series.forEach(serie => {
                const peso = parseFloat(serie.peso);
                const reps = parseInt(serie.reps);
                const rm10 = this.calcular10RM(peso, reps);

                if (peso > mejorPeso) mejorPeso = peso;
                if (rm10 > mejor10RM) mejor10RM = rm10;
            });
        });

        // Calcular progreso
        const primeraSemana = datosEjercicio[0];
        const ultimaSemana = datosEjercicio[datosEjercicio.length - 1];
        
        let pesoInicial = 0;
        let pesoFinal = 0;

        primeraSemana.series.forEach(serie => {
            const peso = parseFloat(serie.peso);
            if (peso > pesoInicial) pesoInicial = peso;
        });

        ultimaSemana.series.forEach(serie => {
            const peso = parseFloat(serie.peso);
            if (peso > pesoFinal) pesoFinal = peso;
        });

        const progreso = pesoInicial > 0 ? ((pesoFinal - pesoInicial) / pesoInicial * 100) : 0;

        // Actualizar UI
        document.getElementById('mejor-peso').textContent = `${mejorPeso}kg`;
        document.getElementById('mejor-10rm').textContent = `${Math.round(mejor10RM)}kg`;
        document.getElementById('total-sesiones').textContent = datosEjercicio.length;
        document.getElementById('progreso-peso').textContent = `${progreso > 0 ? '+' : ''}${Math.round(progreso)}%`;
    }

    calcular10RM(peso, repeticiones) {
        // Fórmula de Epley para calcular 1RM: 1RM = peso * (1 + repeticiones/30)
        const oneRM = peso * (1 + repeticiones / 30);
        // Calcular 10RM: 10RM = 1RM / (1 + 10/30)
        const tenRM = oneRM / (1 + 10 / 30);
        return Math.round(tenRM * 10) / 10; // Redondear a 1 decimal
    }

    renderizarGrafico(datosEjercicio) {
        const ctx = document.getElementById('grafico-progreso').getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (this.grafico) {
            this.grafico.destroy();
        }

        if (datosEjercicio.length === 0) {
            document.getElementById('contenedor-grafico').innerHTML = 
                '<div class="estado-vacio"><i class="fas fa-chart-line"></i><p>No hay datos para mostrar</p></div>';
            return;
        }

        // Preparar datos para el gráfico
        const semanas = datosEjercicio.map(d => `Semana ${d.semana}`);
        const pesos10RM = datosEjercicio.map(semana => {
            // Calcular el mejor 10RM de la semana
            let mejorRM = 0;
            semana.series.forEach(serie => {
                const rm = this.calcular10RM(parseFloat(serie.peso), parseInt(serie.reps));
                if (rm > mejorRM) mejorRM = rm;
            });
            return mejorRM;
        });

        this.grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: semanas,
                datasets: [{
                    label: '10RM Calculado (kg)',
                    data: pesos10RM,
                    borderColor: '#32CD32',
                    backgroundColor: 'rgba(50, 205, 50, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#32CD32',
                    pointBorderColor: '#000',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Peso (kg)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderizarHistorial(datosEjercicio) {
        const contenedor = document.getElementById('contenedor-historial');
        
        if (datosEjercicio.length === 0) {
            contenedor.innerHTML = 
                '<div class="estado-vacio"><i class="fas fa-history"></i><p>No hay historial para este ejercicio</p></div>';
            return;
        }

        let html = '';
        
        datosEjercicio.forEach(semana => {
            // Calcular mejor 10RM de la semana
            let mejorRM = 0;
            let mejorPeso = 0;
            let mejorReps = 0;

            semana.series.forEach(serie => {
                const peso = parseFloat(serie.peso);
                const reps = parseInt(serie.reps);
                const rm = this.calcular10RM(peso, reps);
                
                if (rm > mejorRM) {
                    mejorRM = rm;
                    mejorPeso = peso;
                    mejorReps = reps;
                }
            });

            html += `
                <div class="semana-progreso">
                    <div class="cabecera-semana">
                        <div class="titulo-semana">Semana ${semana.semana}</div>
                        <div class="fecha-semana">${semana.fecha}</div>
                    </div>
                    
                    <div class="series-semana">
                        ${semana.series.map(serie => `
                            <div class="serie-progreso">
                                <div class="numero-serie">Serie ${serie.serieNumero}</div>
                                <div class="datos-serie">${serie.peso}kg × ${serie.reps} reps</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="calculo-rm">
                        <div class="titulo-rm">Mejor 10RM de la semana:</div>
                        <div class="valor-rm">${mejorRM}kg (calculado de ${mejorPeso}kg × ${mejorReps} reps)</div>
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = html;
    }

    limpiarVista() {
        document.getElementById('mejor-peso').textContent = '-';
        document.getElementById('mejor-10rm').textContent = '-';
        document.getElementById('total-sesiones').textContent = '0';
        document.getElementById('progreso-peso').textContent = '0%';
        
        document.getElementById('contenedor-grafico').innerHTML = 
            '<div class="estado-vacio"><i class="fas fa-chart-line"></i><p>Selecciona un ejercicio para ver el progreso</p></div>';
        
        document.getElementById('contenedor-historial').innerHTML = 
            '<div class="estado-vacio"><i class="fas fa-history"></i><p>Selecciona un ejercicio para ver el historial</p></div>';

        if (this.grafico) {
            this.grafico.destroy();
            this.grafico = null;
        }
    }

    // =============================================================================
    // MÉTODOS DE DATOS - SE REEMPLAZARÁN CON CONEXIÓN A BD REAL
    // =============================================================================

    obtenerRegistros() {
        // Datos de ejemplo - en producción vendrían de una API/BD
        return JSON.parse(localStorage.getItem('registrosEntrenamiento') || '[]');
    }

    obtenerEjercicios() {
        // Ejercicios de ejemplo - en producción vendrían de una API/BD
        return [
            { id: 1, nombre: "Press de Banca" },
            { id: 2, nombre: "Fondos en Paralelas" },
            { id: 3, nombre: "Press Inclinado con Mancuernas" },
            { id: 4, nombre: "Aperturas con Mancuernas" },
            { id: 5, nombre: "Press Declinado con Barra" },
            { id: 6, nombre: "Dominadas" },
            { id: 7, nombre: "Remo con Barra" },
            { id: 8, nombre: "Sentadillas" },
            { id: 9, nombre: "Press Militar" }
        ];
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    new GestorProgreso();
});