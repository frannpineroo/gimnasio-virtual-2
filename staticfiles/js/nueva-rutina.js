document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('routine-form');
    const searchInput = document.getElementById('search-input');
    // Nuevo input para profesor (asumo que existe en el HTML)
    const searchProfessorInput = document.getElementById('search-profesor-input');

    let selectedClient = null;
    let selectedProfessor = null;
    let searchTimeout = null;
    let searchProfessorTimeout = null;

    // ------------ CONTENEDOR RESULTADOS CLIENTES ------------
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.className = 'search-results';
    searchResultsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        margin-top: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    // Insertar el contenedor después del input de búsqueda de cliente
    const searchContainer = searchInput.closest('.search');
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(searchResultsContainer);

    // ------------ CONTENEDOR RESULTADOS PROFESORES ------------
    const searchProfessorResultsContainer = document.createElement('div');
    searchProfessorResultsContainer.className = 'search-professor-results';
    searchProfessorResultsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        margin-top: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    // Insertar el contenedor después del input de búsqueda de profesor (si existe)
    if (searchProfessorInput) {
        const searchProfessorContainer = searchProfessorInput.closest('.search-profesor') || searchProfessorInput.parentElement;
        searchProfessorContainer.style.position = 'relative';
        searchProfessorContainer.appendChild(searchProfessorResultsContainer);
    }

    // ----------------- FUNCIÓN BUSCAR CLIENTES -----------------
    function searchClients(query) {
        if (!query || query.trim().length < 2) {
            searchResultsContainer.style.display = 'none';
            return;
        }

        fetch(`http://localhost:8000/api/clientes/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const queryLower = query.toLowerCase();
                const filteredClients = data.filter(client => {
                    const nombre = (client.nombre || client.name || '').toLowerCase();
                    const apellido = (client.apellido || client.last_name || '').toLowerCase();
                    const dni = (client.dni || '').toString();
                    const email = (client.email || '').toLowerCase();

                    return nombre.includes(queryLower) ||
                        apellido.includes(queryLower) ||
                        dni.includes(queryLower) ||
                        email.includes(queryLower) ||
                        `${nombre} ${apellido}`.includes(queryLower);
                });

                displaySearchResults(filteredClients);
            })
            .catch(error => {
                console.error('Error al buscar clientes:', error);
                searchResultsContainer.innerHTML = `
                    <div style="padding: 16px; text-align: center; color: #dc3545;">
                        Error al buscar clientes
                    </div>
                `;
                searchResultsContainer.style.display = 'block';
            });
    }

    // ----------------- FUNCIÓN MOSTRAR RESULTADOS CLIENTES -----------------
    function displaySearchResults(clients) {
        if (!clients || clients.length === 0) {
            searchResultsContainer.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #999;">
                    No se encontraron clientes
                </div>
            `;
            searchResultsContainer.style.display = 'block';
            return;
        }

        searchResultsContainer.innerHTML = clients.map(client => `
            <div class="search-result-item" data-client-id="${client.id}" style="
                padding: 12px 16px;
                border-bottom: 1px solid #333;
                cursor: pointer;
                transition: background-color 0.2s;
            ">
                <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">
                    ${client.nombre || client.name || ''} ${client.apellido || client.last_name || ''}
                </div>
                <div style="font-size: 14px; color: #999;">
                    DNI: ${client.dni || ''} ${client.email ? `• ${client.email}` : ''}
                </div>
            </div>
        `).join('');

        searchResultsContainer.style.display = 'block';

        // Agregar eventos a cada resultado
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('mouseenter', function () {
                this.style.backgroundColor = '#2a2a2a';
            });

            item.addEventListener('mouseleave', function () {
                this.style.backgroundColor = 'transparent';
            });

            item.addEventListener('click', function () {
                const clientId = this.dataset.clientId;
                const clientData = clients.find(c => c.id == clientId);
                selectClient(clientData);
            });
        });
    }

    // ----------------- SELECCIONAR CLIENTE -----------------
    function selectClient(client) {
        selectedClient = client;
        searchInput.value = `${client.nombre || client.name || ''} ${client.apellido || client.last_name || ''} (DNI: ${client.dni || ''})`;
        searchResultsContainer.style.display = 'none';

        // Cambiar el estilo del input para indicar que hay un cliente seleccionado
        searchInput.style.borderColor = '#32CD32';
        searchInput.style.backgroundColor = 'rgba(50, 205, 50, 0.1)';
    }

    // ----------------- FUNCIÓN BUSCAR PROFESORES -----------------
    // Estructura idéntica a buscar clientes, usa endpoint /api/profesores/
    function searchProfessors(query) {
        if (!searchProfessorInput) return; // si no existe input, no hacemos nada
        if (!query || query.trim().length < 2) {
            searchProfessorResultsContainer.style.display = 'none';
            return;
        }

        fetch(`http://localhost:8000/api/entrenadores/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const queryLower = query.toLowerCase();
                const filtered = data.filter(prof => {
                    const nombre = (prof.nombre || prof.name || '').toLowerCase();
                    const apellido = (prof.apellido || prof.last_name || '').toLowerCase();
                    const dni = (prof.dni || '').toString();
                    const email = (prof.email || '').toLowerCase();

                    return nombre.includes(queryLower) ||
                        apellido.includes(queryLower) ||
                        dni.includes(queryLower) ||
                        email.includes(queryLower) ||
                        `${nombre} ${apellido}`.includes(queryLower);
                });

                displayProfessorResults(filtered);
            })
            .catch(error => {
                console.error('Error al buscar profesores:', error);
                searchProfessorResultsContainer.innerHTML = `
                    <div style="padding: 16px; text-align: center; color: #dc3545;">
                        Error al buscar profesores
                    </div>
                `;
                searchProfessorResultsContainer.style.display = 'block';
            });
    }

    // ----------------- MOSTRAR RESULTADOS PROFESORES -----------------
    function displayProfessorResults(profs) {
        if (!profs || profs.length === 0) {
            searchProfessorResultsContainer.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #999;">
                    No se encontraron profesores
                </div>
            `;
            searchProfessorResultsContainer.style.display = 'block';
            return;
        }

        searchProfessorResultsContainer.innerHTML = profs.map(prof => `
            <div class="search-professor-item" data-prof-id="${prof.id}" style="
                padding: 12px 16px;
                border-bottom: 1px solid #333;
                cursor: pointer;
                transition: background-color 0.2s;
            ">
                <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">
                    ${prof.nombre || prof.name || ''} ${prof.apellido || prof.last_name || ''}
                </div>
                <div style="font-size: 14px; color: #999;">
                    DNI: ${prof.dni || ''} ${prof.email ? `• ${prof.email}` : ''}
                </div>
            </div>
        `).join('');

        searchProfessorResultsContainer.style.display = 'block';

        document.querySelectorAll('.search-professor-item').forEach(item => {
            item.addEventListener('mouseenter', function () {
                this.style.backgroundColor = '#2a2a2a';
            });
            item.addEventListener('mouseleave', function () {
                this.style.backgroundColor = 'transparent';
            });
            item.addEventListener('click', function () {
                const profId = this.dataset.profId;
                const profData = profs.find(p => p.id == profId);
                selectProfessor(profData);
            });
        });
    }

    // ----------------- SELECCIONAR PROFESOR -----------------
    function selectProfessor(prof) {
        selectedProfessor = prof;
        if (searchProfessorInput) {
            searchProfessorInput.value = `${prof.nombre || prof.name || ''} ${prof.apellido || prof.last_name || ''} (DNI: ${prof.dni || ''})`;
            searchProfessorResultsContainer.style.display = 'none';

            // Indicar visualmente selección
            searchProfessorInput.style.borderColor = '#32CD32';
            searchProfessorInput.style.backgroundColor = 'rgba(50, 205, 50, 0.1)';
        }
    }

    // ----------------- EVENT LISTENER INPUT CLIENTE -----------------
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim();

        if (!query) {
            selectedClient = null;
            searchInput.style.borderColor = '';
            searchInput.style.backgroundColor = '';
        }

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            searchClients(query);
        }, 300);
    });

    // ----------------- EVENT LISTENER INPUT PROFESOR -----------------
    if (searchProfessorInput) {
        searchProfessorInput.addEventListener('input', function (e) {
            const query = e.target.value.trim();

            if (!query) {
                selectedProfessor = null;
                searchProfessorInput.style.borderColor = '';
                searchProfessorInput.style.backgroundColor = '';
            }

            if (searchProfessorTimeout) {
                clearTimeout(searchProfessorTimeout);
            }

            searchProfessorTimeout = setTimeout(() => {
                searchProfessors(query);
            }, 300);
        });
    }

    // ----------------- CERRAR RESULTADOS AL HACER CLICK FUERA -----------------
    document.addEventListener('click', function (e) {
        // cerrar clientes
        if (!searchContainer.contains(e.target)) {
            searchResultsContainer.style.display = 'none';
        }
        // cerrar profesores (si existe)
        if (searchProfessorInput) {
            const searchProfessorContainer = searchProfessorInput.closest('.search-profesor') || searchProfessorInput.parentElement;
            if (!searchProfessorContainer.contains(e.target)) {
                searchProfessorResultsContainer.style.display = 'none';
            }
        }
    });

    // ----------------- GUARDAR RUTINA -----------------
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('routine-name').value.trim();
        const description = document.getElementById('routine-description').value.trim();
        const timeWeek = document.getElementById('routine-weeks').value;
        const daysPerWeek = document.getElementById('routine-days').value;

        if (!name || !timeWeek || !daysPerWeek) {
            alert('Por favor completa los campos requeridos (*)');
            return;
        }

        if (isNaN(timeWeek) || timeWeek <= 0) {
            alert('Por favor ingresa una duración válida en semanas');
            return;
        }

        const routineData = {
            name: name,
            description: description || "",
            time_week: parseInt(timeWeek),
            days_per_week: parseInt(daysPerWeek),
            client_id: selectedClient ? selectedClient.id : null,
            // Añadimos professor_id (si se seleccionó)
            professor_id: selectedProfessor ? selectedProfessor.id : null
        };

        fetch('http://localhost:8000/api/rutinas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(routineData)
        })
            .then(response => {
                console.log('=== RESPUESTA DEL SERVIDOR ===');
                console.log('Status:', response.status);
                console.log('Status Text:', response.statusText);
                console.log('==============================');

                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Error response body:', text);
                        throw new Error(`Error ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('=== RUTINA CREADA ===');
                console.log('Respuesta:', data);
                console.log('=======================');

                alert('Rutina guardada exitosamente!');
                window.location.href = 'rutinas.html';
            })
            .catch(error => {
                console.error('=== ERROR ===');
                console.error('Error completo:', error);
                console.error('=============');
                alert('Ocurrió un problema al guardar la rutina: ' + error.message);
            });
    });

    // ----------------- BOTÓN CANCELAR -----------------
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los cambios.')) {
                window.history.back();
            }
        });
    }
});
