const express = require("express");
const router = express.Router();
const tipoContratoController = require("../controllers/tipoContratoController.js");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   name: TipoContrato
 *   description: API para la gestión de tipos de contrato
 */

/**
 * @swagger
 * /tipoContrato:
 *   get:
 *     summary: Obtiene todos los tipos de contrato
 *     tags:
 *       - TipoContrato
 *     responses:
 *       200:
 *         description: Lista de tipos de contrato obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_tipo_contrato:
 *                     type: integer
 *                     description: ID único del tipo de contrato
 *                   nombre:
 *                     type: string
 *                     description: Nombre del tipo de contrato
 *             example:
 *               - id_tipo_contrato: 1
 *                 nombre: "Contrato Temporal"
 *               - id_tipo_contrato: 2
 *                 nombre: "Contrato Fijo"
 *       500:
 *         description: Error del servidor
 */
router.get("/tipoContrato", authenticate(), tipoContratoController.getAllTipoContratos);

/**
 * @swagger
 * /tipoContrato/{id}:
 *   get:
 *     summary: Obtiene un tipo de contrato por su ID
 *     tags:
 *       - TipoContrato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de contrato
 *     responses:
 *       200:
 *         description: Tipo de contrato encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_tipo_contrato:
 *                   type: integer
 *                   description: ID único del tipo de contrato
 *                 nombre:
 *                   type: string
 *                   description: Nombre del tipo de contrato
 *             example:
 *               id_tipo_contrato: 1
 *               nombre: "Contrato Temporal"
 *       404:
 *         description: Tipo de contrato no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/tipoContrato/:id", authenticate(), tipoContratoController.getTipoContratoById);

/**
 * @swagger
 * /tipoContrato/createContrato:
 *   post:
 *     summary: Crea un nuevo tipo de contrato
 *     tags:
 *       - TipoContrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del tipo de contrato
 *                 minLength: 3
 *                 maxLength: 100
 *           example:
 *             nombre: "Contrato Temporal"
 *     responses:
 *       201:
 *         description: Tipo de contrato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_tipo_contrato:
 *                   type: integer
 *                   description: ID del tipo de contrato creado
 *                 nombre:
 *                   type: string
 *                   description: Nombre del tipo de contrato
 *             example:
 *               id_tipo_contrato: 3
 *               nombre: "Contrato Temporal"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/tipoContrato/createContrato", authenticate("Administrador", "Comercial"), tipoContratoController.createTipoContrato);

/**
 * @swagger
 * /tipoContrato/updateContrato/{id}:
 *   put:
 *     summary: Actualiza un tipo de contrato existente
 *     tags:
 *       - TipoContrato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de contrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del tipo de contrato
 *                 minLength: 3
 *                 maxLength: 100
 *           example:
 *             nombre: "Contrato Temporal Actualizado"
 *     responses:
 *       200:
 *         description: Tipo de contrato actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_tipo_contrato:
 *                   type: integer
 *                   description: ID del tipo de contrato
 *                 nombre:
 *                   type: string
 *                   description: Nombre actualizado del tipo de contrato
 *             example:
 *               id_tipo_contrato: 1
 *               nombre: "Contrato Temporal Actualizado"
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Tipo de contrato no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/tipoContrato/updateContrato/:id", authenticate("Administrador", "Comercial"), tipoContratoController.updateTipoContrato);

/**
 * @swagger
 * /tipoContrato/deleteContrato/{id}:
 *   delete:
 *     summary: Elimina un tipo de contrato
 *     tags:
 *       - TipoContrato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de contrato
 *     responses:
 *       200:
 *         description: Tipo de contrato eliminado exitosamente
 *       404:
 *         description: Tipo de contrato no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/tipoContrato/deleteContrato/:id", authenticate("Administrador", "Comercial"), tipoContratoController.deleteTipoContrato);

module.exports = router; 