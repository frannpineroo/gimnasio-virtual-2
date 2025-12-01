// GESTOR UNIFICADO DE MODALES
class ModalManager {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cerrar modal con la X
        const closeBtn = this.modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Cerrar modal al hacer clic fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.hide();
            }
        });
    }

    show() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    setTitle(title) {
        const titleElement = this.modal.querySelector('.modal-header h2');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    setContent(html) {
        const content = this.modal.querySelector('.modal-content');
        if (content) {
            content.innerHTML = html;
        }
    }

    clearForm() {
        const form = this.modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }

    // Método para formularios rápidos
    createForm(fields, onSubmit) {
        const formHTML = `
            <form class="modal-form">
                ${fields.map(field => `
                    <div class="form-group">
                        <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
                        ${field.type === 'textarea' ? 
                            `<textarea id="${field.id}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>` :
                            `<input type="${field.type}" id="${field.id}" value="${field.value || ''}" ${field.required ? 'required' : ''}>`
                        }
                    </div>
                `).join('')}
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-form">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `;

        this.setContent(`
            <div class="modal-header">
                <h2>${fields[0]?.formTitle || 'Formulario'}</h2>
                <button class="close-modal">&times;</button>
            </div>
            ${formHTML}
        `);

        const form = this.modal.querySelector('form');
        const cancelBtn = this.modal.querySelector('#cancel-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {};
            fields.forEach(field => {
                formData[field.id] = document.getElementById(field.id).value;
            });
            onSubmit(formData);
        });

        cancelBtn.addEventListener('click', () => this.hide());

        this.setupEventListeners();
    }
}