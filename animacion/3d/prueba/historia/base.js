// Utilidades de las pruebas de historia3d (no es parte de la API)
import { crearEscenario, util } from '../../escenario.js';
export * from '../../historia3d.js';
export * as H2 from '../../historia2d.js';
export { Karateka3D, cargarPoses, mezclar } from '../../karateka3d.js';
export { util as U };
export const ctx = document.getElementById('c').getContext('2d');
export function escenario(o = {}) { return crearEscenario(Object.assign({ escala: 0.5 }, o)); }
