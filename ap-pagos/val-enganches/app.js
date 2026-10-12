document.getElementById("frmEnganches").addEventListener("submit", async (e) => {
  e.preventDefault();
  await enviarFormulario();
});

// Función auxiliar para convertir archivos (File) a Base64
function convertirArchivoABase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // Extrae la cadena base64 removiendo el encabezado data:*/*;base64,
      const base64String = reader.result.split(",")[1];
      resolve({
        nombre: file.name,
        tipo: file.type,
        base64: base64String,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function enviarFormulario() {
    
  const btn = document.getElementById("btnEnvio");
  const textoBoton = document.getElementById("btnTexto");
  const spinner = document.getElementById("btnSpinner");

  try {
    btn.disabled = true;
    textoBoton.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Procesando...';
    spinner.classList.remove("d-none");

    // Procesar archivos adjuntos si existen
    const inputFicha = document.getElementById("fichaDeposito").files[0];
    const inputCaratula = document.getElementById("caratula").files[0];

    const fichaDepositoData = await convertirArchivoABase64(inputFicha);
    const caratulaData = await convertirArchivoABase64(inputCaratula);

    // Mapeo de datos con los IDs exactos del nuevo formulario
    const datos = {
      fechaHora: document.getElementById("fechaHora").value,
      cliente: document.getElementById("cliente").value,
      producto: document.getElementById("producto").value,
      sucursal: document.getElementById("sucursal").value,
      distribuidor: document.getElementById("distribuidor").value,
      fechaDeposito: document.getElementById("fechaDeposito").value,
      importe: document.getElementById("importe").value,
      banco: document.getElementById("banco").value,
      tipoDeposito: document.getElementById("tipoDeposito").value,
      fichaDeposito: fichaDepositoData,
      caratula: caratulaData,
      nombreEjecutivo: document.getElementById("nombreEjecutivo").value,
      correoejecutivo: document.getElementById("correoejecutivo").value,
      telefonoEjecutivo: document.getElementById("telefonoEjecutivo").value,
      comentario: document.getElementById("comentario").value,
    };

    console.log("Datos a enviar:", datos);

    const API_URL = "https://script.google.com/macros/s/AKfycbw-1S_Tit2y1uvzBT40MIgrt5Ych4KsT42bfsW5gGoEhX3QFtJY7vt-3VdH_laOKo-g-w/exec";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(datos),
    });

    const resultado = await response.json();

    if (response.ok && resultado.success) {
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Depósito Registrado",
        text: "La información y los comprobantes se guardaron correctamente.",
        showConfirmButton: false,
        timer: 2000,
      });

      document.getElementById("frmDepositos").reset();
      establecerFechaActual();
    } else {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar el depósito",
        text: resultado.error || "Ocurrió un problema en el servidor.",
      });
    }
  } catch (error) {
    console.error("Error al realizar el fetch:", error);
    Swal.fire({
      icon: "error",
      title: "Error al enviar",
      text: "No fue posible enviar la solicitud. Verifica tu conexión e inténtalo de nuevo.",
    });
  } finally {
    btn.disabled = false;
    textoBoton.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Registrar Depósito';
    spinner.classList.add("d-none");
  }
}

window.onload = establecerFechaActual;

function establecerFechaActual() {
  const ahora = new Date();

  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  const hora = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  
  const fechaCompleta = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
  
  const campoFecha = document.getElementById("fechaHora");
  if (campoFecha) {
    campoFecha.value = fechaCompleta;
  }
}