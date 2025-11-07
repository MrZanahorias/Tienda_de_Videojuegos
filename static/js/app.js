// Configuración de la API
const API_BASE_URL = '/api';

// Estado de la aplicación
let editingVideojuegoId = null;

// Elementos del DOM
const videojuegoForm = document.getElementById('videojuego-form');
const videojuegosTbody = document.getElementById('videojuegos-tbody');
const loadingDiv = document.getElementById('loading');
const errorMessageDiv = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const videojuegosTable = document.getElementById('videojuegos-table');
const refreshBtn = document.getElementById('refresh-btn');
const cancelBtn = document.getElementById('cancel-btn');
const modalTitleText = document.getElementById('modal-title-text');
const btnText = document.getElementById('btn-text');
const gameModal = document.getElementById('game-modal');
const closeModalBtn = document.getElementById('close-modal');
const addBtn = document.querySelector('.add-btn');

// Verificar que los elementos críticos existan
if (!videojuegoForm) {
    console.error('Error: No se encontró el formulario videojuego-form');
}
if (!videojuegosTbody) {
    console.error('Error: No se encontró el tbody videojuegos-tbody');
}
if (!videojuegosTable) {
    console.error('Error: No se encontró la tabla videojuegos-table');
}

// Obtener el token CSRF de Django
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Obtener CSRF token
function getCSRFToken() {
    let token = getCookie('csrftoken');
    // Si no hay cookie, intentar obtener del meta tag
    if (!token) {
        const metaTag = document.querySelector('meta[name=csrf-token]');
        if (metaTag) {
            token = metaTag.getAttribute('content');
        }
    }
    return token;
}

const csrftoken = getCSRFToken();

// Mostrar toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Mostrar/ocultar loading
function setLoading(isLoading) {
    loadingDiv.style.display = isLoading ? 'block' : 'none';
}

// Mostrar error
function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    setTimeout(() => {
        errorMessageDiv.style.display = 'none';
    }, 5000);
}

// Cargar videojuegos
async function cargarVideojuegos() {
    setLoading(true);
    errorMessageDiv.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE_URL}/videojuegos/`);
        
        if (!response.ok) {
            throw new Error('Error al cargar videojuegos');
        }
        
        const videojuegos = await response.json();
        mostrarVideojuegos(videojuegos);
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar los videojuegos. Por favor, intenta de nuevo.');
    } finally {
        setLoading(false);
    }
}

// Mapeo de nombres de plataformas y géneros
const PLATAFORMAS_NOMBRES = {
    'PC': 'PC',
    'PS5': 'PlayStation 5',
    'PS4': 'PlayStation 4',
    'XBOX_SERIES': 'Xbox Series X/S',
    'XBOX_ONE': 'Xbox One',
    'SWITCH': 'Nintendo Switch',
    'MULTI': 'Multiplataforma'
};

const GENEROS_NOMBRES = {
    'ACCION': 'Acción',
    'AVENTURA': 'Aventura',
    'RPG': 'RPG',
    'DEPORTES': 'Deportes',
    'ESTRATEGIA': 'Estrategia',
    'SIMULACION': 'Simulación',
    'CARRERAS': 'Carreras',
    'SHOOTER': 'Shooter',
    'TERROR': 'Terror',
    'PUZZLE': 'Puzzle'
};

// Mostrar videojuegos en la tabla
function mostrarVideojuegos(videojuegos) {
    videojuegosTbody.innerHTML = '';
    
    if (videojuegos.length === 0) {
        videojuegosTable.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    videojuegosTable.style.display = 'table';
    emptyState.style.display = 'none';
    
    videojuegos.forEach(videojuego => {
        const tr = document.createElement('tr');
        // Formatear fecha de lanzamiento si existe
        let fechaFormateada = 'N/A';
        if (videojuego.fecha_lanzamiento) {
            const fecha = new Date(videojuego.fecha_lanzamiento);
            fechaFormateada = fecha.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        
        tr.innerHTML = `
            <td>${videojuego.id}</td>
            <td><strong>${videojuego.titulo}</strong></td>
            <td>${PLATAFORMAS_NOMBRES[videojuego.plataforma] || videojuego.plataforma}</td>
            <td>${GENEROS_NOMBRES[videojuego.genero] || videojuego.genero}</td>
            <td>${videojuego.desarrollador || 'N/A'}</td>
            <td><strong>$${parseFloat(videojuego.precio).toFixed(2)}</strong></td>
            <td>${videojuego.stock}</td>
            <td>
                <button class="btn btn-edit" onclick="editarVideojuego(${videojuego.id})"> Editar</button>
                <button class="btn btn-delete" onclick="eliminarVideojuego(${videojuego.id})"> Eliminar</button>
            </td>
        `;
        videojuegosTbody.appendChild(tr);
    });
}

// Funciones del modal
function abrirModal() {
    if (gameModal) {
        gameModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal() {
    if (gameModal) {
        gameModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    cancelarEdicion();
}

// Validar formulario
function validarFormulario() {
    const errores = [];
    
    // Validar título (requerido)
    const titulo = document.getElementById('titulo').value.trim();
    if (!titulo) {
        errores.push('El título es requerido');
    }
    
    // Validar precio (requerido y positivo)
    const precioStr = document.getElementById('precio').value;
    if (!precioStr) {
        errores.push('El precio es requerido');
    } else {
        const precio = parseFloat(precioStr);
        if (isNaN(precio)) {
            errores.push('El precio debe ser un número válido');
        } else if (precio < 0) {
            errores.push('El precio debe ser mayor o igual a 0');
        }
    }
    
    // Validar stock (requerido y no negativo)
    const stockStr = document.getElementById('stock').value;
    if (stockStr === '' || stockStr === null || stockStr === undefined) {
        errores.push('El stock es requerido');
    } else {
        const stock = parseInt(stockStr);
        if (isNaN(stock)) {
            errores.push('El stock debe ser un número entero válido');
        } else if (stock < 0) {
            errores.push('El stock debe ser mayor o igual a 0');
        }
    }
    
    // Validar plataforma (requerido)
    const plataforma = document.getElementById('plataforma').value;
    if (!plataforma) {
        errores.push('La plataforma es requerida');
    }
    
    // Validar género (requerido)
    const genero = document.getElementById('genero').value;
    if (!genero) {
        errores.push('El género es requerido');
    }
    
    return errores;
}

// Crear o actualizar videojuego
videojuegoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const errores = validarFormulario();
    if (errores.length > 0) {
        showToast(errores.join('; '), 'error');
        return;
    }
    
    // Preparar datos del formulario
    const fechaLanzamientoValue = document.getElementById('fecha_lanzamiento').value;
    
    const formData = {
        titulo: document.getElementById('titulo').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        plataforma: document.getElementById('plataforma').value,
        genero: document.getElementById('genero').value,
        desarrollador: document.getElementById('desarrollador').value.trim(),
        fecha_lanzamiento: fechaLanzamientoValue || null
    };
    
    // En actualización, si fecha_lanzamiento está vacío, enviar null explícitamente
    if (editingVideojuegoId && !fechaLanzamientoValue) {
        formData.fecha_lanzamiento = null;
    }
    
    try {
        let response;
        
        // Preparar headers
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Agregar CSRF token solo si existe (las vistas usan @csrf_exempt pero por si acaso)
        if (csrftoken) {
            headers['X-CSRFToken'] = csrftoken;
        }
        
        if (editingVideojuegoId) {
            // Actualizar videojuego existente
            response = await fetch(`${API_BASE_URL}/videojuegos/${editingVideojuegoId}/actualizar/`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(formData)
            });
        } else {
            // Crear nuevo videojuego
            response = await fetch(`${API_BASE_URL}/videojuegos/crear/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });
        }
        
        if (!response.ok) {
            let errorMessage = 'Error al guardar el videojuego';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        const mensaje = editingVideojuegoId ? '✅ Videojuego actualizado correctamente' : '✅ Videojuego creado correctamente';
        showToast(mensaje, 'success');
        
        // Cerrar modal y resetear
        cerrarModal();
        
        // Recargar videojuegos para actualizar la tabla
        await cargarVideojuegos();
        
        console.log('Videojuego guardado exitosamente. Tabla actualizada.');
        
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ ' + error.message, 'error');
    }
});

