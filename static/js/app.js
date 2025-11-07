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
const formTitle = document.getElementById('form-title');
const btnText = document.getElementById('btn-text');

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

const csrftoken = getCookie('csrftoken');

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
        tr.innerHTML = `
            <td>${videojuego.id}</td>
            <td>${videojuego.titulo}</td>
            <td>${PLATAFORMAS_NOMBRES[videojuego.plataforma] || videojuego.plataforma}</td>
            <td>${GENEROS_NOMBRES[videojuego.genero] || videojuego.genero}</td>
            <td>${videojuego.desarrollador || 'N/A'}</td>
            <td>$${parseFloat(videojuego.precio).toFixed(2)}</td>
            <td>${videojuego.stock}</td>
            <td>
                <button class="btn btn-edit" onclick="editarVideojuego(${videojuego.id})">✏️ Editar</button>
                <button class="btn btn-delete" onclick="eliminarVideojuego(${videojuego.id})">🗑️ Eliminar</button>
            </td>
        `;
        videojuegosTbody.appendChild(tr);
    });
}

// Crear o actualizar videojuego
videojuegoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        plataforma: document.getElementById('plataforma').value,
        genero: document.getElementById('genero').value,
        desarrollador: document.getElementById('desarrollador').value,
        fecha_lanzamiento: document.getElementById('fecha_lanzamiento').value || null
    };
    
    try {
        let response;
        
        if (editingVideojuegoId) {
            // Actualizar videojuego existente
            response = await fetch(`${API_BASE_URL}/videojuegos/${editingVideojuegoId}/actualizar/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Crear nuevo videojuego
            response = await fetch(`${API_BASE_URL}/videojuegos/crear/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(formData)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar el videojuego');
        }
        
        const mensaje = editingVideojuegoId ? 'Videojuego actualizado correctamente' : 'Videojuego creado correctamente';
        showToast(mensaje, 'success');
        
        // Resetear formulario
        videojuegoForm.reset();
        cancelarEdicion();
        
        // Recargar videojuegos
        await cargarVideojuegos();
        
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
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
        document.getElementById('fecha_lanzamiento').value = videojuego.fecha_lanzamiento || '';
        
        // Cambiar estado a edición
        editingVideojuegoId = id;
        formTitle.textContent = 'Editar Videojuego';
        btnText.textContent = 'Actualizar Videojuego';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll al formulario
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar el videojuego para editar', 'error');
    }
}

// Cancelar edición
function cancelarEdicion() {
    editingVideojuegoId = null;
    formTitle.textContent = 'Agregar Nuevo Videojuego';
    btnText.textContent = 'Agregar Videojuego';
    cancelBtn.style.display = 'none';
    videojuegoForm.reset();
}

// Eliminar videojuego
async function eliminarVideojuego(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este videojuego?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/videojuegos/${id}/eliminar/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar el videojuego');
        }
        
        showToast('Videojuego eliminado correctamente', 'success');
        await cargarVideojuegos();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al eliminar el videojuego', 'error');
    }
}

// Event listeners
refreshBtn.addEventListener('click', cargarVideojuegos);
cancelBtn.addEventListener('click', cancelarEdicion);

// Cargar videojuegos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarVideojuegos();
});
