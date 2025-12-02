
const express = require("express");
const router = express.Router();
// Importar controlador de producto
const productoController = require("../controllers/productoController");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   - name: Producto
 *     description: Operaciones relacionadas con productos
 */

/**
 * @swagger
 * /Producto/createProducto:
 *   post:
 *     tags: [Producto]
 *     summary: Crear un nuevo producto
 *     description: Crea un nuevo producto con la información proporcionada.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nombre
 *               - precio
 *               - costo
 *               - unidadMedida
 *               - tipoProducto
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código único del producto
 *                 example: "PROD001"
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto
 *                 example: "Laptop Dell Inspiron"
 *               precio:
 *                 type: number
 *                 format: double
 *                 description: Precio del producto
 *                 example: 1299.99
 *               costo:
 *                 type: number
 *                 format: double
 *                 description: Costo del producto
 *                 example: 999.99
 *               nota:
 *                 type: string
 *                 description: Nota adicional sobre el producto
 *                 example: "Producto con garantía de 2 años"
 *               unidadMedida:
 *                 type: string
 *                 description: Unidad de medida del producto
 *                 example: "unidad"
 *               tipoProducto:
 *                 type: string
 *                 description: Tipo de producto
 *                 example: "Electrónica"

 *           example:
 *             codigo: "PROD001"
 *             nombre: "Laptop Dell Inspiron"
 *             precio: 1299.99
 *             costo: 999.99
 *             nota: "Producto con garantía de 2 años"
 *             unidadMedida: "unidad"
 *             tipoProducto: "Electrónica"

 *     responses:
 *       201:
 *         description: Producto creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_producto:
 *                       type: integer
 *                       example: 1
 *                     codigo:
 *                       type: string
 *                       example: "PROD001"
 *                     nombre:
 *                       type: string
 *                       example: "Laptop Dell Inspiron"
 *                     precio:
 *                       type: number
 *                       example: 1299.99
 *                     nota:
 *                       type: string
 *                       example: "Producto con garantía de 2 años"
 *                     unidadMedida:
 *                       type: string
 *                       example: "unidad"
 *       400:
 *         description: Datos de entrada inválidos o código duplicado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error del servidor.
 */
router.post("/Producto/createProducto", authenticate("Administrador", "Comercial"), productoController.createProducto);

/**
 * @swagger
 * /Producto:
 *   get:
 *     tags: [Producto]
 *     summary: Obtener todos los productos
 *     description: Devuelve una lista de todos los productos registrados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_producto:
 *                     type: integer
 *                     description: ID único del producto
 *                   codigo:
 *                     type: string
 *                     description: Código único del producto
 *                   nombre:
 *                     type: string
 *                     description: Nombre del producto
 *                   precio:
 *                     type: number
 *                     format: double
 *                     description: Precio del producto
 *                   nota:
 *                     type: string
 *                     description: Nota adicional sobre el producto
 *                   unidadMedida:
 *                     type: string
 *                     description: Unidad de medida del producto
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de última actualización
 *       500:
 *         description: Error del servidor.
 */
router.get("/Producto", authenticate(), productoController.getProductos);

