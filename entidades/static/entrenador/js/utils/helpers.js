// FUNCIONES AUXILIARES REUTILIZABLES
const Helpers = {
    // Formatear objetivos
    formatGoal(goal) {
        const goals = {
            'perdida_grasa': 'Pérdida de grasa',
            'ganancia_muscular': 'Ganancia muscular',
            'mejora_rendimiento': 'Mejora de rendimiento',
            'rehabilitacion': 'Rehabilitación',
            'mantenimiento': 'Mantenimiento'
        };
        return goals[goal] || goal;
    },

    // Formatear niveles
    formatLevel(level) {
        const levels = {
            'beginner': 'Principiante',
            'intermediate': 'Intermedio',
            'advanced': 'Avanzado'
        };
        return levels[level] || level;
    },

    // Capitalizar texto
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validar email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Formatear fecha
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES');
    },

    // Debounce para búsquedas
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};