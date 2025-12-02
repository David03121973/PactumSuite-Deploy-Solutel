const express = require("express");
const router = express.Router();
const facturaController = require("../controllers/facturaController");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   - name: Factura
 *     description: Operaciones relacionadas con facturas
 */

/**
 * @swagger
 * /Factura/createFactura:
 *   post:
 *     tags: [Factura]
 *     summary: Crear una nueva factura (Operación compleja que afecta inventario, entradas y validaciones)
 *     description: |
 *       Esta operación crea una nueva factura y realiza múltiples validaciones y actualizaciones en otras partes del sistema:
 *
 *       **Validaciones principales:**
 *       - Verifica existencia de contrato, usuario firmante y trabajador autorizado.
 *       - Para contratos de tipo 'Cliente': valida que el número consecutivo sea único por año y que la fecha sea posterior a la factura anterior (consecutivo - 1).
 *       - Valida stock disponible para productos en contratos de tipo 'Cliente'.
 *
 *       **Impacto en inventario:**
 *       - Para contratos 'Cliente': decrementa la cantidad en existencia de los productos.
 *       - Para contratos 'Proveedor': incrementa la cantidad en existencia de los productos.
 *
 *       **Creación de entradas:**
 *       - Para contratos 'Proveedor': crea registros en la tabla 'entradas' con los productos facturados.
 *
 *       **Servicios vs Productos:**
 *       - No se pueden enviar servicios y productos simultáneamente.
 *       - Los servicios se crean directamente en la tabla 'servicios'.
 *       - Los productos se asocian a través de 'factura_producto' con precios y costos personalizables para proveedores.
 *
 *       **Transacción completa:** Toda la operación se realiza en una transacción para garantizar consistencia.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [num_consecutivo, fecha, id_contrato]
 *             description: "Nota: No se puede enviar tanto 'services' como 'products' al mismo tiempo. Use solo uno de los dos. Para contratos de tipo 'Cliente', el número consecutivo debe ser único por año."
 *             properties:
 *               num_consecutivo: { type: integer, example: 1001 }
 *               fecha: { type: string, format: date-time }
 *               estado: { type: string, enum: ["Facturado", "No Facturado", "Cancelado"] }
 *               id_contrato: { type: integer, example: 5 }
 *               id_usuario: { type: integer, example: 2, description: 'ID del usuario que firma la factura (required, debe existir)'}
 *               id_trabajador_autorizado: { type: integer, example: 3 }
 *               nota: { type: string }
 *               cargoAdicional: { type: number, format: double, example: 10.5, description: 'Cargo adicional opcional, debe ser >= 0 o null' }
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [descripcion, cantidad, importe, unidadMedida]
 *                   properties:
 *                     descripcion: { type: string, example: "Servicio de mantenimiento" }
 *                     cantidad: { type: integer, example: 2 }
 *                     importe: { type: number, format: double, example: 150.5 }
 *                     unidadMedida: { type: string, example: "unidad" }
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id_producto, cantidad]
 *                   properties:
 *                     id_producto: { type: integer, example: 1, description: "ID del producto" }
 *                     cantidad: { type: number, format: double, example: 2.5, description: "Cantidad del producto", minimum: 0 }
 *                     precio: { type: number, format: double, description: "Precio personalizado para contratos de tipo Proveedor (opcional)" }
 *                     costo: { type: number, format: double, description: "Costo personalizado para contratos de tipo Proveedor (opcional)" }
 *     responses:
 *       201:
 *         description: Factura creada con sumas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_factura: { type: integer }
 *                     num_consecutivo: { type: integer }
 *                     fecha: { type: string, format: date-time }
 *                     estado: { type: string }
 *                     id_usuario: { type: integer }
 *                     cargoAdicional: { type: number, description: 'Cargo adicional asociado a la factura' }
 *                     suma_servicios: { type: number, description: "Suma total de servicios" }
 *                     suma_productos: { type: number, description: "Suma total de productos" }
 *                     suma_general: { type: number, description: "Suma general (servicios + productos)" }
 *       400:
 *         description: Error de validación
 */
router.post("/Factura/createFactura", authenticate("Administrador", "Comercial"), facturaController.createFactura);

/**
 * @swagger
 * /Factura:
 *   get:
 *     tags: [Factura]
 *     summary: Obtener todas las facturas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas con sumas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_factura: { type: integer }
 *                   num_consecutivo: { type: integer }
 *                   fecha: { type: string, format: date-time }
 *                   estado: { type: string }
 *                   id_usuario: { type: integer }
 *                   cargoAdicional: { type: number, description: 'Cargo adicional asociado a la factura' }
 *                   suma_servicios: { type: number, description: "Suma total de servicios" }
 *                   suma_productos: { type: number, description: "Suma total de productos" }
 *                   suma_general: { type: number, description: "Suma general (servicios + productos)" }
 */
