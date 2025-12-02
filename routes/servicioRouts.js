const express = require("express");
const router = express.Router();
const servicioController = require("../controllers/servicioController");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   - name: Servicio
 *     description: Operaciones relacionadas con servicios
 */

/**
 * @swagger
 * /Servicio:
 *   post:
 *     tags: [Servicio]
 *     summary: Crear un nuevo servicio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - importe
 *               - cantidad
 *               - unidadMedida
 *               - id_factura
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Servicio de mantenimiento"
 *               importe:
 *                 type: number
 *                 format: double
 *                 example: 150.5
 *               cantidad:
 *                 type: integer
 *                 example: 2
 *               unidadMedida:
 *                 type: string
 *                 example: "horas"
 *               id_factura:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_servicio:
 *                       type: integer
 *                     descripcion:
 *                       type: string
 *                     importe:
 *                       type: number
 *                     cantidad:
 *                       type: integer
 *                     unidadMedida:
 *                       type: string
 *                     id_factura:
 *                       type: integer
 *                     importe_total:
 *                       type: number
 *                       description: cantidad * importe
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.post("/Servicio", authenticate("Administrador", "Comercial"), servicioController.createServicio);

/**
 * @swagger
 * /Servicio:
 *   get:
 *     tags: [Servicio]
 *     summary: Obtener todos los servicios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_servicio:
 *                     type: integer
 *                   descripcion:
 *                     type: string
 *                   importe:
 *                     type: number
 *                   cantidad:
 *                     type: integer
 *                   unidadMedida:
 *                     type: string
 *                   id_factura:
 *                     type: integer
 *                   importe_total:
 *                     type: number
 *                   factura:
 *                     type: object
 *       500:
 *         description: Error del servidor
 */
router.get("/Servicio", authenticate(), servicioController.getServicios);

/**
 * @swagger
 * /Servicio/{id}:
 *   get:
 *     tags: [Servicio]
 *     summary: Obtener un servicio por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_servicio:
 *                   type: integer
 *                 descripcion:
 *                   type: string
 *                 importe:
 *                   type: number
 *                 cantidad:
 *                   type: integer
 *                 unidadMedida:
 *                   type: string
 *                 id_factura:
 *                   type: integer
 *                 importe_total:
 *                   type: number
 *                 factura:
 *                   type: object
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/Servicio/:id", authenticate(), servicioController.getServicioById);

/**
 * @swagger
 * /Servicio/{id}:
 *   put:
 *     tags: [Servicio]
 *     summary: Actualizar un servicio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               importe:
 *                 type: number
 *               cantidad:
 *                 type: integer
 *               unidadMedida:
 *                 type: string
 *               id_factura:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_servicio:
 *                   type: integer
 *                 descripcion:
 *                   type: string
 *                 importe:
 *                   type: number
 *                 cantidad:
 *                   type: integer
 *                 unidadMedida:
 *                   type: string
 *                 id_factura:
 *                   type: integer
 *                 importe_total:
 *                   type: number
 *                 factura:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/Servicio/:id", authenticate("Administrador", "Comercial"), servicioController.updateServicio);

/**
 * @swagger
 * /Servicio/{id}:
 *   delete:
 *     tags: [Servicio]
 *     summary: Eliminar un servicio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 servicio:
 *                   type: object
 *                   properties:
 *                     id_servicio:
 *                       type: integer
 *                     descripcion:
 *                       type: string
 *                     importe_total:
 *                       type: number
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/Servicio/:id", authenticate("Administrador", "Comercial"), servicioController.deleteServicio);

/**
 * @swagger
 * /Servicio/filter:
 *   post:
 *     tags: [Servicio]
 *     summary: Filtrar servicios por descripción (sin paginación)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "mantenimiento"
 *               id_factura:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Lista de servicios filtrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_servicio:
 *                     type: integer
 *                   descripcion:
 *                     type: string
 *                   importe:
 *                     type: number
 *                   cantidad:
 *                     type: integer
 *                   unidadMedida:
 *                     type: string
 *                   id_factura:
 *                     type: integer
 *                   importe_total:
 *                     type: number
 *                   factura:
 *                     type: object
 *       500:
 *         description: Error del servidor
 */
router.post("/Servicio/filter", authenticate(), servicioController.filterServicios);

module.exports = router;


