const express = require("express");
const router = express.Router();
const facturaProductoController = require("../controllers/facturaProductoController");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   - name: FacturaProducto
 *     description: Operaciones relacionadas con la relación factura-producto
 */

/**
 * @swagger
 * /FacturaProducto/createFacturaProducto:
 *   post:
 *     tags: [FacturaProducto]
 *     summary: Crear una nueva relación factura-producto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_factura, id_producto]
 *             properties:
 *               id_factura: { type: integer, example: 4, description: "ID de la factura" }
 *               id_producto: { type: integer, example: 1, description: "ID del producto" }
 *               precioVenta: { type: number, format: double, example: 1299.99, description: "Precio de venta del producto" }
 *               costoVenta: { type: number, format: double, example: 999.99, description: "Costo de venta del producto" }
 *     responses:
 *       201:
 *         description: Relación factura-producto creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_factura_producto: { type: integer, example: 1 }
 *                     id_factura: { type: integer, example: 4 }
 *                     id_producto: { type: integer, example: 1 }
 *                     precioVenta: { type: number, format: double, example: 1299.99 }
 *                     costoVenta: { type: number, format: double, example: 999.99 }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Campos obligatorios: id_factura, id_producto"]
 */
router.post("/FacturaProducto/createFacturaProducto", authenticate("Administrador", "Comercial"), facturaProductoController.createFacturaProducto);

/**
 * @swagger
 * /FacturaProducto:
 *   get:
 *     tags: [FacturaProducto]
 *     summary: Obtener todas las relaciones factura-producto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de relaciones factura-producto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_factura_producto: { type: integer, example: 1 }
 *                   id_factura: { type: integer, example: 4 }
 *                   id_producto: { type: integer, example: 1 }
 *                   factura:
 *                     type: object
 *                     properties:
 *                       id_factura: { type: integer, example: 4 }
 *                       num_consecutivo: { type: integer, example: 1000 }
 *                   producto:
 *                     type: object
 *                     properties:
 *                       id_producto: { type: integer, example: 1 }
 *                       nombre: { type: string, example: "Producto ejemplo" }
 */
router.get("/FacturaProducto", authenticate(), facturaProductoController.getFacturaProductos);

/**
 * @swagger
 * /FacturaProducto/{id}:
 *   get:
 *     tags: [FacturaProducto]
 *     summary: Obtener una relación factura-producto por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la relación factura-producto
 *     responses:
 *       200:
 *         description: Relación factura-producto encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_factura_producto: { type: integer, example: 1 }
 *                 id_factura: { type: integer, example: 4 }
 *                 id_producto: { type: integer, example: 1 }
 *                 factura:
 *                   type: object
 *                   properties:
 *                     id_factura: { type: integer, example: 4 }
 *                     num_consecutivo: { type: integer, example: 1000 }
 *                 producto:
 *                   type: object
 *                   properties:
 *                     id_producto: { type: integer, example: 1 }
 *                     nombre: { type: string, example: "Producto ejemplo" }
 *       404:
 *         description: Relación factura-producto no encontrada
 */
router.get("/FacturaProducto/:id", authenticate(), facturaProductoController.getFacturaProductoById);

/**
 * @swagger
 * /FacturaProducto/updateFacturaProducto/{id}:
 *   put:
 *     tags: [FacturaProducto]
 *     summary: Actualizar una relación factura-producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la relación factura-producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_factura: { type: integer, example: 4, description: "ID de la factura" }
 *               id_producto: { type: integer, example: 1, description: "ID del producto" }
 *               cantidad: { type: number, format: double, example: 2.5, description: "Cantidad del producto", minimum: 0 }
 *     responses:
 *       200:
 *         description: Relación factura-producto actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_factura_producto: { type: integer, example: 1 }
 *                 id_factura: { type: integer, example: 4 }
 *                 id_producto: { type: integer, example: 1 }
 *                 factura:
 *                   type: object
 *                   properties:
 *                     id_factura: { type: integer, example: 4 }
 *                     num_consecutivo: { type: integer, example: 1000 }
 *                 producto:
 *                   type: object
 *                   properties:
 *                     id_producto: { type: integer, example: 1 }
 *                     nombre: { type: string, example: "Producto ejemplo" }
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Relación factura-producto no encontrada
 */
router.put("/FacturaProducto/updateFacturaProducto/:id", authenticate("Administrador", "Comercial"), facturaProductoController.updateFacturaProducto);

