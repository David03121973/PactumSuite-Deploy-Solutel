const express = require("express");
const router = express.Router();
const ofertaController = require("../controllers/ofertaController.js");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   name: Oferta
 *   description: API para la gestión de ofertas
 */

/**
 * @swagger
 * /oferta:
 *   get:
 *     summary: Obtiene todas las ofertas
 *     tags:
 *       - Oferta
 *     responses:
 *       200:
 *         description: Lista de ofertas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *             example:
 *               - id_oferta: 1
 *                 fecha_inicio: "2023-01-01"
 *                 fecha_fin: "2023-01-31"
 *                 id_contrato: 101
 *                 id_usuario: 50
 *                 estado: "vigente"
 *                 descripciones: []
 *               - id_oferta: 2
 *                 fecha_inicio: "2023-02-15"
 *                 fecha_fin: "2023-03-15"
 *                 id_contrato: 102
 *                 id_usuario: 51
 *                 estado: "facturada"
 *                 descripciones: []
 *       500:
 *         description: Error del servidor
 */
router.get("/oferta",authenticate(), ofertaController.getAllOfertas);

/**
 * @swagger
 * /oferta/filterOfertas:
 *   post:
 *     summary: Filtra ofertas según criterios específicos
 *     tags:
 *       - Oferta
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio para filtrar (YYYY-MM-DD)
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin para filtrar (YYYY-MM-DD)
 *               id_contrato:
 *                 type: integer
 *                 description: ID del contrato
 *               id_usuario:
 *                 type: integer
 *                 description: ID del usuario
 *               estado:
 *                 type: string
 *                 enum: [vigente, facturada, vencida]
 *                 description: Estado de la oferta (opcional)
 *           example:
 *             fecha_inicio: "2023-01-01"
 *             fecha_fin: "2023-01-31"
 *             id_contrato: 101
 *             id_usuario: 50
 *             estado: "vigente"
 *     responses:
 *       200:
 *         description: Lista de ofertas filtradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *             example:
 *               - id_oferta: 1
 *                 fecha_inicio: "2023-01-01"
 *                 fecha_fin: "2023-01-31"
 *                 id_contrato: 101
 *                 id_usuario: 50
 *                 descripciones: []
 *       500:
 *         description: Error del servidor
 */
router.post("/oferta/filterOfertas", authenticate(), ofertaController.filterOfertas);

