/**
 * Lógica Web - Registro de Crédito / Prospecto ASEFIMEX
 * Archivo: app.js
 */

// ⚠️ REEMPLAZA ESTA URL CON LA QUE TE DÉ GOOGLE APPS SCRIPT AL PUBLICAR
const WEB_APP_URL = "";

const AsefiApp = (function () {

    // Inicialización de la app
    function init() {
        updateTimestamp();
    }

    // Marca de tiempo en el campo readonly fechaHora
    function updateTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        const fechaInput = document.getElementById('fechaHora');
        if (fechaInput) {
            fechaInput.value = formatted;
            fechaInput.defaultValue = formatted;
        }
    }

    // Convierte un archivo tipo File a Base64
    function fileToBase64(fileInputId) {
        return new Promise((resolve) => {
            const input = document.getElementById(fileInputId);
            if (!input || !input.files || input.files.length === 0) {
                resolve('N/A');
                return;
            }

            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = function () {
                resolve(reader.result);
            };

            reader.onerror = function () {
                resolve('ERROR_LECTURA');
            };

            reader.readAsDataURL(file);
        });
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

    // Cierra la caja de alertas
    function closeAlert() {
        const box = document.getElementById('alertBox');
        if (box) box.classList.add('hidden');
    }

    // Envío y validación del formulario
    async function handleSubmit(e) {
        e.preventDefault();
        closeAlert();

        if (!WEB_APP_URL || WEB_APP_URL.trim() === "" || WEB_APP_URL.includes("TU_SCRIPT_ID_AQUI")) {
            showAlert('Falta configurar la URL de Google Apps Script en la variable WEB_APP_URL dentro de app.js');
            return;
        }

        // Lista de campos obligatorios alineados con tu index.html
        const requiredFields = [
            'nombreprospecto', 'telefonoProspecto', 'sucursal', 'ejecutivo',
            'horarioLlamada', 'producto', 'montoCred', 'distribuidor', 'especificaciones'
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

        if (missing) {
            showAlert('Por favor complete todos los campos obligatorios marcados con asterisco (*).');
            return;
        }

        const submitBtn = document.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i><span>Procesando datos y guardando...</span>';

        try {
            // Conversión del archivo adjunto a Base64
            const b64IneFrente = await fileToBase64('ineFrente');

            const payload = {
                fechaHora: document.getElementById('fechaHora').value,
                nombreprospecto: document.getElementById('nombreprospecto').value,
                telefonoProspecto: document.getElementById('telefonoProspecto').value,
                sucursal: document.getElementById('sucursal').value,
                ejecutivo: document.getElementById('ejecutivo').value,
                horarioLlamada: document.getElementById('horarioLlamada').value,
                producto: document.getElementById('producto').value,
                montoCred: document.getElementById('montoCred').value,
                distribuidor: document.getElementById('distribuidor').value,
                especificaciones: document.getElementById('especificaciones').value,
                ineFrente: b64IneFrente,
                comentarios: document.getElementById('comentarios').value || 'Sin comentarios'
            };

            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            // Llenar Modal de Comprobante
            document.getElementById('modalNumRegistro').textContent = "REG-" + Math.floor(100000 + Math.random() * 900000);
            document.getElementById('modalFechaHora').textContent = payload.fechaHora;
            document.getElementById('resCliente').textContent = payload.nombreprospecto;
            document.getElementById('resTel').textContent = payload.telefonoProspecto;
            document.getElementById('resSucEjecutivo').textContent = `${payload.sucursal} (${payload.ejecutivo})`;
            document.getElementById('resProdMonto').textContent = `${payload.producto} - $${payload.montoCred}`;
            document.getElementById('resRenovAnalista').textContent = `Distribuidor: ${payload.distribuidor}`;

            document.getElementById('receiptModal').classList.remove('hidden');
        } catch (error) {
            showAlert('Ocurrió un error al registrar la solicitud. Verifique su conexión.');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    }

    // Cierra el modal de comprobante
    function closeModal() {
        document.getElementById('receiptModal').classList.add('hidden');
    }

    // Resetea el formulario
    function resetForm() {
        const form = document.getElementById('creditoForm');
        if (form) form.reset();

        closeAlert();
        updateTimestamp();
        document.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
    }

    return {
        init,
        handleSubmit,
        closeModal,
        resetForm,
        closeAlert
    };
})();

window.onload = function () {
    AsefiApp.init();
};