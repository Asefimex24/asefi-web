/**
 * Lógica principal de la aplicación Asefiweb - Requisición de Personal
 * Archivo: apps.js
 */
const AsefiApp = (function () {
    let activeFolio = '';

    // Inicialización de la app
    function init() {
        updateTimestamp();
        generateFolio();
    }

    // Actualiza la marca de tiempo en el campo de fecha readonly
    function updateTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        const fechaInput = document.getElementById('fechaSolicitud');
        if (fechaInput) {
            fechaInput.value = formatted;
        }
    }

    // Generador de folio único institucional
    function generateFolio() {
        const now = new Date();
        const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const rand = Math.floor(1000 + Math.random() * 9000);
        activeFolio = `REQ-${dateCode}-${rand}`;

        const headerFolioEl = document.getElementById('headerFolio');
        if (headerFolioEl) {
            headerFolioEl.textContent = activeFolio;
        }
    }

    // Controla la visibilidad del campo condicional de sustitución
    function toggleSustitucion(val) {
        const campo = document.getElementById('campoSustitucion');
        const input = document.getElementById('colaboradorSustituir');
        if (!campo || !input) return;

        if (val === 'Reemplazo / Sustitución' || val === 'Incapacidad / Maternidad') {
            campo.classList.remove('hidden');
            input.required = true;
        } else {
            campo.classList.add('hidden');
            input.required = false;
            input.value = '';
        }
    }

    // Formatea la etiqueta con el nombre del archivo seleccionado
    function updateFileName(input) {
        const label = document.getElementById('fileNameLabel');
        if (!label) return;

        if (input.files && input.files.length > 0) {
            label.textContent = input.files[0].name;
            label.classList.remove('text-slate-500');
            label.classList.add('text-slate-900', 'font-medium');
        } else {
            label.textContent = 'Sin archivos seleccionados';
            label.classList.add('text-slate-500');
            label.classList.remove('text-slate-900', 'font-medium');
        }
    }

    // Muestra mensajes de alerta en pantalla
    function showAlert(text, isError = true) {
        const box = document.getElementById('alertBox');
        const icon = document.getElementById('alertIcon');
        const msg = document.getElementById('alertText');
        if (!box || !icon || !msg) return;

        if (isError) {
            box.className = 'mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm shadow-sm flex items-center justify-between';
            icon.className = 'fa-solid fa-circle-exclamation text-red-600 text-lg';
        } else {
            box.className = 'mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm shadow-sm flex items-center justify-between';
            icon.className = 'fa-solid fa-circle-check text-emerald-600 text-lg';
        }

        msg.textContent = text;
        box.classList.remove('hidden');
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Cierra la caja de alerta
    function closeAlert() {
        const box = document.getElementById('alertBox');
        if (box) box.classList.add('hidden');
    }

    // Manejo y validación del formulario
    function handleSubmit(e) {
        e.preventDefault();
        closeAlert();

        // Lista de campos requeridos obligatorios
        const requiredFields = [
            'nombreEjecutivo', 'sucursal', 'telefonoEjecutivo', 'correoEjecutivo',
            'areaDepartamento', 'nombrePuesto', 'numPlazas', 'tipoVacante',
            'motivoRequisicion', 'escolaridad', 'carreraAfine', 'experiencia',
            'softwareHerramientas', 'horarioTrabajo', 'diasLaborables',
            'sueldoPropuesto', 'tipoContrato', 'disponibilidadViajar', 'prestaciones'
        ];

        let missing = false;
        requiredFields.forEach(id => {
            const el = document.getElementById(id);
            if (!el || !el.value.trim()) {
                if (el) el.classList.add('border-red-500');
                missing = true;
            } else {
                el.classList.remove('border-red-500');
            }
        });

        // Validación especial para sustitución
        const tipoVac = document.getElementById('tipoVacante').value;
        if (tipoVac === 'Reemplazo / Sustitución' || tipoVac === 'Incapacidad / Maternidad') {
            const colab = document.getElementById('colaboradorSustituir');
            if (!colab.value.trim()) {
                colab.classList.add('border-red-500');
                missing = true;
            } else {
                colab.classList.remove('border-red-500');
            }
        }

        if (missing) {
            showAlert('Por favor complete todos los campos obligatorios marcados con asterisco (*).');
            return;
        }

        // Cargar datos en el comprobante modal
        document.getElementById('modalFolio').textContent = activeFolio;
        document.getElementById('modalFecha').textContent = document.getElementById('fechaSolicitud').value;
        document.getElementById('resSolicitante').textContent = document.getElementById('nombreEjecutivo').value;
        document.getElementById('resSucursalArea').textContent = `${document.getElementById('sucursal').value} (${document.getElementById('areaDepartamento').value})`;
        document.getElementById('resPuesto').textContent = document.getElementById('nombrePuesto').value;
        document.getElementById('resPlazasTipo').textContent = `${document.getElementById('numPlazas').value} plaza(s) - ${document.getElementById('tipoVacante').value}`;
        document.getElementById('resSueldo').textContent = document.getElementById('sueldoPropuesto').value;

        const fileEl = document.getElementById('fileInput');
        document.getElementById('resArchivo').textContent = (fileEl.files && fileEl.files.length > 0) ? fileEl.files[0].name : 'Ninguno';

        // Mostrar Modal de Acuse
        document.getElementById('receiptModal').classList.remove('hidden');
    }

    // Cierra el modal de acuse
    function closeModal() {
        document.getElementById('receiptModal').classList.add('hidden');
    }

    // Resetea el formulario a su estado inicial
    function resetForm() {
        const form = document.getElementById('requisicionForm');
        if (form) form.reset();

        const label = document.getElementById('fileNameLabel');
        if (label) {
            label.textContent = 'Sin archivos seleccionados';
            label.classList.add('text-slate-500');
            label.classList.remove('text-slate-900', 'font-medium');
        }

        toggleSustitucion('');
        closeAlert();
        generateFolio();
        updateTimestamp();
        document.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
    }

    return {
        init,
        toggleSustitucion,
        updateFileName,
        handleSubmit,
        closeModal,
        resetForm,
        closeAlert
    };
})();

// Evento de arranque al cargar la página
window.onload = function () {
    AsefiApp.init();
};