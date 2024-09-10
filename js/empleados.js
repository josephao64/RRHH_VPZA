import { db } from './firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Cargar empleados y sucursales al inicio
window.onload = () => {
    cargarSucursalesFiltro();
    listarEmpleados();
};

// Inicializar el modal de agregar empleado y el de estado del empleado
document.addEventListener('DOMContentLoaded', () => {
    const btnAgregarEmpleado = document.getElementById('btnAgregarEmpleado');
    const modalEmpleado = document.getElementById('modalEmpleado');
    const closeEmpleado = document.getElementById('closeEmpleado');
    
    if (btnAgregarEmpleado && modalEmpleado) {
        btnAgregarEmpleado.addEventListener('click', () => {
            modalEmpleado.style.display = 'block';
            document.getElementById('nuevoEmpleadoForm').reset();
            cargarSucursales();
        });
    }

    if (closeEmpleado && modalEmpleado) {
        closeEmpleado.addEventListener('click', () => {
            modalEmpleado.style.display = 'none';
        });
    }

    // Lógica para cerrar el modal de suspensión IGSS con la "X"
    const closeSuspension = document.getElementById('closeSuspension');
    const modalSuspension = document.getElementById('modalSuspension');

    if (closeSuspension && modalSuspension) {
        closeSuspension.addEventListener('click', () => {
            modalSuspension.style.display = 'none';
        });
    }

    // Lógica para modificar estado del empleado
    const btnEstadoEmpleado = document.getElementById('btnEstadoEmpleado');
    const modalEstadoEmpleado = document.getElementById('modalEstadoEmpleado');
    const closeEstadoEmpleado = document.getElementById('closeEstadoEmpleado');
    const formEstadoEmpleado = document.getElementById('formEstadoEmpleado');
    let estadoSeleccionado = ''; // Almacenar si es "Despedido" o "Renuncia"

    if (btnEstadoEmpleado && modalEstadoEmpleado) {
        btnEstadoEmpleado.addEventListener('click', () => {
            modalEstadoEmpleado.style.display = 'block';
        });
    }

    if (closeEstadoEmpleado && modalEstadoEmpleado) {
        closeEstadoEmpleado.addEventListener('click', () => {
            modalEstadoEmpleado.style.display = 'none';
            formEstadoEmpleado.style.display = 'none'; // Ocultar formulario cuando se cierra el modal
        });
    }

    const btnDespedido = document.getElementById('btnDespedido');
    const btnRenuncia = document.getElementById('btnRenuncia');
    if (btnDespedido && btnRenuncia) {
        btnDespedido.addEventListener('click', () => {
            estadoSeleccionado = 'Despedido';
            formEstadoEmpleado.style.display = 'block'; // Mostrar el formulario para la fecha
        });

        btnRenuncia.addEventListener('click', () => {
            estadoSeleccionado = 'Renuncia';
            formEstadoEmpleado.style.display = 'block'; // Mostrar el formulario para la fecha
        });
    }

    formEstadoEmpleado.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fechaEstado = document.getElementById('fechaEstadoEmpleado').value;

        if (estadoSeleccionado) {
            const empleadoId = formEstadoEmpleado.getAttribute('data-empleado-id');
            
            // Actualizar el estado del empleado en Firestore
            await updateDoc(doc(db, "empleados", empleadoId), {
                estado: estadoSeleccionado,
                fechaEstado: fechaEstado
            });

            alert(`Estado del empleado actualizado a ${estadoSeleccionado}`);
            modalEstadoEmpleado.style.display = 'none'; // Cerrar modal
            formEstadoEmpleado.style.display = 'none'; // Ocultar formulario
            verDetalles(empleadoId); // Refrescar detalles del empleado
        }
    });
});

// Cargar las sucursales en el select dentro del formulario de agregar empleado
async function cargarSucursales() {
    const sucursalesSelect = document.getElementById('sucursalEmpleado');
    if (sucursalesSelect) {
        sucursalesSelect.innerHTML = '<option value="">Seleccionar Sucursal</option>';
        const querySnapshot = await getDocs(collection(db, "sucursales"));
        querySnapshot.forEach((doc) => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().nombre;
            sucursalesSelect.appendChild(option);
        });
    }
}