/**
 * @swagger
 * /oferta/{id}:
 *   get:
 *     summary: Obtiene una oferta por ID
 *     tags:
 *       - Oferta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la oferta a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Oferta obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               id_oferta: 1
 *               fecha_inicio: "2023-01-01"
 *               fecha_fin: "2023-01-31"
 *               id_contrato: 101
 *               descripcion: "Oferta de desarrollo de software para proyecto X."
 *               id_usuario: 50
 *               estado: "vigente"
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/oferta/:id",authenticate(), ofertaController.getOfertaById);

/**
 * @swagger
 * /oferta/CreateOferta:
 *   post:
 *     summary: Crea una nueva oferta con sus descripciones
 *     tags:
 *       - Oferta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha_inicio
 *               - fecha_fin
 *               - id_contrato
 *               - id_usuario
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la oferta
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la oferta
 *               id_contrato:
 *                 type: integer
 *                 description: ID del contrato asociado
 *               id_usuario:
 *                 type: integer
 *                 description: ID del usuario que crea la oferta
 *               estado:
 *                 type: string
 *                 enum: [vigente, facturada, vencida]
 *                 description: Estado de la oferta (opcional)
 *               descripciones:
 *                 type: array
 *                 description: Lista de descripciones para la oferta (opcional)
 *                 items:
 *                   type: string
 *                   description: Texto de la descripción
 *           example:
 *             fecha_inicio: "2024-01-01"
 *             fecha_fin: "2024-12-31"
 *             id_contrato: 1
 *             id_usuario: 1
 *             estado: "vigente"
 *             descripciones:
 *               - "Desarrollo de aplicación web con React"
 *               - "Implementación de API REST con Node.js"
 *               - "Configuración de base de datos PostgreSQL"
 *     responses:
 *       201:
 *         description: Oferta creada exitosamente con sus descripciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Oferta creada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_oferta:
 *                       type: integer
 *                     fecha_inicio:
 *                       type: string
 *                       format: date
 *                     fecha_fin:
 *                       type: string
 *                       format: date
 *                     id_contrato:
 *                       type: integer
 *                     id_usuario:
 *                       type: integer
 *                     estado:
 *                       type: string
 *                     descripciones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_oferta_descripcion:
 *                             type: integer
 *                           descripcion:
 *                             type: string
 *                           id_oferta:
 *                             type: integer
 *             example:
 *               message: "Oferta creada exitosamente"
 *               data:
 *                 id_oferta: 1
 *                 fecha_inicio: "2024-01-01"
 *                 fecha_fin: "2024-12-31"
 *                 id_contrato: 1
 *                 id_usuario: 1
 *                 estado: "vigente"
 *                 descripciones:
 *                   - id_oferta_descripcion: 1
 *                     descripcion: "Desarrollo de aplicación web con React"
 *                     id_oferta: 1
 *                   - id_oferta_descripcion: 2
 *                     descripcion: "Implementación de API REST con Node.js"
 *                     id_oferta: 1
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/oferta/CreateOferta",authenticate("Administrador", "Comercial"), ofertaController.createOferta);

/**
 * @swagger
 * /oferta/updateOferta/{id}:
 *   put:
 *     summary: Actualiza una oferta existente con sus descripciones
 *     tags:
 *       - Oferta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la oferta a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de la oferta
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin de la oferta
 *               id_contrato:
 *                 type: integer
 *                 description: ID del contrato asociado
 *               id_usuario:
 *                 type: integer
 *                 description: ID del usuario que actualiza la oferta
 *               estado:
 *                 type: string
 *                 enum: [vigente, facturada, vencida]
 *                 description: Estado de la oferta (opcional)
 *               descripciones:
 *                 type: array
 *                 description: Lista de descripciones para la oferta (opcional, reemplaza todas las existentes)
 *                 items:
 *                   type: string
 *                   description: Texto de la descripción
 *           example:
 *             fecha_inicio: "2024-01-01"
 *             fecha_fin: "2024-12-31"
 *             id_contrato: 1
 *             id_usuario: 1
 *             estado: "facturada"
 *             descripciones:
 *               - "Desarrollo de aplicación web con React - Actualizado"
 *               - "Implementación de API REST con Node.js - Mejorado"
 *               - "Configuración de base de datos PostgreSQL - Optimizado"
 *     responses:
 *       200:
 *         description: Oferta actualizada exitosamente con sus descripciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Oferta actualizada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_oferta:
 *                       type: integer
 *                     fecha_inicio:
 *                       type: string
 *                       format: date
 *                     fecha_fin:
 *                       type: string
 *                       format: date
 *                     id_contrato:
 *                       type: integer
 *                     id_usuario:
 *                       type: integer
 *                     estado:
 *                       type: string
 *                     descripciones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_oferta_descripcion:
 *                             type: integer
 *                           descripcion:
 *                             type: string
 *                           id_oferta:
 *                             type: integer
 *             example:
 *               message: "Oferta actualizada exitosamente"
 *               data:
 *                 id_oferta: 1
 *                 fecha_inicio: "2024-01-01"
 *                 fecha_fin: "2024-12-31"
 *                 id_contrato: 1
 *                 id_usuario: 1
 *                 estado: "facturada"
 *                 descripciones:
 *                   - id_oferta_descripcion: 1
 *                     descripcion: "Desarrollo de aplicación web con React - Actualizado"
 *                     id_oferta: 1
 *                   - id_oferta_descripcion: 2
 *                     descripcion: "Implementación de API REST con Node.js - Mejorado"
 *                     id_oferta: 1
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/oferta/updateOferta/:id",authenticate("Administrador", "Comercial"), ofertaController.updateOferta);

/**
 * @swagger
 * /oferta/deleteOferta/{id}:
 *   delete:
 *     summary: Elimina una oferta y todas sus descripciones
 *     tags:
 *       - Oferta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la oferta a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Oferta y todas sus descripciones eliminadas exitosamente
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/oferta/deleteOferta/:id",authenticate("Administrador", "Comercial"), ofertaController.deleteOferta);

module.exports = router; 