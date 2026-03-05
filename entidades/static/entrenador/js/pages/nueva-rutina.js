// nueva-rutina.js — Usa la API real del backend

const RutinaBuilder = {
    rutinaId: null,       // ID de la rutina ya guardada (modo edición)
    diasData: {},         // { 1: { dayRutineId: null, ejercicios: [] }, ... }
    diaActual: 1,
    ejerciciosDisponibles: [],

    async init() {
        this.bindFormDays();
        this.bindGuardar();
        await this.cargarEjercicios();

        // Modo edición: si la URL tiene ?id=X o el template pasa el id
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            this.rutinaId = id;
            await this.cargarRutinaExistente(id);
        }
    },

    // ─── CARGAR EJERCICIOS DESDE LA API ───────────────────────────────────────

    async cargarEjercicios() {
        try {
            const res = await fetch('/entrenador/api/ejercicios/?active_only=true');
            const data = await res.json();
            this.ejerciciosDisponibles = data.results || data;
        } catch (e) {
            console.error('Error cargando ejercicios:', e);
        }
    },

    // ─── DÍAS ─────────────────────────────────────────────────────────────────

    bindFormDays() {
        const select = document.getElementById('id_days_per_week');
        if (select) {
            select.addEventListener('change', () => {
                this.generarDias(parseInt(select.value) || 0);
            });
        }
    },

    generarDias(cantidad) {
        const container = document.getElementById('dias-container');
        if (!container) return;

        // Preservar ejercicios ya cargados
        const diasPrevios = { ...this.diasData };
        this.diasData = {};
        container.innerHTML = '';

        if (cantidad === 0) return;

        // Tabs
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'dias-tabs';

        for (let i = 1; i <= cantidad; i++) {
            this.diasData[i] = diasPrevios[i] || { dayRutineId: null, ejercicios: [] };

            // Tab
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'dia-tab' + (i === 1 ? ' active' : '');
            tab.textContent = `Día ${i}`;
            tab.dataset.dia = i;
            tab.addEventListener('click', () => this.switchDia(i));
            tabsDiv.appendChild(tab);

            // Panel
            const panel = document.createElement('div');
            panel.className = 'dia-panel' + (i === 1 ? ' active' : '');
            panel.id = `dia-panel-${i}`;
            panel.innerHTML = `
                <div class="dia-header">
                    <h4>Día ${i}</h4>
                    <button type="button" class="btn-agregar-ejercicio" onclick="RutinaBuilder.abrirModal(${i})">
                        + Agregar ejercicio
                    </button>
                </div>
                <div class="ejercicios-lista" id="ejercicios-dia-${i}">
                    <p class="empty-msg">No hay ejercicios agregados.</p>
                </div>
            `;
            container.appendChild(tabsDiv);
            container.appendChild(panel);
        }

        // Fix: el tabsDiv se agrega dentro del loop, lo corregimos
        container.innerHTML = '';
        container.appendChild(tabsDiv);
        for (let i = 1; i <= cantidad; i++) {
            const panel = document.getElementById(`dia-panel-${i}`) || this._crearPanel(i, cantidad);
            container.appendChild(panel);
        }

        this.switchDia(1);
        this.renderTodosLosDias();
    },

    _crearPanel(i, cantidad) {
        const panel = document.createElement('div');
        panel.className = 'dia-panel' + (i === 1 ? ' active' : '');
        panel.id = `dia-panel-${i}`;
        panel.innerHTML = `
            <div class="dia-header">
                <h4>Día ${i}</h4>
                <button type="button" class="btn-agregar-ejercicio" onclick="RutinaBuilder.abrirModal(${i})">
                    + Agregar ejercicio
                </button>
            </div>
            <div class="ejercicios-lista" id="ejercicios-dia-${i}">
                <p class="empty-msg">No hay ejercicios agregados.</p>
            </div>
        `;
        return panel;
    },

    switchDia(dia) {
        this.diaActual = dia;
        document.querySelectorAll('.dia-tab').forEach(t => {
            t.classList.toggle('active', parseInt(t.dataset.dia) === dia);
        });
        document.querySelectorAll('.dia-panel').forEach(p => {
            p.classList.toggle('active', p.id === `dia-panel-${dia}`);
        });
    },

    renderTodosLosDias() {
        Object.keys(this.diasData).forEach(dia => {
            this.renderDia(parseInt(dia));
        });
    },

    renderDia(dia) {
        const lista = document.getElementById(`ejercicios-dia-${dia}`);
        if (!lista) return;

        const ejercicios = this.diasData[dia]?.ejercicios || [];

        if (ejercicios.length === 0) {
            lista.innerHTML = '<p class="empty-msg">No hay ejercicios agregados.</p>';
            return;
        }

        lista.innerHTML = ejercicios.map((ej, idx) => `
            <div class="ejercicio-row">
                <div class="ejercicio-info">
                    <span class="ejercicio-nombre">${ej.nombre}</span>
                    <span class="ejercicio-grupo">${ej.grupoMuscular || ''}</span>
                </div>
                <div class="ejercicio-config">
                    <label>Series
                        <input type="number" min="1" max="10" value="${ej.series}"
                            onchange="RutinaBuilder.actualizarConfig(${dia}, ${idx}, 'series', this.value)">
                    </label>
                    <label>Repeticiones
                        <input type="text" value="${ej.repeticiones}" placeholder="ej: 8-12"
                            onchange="RutinaBuilder.actualizarConfig(${dia}, ${idx}, 'repeticiones', this.value)">
                    </label>
                    <label>Tipo de serie
                        <select onchange="RutinaBuilder.actualizarConfig(${dia}, ${idx}, 'tipo_serie', this.value)">
                            <option value="normal" ${ej.tipo_serie === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="drop_set" ${ej.tipo_serie === 'drop_set' ? 'selected' : ''}>Drop Set</option>
                            <option value="superset" ${ej.tipo_serie === 'superset' ? 'selected' : ''}>Superset</option>
                            <option value="giant_set" ${ej.tipo_serie === 'giant_set' ? 'selected' : ''}>Giant Set</option>
                        </select>
                    </label>
                </div>
                <button type="button" class="btn-quitar" onclick="RutinaBuilder.quitarEjercicio(${dia}, ${idx})">✕</button>
            </div>
        `).join('');
    },

    actualizarConfig(dia, idx, campo, valor) {
        if (this.diasData[dia]?.ejercicios[idx]) {
            this.diasData[dia].ejercicios[idx][campo] = campo === 'series' ? parseInt(valor) : valor;
        }
    },

    quitarEjercicio(dia, idx) {
        this.diasData[dia].ejercicios.splice(idx, 1);
        this.renderDia(dia);
    },

    // ─── MODAL DE EJERCICIOS ──────────────────────────────────────────────────

    abrirModal(dia) {
        this.diaActual = dia;
        const modal = document.getElementById('modal-ejercicios');
        if (!modal) return;

        this.renderGridEjercicios('');
        document.getElementById('buscador-ejercicio').value = '';
        modal.style.display = 'flex';
    },

    cerrarModal() {
        const modal = document.getElementById('modal-ejercicios');
        if (modal) modal.style.display = 'none';
    },

    renderGridEjercicios(filtro) {
        const grid = document.getElementById('grid-ejercicios');
        if (!grid) return;

        const filtrados = this.ejerciciosDisponibles.filter(e =>
            e.name.toLowerCase().includes(filtro.toLowerCase())
        );

        if (filtrados.length === 0) {
            grid.innerHTML = '<p class="empty-msg">No se encontraron ejercicios.</p>';
            return;
        }

        grid.innerHTML = filtrados.map(e => `
            <div class="ejercicio-card" onclick="RutinaBuilder.agregarEjercicio(${e.id}, '${e.name.replace(/'/g, "\\'")}', '${e.muscle_group_name || ''}')">
                <div class="ejercicio-card-nombre">${e.name}</div>
                <div class="ejercicio-card-grupo">${e.muscle_group_name || 'Sin grupo'}</div>
                <div class="ejercicio-card-dificultad">${e.difficulty_display || e.difficulty}</div>
            </div>
        `).join('');
    },

    agregarEjercicio(id, nombre, grupoMuscular) {
        const dia = this.diaActual;
        const yaExiste = this.diasData[dia]?.ejercicios.find(e => e.ejercicioId === id);
        if (yaExiste) {
            alert(`"${nombre}" ya está en el Día ${dia}.`);
            return;
        }

        this.diasData[dia].ejercicios.push({
            ejercicioId: id,
            nombre,
            grupoMuscular,
            series: 3,
            repeticiones: '8-12',
            tipo_serie: 'normal'
        });

        this.renderDia(dia);
        this.cerrarModal();
    },

    // ─── GUARDAR TODO ─────────────────────────────────────────────────────────

    bindGuardar() {
        const btn = document.getElementById('btn-guardar-rutina');
        if (btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.guardar();
            });
        }
    },

    async guardar() {
        const nombre = document.getElementById('id_name')?.value?.trim();
        const diasSemana = document.getElementById('id_days_per_week')?.value;

        if (!nombre) {
            alert('El nombre de la rutina es obligatorio.');
            return;
        }

        const btn = document.getElementById('btn-guardar-rutina');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            // 1. Crear o actualizar la Rutina
            const rutinaPayload = {
                name: nombre,
                description: document.getElementById('id_description')?.value || '',
                time_week: parseInt(diasSemana) || 0,
                days_per_week: parseInt(diasSemana) || 0,
                goal: document.getElementById('id_goal')?.value || '',
                coach: document.getElementById('id_coach')?.value || null,
                client: document.getElementById('id_client')?.value || null,
                is_template: document.getElementById('id_is_template')?.checked || false,
            };

            let rutinaRes;
            if (this.rutinaId) {
                rutinaRes = await fetch(`/entrenador/api/rutinas/${this.rutinaId}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': this.getCsrf() },
                    body: JSON.stringify(rutinaPayload)
                });
            } else {
                rutinaRes = await fetch('/entrenador/api/rutinas/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': this.getCsrf() },
                    body: JSON.stringify(rutinaPayload)
                });
            }

            if (!rutinaRes.ok) {
                const err = await rutinaRes.json();
                throw new Error(JSON.stringify(err));
            }

            const rutina = await rutinaRes.json();
            this.rutinaId = rutina.id;

            // 2. Crear DayRutine + ExerciseRutine por cada día
            for (const [diaNum, diaData] of Object.entries(this.diasData)) {
                let dayRutineId = diaData.dayRutineId;

                if (!dayRutineId) {
                    const dayRes = await fetch('/entrenador/api/dias-rutina/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': this.getCsrf() },
                        body: JSON.stringify({
                            name: `Día ${diaNum}`,
                            description: '',
                            order: diaNum,
                            rutine: this.rutinaId
                        })
                    });

                    if (!dayRes.ok) throw new Error('Error creando día ' + diaNum);
                    const dayData2 = await dayRes.json();
                    dayRutineId = dayData2.id;
                    this.diasData[diaNum].dayRutineId = dayRutineId;
                }

                // 3. Crear ExerciseRutine por cada ejercicio del día
                for (const ej of diaData.ejercicios) {
                    if (ej.exerciseRutineId) continue; // ya guardado

                    const ejRes = await fetch('/entrenador/api/ejercicios-rutina/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': this.getCsrf() },
                        body: JSON.stringify({
                            series: String(ej.series),
                            repetitions: String(ej.repeticiones),
                            type_serie: ej.tipo_serie,
                            dia_rutine: dayRutineId,
                            exercise: ej.ejercicioId
                        })
                    });

                    if (!ejRes.ok) throw new Error('Error guardando ejercicio ' + ej.nombre);
                    const ejData = await ejRes.json();
                    ej.exerciseRutineId = ejData.id;
                }
            }

            alert('¡Rutina guardada correctamente!');
            window.location.href = '/entrenador/rutinas/';

        } catch (err) {
            console.error('Error guardando rutina:', err);
            alert('Hubo un error al guardar: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Rutina';
        }
    },

    // ─── MODO EDICIÓN ─────────────────────────────────────────────────────────

    async cargarRutinaExistente(id) {
        try {
            const [rutinaRes, diasRes] = await Promise.all([
                fetch(`/entrenador/api/rutinas/${id}/`),
                fetch(`/entrenador/api/dias-rutina/?rutine=${id}`)
            ]);
            const rutina = await rutinaRes.json();
            const dias = await diasRes.json();

            // Poblar campos del form
            if (document.getElementById('id_name')) document.getElementById('id_name').value = rutina.name;
            if (document.getElementById('id_description')) document.getElementById('id_description').value = rutina.description || '';
            if (document.getElementById('id_days_per_week')) document.getElementById('id_days_per_week').value = rutina.days_per_week;
            if (document.getElementById('id_goal')) document.getElementById('id_goal').value = rutina.goal || '';

            // Generar días
            this.generarDias(rutina.days_per_week);

            // Cargar ejercicios de cada día
            const diasList = dias.results || dias;
            for (const dia of diasList) {
                const ejRes = await fetch(`/entrenador/api/ejercicios-rutina/?dia_rutine=${dia.id}`);
                const ejercicios = await ejRes.json();
                const diaNum = parseInt(dia.order);

                if (!this.diasData[diaNum]) continue;
                this.diasData[diaNum].dayRutineId = dia.id;

                const ejList = ejercicios.results || ejercicios;
                for (const ej of ejList) {
                    const ejInfo = this.ejerciciosDisponibles.find(e => e.id === ej.exercise);
                    this.diasData[diaNum].ejercicios.push({
                        ejercicioId: ej.exercise,
                        nombre: ejInfo?.name || `Ejercicio ${ej.exercise}`,
                        grupoMuscular: ejInfo?.muscle_group_name || '',
                        series: parseInt(ej.series),
                        repeticiones: ej.repetitions,
                        tipo_serie: ej.type_serie,
                        exerciseRutineId: ej.id
                    });
                }
            }

            this.renderTodosLosDias();
        } catch (e) {
            console.error('Error cargando rutina:', e);
        }
    },

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    getCsrf() {
        return document.cookie.split(';')
            .find(c => c.trim().startsWith('csrftoken='))
            ?.split('=')[1] || '';
    }
};

// Buscador del modal
document.addEventListener('DOMContentLoaded', () => {
    RutinaBuilder.init();

    const buscador = document.getElementById('buscador-ejercicio');
    if (buscador) {
        buscador.addEventListener('input', (e) => {
            RutinaBuilder.renderGridEjercicios(e.target.value);
        });
    }

    const cerrarModal = document.getElementById('cerrar-modal-ejercicios');
    if (cerrarModal) {
        cerrarModal.addEventListener('click', () => RutinaBuilder.cerrarModal());
    }
});