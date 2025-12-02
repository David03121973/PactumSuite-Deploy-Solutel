const express = require("express");
const router = express.Router();
const salidaController = require("../controllers/salidaController");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   - name: Salida
 *     description: Operaciones relacionadas con salidas de productos
 */

/**
 * @swagger
 * /Salida/createSalida:
 *   post:
 *     tags: [Salida]
 *     summary: Crear una nueva salida (descuenta stock)
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Una "Salida" representa la extracción de cantidad de un `producto`. Al crear una salida:
 *       - Se verifica que el `producto` tenga suficiente `cantidadExistencia`.
 *       - Si hay stock suficiente, se descuenta `cantidad` de `cantidadExistencia`.
 *       - Si no hay stock suficiente, se devuelve un error de validación.
 *       
 *       Este comportamiento es análogo a cómo las facturas afectan el stock en el sistema: cada operación impacta directamente en la `cantidadExistencia` del producto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_producto, id_usuario, fecha, descripcion, cantidad]
 *             properties:
 *               id_producto: { type: integer, example: 1 }
 *               id_usuario: { type: integer, example: 3 }
 *               fecha: { type: string, format: date-time, example: "2025-10-17T10:00:00.000Z" }
 *               descripcion: { type: string, example: "Salida por venta menudeo" }
 *               cantidad: { type: number, format: double, example: 2.5, minimum: 0.01 }
 *     responses:
 *       201:
 *         description: Salida creada exitosamente
 *       400:
 *         description: Error de validación o stock insuficiente
 *       500:
 *         description: Error del servidor
 */
router.post("/Salida/createSalida", authenticate("Administrador", "Comercial"), salidaController.createSalida);

/**
 * @swagger
 * /Salida:
 *   get:
 *     tags: [Salida]
 *     summary: Obtener todas las salidas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salidas
 *       500:
 *         description: Error del servidor
 */
router.get("/Salida", authenticate(), salidaController.getSalidas);

/**
 * @swagger
 * /Salida/{id}:
 *   get:
 *     tags: [Salida]
 *     summary: Obtener una salida por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Salida encontrada
 *       404:
 *         description: Salida no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/Salida/:id", authenticate(), salidaController.getSalidaById);

/**
 * @swagger
 * /Salida/updateSalida/{id}:
 *   put:
 *     tags: [Salida]
 *     summary: Actualizar una salida (ajusta stock según delta)
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Al actualizar una salida:
 *       - Si cambia la `cantidad`, se calcula el delta respecto a la salida original y se ajusta la `cantidadExistencia` del producto.
 *       - Si cambia el `producto`, se revierte el stock en el producto anterior y se descuenta del nuevo.
 *       - Se valida siempre que exista stock suficiente ante incrementos o cambio de producto.
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
 *             properties:
 *               id_producto: { type: integer }
 *               id_usuario: { type: integer }
 *               fecha: { type: string, format: date-time }
 *               descripcion: { type: string }
 *               cantidad: { type: number, format: double, minimum: 0.01 }
 *     responses:
 *       200:
 *         description: Salida actualizada exitosamente
 *       400:
 *         description: Error de validación o stock insuficiente
 *       404:
 *         description: Salida no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/Salida/updateSalida/:id", authenticate("Administrador", "Comercial"), salidaController.updateSalida);

/**
 * @swagger
 * /Salida/deleteSalida/{id}:
 *   delete:
 *     tags: [Salida]
 *     summary: Eliminar una salida (restituye stock)
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Al eliminar una salida, se repone en el `producto` la `cantidad` previamente descontada, incrementando `cantidadExistencia`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Salida eliminada exitosamente
 *       404:
 *         description: Salida no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/Salida/deleteSalida/:id", authenticate("Administrador", "Comercial"), salidaController.deleteSalida);

/**
 * @swagger
 * /Salida/filterSalidas/{page}/{limit}:
 *   post:
 *     tags: [Salida]
 *     summary: Filtrar salidas por descripción y rango de fechas con paginación
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
 *               descripcion: { type: string, example: "venta" }
 *               fecha_desde: { type: string, format: date, example: "2025-10-01" }
 *               fecha_hasta: { type: string, format: date, example: "2025-10-31" }
 *               producto_nombre: { type: string, example: "Res molida" }
 *               usuario_nombre: { type: string, example: "Juan Pérez" }
 *               cantidad:
 *                 type: object
 *                 properties:
 *                   min: { type: number, format: double, example: 1 }
 *                   max: { type: number, format: double, example: 10 }
 *     responses:
 *       200:
 *         description: Salidas filtradas exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.post("/Salida/filterSalidas/:page/:limit", authenticate(), salidaController.filterSalidas);

module.exports = router;


