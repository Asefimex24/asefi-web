document.getElementById("frmEnganches").addEventListener("submit", async (e) => {
  e.preventDefault();
  await enviarFormulario();
});

// Función auxiliar para convertir archivos (File) a Base64
function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

async function enviarFormulario() {
    
  const btn = document.getElementById("btnEnvio");
  const textoBoton = document.getElementById("btnTexto");
  const spinner = document.getElementById("btnSpinner");

  try {
    btn.disabled = true;
    textoBoton.innerHTML = 'Procesando...';
    spinner.classList.remove("d-none");

    // Procesar archivos adjuntos si existen
    const inputFicha = document.getElementById("fichaDeposito").files[0];
    let fichaBase64;
    let fichaNombre = "";
    let fichaMime = "";
    
    if(inputFicha){
      fichaBase64= await convertirBase64(inputFicha);
      fichaNombre = inputFicha.name;
      fichaMime = inputFicha.type;
    }
    
    const inputCaratula = document.getElementById("caratula").files[0];
    let caratulaBase64;
    let caratulaNombre = "";
    let caratulaMime = "";

    if(inputCaratula){
      caratulaBase64 =await convertirBase64(inputCaratula);
      caratulaNombre = inputCaratula.name;
      caratulaMime = inputCaratula.type;
    }
    

    // Mapeo de datos con los IDs exactos del nuevo formulario
    const datos = {
      tipoOperacion: "COM-APERTURA",
      fechaHora: document.getElementById("fechaHora").value,
      nombreCliente: document.getElementById("nombreCliente").value,
      producto: document.getElementById("producto").value,
      sucursal: document.getElementById("sucursal").value,
      distribuidor: document.getElementById("distribuidor").value,
      fechaDeposito: document.getElementById("fechaDeposito").value,
      importe: document.getElementById("importe").value,
      banco: document.getElementById("banco").value,
      tipoDeposito: document.getElementById("tipoDeposito").value,
      nombreEjecutivo: document.getElementById("nombreEjecutivo").value,
      correoEjecutivo: document.getElementById("correoEjecutivo").value,
      telefonoEjecutivo: document.getElementById("telefonoEjecutivo").value,
      comentario: document.getElementById("comentario").value,
      fichaBase64: fichaBase64,
      fichaNombre: fichaNombre,
      fichaMime: fichaMime,
      caratulaBase64: caratulaBase64,
      caratulaNombre: caratulaNombre,
      caratulaMime: caratulaMime,
    };


    const API_URL = "https://script.google.com/macros/s/AKfycbzRF6dyP_m4xhYFuYqZ_-zdkd2SqW4-HJw-GRl9C0BIUcqm0z9Z9fmGcKB1xSBcs1wD/exec";

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
        title: "Solicitud Registrada",
        showConfirmButton: false,
        timer: 1500,
      });

      document.getElementById("frmEnganches").reset();
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