// Lógica Web - Requisición de Personal ASEFIMEX
// Conexión a Google Sheets (31 Columnas)

// REEMPLAZA CON LA URL QUE TE DA GOOGLE APPS SCRIPT AL PUBLICAR COMO WEB APP
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyWepGlhx6ZGsegYwSXjsXP3jo4kvLx8ROxH6Lq8Cn7HAqX2VIBKkuoewiNsFKXI-z3/exec";

const AsefiApp = (function () {
    let activeFolio = '';

    function init() {
        updateTimestamp();
        generateFolio();
    }

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

    function closeAlert() {
        const box = document.getElementById('alertBox');
        if (box) box.classList.add('hidden');
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const encoded = reader.result.split(',')[1];
                resolve({
                    base64: encoded,
                    mimeType: file.type,
                    fileName: file.name
                });
            };
            reader.onerror = error => reject(error);
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        closeAlert();

        // IDs actualizados según tu HTML actual
        const requiredFields = [
            'nombreSolicitante',
            'sucursal',
            'telefonoSolicitante',
            'correoSolicitante',
            'areaDepartamento',
            'nombrePuesto',
            'numPlazas',
            'tipoVacante',
            'motivoRequisicion',
            'escolaridad',
            'carreraAfine',
            'experiencia',
            'softwareHerramientas',
            'horarioTrabajo',
            'diasLaborables',
            'sueldoPropuesto',
            'tipoContrato',
            'disponibilidadViajar',
            'prestaciones'
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

        const tipoVac = document.getElementById('tipoVacante').value;
        if (tipoVac === 'Reemplazo / Sustitución' || tipoVac === 'Incapacidad / Maternidad') {
            const colab = document.getElementById('colaboradorSustituir');
            if (!colab || !colab.value.trim()) {
                if (colab) colab.classList.add('border-red-500');
                missing = true;
            } else {
                colab.classList.remove('border-red-500');
            }
        }

        if (missing) {
            showAlert('Por favor complete todos los campos obligatorios marcados con asterisco (*).');
            return;
        }

        // Procesar archivo adjunto
        const fileEl = document.getElementById('fileInput');
        let fileData = null;
        if (fileEl && fileEl.files && fileEl.files.length > 0) {
            try {
                fileData = await fileToBase64(fileEl.files[0]);
            } catch (err) {
                showAlert('Error al procesar el archivo adjunto.');
                return;
            }
        }

        // Construcción del objeto para las 31 columnas
        const obsExtra = document.getElementById('observacionesExtra') ? document.getElementById('observacionesExtra').value : '';
        const telContacto = document.getElementById('telefonoSolicitante').value;

        const payload = {
            marcaTemporal: document.getElementById('fechaSolicitud').value,
            correo: document.getElementById('correoSolicitante').value,
            nombrePuesto: document.getElementById('nombrePuesto').value,
            sucursal: document.getElementById('sucursal').value,
            areaSolicita: document.getElementById('areaDepartamento').value,
            numVacantes: document.getElementById('numPlazas').value,
            motivoVacante: document.getElementById('tipoVacante').value + ' - ' + document.getElementById('motivoRequisicion').value,
            rangoEdad: document.getElementById('rangoEdad') ? document.getElementById('rangoEdad').value : 'Indistinto',
            genero: document.getElementById('genero') ? document.getElementById('genero').value : 'Indistinto',
            escolaridad: document.getElementById('escolaridad').value,
            tituloCedula: 'Requerido',
            horarioLaboral: document.getElementById('horarioTrabajo').value + ' (' + document.getElementById('diasLaborables').value + ')',
            experienciaMinima: document.getElementById('experiencia').value,
            habilidades: document.getElementById('carreraAfine').value,
            softwareProgramas: document.getElementById('softwareHerramientas').value,
            disponibilidadViajar: document.getElementById('disponibilidadViajar').value,
            lugaresViaje: 'Según requerimiento',
            manejoVehiculo: 'No indispensable',
            tipoLicencia: 'N/A',
            tipoContrato: document.getElementById('tipoContrato').value,
            viaticos: 'Según políticas',
            comisiones: 'N/A',
            personalCargo: 'No especificado',
            equipoAsignado: 'Equipo estándar',
            funciones: document.getElementById('motivoRequisicion').value,
            comentariosAdicionales: obsExtra,
            nombreSolicita: document.getElementById('nombreSolicitante').value,
            nombreAutoriza: 'Pendiente de Validación',
            salarioMensual: document.getElementById('sueldoPropuesto').value,
            localidad: document.getElementById('sucursal').value,
            codigo: activeFolio,
            file: fileData
        };
        console.log(payload);
        const submitBtn = document.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-xs"></i><span>Enviando...</span>';

        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            // Llenar Modal de Confirmación
            document.getElementById('modalFolio').textContent = activeFolio;
            document.getElementById('modalFecha').textContent = payload.marcaTemporal;
            document.getElementById('resSolicitante').textContent = payload.nombreSolicita;
            document.getElementById('resSucursalArea').textContent = `${payload.sucursal} (${payload.areaSolicita})`;
            document.getElementById('resPuesto').textContent = payload.nombrePuesto;
            document.getElementById('resPlazasTipo').textContent = `${payload.numVacantes} plaza(s) - ${document.getElementById('tipoVacante').value}`;
            document.getElementById('resSueldo').textContent = payload.salarioMensual;
            document.getElementById('resArchivo').textContent = fileData ? fileData.fileName : 'Sin archivo adjunto';

            document.getElementById('receiptModal').classList.remove('hidden');
        } catch (error) {
            showAlert('Ocurrió un error al conectar con el servidor. Intente de nuevo.');
            console.error('Error al enviar:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    }

    function closeModal() {
        document.getElementById('receiptModal').classList.add('hidden');
    }

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

window.onload = function () {
    AsefiApp.init();
};