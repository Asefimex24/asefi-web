/**
 * Lógica Web - Registro de Bienes Adjudicados ASEFIMEX
 * Archivo: app.js
 */

// ⚠️ PEGA AQUÍ LA URL QUE TE DA GOOGLE APPS SCRIPT AL PUBLICAR
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwwLGZgRODy2XdLQ7JjtZ0E9siaT-tt3bT_5R3nz9bOXwlMO2tcQOXqU7HUhNqPrlhS/exec";

const AsefiApp = (function () {

    // Inicialización de la app
    function init() {
        updateTimestamp();
    }

    // Marca de tiempo en el campo readonly fechaRegistro
    function updateTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        const fechaInput = document.getElementById('fechaRegistro');
        if (fechaInput) {
            fechaInput.value = formatted;
            fechaInput.defaultValue = formatted;
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

    // Cierra la caja de alertas
    function closeAlert() {
        const box = document.getElementById('alertBox');
        if (box) box.classList.add('hidden');
    }

    // Manejo y validación del formulario
    async function handleSubmit(e) {
        e.preventDefault();
        closeAlert();

        // Validar que se haya configurado la URL de Apps Script
        if (!WEB_APP_URL || WEB_APP_URL.trim() === "" || WEB_APP_URL.includes("TU_SCRIPT_ID_AQUI")) {
            showAlert('Falta configurar la URL de Google Apps Script en la variable WEB_APP_URL dentro de app.js');
            return;
        }

        // Lista de los 24 campos obligatorios del formulario
        const requiredFields = [
            'correo', 'nombreAcreditado', 'sucursalCredito', 'numCuenta',
            'numCredito', 'fechaInicioCredito', 'saldoCapital', 'interesOrdinario',
            'moratorio', 'cuotasPagadas', 'cuotasAtraso', 'diasAtraso',
            'tipoBien', 'numSerie', 'marca', 'modelo', 'color', 'tipoUnidad',
            'kilometraje', 'numPlaca', 'lugarResguardo', 'razonAdjudicacion',
            'nombreVendedor', 'elaboro'
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

        // Construcción del objeto de datos
        const payload = {
            fechaRegistro: document.getElementById('fechaRegistro').value,
            correo: document.getElementById('correo').value,
            nombreAcreditado: document.getElementById('nombreAcreditado').value,
            fechaInicioCredito: document.getElementById('fechaInicioCredito').value,
            numCuenta: document.getElementById('numCuenta').value,
            numCredito: document.getElementById('numCredito').value,
            cuotasPagadas: document.getElementById('cuotasPagadas').value,
            cuotasAtraso: document.getElementById('cuotasAtraso').value,
            diasAtraso: document.getElementById('diasAtraso').value,
            tipoBien: document.getElementById('tipoBien').value,
            numSerie: document.getElementById('numSerie').value,
            marca: document.getElementById('marca').value,
            modelo: document.getElementById('modelo').value,
            color: document.getElementById('color').value,
            tipoUnidad: document.getElementById('tipoUnidad').value,
            kilometraje: document.getElementById('kilometraje').value,
            razonAdjudicacion: document.getElementById('razonAdjudicacion').value,
            lugarResguardo: document.getElementById('lugarResguardo').value,
            sucursalCredito: document.getElementById('sucursalCredito').value,
            saldoCapital: document.getElementById('saldoCapital').value,
            interesOrdinario: document.getElementById('interesOrdinario').value,
            moratorio: document.getElementById('moratorio').value,
            numPlaca: document.getElementById('numPlaca').value,
            nombreVendedor: document.getElementById('nombreVendedor').value,
            elaboro: document.getElementById('elaboro').value
        };

        // Estado visual de carga del botón
        const submitBtn = document.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i><span>Guardando...</span>';

        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            // Cargar información en el Modal Comprobante
            document.getElementById('modalFecha').textContent = payload.fechaRegistro;
            document.getElementById('resAcreditado').textContent = payload.nombreAcreditado;
            document.getElementById('resCredito').textContent = `${payload.numCredito} (Cuenta: ${payload.numCuenta})`;
            document.getElementById('resBien').textContent = `${payload.tipoBien} - ${payload.marca} ${payload.modelo} (${payload.color})`;
            document.getElementById('resSeriePlaca').textContent = `Serie: ${payload.numSerie} | Placa: ${payload.numPlaca}`;
            document.getElementById('resSaldo').textContent = `$${payload.saldoCapital}`;
            document.getElementById('resResguardo').textContent = payload.lugarResguardo;
            document.getElementById('resElaboro').textContent = payload.elaboro;

            // Mostrar el modal
            document.getElementById('receiptModal').classList.remove('hidden');
        } catch (error) {
            showAlert('Ocurrió un error al registrar la adjudicación. Verifique su conexión.');
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
        const form = document.getElementById('adjudicacionForm');
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