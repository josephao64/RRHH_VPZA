// Archivo: /public/js/configuracion.js

import { db } from './firebase.js';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Cargar sucursales al inicio
window.onload = listarSucursales;

// Inicializar el modal de agregar sucursal
document.getElementById('btnAgregarSucursal').addEventListener('click', () => {
    document.getElementById('modalSucursal').style.display = 'block';
    document.getElementById('nuevoSucursalForm').reset();
});

// Cerrar modal
document.getElementById('closeSucursal').addEventListener('click', () => {
    document.getElementById('modalSucursal').style.display = 'none';
});

// Enviar el formulario de sucursal (Agregar o Editar)
document.getElementById('nuevoSucursalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sucursalId = document.getElementById('sucursalId').value;
    if (sucursalId) {
        await actualizarSucursal(sucursalId); // Si existe el ID, es una actualización
    } else {
        await agregarSucursal(); // Si no hay ID, es una creación
    }
    document.getElementById('modalSucursal').style.display = 'none';
    listarSucursales(); // Actualizar lista de sucursales
});

// Función para listar sucursales
async function listarSucursales() {
    const sucursalesTabla = document.getElementById('sucursalesTabla');
    sucursalesTabla.innerHTML = ''; // Limpiar la tabla
    const querySnapshot = await getDocs(collection(db, "sucursales"));
    querySnapshot.forEach((doc) => {
        const sucursal = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sucursal.nombre}</td>
            <td>${sucursal.direccion}</td>
            <td>${sucursal.telefono}</td>
            <td>
                <button onclick="editarSucursal('${doc.id}')">Editar</button>
                <button onclick="eliminarSucursal('${doc.id}')">Eliminar</button>
            </td>
        `;
        sucursalesTabla.appendChild(tr);
    });
}

// Función para agregar una nueva sucursal
async function agregarSucursal() {
    const nuevaSucursal = obtenerDatosFormulario();
    await addDoc(collection(db, "sucursales"), nuevaSucursal);
    alert('Sucursal agregada correctamente');
}

// Función para actualizar una sucursal existente
async function actualizarSucursal(id) {
    const sucursalRef = doc(db, "sucursales", id);
    const datosActualizados = obtenerDatosFormulario();
    await updateDoc(sucursalRef, datosActualizados);
    alert('Sucursal actualizada correctamente');
}

// Función para eliminar una sucursal
async function eliminarSucursal(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) {
        await deleteDoc(doc(db, "sucursales", id));
        listarSucursales(); // Actualizar lista
    }
}

// Función para cargar el formulario con los datos de una sucursal para editar
async function editarSucursal(id) {
    const sucursalRef = doc(db, "sucursales", id);
    const sucursalSnapshot = await getDocs(sucursalRef);
    if (sucursalSnapshot.exists()) {
        const sucursal = sucursalSnapshot.data();
        document.getElementById('nombreSucursal').value = sucursal.nombre;
        document.getElementById('direccion').value = sucursal.direccion;
        document.getElementById('telefono').value = sucursal.telefono;
        document.getElementById('sucursalId').value = id; // Guardar ID para actualizar
        document.getElementById('modalSucursal').style.display = 'block'; // Abrir el modal
    }
}

// Obtener datos del formulario
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombreSucursal').value,
        direccion: document.getElementById('direccion').value,
        telefono: document.getElementById('telefono').value
    };
}