// Editar videojuego
async function editarVideojuego(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/videojuegos/${id}/`);
        
        if (!response.ok) {
            throw new Error('Error al cargar el videojuego');
        }
        
        const videojuego = await response.json();
        
        // Llenar el formulario
        document.getElementById('titulo').value = videojuego.titulo;
        document.getElementById('descripcion').value = videojuego.descripcion || '';
        document.getElementById('precio').value = videojuego.precio;
        document.getElementById('stock').value = videojuego.stock;
        document.getElementById('plataforma').value = videojuego.plataforma;
        document.getElementById('genero').value = videojuego.genero;
        document.getElementById('desarrollador').value = videojuego.desarrollador || '';
        // Manejar fecha de lanzamiento (formato YYYY-MM-DD para input type="date")
        if (videojuego.fecha_lanzamiento) {
            // Si viene en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS)
            const fecha = videojuego.fecha_lanzamiento.split('T')[0];
            document.getElementById('fecha_lanzamiento').value = fecha;
        } else {
            document.getElementById('fecha_lanzamiento').value = '';
        }
        
        // Cambiar estado a edición
        editingVideojuegoId = id;
        if (modalTitleText) {
            modalTitleText.textContent = 'Editar Videojuego';
        }
        if (btnText) {
            btnText.textContent = 'Actualizar Videojuego';
        }
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }
        
        // Abrir modal si existe
        if (gameModal) {
            abrirModal();
        } else {
            // Si no hay modal, hacer scroll al formulario
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al cargar el videojuego para editar', 'error');
    }
}

// Cancelar edición
function cancelarEdicion() {
    editingVideojuegoId = null;
    if (modalTitleText) {
        modalTitleText.textContent = 'Agregar Nuevo Videojuego';
    }
    if (btnText) {
        btnText.textContent = 'Agregar Videojuego';
    }
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
    if (videojuegoForm) {
        videojuegoForm.reset();
    }
}

// Eliminar videojuego
async function eliminarVideojuego(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este videojuego?')) {
        return;
    }
    
    try {
        // Preparar headers
        const headers = {};
        if (csrftoken) {
            headers['X-CSRFToken'] = csrftoken;
        }
        
        const response = await fetch(`${API_BASE_URL}/videojuegos/${id}/eliminar/`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar el videojuego');
        }
        
        showToast('✅ Videojuego eliminado correctamente', 'success');
        await cargarVideojuegos();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al eliminar el videojuego', 'error');
    }
}

// Event listeners
if (refreshBtn) {
    refreshBtn.addEventListener('click', cargarVideojuegos);
}
if (cancelBtn) {
    cancelBtn.addEventListener('click', cerrarModal);
}
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', cerrarModal);
}
if (addBtn) {
    addBtn.addEventListener('click', abrirModal);
}

// Cerrar modal al hacer click fuera
if (gameModal) {
    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) {
            cerrarModal();
        }
    });
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameModal && gameModal.classList.contains('show')) {
        cerrarModal();
    }
});

// Cargar videojuegos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarVideojuegos();
});