router.get("/Factura", authenticate(), facturaController.getFacturas);

/**
 * @swagger
 * /Factura/{id}:
 *   get:
 *     tags: [Factura]
 *     summary: Obtener una factura por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Factura encontrada con sumas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_factura: { type: integer }
 *                 num_consecutivo: { type: integer }
 *                 fecha: { type: string, format: date-time }
 *                 estado: { type: string }
 *                 id_usuario: { type: integer }
 *                 cargoAdicional: { type: number, description: 'Cargo adicional asociado a la factura' }
 *                 suma_servicios: { type: number, description: "Suma total de servicios" }
 *                 suma_productos: { type: number, description: "Suma total de productos" }
 *                 suma_general: { type: number, description: "Suma general (servicios + productos)" }
 *       404:
 *         description: Factura no encontrada
 */
router.get("/Factura/:id", authenticate(), facturaController.getFacturaById);

/**
 * @swagger
 * /Factura/nextConsecutivo/{year}:
 *   get:
 *     tags: [Factura]
 *     summary: Obtener el siguiente número consecutivo disponible para facturas de tipo Cliente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema: { type: integer, minimum: 1900, maximum: 2100 }
 *         description: "Año para el cual se desea obtener el siguiente número consecutivo"
 *     responses:
 *       200:
 *         description: Siguiente número consecutivo disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     year: { type: integer, description: "Año consultado" }
 *                     nextConsecutivo: { type: integer, description: "Siguiente número consecutivo disponible" }
 *                     message: { type: string, description: "Mensaje descriptivo del resultado" }
 *       400:
 *         description: Error de validación (año inválido)
 *       500:
 *         description: Error interno del servidor
 */
router.get("/Factura/nextConsecutivo/:year", authenticate(), facturaController.getNextConsecutivo);

/**
 * @swagger
 * /Factura/updateFactura/{id}:
 *   put:
 *     tags: [Factura]
 *     summary: Actualizar una factura (Operación compleja que revierte y aplica cambios en inventario y entradas)
 *     description: |
 *       Esta operación actualiza una factura existente y maneja reversiones y aplicaciones de cambios en múltiples módulos:

 *       **Restricciones importantes:**
 *       - No se puede cambiar el usuario que firmó la factura original.
 *       - Si se actualizan servicios o productos, se reemplazan completamente los anteriores.

 *       **Validaciones principales:**
 *       - Verifica existencia de contrato, trabajador autorizado y usuario (si se cambia).
 *       - Para contratos de tipo 'Cliente': valida unicidad del número consecutivo por año y orden de fechas.
 *       - Valida stock disponible para nuevos productos en contratos de tipo 'Cliente'.

 *       **Gestión de inventario:**
 *       - **Reversión:** Restaura el inventario de productos anteriores (incrementa para 'Cliente', decrementa para 'Proveedor').
 *       - **Aplicación:** Aplica cambios de inventario para productos nuevos (decrementa para 'Cliente', incrementa para 'Proveedor').

 *       **Gestión de entradas:**
 *       - Elimina entradas anteriores si el contrato era 'Proveedor'.
 *       - Crea nuevas entradas para productos actualizados si el contrato nuevo es 'Proveedor'.

 *       **Servicios vs Productos:**
 *       - No se pueden enviar servicios y productos simultáneamente.
 *       - Los servicios se eliminan y recrean completamente.
 *       - Los productos se asocian con precios y costos personalizables para proveedores.

 *       **Transacción completa:** Toda la operación se realiza en una transacción para mantener consistencia.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "Nota: No se puede enviar tanto 'services' como 'products' al mismo tiempo. Use solo uno de los dos. Para contratos de tipo 'Cliente', el número consecutivo debe ser único por año."
 *             properties:
 *               num_consecutivo: { type: integer }
 *               fecha: { type: string, format: date-time }
 *               estado: { type: string, enum: ["Facturado", "No Facturado", "Cancelado"] }
 *               id_contrato: { type: integer }
 *               id_usuario: { type: integer }
 *               id_trabajador_autorizado: { type: integer }
 *               nota: { type: string }
 *               cargoAdicional: { type: number, description: 'Cargo adicional opcional, puede ser null' }
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [descripcion, cantidad, importe, unidadMedida]
 *                   properties:
 *                     descripcion: { type: string }
 *                     cantidad: { type: integer }
 *                     importe: { type: number, format: double }
 *                     unidadMedida: { type: string }
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id_producto, cantidad]
 *                   properties:
 *                     id_producto: { type: integer, description: "ID del producto" }
 *                     cantidad: { type: number, format: double, example: 2.5, description: "Cantidad del producto", minimum: 0 }
 *                     precio: { type: number, format: double, description: "Precio personalizado para contratos de tipo Proveedor (opcional)" }
 *                     costo: { type: number, format: double, description: "Costo personalizado para contratos de tipo Proveedor (opcional)" }
 *     responses:
 *       200:
 *         description: Factura actualizada con sumas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_factura: { type: integer }
 *                 num_consecutivo: { type: integer }
 *                 fecha: { type: string, format: date-time }
 *                 estado: { type: string }
 *                 id_usuario: { type: integer }
 *                 cargoAdicional: { type: number, description: 'Cargo adicional asociado a la factura' }
 *                 suma_servicios: { type: number, description: "Suma total de servicios" }
 *                 suma_productos: { type: number, description: "Suma total de productos" }
 *                 suma_general: { type: number, description: "Suma general (servicios + productos)" }
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Factura no encontrada
 */