// Función para guardar un nuevo empleado
document.addEventListener('DOMContentLoaded', () => {
    const nuevoEmpleadoForm = document.getElementById('nuevoEmpleadoForm');
    if (nuevoEmpleadoForm) {
        nuevoEmpleadoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombreEmpleado').value;
            const apellido = document.getElementById('apellidoEmpleado').value;
            const fechaNacimiento = document.getElementById('fechaNacimientoEmpleado').value;
            const dpi = document.getElementById('dpiEmpleado').value;
            const fechaInicioLabores = document.getElementById('fechaInicioLabores').value;
            const telefono = document.getElementById('telefonoEmpleado').value;
            const puesto = document.getElementById('puestoEmpleado').value;
            const salario = document.getElementById('salarioEmpleado').value;
            const sucursal = document.getElementById('sucursalEmpleado').value;

            const sucursalDoc = await getDoc(doc(db, "sucursales", sucursal));
            const sucursalNombre = sucursalDoc.data().nombre;

            const igssEstado = document.getElementById('igssEstado').value;
            const igssFechaInscrito = document.getElementById('igssFechaInscrito').value || null;
            const igssNumeroAfiliacion = document.getElementById('igssNumeroAfiliacion').value || null;

            await addDoc(collection(db, "empleados"), {
                nombre: nombre,
                apellido: apellido,
                fechaNacimiento: fechaNacimiento,
                dpi: dpi,
                fechaInicioLabores: fechaInicioLabores,
                telefono: telefono,
                puesto: puesto,
                salario: salario,
                sucursal: sucursal,
                sucursalNombre: sucursalNombre,
                igss: {
                    estado: igssEstado,
                    fechaInscrito: igssFechaInscrito,
                    numeroAfiliacion: igssNumeroAfiliacion
                }
            });

            alert("Empleado guardado correctamente");
            document.getElementById('modalEmpleado').style.display = 'none';
            listarEmpleados(sucursal); // Actualizar la lista de empleados para la sucursal seleccionada
        });
    }
});