/**
 * @swagger
 * /FacturaProducto/deleteFacturaProducto/{id}:
 *   delete:
 *     tags: [FacturaProducto]
 *     summary: Eliminar una relación factura-producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la relación factura-producto
 *     responses:
 *       200:
 *         description: Relación factura-producto eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facturaProducto:
 *                   type: object
 *                   properties:
 *                     id_factura_producto: { type: integer, example: 1 }
 *                     id_factura: { type: integer, example: 4 }
 *                     id_producto: { type: integer, example: 1 }
 *       404:
 *         description: Relación factura-producto no encontrada
 */
router.delete("/FacturaProducto/deleteFacturaProducto/:id", authenticate("Administrador", "Comercial"), facturaProductoController.deleteFacturaProducto);

/**
 * @swagger
 * /FacturaProducto/filterFacturaProductos/{page}/{limit}:
 *   post:
 *     tags: [FacturaProducto]
 *     summary: Filtrar relaciones factura-producto con paginación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Número de página
 *       - in: path
 *         name: limit
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *         description: Límite de elementos por página
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  *               id_factura: { type: integer, description: "Filtrar por ID de factura" }
  *               id_producto: { type: integer, description: "Filtrar por ID de producto" }
  *               nombre_producto: { type: string, description: "Filtrar por nombre de producto (contiene)" }
  *               codigo_producto: { type: string, description: "Filtrar por código de producto (contiene)" }
  *               num_consecutivo: { type: integer, description: "Filtrar por número consecutivo de la factura" }
  *               estado: { type: string, enum: ["Facturado", "No Facturado", "Cancelado"], description: "Estado de la factura" }
  *               fecha_desde: { type: string, format: date-time, description: "Fecha de la factura desde" }
  *               fecha_hasta: { type: string, format: date-time, description: "Fecha de la factura hasta" }
  *               precio_min: { type: number, format: double, description: "Precio mínimo (precioVenta en la relación)" }
  *               precio_max: { type: number, format: double, description: "Precio máximo (precioVenta en la relación)" }
  *           example:
  *             nombre_producto: "carne"
  *             codigo_producto: "C-"
  *             num_consecutivo: 102
  *             estado: "Facturado"
  *             fecha_desde: "2025-01-01T00:00:00.000Z"
  *             fecha_hasta: "2025-12-31T23:59:59.999Z"
  *             precio_min: 10
  *             precio_max: 200
 *     responses:
 *       200:
 *         description: Relaciones factura-producto filtradas
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
 *                       id_factura_producto: { type: integer, example: 1 }
 *                       id_factura: { type: integer, example: 4 }
 *                       id_producto: { type: integer, example: 1 }
 *                       factura:
 *                         type: object
 *                         properties:
 *                           id_factura: { type: integer, example: 4 }
 *                           num_consecutivo: { type: integer, example: 1000 }
  *                           fecha: { type: string, format: date-time, example: "2025-06-10T15:30:00.000Z" }
  *                           estado: { type: string, example: "Facturado" }
 *                       producto:
 *                         type: object
 *                         properties:
 *                           id_producto: { type: integer, example: 1 }
  *                           nombre: { type: string, example: "Carne de res" }
  *                           codigo: { type: string, example: "C-001" }
  *                       cantidad: { type: number, format: double, example: 2.5 }
  *                       precioVenta: { type: number, format: double, example: 129.99 }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 10 }
 *                     totalPages: { type: integer, example: 2 }
 *                     currentPage: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 5 }
 *                     hasNextPage: { type: boolean, example: true }
 *                     hasPrevPage: { type: boolean, example: false }
  *             example:
  *               data:
  *                 - id_factura_producto: 12
  *                   id_factura: 4
  *                   id_producto: 1
  *                   factura:
  *                     id_factura: 4
  *                     num_consecutivo: 102
  *                     fecha: "2025-06-10T15:30:00.000Z"
  *                     estado: "Facturado"
  *                   producto:
  *                     id_producto: 1
  *                     nombre: "Carne de res"
  *                     codigo: "C-001"
  *                   cantidad: 2.5
  *                   precioVenta: 129.99
  *               pagination:
  *                 total: 1
  *                 totalPages: 1
  *                 currentPage: 1
  *                 limit: 10
  *                 hasNextPage: false
  *                 hasPrevPage: false
 */
router.post("/FacturaProducto/filterFacturaProductos/:page/:limit", authenticate(), facturaProductoController.filterFacturaProductos);

module.exports = router;