router.put("/Factura/updateFactura/:id", authenticate("Administrador", "Comercial"), facturaController.updateFactura);

/**
 * @swagger
 * /Factura/deleteFactura/{id}:
 *   delete:
 *     tags: [Factura]
 *     summary: Eliminar una factura (Operación que revierte cambios en inventario y elimina registros relacionados)
 *     description: |
 *       Esta operación elimina una factura y revierte todos los cambios realizados en otras partes del sistema durante su creación:

 *       **Reversión de inventario:**
 *       - Para contratos de tipo 'Cliente': incrementa la cantidad en existencia de los productos (restaura lo decrementado).
 *       - Para contratos de tipo 'Proveedor': decrementa la cantidad en existencia de los productos (remueve lo incrementado).

 *       **Eliminación en cascada:**
 *       - Elimina automáticamente los registros relacionados en 'servicio', 'factura_producto' y 'entrada' debido a las restricciones de clave foránea.

 *       **Transacción completa:** Toda la operación se realiza en una transacción para mantener consistencia y evitar estados inconsistentes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Factura eliminada y cambios revertidos
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error interno al eliminar la factura
 */
router.delete("/Factura/deleteFactura/:id", authenticate("Administrador", "Comercial"), facturaController.deleteFactura);

/**
 * @swagger
 * /Factura/filterFacturas/{page}/{limit}:
 *   post:
 *     tags: [Factura]
 *     summary: Filtrar facturas con paginación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: path
 *         name: limit
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_contrato: { type: integer }
 *               id_entidad: { type: integer }
 *               consecutivoEntidad: { type: string, description: 'Buscar facturas cuyos contratos pertenezcan a entidades con este consecutivo (case-insensitive)' }
 *               organismoEntidad: { type: string, description: 'Buscar facturas cuyos contratos pertenezcan a entidades con este organismo (case-insensitive)' }
 *               num_consecutivo: { type: integer }
 *               fecha_desde: { type: string, format: date-time }
 *               fecha_hasta: { type: string, format: date-time }
 *               estado: { type: string, enum: ["Facturado", "No Facturado", "Cancelado"] }
 *               id_trabajador_autorizado: { type: integer }
 *               id_usuario: { type: integer, description: 'Filtrar por facturas firmadas por este usuario' }
 *     responses:
 *       200:
 *         description: Facturas filtradas con sumas calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_factura: { type: integer }
 *                       num_consecutivo: { type: integer }
 *                       fecha: { type: string, format: date-time }
 *                       estado: { type: string }
 *                       id_usuario: { type: integer }
 *                       cargoAdicional: { type: number, description: 'Cargo adicional asociado a la factura' }
 *                       suma_servicios: { type: number, description: "Suma total de servicios" }
 *                       suma_productos: { type: number, description: "Suma total de productos" }
 *                       suma_general: { type: number, description: "Suma general (servicios + productos)" }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *                     currentPage: { type: integer }
 *                     limit: { type: integer }
 *                     hasNextPage: { type: boolean }
 *                     hasPrevPage: { type: boolean }
 */
router.post("/Factura/filterFacturas/:page/:limit", authenticate(), facturaController.filterFacturas);

module.exports = router;
