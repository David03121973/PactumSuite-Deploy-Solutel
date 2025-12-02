const express = require("express");
const router = express.Router();
const ofertaDescripcionController = require("../controllers/ofertaDescripcionController.js");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   name: OfertaDescripcion
 *   description: API para la gestión de descripciones de ofertas
 */

/**
 * @swagger
 * /oferta-descripcion:
 *   get:
 *     summary: Obtiene todas las descripciones de ofertas
 *     tags:
 *       - OfertaDescripcion
 *     responses:
 *       200:
 *         description: Lista de descripciones de ofertas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Descripciones de ofertas obtenidas exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_oferta_descripcion:
 *                         type: integer
 *                         description: ID único de la descripción
 *                       descripcion:
 *                         type: string
 *                         description: Descripción de la oferta
 *                       id_oferta:
 *                         type: integer
 *                         description: ID de la oferta asociada
 *                       oferta:
 *                         type: object
 *                         description: Información de la oferta asociada
 *                         properties:
 *                           id_oferta:
 *                             type: integer
 *                           fecha_inicio:
 *                             type: string
 *                             format: date
 *                           fecha_fin:
 *                             type: string
 *                             format: date
 *                           estado:
 *                             type: string
 *       500:
 *         description: Error del servidor
 */
router.get("/oferta-descripcion", authenticate(), ofertaDescripcionController.getAllOfertaDescripciones);

/**
 * @swagger
 * /oferta-descripcion/{id}:
 *   get:
 *     summary: Obtiene una descripción de oferta por ID
 *     tags:
 *       - OfertaDescripcion
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la descripción de oferta a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Descripción de oferta obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Descripción de oferta encontrada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_oferta_descripcion:
 *                       type: integer
 *                       description: ID único de la descripción
 *                     descripcion:
 *                       type: string
 *                       description: Descripción de la oferta
 *                     id_oferta:
 *                       type: integer
 *                       description: ID de la oferta asociada
 *                     oferta:
 *                       type: object
 *                       description: Información de la oferta asociada
 *       404:
 *         description: Descripción de oferta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/oferta-descripcion/:id", authenticate(), ofertaDescripcionController.getOfertaDescripcionById);

/**
 * @swagger
 * /oferta-descripcion/oferta/{idOferta}:
 *   get:
 *     summary: Obtiene todas las descripciones de una oferta específica
 *     tags:
 *       - OfertaDescripcion
 *     parameters:
 *       - in: path
 *         name: idOferta
 *         required: true
 *         description: ID de la oferta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Descripciones de oferta obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Descripciones de oferta obtenidas exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_oferta_descripcion:
 *                         type: integer
 *                       descripcion:
 *                         type: string
 *                       id_oferta:
 *                         type: integer
 *                       oferta:
 *                         type: object
 *                 count:
 *                   type: integer
 *                   description: Número total de descripciones
 *       500:
 *         description: Error del servidor
 */
router.get("/oferta-descripcion/oferta/:idOferta", authenticate(), ofertaDescripcionController.getDescripcionesByOfertaId);

/**
 * @swagger
 * /oferta-descripcion:
 *   post:
 *     summary: Crea una nueva descripción de oferta
 *     tags:
 *       - OfertaDescripcion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - id_oferta
 *             properties:
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la oferta (obligatorio)
 *               id_oferta:
 *                 type: integer
 *                 description: ID de la oferta asociada (obligatorio)
 *           example:
 *             descripcion: "Desarrollo de aplicación web con React y Node.js"
 *             id_oferta: 1
 *     responses:
 *       201:
 *         description: Descripción de oferta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Descripción de oferta creada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_oferta_descripcion:
 *                       type: integer
 *                     descripcion:
 *                       type: string
 *                     id_oferta:
 *                       type: integer
 *                     oferta:
 *                       type: object
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.post("/oferta-descripcion", authenticate("Administrador", "Comercial"), ofertaDescripcionController.createOfertaDescripcion);

/**
 * @swagger
 * /oferta-descripcion/{id}:
 *   put:
 *     summary: Actualiza una descripción de oferta existente
 *     tags:
 *       - OfertaDescripcion
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la descripción de oferta a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - id_oferta
 *             properties:
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la oferta (obligatorio)
 *               id_oferta:
 *                 type: integer
 *                 description: ID de la oferta asociada (obligatorio)
 *           example:
 *             descripcion: "Desarrollo de aplicación web con React y Node.js - Actualizado"
 *             id_oferta: 1
 *     responses:
 *       200:
 *         description: Descripción de oferta actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Descripción de oferta actualizada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_oferta_descripcion:
 *                       type: integer
 *                     descripcion:
 *                       type: string
 *                     id_oferta:
 *                       type: integer
 *                     oferta:
 *                       type: object
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Descripción de oferta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/oferta-descripcion/:id", authenticate("Administrador", "Comercial"), ofertaDescripcionController.updateOfertaDescripcion);

/**
 * @swagger
 * /oferta-descripcion/{id}:
 *   delete:
 *     summary: Elimina una descripción de oferta
 *     tags:
 *       - OfertaDescripcion
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la descripción de oferta a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Descripción de oferta eliminada exitosamente
 *       404:
 *         description: Descripción de oferta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/oferta-descripcion/:id", authenticate("Administrador", "Comercial"), ofertaDescripcionController.deleteOfertaDescripcion);

/**
 * @swagger
 * /oferta-descripcion/filter/{page}/{limit}:
 *   post:
 *     summary: Filtra descripciones de ofertas según criterios específicos con paginación
 *     tags:
 *       - OfertaDescripcion
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
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la oferta (búsqueda case-insensitive)
 *               id_oferta:
 *                 type: integer
 *                 description: ID de la oferta
 *     responses:
 *       200:
 *         description: Descripciones de ofertas filtradas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Descripciones de ofertas filtradas exitosamente
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Error al filtrar descripciones de ofertas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al filtrar descripciones de ofertas
 *                 error:
 *                   type: string
 */
router.post("/oferta-descripcion/filter/:page/:limit", authenticate(), ofertaDescripcionController.filterOfertaDescripciones);

module.exports = router; 