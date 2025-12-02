const express = require("express");
const router = express.Router();
const contratoTrabajadorController = require("../controllers/contratoTrabajadorController.js");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   name: ContratoTrabajador
 *   description: API para la gestión de la relación Contrato-Trabajador
 */

/**
 * @swagger
 * /contratoTrabajador:
 *   get:
 *     summary: Obtiene todas las relaciones Contrato-Trabajador
 *     tags:
 *       - ContratoTrabajador
 *     responses:
 *       200:
 *         description: Lista de relaciones Contrato-Trabajador obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               - id_contrato_trabajador: 1
 *                 id_contrato: 2
 *                 id_trabajador_autorizado: 3
 *                 createdAt: "2024-03-20T10:00:00.000Z"
 *                 updatedAt: "2024-03-20T10:00:00.000Z"
 *               - id_contrato_trabajador: 2
 *                 id_contrato: 3
 *                 id_trabajador_autorizado: 4
 *                 createdAt: "2024-03-21T11:00:00.000Z"
 *                 updatedAt: "2024-03-21T11:00:00.000Z"
 *       500:
 *         description: Error del servidor
 */
router.get("/contratoTrabajador", authenticate(), contratoTrabajadorController.getAllContratoTrabajadores);

/**
 * @swagger
 * /contratoTrabajador/{id}:
 *   get:
 *     summary: Obtiene una relación Contrato-Trabajador por ID
 *     tags:
 *       - ContratoTrabajador
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la relación Contrato-Trabajador a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relación Contrato-Trabajador obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id_contrato_trabajador: 1
 *               id_contrato: 2
 *               id_trabajador_autorizado: 3
 *               createdAt: "2024-03-20T10:00:00.000Z"
 *               updatedAt: "2024-03-20T10:00:00.000Z"
 *       404:
 *         description: Relación Contrato-Trabajador no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/contratoTrabajador/:id", authenticate(), contratoTrabajadorController.getContratoTrabajadorById);

/**
 * @swagger
 * /contratoTrabajador/CreateContratoTrabajador:
 *   post:
 *     summary: Crea una nueva relación Contrato-Trabajador
 *     tags:
 *       - ContratoTrabajador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_contrato
 *               - id_trabajador_autorizado
 *             properties:
 *               id_contrato:
 *                 type: integer
 *                 description: ID del contrato
 *                 example: 2
 *               id_trabajador_autorizado:
 *                 type: integer
 *                 description: ID del trabajador autorizado
 *                 example: 3
 *           example:
 *             id_contrato: 2
 *             id_trabajador_autorizado: 3
 *     responses:
 *       201:
 *         description: Relación Contrato-Trabajador creada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id_contrato_trabajador: 1
 *               id_contrato: 2
 *               id_trabajador_autorizado: 3
 *               createdAt: "2024-03-20T10:00:00.000Z"
 *               updatedAt: "2024-03-20T10:00:00.000Z"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/contratoTrabajador/CreateContratoTrabajador", authenticate("Administrador", "Comercial"), contratoTrabajadorController.createContratoTrabajador);

/**
 * @swagger
 * /contratoTrabajador/UpdateContratoTrabajador/{id}:
 *   put:
 *     summary: Actualiza una relación Contrato-Trabajador existente
 *     tags:
 *       - ContratoTrabajador
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la relación Contrato-Trabajador a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_contrato:
 *                 type: integer
 *                 description: ID del contrato
 *                 example: 2
 *               id_trabajador_autorizado:
 *                 type: integer
 *                 description: ID del trabajador autorizado
 *                 example: 3
 *           example:
 *             id_contrato: 2
 *             id_trabajador_autorizado: 3
 *     responses:
 *       200:
 *         description: Relación Contrato-Trabajador actualizada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id_contrato_trabajador: 1
 *               id_contrato: 2
 *               id_trabajador_autorizado: 3
 *               createdAt: "2024-03-20T10:00:00.000Z"
 *               updatedAt: "2024-03-20T10:00:00.000Z"
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Relación Contrato-Trabajador no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/contratoTrabajador/UpdateContratoTrabajador/:id", authenticate("Administrador", "Comercial"), contratoTrabajadorController.updateContratoTrabajador);

/**
 * @swagger
 * /contratoTrabajador/DeleteContratoTrabajador{id}:
 *   delete:
 *     summary: Elimina una relación Contrato-Trabajador
 *     tags:
 *       - ContratoTrabajador
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la relación Contrato-Trabajador a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Relación Contrato-Trabajador eliminada exitosamente
 *       404:
 *         description: Relación Contrato-Trabajador no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/contratoTrabajador/DeleteContratoTrabajador:id", authenticate("Administrador", "Comercial"), contratoTrabajadorController.deleteContratoTrabajador);

/**
 * @swagger
 * /contratoTrabajador/syncTrabajadorContratos:
 *   post:
 *     summary: Sincroniza los contratos de un trabajador autorizado
 *     tags:
 *       - ContratoTrabajador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_trabajador_autorizado:
 *                 type: integer
 *                 description: ID del trabajador autorizado
 *                 example: 1
 *               ids_contratos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Lista de IDs de contratos a asociar
 *                 example: [2, 3, 4, 5]
 *           example:
 *             id_trabajador_autorizado: 1
 *             ids_contratos: [2, 3, 4, 5]
 *     responses:
 *       200:
 *         description: Sincronización exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sincronización exitosa
 *                 data:
 *                   type: array
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Errores de validación
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error al sincronizar contratos del trabajador autorizado
 *                 error:
 *                   type: string
 *                   example: Error detallado
 */
router.post("/contratoTrabajador/syncTrabajadorContratos", authenticate("Administrador", "Comercial"), contratoTrabajadorController.syncTrabajadorContratos);

module.exports = router; 