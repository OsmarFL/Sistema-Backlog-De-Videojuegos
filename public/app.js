const API = 'http://localhost:3000/api/juegos';
let juegoAEliminar = null;

// ————— NOTIFICACIÓN —————
function mostrarNotificacion(mensaje, tipo = 'exito') {
  const notif = document.getElementById('notificacion');
  notif.textContent = mensaje;
  notif.className = `notificacion ${tipo}`;
  notif.style.display = 'block';
  setTimeout(() => {
    notif.style.display = 'none';
  }, 3000);
}

// ————— CARGAR JUEGOS —————
async function cargarJuegos() {
  const res = await fetch(API);
  const juegos = await res.json();

  const filtro = document.getElementById('filtro-estado').value;
  const lista = document.getElementById('lista-juegos');
  const sinResultados = document.getElementById('sin-resultados');

  const filtrados = filtro === 'todos'
    ? juegos
    : juegos.filter(j => j.estado === filtro);

  document.getElementById('total-pendiente').textContent = juegos.filter(j => j.estado === 'pendiente').length;
  document.getElementById('total-jugando').textContent = juegos.filter(j => j.estado === 'jugando').length;
  document.getElementById('total-terminado').textContent = juegos.filter(j => j.estado === 'terminado').length;

  lista.innerHTML = '';
  lista.appendChild(sinResultados);

  if (filtrados.length === 0) {
    sinResultados.style.display = 'block';
    return;
  }

  sinResultados.style.display = 'none';

  filtrados.forEach(juego => {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');
    tarjeta.innerHTML = `
      ${juego.portada ? `<img src="${juego.portada}" alt="${juego.titulo}">` : ''}
      <div class="tarjeta-info">
        <span class="badge ${juego.estado}">${juego.estado}</span>
        <h3>${juego.titulo}</h3>
        <p><i class="fa-solid fa-desktop"></i> ${juego.plataforma}</p>
        <p><i class="fa-solid fa-tags"></i> ${juego.genero}</p>
        <p><i class="fa-solid fa-star"></i> ${juego.calificacion ? `${juego.calificacion}/10` : 'Sin calificar aún'}</p>
        ${juego.notas ? `<p><i class="fa-solid fa-note-sticky"></i> ${juego.notas}</p>` : ''}
        <div class="tarjeta-botones">
          <button class="btn-editar" onclick="abrirEditar('${juego._id}')"><i class="fa-solid fa-pen"></i> Editar</button>
          <button class="btn-eliminar" onclick="abrirModal('${juego._id}')"><i class="fa-solid fa-trash"></i> Eliminar</button>
        </div>
      </div>
    `;

    tarjeta.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'I') return;
      abrirDetalle(juego);
    });

    lista.appendChild(tarjeta);
  });
}

// ————— DETALLE —————
function abrirDetalle(juego) {
  document.getElementById('detalle-titulo').textContent = juego.titulo;
  const badge = document.getElementById('detalle-badge');
  badge.textContent = juego.estado;
  badge.className = `badge ${juego.estado}`;
  document.getElementById('detalle-plataforma').textContent = juego.plataforma;
  document.getElementById('detalle-genero').textContent = juego.genero;
  document.getElementById('detalle-calificacion').textContent = juego.calificacion ? `${juego.calificacion}/10` : 'Sin calificación';
  document.getElementById('detalle-notas').textContent = juego.notas || 'Sin notas';
  document.getElementById('detalle-fecha').textContent = new Date(juego.fechaAgregado).toLocaleDateString('es-ES');
  document.getElementById('modal-detalle').style.display = 'flex';
}

document.getElementById('btn-cerrar-detalle').addEventListener('click', () => {
  document.getElementById('modal-detalle').style.display = 'none';
});

// ————— FORMULARIO —————
document.getElementById('btn-abrir-form').addEventListener('click', () => {
  document.getElementById('formulario').style.display = 'flex';
  document.getElementById('form-titulo').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar Juego';
  limpiarFormulario();
});

document.getElementById('btn-cancelar').addEventListener('click', () => {
  document.getElementById('formulario').style.display = 'none';
  limpiarFormulario();
});

function limpiarFormulario() {
  document.getElementById('juego-id').value = '';
  document.getElementById('titulo').value = '';
  document.getElementById('genero').value = '';
  document.getElementById('plataforma').value = '';
  document.getElementById('estado').value = 'pendiente';
  document.getElementById('calificacion').value = '';
  document.getElementById('portada').value = '';
  document.getElementById('notas').value = '';
}

// ————— GUARDAR —————
document.getElementById('btn-guardar').addEventListener('click', async () => {
  const id = document.getElementById('juego-id').value;
  const titulo = document.getElementById('titulo').value.trim();
  const genero = document.getElementById('genero').value.trim();
  const plataforma = document.getElementById('plataforma').value.trim();

  if (!titulo || !genero || !plataforma) {
    mostrarNotificacion('Título, género y plataforma son obligatorios', 'error');
    return;
  }
  if (titulo.length < 2) {
    mostrarNotificacion('El título debe tener al menos 2 caracteres', 'error');
    return;
  }
  if (genero.length < 3) {
    mostrarNotificacion('El género debe tener al menos 3 caracteres', 'error');
    return;
  }
  if (plataforma.length < 2) {
    mostrarNotificacion('La plataforma debe tener al menos 2 caracteres', 'error');
    return;
  }

  const datos = {
    titulo,
    genero,
    plataforma,
    estado: document.getElementById('estado').value,
    calificacion: document.getElementById('calificacion').value || null,
    portada: document.getElementById('portada').value,
    notas: document.getElementById('notas').value
  };

  if (id) {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    mostrarNotificacion('Juego actualizado exitosamente');
  } else {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    mostrarNotificacion('Juego agregado exitosamente');
  }

  document.getElementById('formulario').style.display = 'none';
  limpiarFormulario();
  cargarJuegos();
});

// ————— EDITAR —————
async function abrirEditar(id) {
  const res = await fetch(API);
  const juegos = await res.json();
  const juego = juegos.find(j => j._id === id);

  document.getElementById('juego-id').value = juego._id;
  document.getElementById('titulo').value = juego.titulo;
  document.getElementById('genero').value = juego.genero;
  document.getElementById('plataforma').value = juego.plataforma;
  document.getElementById('estado').value = juego.estado;
  document.getElementById('calificacion').value = juego.calificacion || '';
  document.getElementById('portada').value = juego.portada || '';
  document.getElementById('notas').value = juego.notas || '';

  document.getElementById('form-titulo').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Juego';
  document.getElementById('formulario').style.display = 'flex';
}

// ————— ELIMINAR —————
function abrirModal(id) {
  juegoAEliminar = id;
  document.getElementById('modal').style.display = 'flex';
}

document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => {
  document.getElementById('modal').style.display = 'none';
  juegoAEliminar = null;
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {
  await fetch(`${API}/${juegoAEliminar}`, { method: 'DELETE' });
  mostrarNotificacion('Juego eliminado');
  document.getElementById('modal').style.display = 'none';
  juegoAEliminar = null;
  cargarJuegos();
});

// ————— FILTRO —————
document.getElementById('filtro-estado').addEventListener('change', cargarJuegos);

// ————— INICIAR —————
cargarJuegos();