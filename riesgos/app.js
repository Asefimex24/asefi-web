document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // CONFIGURACIÓN
    // ==========================================
    const GOOGLE_SCRIPT_URL = "URL DEL GOOGLESHEETS"; // Reemplaza con la URL de tu Google Script

    // 1. Asignar Fecha y Hora actual automáticamente
    const campoFechaHora = document.getElementById("fechaHora");
    if (campoFechaHora) {
        const ahora = new Date();
        const formatoFechaHora = ahora.toLocaleString("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
        campoFechaHora.value = formatoFechaHora;
    }

    // 2. Referencias a Elementos del DOM
    const form = document.getElementById("frmSolicitudTI");
    const tipoReporte = document.getElementById("tipoReporte");
    const bloqueIncidencia = document.getElementById("bloqueIncidencia");
    const bloqueFalsificacion = document.getElementById("bloqueFalsificacion");
    const bloqueOtros = document.getElementById("bloqueOtros");
    const bloqueDescripcion = document.getElementById("bloqueDescripcion");
    const descripcionInput = document.getElementById("descripcion");

    const btnEnvio = document.getElementById("btnEnvio");
    const btnTexto = document.getElementById("btnTexto");
    const btnSpinner = document.getElementById("btnSpinner");

    const bloques = [
        { id: "Incidencia de Seguridad", elemento: bloqueIncidencia },
        { id: "Falsificación de Documentos", elemento: bloqueFalsificacion },
        { id: "Otros", elemento: bloqueOtros },
    ];

    // ==========================================
    // LÓGICA DE CAMPOS DINÁMICOS
    // ==========================================
    function alternarCampos() {
        const valorSeleccionado = tipoReporte.value;

        // Ocultar bloques y limpiar/quitar atributos 'required'
        bloques.forEach(({ elemento }) => {
            if (elemento) {
                elemento.classList.add("d-none");
                elemento.querySelectorAll("input, select, textarea").forEach((campo) => {
                    campo.removeAttribute("required");
                    campo.value = "";
                });
            }
        });

        const bloqueActivo = bloques.find((b) => b.id === valorSeleccionado);

        if (bloqueActivo && bloqueActivo.elemento) {
            bloqueActivo.elemento.classList.remove("d-none");
            bloqueActivo.elemento.querySelectorAll("input, select, textarea").forEach((campo) => {
                campo.setAttribute("required", "true");
            });

            bloqueDescripcion.classList.remove("d-none");
            descripcionInput.setAttribute("required", "true");
        } else {
            bloqueDescripcion.classList.add("d-none");
            descripcionInput.removeAttribute("required");
            descripcionInput.value = "";
        }
    }

    tipoReporte.addEventListener("change", alternarCampos);

    // ==========================================
    // FUNCIÓN AUXILIAR: CONVERTIR ARCHIVO A BASE64
    // ==========================================
    function convertirArchivoABase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve({ mimeType: "", data: "", fileName: "" });
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(",")[1];
                resolve({
                    mimeType: file.type,
                    data: base64String,
                    fileName: file.name,
                });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // ==========================================
    // ENVÍO DEL FORMULARIO VIA FETCH
    // ==========================================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Confirmación previa al envío
        const confirmacion = await Swal.fire({
            title: "¿Enviar reporte?",
            text: "Verifica que la información ingresada sea correcta.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, enviar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) return;

        // Estado del botón: Cargando
        btnEnvio.disabled = true;
        btnTexto.textContent = "Enviando...";
        btnSpinner.classList.remove("d-none");

        try {
            // Procesar la evidencia adjunta (si existe)
            const inputEvidencia = document.getElementById("evidencia");
            const archivo = inputEvidencia && inputEvidencia.files[0] ? inputEvidencia.files[0] : null;
            const evidenciaBase64 = await convertirArchivoABase64(archivo);

            // Recopilar datos básicos
            const payload = {
                fechaHora: document.getElementById("fechaHora").value,
                nombreEjecutivo: document.getElementById("nombreEjecutivo").value,
                puestoEjecutivo: document.getElementById("puestoEjecutivo").value,
                sucursal: document.getElementById("sucursal").value,
                telefonoEjecutivo: document.getElementById("telefonoEjecutivo").value,
                correoEjecutivo: document.getElementById("correoEjecutivo").value,
                tipoReporte: tipoReporte.value,
                descripcion: descripcionInput.value,
                evidencia: evidenciaBase64,
            };

            // Agregar campos específicos según el tipo de reporte
            if (tipoReporte.value === "Incidencia de Seguridad") {
                payload.tipoIncidencia = document.getElementById("tipoIncidencia").value;
                payload.fechaEvento = document.getElementById("fechaEvento").value;
                payload.horaAproximada = document.getElementById("horaAproximada").value;
                payload.jefeInformado = document.getElementById("jefeInformado").value;
            } else if (tipoReporte.value === "Falsificación de Documentos") {
                payload.folioPlataforma = document.getElementById("folioPlataforma").value;
                payload.plataforma = document.getElementById("plataforma").value;
                payload.cliente = document.getElementById("cliente").value;
                payload.documentoReportado = document.getElementById("documentoReportado").value;
                payload.deteccion = document.getElementById("deteccion").value;
            } else if (tipoReporte.value === "Otros") {
                payload.tipoRiesgo = document.getElementById("tipoRiesgo").value;
            }

            // Enviar solicitud Fetch utilizando text/plain para evitar redirecciones CORS preflight
            const respuesta = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(payload),
            });

            const resultado = await respuesta.json();

            if (resultado.result === "success" || resultado.status === "ok") {
                await Swal.fire({
                    title: "¡Reporte enviado!",
                    text: "El reporte se registró con éxito.",
                    icon: "success",
                    confirmButtonColor: "#2563eb",
                });

                // Limpiar formulario y restablecer campos
                form.reset();
                alternarCampos();

                // Actualizar la fecha y hora para un nuevo registro
                const nuevaFecha = new Date();
                campoFechaHora.value = nuevaFecha.toLocaleString("es-MX", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                });
            } else {
                throw new Error(resultado.message || "Error al guardar el reporte.");
            }
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            Swal.fire({
                title: "Error al enviar",
                text: "Ocurrió un problema al enviar el reporte. Por favor, intente nuevamente.",
                icon: "error",
                confirmButtonColor: "#2563eb",
            });
        } finally {
            // Restablecer estado del botón
            btnEnvio.disabled = false;
            btnTexto.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Enviar Solicitud';
            btnSpinner.classList.add("d-none");
        }
    });
});