// Archivo: /public/js/main.js

import { initEmpleados } from './empleados.js';
import { initConfiguracion } from './configuracion.js';

document.addEventListener('DOMContentLoaded', () => {
    // Ocultar todas las secciones al inicio
    document.getElementById('empleadosSection').style.display = 'none';
    document.getElementById('configuracionSection').style.display = 'none';

    // Configurar botones del menú principal
    document.getElementById('btnEmpleados').addEventListener('click', () => {
        mostrarSeccion('empleadosSection');
        initEmpleados();
    });

    document.getElementById('btnConfiguracion').addEventListener('click', () => {
        mostrarSeccion('configuracionSection');
        initConfiguracion();
    });
});

// Función para mostrar la sección seleccionada y ocultar las demás
function mostrarSeccion(seccionId) {
    document.getElementById('empleadosSection').style.display = 'none';
    document.getElementById('configuracionSection').style.display = 'none';
    document.getElementById(seccionId).style.display = 'block';
}