// Función para listar empleados y mostrar el nombre de la sucursal seleccionada
async function listarEmpleados(sucursal = '') {
    const empleadosTabla = document.getElementById('empleadosTabla');
    empleadosTabla.innerHTML = ''; // Limpiar la tabla

    let empleadosQuery;
    if (sucursal) {
        empleadosQuery = query(collection(db, "empleados"), where("sucursal", "==", sucursal));
        const sucursalDoc = await getDoc(doc(db, "sucursales", sucursal));
        document.getElementById('tituloSucursal').textContent = `Empleados de la Sucursal: ${sucursalDoc.data().nombre}`;
    } else {
        empleadosQuery = collection(db, "empleados");
        document.getElementById('tituloSucursal').textContent = "Seleccione una Sucursal";
    }

    const querySnapshot = await getDocs(empleadosQuery);
    querySnapshot.forEach((doc) => {
        const empleado = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${empleado.nombre} ${empleado.apellido}</td>
            <td>${empleado.telefono}</td>
            <td>${empleado.puesto}</td>
            <td>${empleado.sucursalNombre}</td>
            <td>
                <button onclick="verDetalles('${doc.id}')">Ver Detalles</button>
                <button onclick="eliminarEmpleado('${doc.id}')">Eliminar</button>
            </td>
        `;
        empleadosTabla.appendChild(tr);
    });
}

// Hacer que las funciones verDetalles y eliminarEmpleado sean accesibles globalmente
window.verDetalles = async function(id) {
    const empleadoRef = doc(db, "empleados", id);
    const empleadoSnapshot = await getDoc(empleadoRef);
    
    if (empleadoSnapshot.exists()) {
        const empleado = empleadoSnapshot.data();

        document.getElementById('detallesNombre').textContent = `Nombre: ${empleado.nombre} ${empleado.apellido}`;
        document.getElementById('detallesTelefono').textContent = `Teléfono: ${empleado.telefono}`;
        document.getElementById('detallesPuesto').textContent = `Puesto: ${empleado.puesto}`;
        document.getElementById('detallesSucursal').textContent = `Sucursal: ${empleado.sucursalNombre}`;
        
        // Calcular el tiempo trabajado en años, meses y días
        const fechaInicioLabores = new Date(empleado.fechaInicioLabores);
        const fechaActual = new Date();
        const tiempoTrabajado = calcularTiempoTrabajado(fechaInicioLabores, fechaActual);

        // Mostrar el tiempo trabajado
        document.getElementById('detallesTiempoTrabajado').textContent = `Tiempo Trabajado: ${tiempoTrabajado.years} años, ${tiempoTrabajado.months} meses y ${tiempoTrabajado.days} días`;

        // Determinar si es apto para vacaciones y mostrar la fecha cuando será apto si no tiene un año
        if (tiempoTrabajado.years >= 1) {
            document.getElementById('detallesAptoVacaciones').textContent = 'Apto para Vacaciones: Sí';
            document.getElementById('proximoApto').style.display = 'none';
        } else {
            document.getElementById('detallesAptoVacaciones').textContent = 'Apto para Vacaciones: No';
            const fechaApto = new Date(fechaInicioLabores);
            fechaApto.setFullYear(fechaInicioLabores.getFullYear() + 1);
            document.getElementById('proximoApto').textContent = `Será apto el: ${fechaApto.toLocaleDateString()}`;
        }

        // Mostrar estado de vacaciones
        const vacaciones = empleado.vacaciones || {};
        document.getElementById('detallesDiasTrabajados').textContent = `Días Laborados: ${vacaciones.diasTrabajados || 'No disponible'}`;
        document.getElementById('detallesVacacionesEstado').textContent = `Estado: ${vacaciones.estado || 'No programado'}`;
        document.getElementById('detallesPagosVacaciones').textContent = `Total a Pagar: ${vacaciones.totalPagar || 'N/A'}`;
        document.getElementById('detallesFechasVacaciones').textContent = `Vacaciones Programadas: ${vacaciones.fechaInicio || 'No'}`;

        document.getElementById('detallesEmpleado').style.display = 'block';

        // Asignar funcionalidad a botón de programar vacaciones
        document.getElementById('btnProgramarVacaciones').addEventListener('click', () => {
            abrirModalVacaciones(id);
        });

        // Asignar funcionalidad a botón de actualizar IGSS
        document.getElementById('btnEstadoIGSS').addEventListener('click', () => {
            abrirModalActualizarIGSS(id);
        });

        // Asignar los botones de apertura de modales
        document.getElementById('btnSuspensionIGSS').addEventListener('click', () => {
            document.getElementById('modalSuspension').style.display = 'block';
        });

        document.getElementById('btnAdelantoSueldo').addEventListener('click', () => {
            abrirModalAdelanto(id); // Abrir modal de adelanto con el ID del empleado
        });

        document.getElementById('btnEstadoEmpleado').addEventListener('click', () => {
            abrirModalEstadoEmpleado(id); // Abrir modal de estado del empleado
        });

        // Cerrar ventana de detalles
        document.getElementById('cerrarDetalles').addEventListener('click', () => {
            document.getElementById('detallesEmpleado').style.display = 'none';
        });
    }
}

// Hacer que eliminarEmpleado sea accesible globalmente
window.eliminarEmpleado = async function(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
        await deleteDoc(doc(db, "empleados", id));
        listarEmpleados(); // Actualizar lista
    }
}

// Función para abrir el modal de vacaciones
function abrirModalVacaciones(idEmpleado) {
    const formGozarVacaciones = document.getElementById('formGozarVacaciones');
    const formPagarVacaciones = document.getElementById('formPagarVacaciones');
    document.getElementById('modalVacaciones').style.display = 'block';

    // Mostrar los botones para elegir entre "Pagar" o "Gozar" vacaciones
    document.getElementById('btnGozarVacaciones').addEventListener('click', () => {
        formGozarVacaciones.style.display = 'block';
        formPagarVacaciones.style.display = 'none';
    });

    document.getElementById('btnPagarVacaciones').addEventListener('click', () => {
        formPagarVacaciones.style.display = 'block';
        formGozarVacaciones.style.display = 'none';
    });

    // Al programar vacaciones, la fecha de fin se establecerá automáticamente como 15 días después de la fecha de inicio
    formGozarVacaciones.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fechaInicio = document.getElementById('fechaInicioVacaciones').value;
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 15);
        document.getElementById('fechaFinVacaciones').value = fechaFin.toLocaleDateString();

        await updateDoc(doc(db, "empleados", idEmpleado), {
            vacaciones: {
                fechaInicio: fechaInicio,
                fechaFin: fechaFin.toISOString().split('T')[0],
                estado: 'Gozará Vacaciones'
            }
        });

        alert('Vacaciones programadas correctamente');
        document.getElementById('modalVacaciones').style.display = 'none';
        verDetalles(idEmpleado);
    });

    // Al pagar vacaciones, se podrá dividir en varios pagos
    formPagarVacaciones.addEventListener('submit', async (e) => {
        e.preventDefault();
        const numeroPagos = document.getElementById('numeroPagosVacaciones').value;
        const fechaPago = document.getElementById('fechaPagoVacaciones').value;
        const totalPagar = document.getElementById('totalPagarVacaciones').value;

        await updateDoc(doc(db, "empleados", idEmpleado), {
            vacaciones: {
                numeroPagos: numeroPagos,
                fechaPago: fechaPago,
                totalPagar: totalPagar,
                estado: 'Pagará Vacaciones'
            }
        });

        alert('Pago de vacaciones registrado correctamente');
        document.getElementById('modalVacaciones').style.display = 'none';
        verDetalles(idEmpleado);
    });

    document.getElementById('closeVacaciones').addEventListener('click', () => {
        document.getElementById('modalVacaciones').style.display = 'none';
    });
}

// Función para abrir el modal de actualización de IGSS
function abrirModalActualizarIGSS(idEmpleado) {
    document.getElementById('modalActualizarIGSS').style.display = 'block';

    document.getElementById('formActualizarIGSS').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener los nuevos datos del IGSS
        const nuevoEstado = document.getElementById('igssEstadoActualizado').value;
        const nuevaFechaInscrito = document.getElementById('igssFechaInscritoActualizado').value || null;
        const nuevoNumeroAfiliacion = document.getElementById('igssNumeroAfiliacionActualizado').value || null;

        // Actualizar los datos en Firestore
        await updateDoc(doc(db, "empleados", idEmpleado), {
            igss: {
                estado: nuevoEstado,
                fechaInscrito: nuevaFechaInscrito,
                numeroAfiliacion: nuevoNumeroAfiliacion
            }
        });

        alert('Datos de IGSS actualizados correctamente');
        document.getElementById('modalActualizarIGSS').style.display = 'none';
        verDetalles(idEmpleado);
    });

    document.getElementById('closeActualizarIGSS').addEventListener('click', () => {
        document.getElementById('modalActualizarIGSS').style.display = 'none';
    });
}

// Función para abrir el modal de adelanto de sueldo
function abrirModalAdelanto(idEmpleado) {
    document.getElementById('modalAdelanto').style.display = 'block';

    document.getElementById('formAdelantoSueldo').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fechaAdelanto = document.getElementById('fechaAdelanto').value;
        const montoAdelanto = document.getElementById('montoAdelanto').value;

        // Guardar adelanto en la base de datos
        await updateDoc(doc(db, "empleados", idEmpleado), {
            adelanto: {
                fecha: fechaAdelanto,
                monto: montoAdelanto,
                deuda: montoAdelanto
            }
        });

        alert('Adelanto de sueldo guardado correctamente');
        document.getElementById('modalAdelanto').style.display = 'none';
        verDetalles(idEmpleado);
    });

    document.getElementById('closeAdelanto').addEventListener('click', () => {
        document.getElementById('modalAdelanto').style.display = 'none';
    });
}

// Función para abrir el modal de estado del empleado
function abrirModalEstadoEmpleado(idEmpleado) {
    const modalEstadoEmpleado = document.getElementById('modalEstadoEmpleado');
    const formEstadoEmpleado = document.getElementById('formEstadoEmpleado');
    formEstadoEmpleado.setAttribute('data-empleado-id', idEmpleado); // Pasar el ID del empleado al formulario
    modalEstadoEmpleado.style.display = 'block';
}

// Función para calcular el tiempo trabajado en años, meses y días
function calcularTiempoTrabajado(fechaInicio, fechaActual) {
    let years = fechaActual.getFullYear() - fechaInicio.getFullYear();
    let months = fechaActual.getMonth() - fechaInicio.getMonth();
    let days = fechaActual.getDate() - fechaInicio.getDate();

    // Ajuste de días y meses si es necesario
    if (days < 0) {
        months--;
        const diasMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0).getDate();
        days += diasMesAnterior;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

// Función para cargar las sucursales en el filtro
async function cargarSucursalesFiltro() {
    const sucursalFiltro = document.getElementById('sucursalFiltro');
    const querySnapshot = await getDocs(collection(db, "sucursales"));
    sucursalFiltro.innerHTML = '<option value="">Seleccionar Sucursal</option>';
    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().nombre;
        sucursalFiltro.appendChild(option);
    });
}