/**
 * @swagger
 * /Producto/{id}:
 *   get:
 *     tags: [Producto]
 *     summary: Obtener un producto por ID
 *     description: Devuelve un producto específico usando su ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto a obtener.
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       200:
 *         description: Producto encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_producto:
 *                   type: integer
 *                   format: int32
 *                   description: ID del producto.
 *                 codigo:
 *                   type: string
 *                   description: Código único del producto.
 *                 nombre:
 *                   type: string
 *                   description: Nombre del producto.
 *                 precio:
 *                   type: number
 *                   format: double
 *                   description: Precio del producto.
 *                 nota:
 *                   type: string
 *                   description: Nota adicional sobre el producto.
 *                 unidadMedida:
 *                   type: string
 *                   description: Unidad de medida del producto.
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.get("/Producto/:id", authenticate(), productoController.getProductoById);

/**
 * @swagger
 * /Producto/codigo/{codigo}:
 *   get:
 *     tags: [Producto]
 *     summary: Obtener un producto por código
 *     description: Devuelve un producto específico usando su código.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         description: Código del producto a obtener.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_producto:
 *                   type: integer
 *                   format: int32
 *                   description: ID del producto.
 *                 codigo:
 *                   type: string
 *                   description: Código único del producto.
 *                 nombre:
 *                   type: string
 *                   description: Nombre del producto.
 *                 precio:
 *                   type: number
 *                   format: double
 *                   description: Precio del producto.
 *                 nota:
 *                   type: string
 *                   description: Nota adicional sobre el producto.
 *                 unidadMedida:
 *                   type: string
 *                   description: Unidad de medida del producto.
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.get("/Producto/codigo/:codigo", authenticate(), productoController.getProductoByCodigo);

/**
 * @swagger
 * /Producto/updateProducto/{id}:
 *   put:
 *     tags: [Producto]
 *     summary: Actualizar un producto
 *     description: Actualiza la información de un producto específico por ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto a actualizar.
 *         schema:
 *           type: integer
 *           format: int32
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código único del producto
 *                 example: "PROD001"
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto
 *                 example: "Laptop Dell Inspiron Actualizada"
 *               precio:
 *                 type: number
 *                 format: double
 *                 description: Precio del producto
 *                 example: 1199.99
 *               nota:
 *                 type: string
 *                 description: Nota adicional sobre el producto
 *                 example: "Producto actualizado con nueva garantía"
 *               unidadMedida:
 *                 type: string
 *                 description: Unidad de medida del producto
 *                 example: "unidad"
 *               cantidadExistencia:
 *                 type: number
 *                 format: double
 *                 description: Cantidad en existencia del producto
 *                 example: 50
 *           example:
 *             codigo: "PROD001"
 *             nombre: "Laptop Dell Inspiron Actualizada"
 *             precio: 1199.99
 *             nota: "Producto actualizado con nueva garantía"
 *             unidadMedida: "unidad"
 *             cantidadExistencia: 50
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_producto:
 *                   type: integer
 *                   format: int32
 *                   description: ID del producto actualizado.
 *                 codigo:
 *                   type: string
 *                   description: Código único del producto.
 *                 nombre:
 *                   type: string
 *                   description: Nombre del producto.
 *                 precio:
 *                   type: number
 *                   format: double
 *                   description: Precio del producto.
 *                 nota:
 *                   type: string
 *                   description: Nota adicional sobre el producto.
 *                 unidadMedida:
 *                   type: string
 *                   description: Unidad de medida del producto.
 *       400:
 *         description: Datos de entrada inválidos o código duplicado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.put("/Producto/updateProducto/:id", authenticate("Administrador", "Comercial"), productoController.updateProducto);

/**
 * @swagger
 * /Producto/deleteProducto/{id}:
 *   delete:
 *     tags: [Producto]
 *     summary: Eliminar un producto
 *     description: Elimina un producto específico por ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto a eliminar.
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado exitosamente"
 *                 producto:
 *                   type: object
 *                   properties:
 *                     id_producto:
 *                       type: integer
 *                       example: 1
 *                     codigo:
 *                       type: string
 *                       example: "PROD001"
 *                     nombre:
 *                       type: string
 *                       example: "Laptop Dell Inspiron"
 *                     unidadMedida:
 *                       type: string
 *                       example: "unidad"
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.delete("/Producto/deleteProducto/:id", authenticate("Administrador", "Comercial"), productoController.deleteProducto);

/**
 * @swagger
 * /Producto/filterProductos/{page}/{limit}:
 *   post:
 *     tags: [Producto]
 *     summary: Filtrar productos por múltiples criterios con paginación
 *     description: Permite filtrar productos por código, nombre, tipo de producto, precio, costo, cantidad de existencia y/o nota con paginación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: Número de página
 *       - in: path
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         required: true
 *         description: Límite de registros por página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código del producto para filtrar (búsqueda case-insensitive).
 *                 example: "PROD"
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto para filtrar (búsqueda case-insensitive).
 *                 example: "Laptop"
 *               tipoProducto:
 *                 type: string
 *                 description: Tipo de producto para filtrar (búsqueda case-insensitive).
 *                 example: "Electrónica"
 *               precio:
 *                 type: object
 *                 description: Rango de precios para filtrar.
 *                 properties:
 *                   min:
 *                     type: number
 *                     format: double
 *                     description: Precio mínimo
 *                     example: 100
 *                   max:
 *                     type: number
 *                     format: double
 *                     description: Precio máximo
 *                     example: 2000
 *               costo:
 *                 type: object
 *                 description: Rango de costos para filtrar.
 *                 properties:
 *                   min:
 *                     type: number
 *                     format: double
 *                     description: Costo mínimo
 *                     example: 50
 *                   max:
 *                     type: number
 *                     format: double
 *                     description: Costo máximo
 *                     example: 1500
 *               cantidadExistencia:
 *                 type: object
 *                 description: Rango de cantidad de existencia para filtrar.
 *                 properties:
 *                   min:
 *                     type: number
 *                     format: double
 *                     description: Cantidad mínima de existencia
 *                     example: 0
 *                   max:
 *                     type: number
 *                     format: double
 *                     description: Cantidad máxima de existencia
 *                     example: 100
 *               nota:
 *                 type: string
 *                 description: Nota del producto para filtrar (búsqueda case-insensitive).
 *                 example: "garantía"
 *             example:
 *               codigo: "PROD"
 *               nombre: "Laptop"
 *               tipoProducto: "Electrónica"
 *               precio:
 *                 min: 100
 *                 max: 2000
 *               costo:
 *                 min: 50
 *                 max: 1500
 *               cantidadExistencia:
 *                 min: 0
 *                 max: 100
 *               nota: "garantía"
 *     responses:
 *       200:
 *         description: Productos filtrados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Productos filtrados exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_producto:
 *                         type: integer
 *                         format: int32
 *                         description: ID del producto.
 *                       codigo:
 *                         type: string
 *                         description: Código único del producto.
 *                       nombre:
 *                         type: string
 *                         description: Nombre del producto.
 *                       precio:
 *                         type: number
 *                         format: double
 *                         description: Precio del producto.
 *                       nota:
 *                         type: string
 *                         description: Nota adicional sobre el producto.
 *                       unidadMedida:
 *                         type: string
 *                         description: Unidad de medida del producto.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de creación
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de última actualización
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                       description: Total de productos que coinciden con los filtros
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                       description: Total de páginas disponibles
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                       description: Página actual
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                       description: Límite de registros por página
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Indica si hay página siguiente
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Indica si hay página anterior
 *       400:
 *         description: Datos de entrada inválidos o parámetros de paginación incorrectos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["El número de página debe ser mayor a 0", "El límite debe estar entre 1 y 100"]
 *       500:
 *         description: Error del servidor.
 */
router.post("/Producto/filterProductos/:page/:limit", authenticate(), productoController.filterProductos);

module.exports = router;
