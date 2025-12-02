const express = require("express");
const router = express.Router();
const entradaController = require("../controllers/entradaController");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   - name: Entrada
 *     description: Operaciones relacionadas con entradas de productos
 */

/**
 * @swagger
 * /Entrada/createEntrada:
 *   post:
 *     tags: [Entrada]
 *     summary: Crear una nueva entrada
 *     description: |
 *       Crea una entrada de inventario y ajusta el stock del `producto` relacionado.
 *       Impacto sobre `producto.cantidadExistencia`:
 *       - Al crear: cantidadExistencia = cantidadExistencia + cantidadEntrada
 *       - Validaciones: no permite valores negativos ni cantidades no numéricas.
 *       - Nota: Este ajuste ocurre únicamente cuando se usa este endpoint directamente.
 *       Reglas adicionales:
 *       - Si se envía `id_factura` o `id_contrato`, ambos deben estar presentes y serán validados.
 *       - Si ambos son null, el campo `nota` es obligatorio.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_producto, cantidadEntrada, fecha]
 *             properties:
 *               id_producto: { type: integer, example: 1 }
 *               id_factura: { type: integer, example: 10, nullable: true, description: 'Debe venir junto a id_contrato si se especifica' }
 *               id_contrato: { type: integer, example: 5, nullable: true, description: 'Debe venir junto a id_factura si se especifica' }
 *               cantidadEntrada: { type: number, format: double, example: 10.5, minimum: 0.01 }
 *               costo: { type: number, format: double, example: 15.0, minimum: 0, description: 'Opcional, por defecto 0' }
 *               nota: { type: string, example: "Entrada independiente (sin factura/contrato)" }
 *               fecha: { type: string, format: date-time, example: "2023-10-01T00:00:00.000Z" }
 *     responses:
 *       201:
 *         description: Entrada creada exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.post("/Entrada/createEntrada", authenticate("Administrador", "Comercial"), entradaController.createEntrada);

/**
 * @swagger
 * /Entrada:
 *   get:
 *     tags: [Entrada]
 *     summary: Obtener todas las entradas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entradas
 *       500:
 *         description: Error del servidor
 */
router.get("/Entrada", authenticate(), entradaController.getEntradas);

/**
 * @swagger
 * /Entrada/{id}:
 *   get:
 *     tags: [Entrada]
 *     summary: Obtener una entrada por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Entrada encontrada
 *       404:
 *         description: Entrada no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/Entrada/:id", authenticate(), entradaController.getEntradaById);

/**
 * @swagger
 * /Entrada/updateEntrada/{id}:
 *   put:
 *     tags: [Entrada]
 *     summary: Actualizar una entrada
 *     description: |
 *       Actualiza una entrada y aplica los ajustes correspondientes al inventario.
 *       Impacto sobre `producto.cantidadExistencia`:
 *       - Si no cambia `id_producto`: cantidadExistencia = cantidadExistencia - cantidadEntrada(anterior) + cantidadEntrada(nueva)
 *       - Si cambia `id_producto`: se resta al producto anterior y se suma al producto nuevo.
 *       - Validaciones: no permite que el stock quede negativo.
 *       - Nota: Este ajuste ocurre únicamente cuando se usa este endpoint directamente.
 *       Reglas adicionales:
 *       - Si se envía `id_factura` o `id_contrato` (nuevos), ambos deben estar presentes.
 *       - Si ambos quedan null, `nota` debe estar presente y no vacía.
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
 *             properties:
 *               id_producto: { type: integer }
 *               id_factura: { type: integer, nullable: true }
 *               id_contrato: { type: integer, nullable: true }
 *               cantidadEntrada: { type: number, format: double, minimum: 0.01 }
 *               costo: { type: number, format: double, minimum: 0 }
 *               nota: { type: string, description: 'Obligatoria si id_factura e id_contrato son null' }
 *               fecha: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Entrada actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Entrada no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/Entrada/updateEntrada/:id", authenticate("Administrador", "Comercial"), entradaController.updateEntrada);

/**
 * @swagger
 * /Entrada/deleteEntrada/{id}:
 *   delete:
 *     tags: [Entrada]
 *     summary: Eliminar una entrada
 *     description: |
 *       Elimina una entrada y ajusta el inventario del `producto` relacionado.
 *       Impacto sobre `producto.cantidadExistencia`:
 *       - Al eliminar: cantidadExistencia = cantidadExistencia - cantidadEntrada
 *       - Validaciones: no permite que el stock quede negativo.
 *       - Nota: Este ajuste ocurre únicamente cuando se usa este endpoint directamente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Entrada eliminada exitosamente
 *       404:
 *         description: Entrada no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/Entrada/deleteEntrada/:id", authenticate("Administrador", "Comercial"), entradaController.deleteEntrada);

/**
 * @swagger
 * /Entrada/filterEntradas/{page}/{limit}:
 *   post:
 *     tags: [Entrada]
 *     summary: Filtrar entradas con paginación
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
 *               id_producto: { type: integer }
 *               id_contrato: { type: integer, description: 'Puede ser null para filtrar entradas sin contrato' }
 *               cantidadEntrada:
 *                 type: object
 *                 properties:
 *                   min: { type: number, format: double }
 *                   max: { type: number, format: double }
 *               costo:
 *                 type: object
 *                 properties:
 *                   min: { type: number, format: double }
 *                   max: { type: number, format: double }
 *               nota: { type: string }
 *               fecha_desde: { type: string, format: date }
 *               fecha_hasta: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Entradas filtradas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { type: object } }
 *                 pagination: { type: object }
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.post("/Entrada/filterEntradas/:page/:limit", authenticate(), entradaController.filterEntradas);

module.exports = router;
