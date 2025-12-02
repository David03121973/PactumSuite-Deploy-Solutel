const express = require("express");
const router = express.Router();
const trabajadorAutorizadoController = require("../controllers/trabajadorAutorizadoController.js");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   name: TrabajadorAutorizado
 *   description: API para la gestión de trabajadores autorizados
 */

/**
 * @swagger
 * /trabajadorAutorizado:
 *   get:
 *     summary: Obtiene todos los trabajadores autorizados
 *     tags:
 *       - TrabajadorAutorizado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trabajadores autorizados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_trabajador_autorizado:
 *                         type: integer
 *                         example: 1
 *                       cargo:
 *                         type: string
 *                         example: "Ingeniero de Software"
 *                       funcion:
 *                         type: string
 *                         example: "Firma"
 *                         enum:
 *                           - "Concidia"
 *                           - "Firma"
 *                           - "Concidia y Firma"
 *                       nombre:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       carnet_identidad:
 *                         type: string
 *                         example: "12345678901"
 *                       num_telefono:
 *                         type: string
 *                         example: "+53 55555555"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:30:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T10:30:00.000Z"
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
 *                   example: "Error al obtener los trabajadores autorizados"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión con la base de datos"
 */
router.get("/trabajadorAutorizado",authenticate(), trabajadorAutorizadoController.getAllTrabajadoresAutorizados);

/**
 * @swagger
 * /trabajadorAutorizado/{id}:
 *   get:
 *     summary: Obtiene un trabajador autorizado por su ID
 *     tags:
 *       - TrabajadorAutorizado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador autorizado
 *         example: 1
 *     responses:
 *       200:
 *         description: Trabajador autorizado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_trabajador_autorizado:
 *                       type: integer
 *                       example: 1
 *                     cargo:
 *                       type: string
 *                       example: "Ingeniero de Software"
 *                     funcion:
 *                       type: string
 *                       example: "Firma"
 *                       enum:
 *                         - "Concidia"
 *                         - "Firma"
 *                         - "Concidia y Firma"
 *                     nombre:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     carnet_identidad:
 *                       type: string
 *                       example: "12345678901"
 *                     num_telefono:
 *                       type: string
 *                       example: "+53 55555555"
 *       404:
 *         description: Trabajador autorizado no encontrado
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
 *                   example: "Trabajador autorizado no encontrado"
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
 *                   example: "Error al obtener el trabajador autorizado"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión con la base de datos"
 */
router.get("/trabajadorAutorizado/:id",authenticate(), trabajadorAutorizadoController.getTrabajadorAutorizadoById);

/**
 * @swagger
 * /trabajadorAutorizado/CreateTrabajadorAutorizado:
 *   post:
 *     summary: Crea un nuevo trabajador autorizado
 *     tags:
 *       - TrabajadorAutorizado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - carnet_identidad
 *             properties:
 *               cargo:
 *                 type: string
 *                 example: "Ingeniero de Software"
 *               funcion:
 *                 type: string
 *                 example: "Firma"
 *                 enum:
 *                   - "Concidia"
 *                   - "Firma"
 *                   - "Concidia y Firma"
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               carnet_identidad:
 *                 type: string
 *                 example: "12345678901"
 *               num_telefono:
 *                 type: string
 *                 example: "+53 55555555"
 *     responses:
 *       201:
 *         description: Trabajador autorizado creado exitosamente
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
 *                   example: "Trabajador autorizado creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_trabajador_autorizado:
 *                       type: integer
 *                       example: 1
 *                     cargo:
 *                       type: string
 *                       example: "Ingeniero de Software"
 *                     funcion:
 *                       type: string
 *                       example: "Firma"
 *                       enum:
 *                         - "Concidia"
 *                         - "Firma"
 *                         - "Concidia y Firma"
 *                     nombre:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     carnet_identidad:
 *                       type: string
 *                       example: "12345678901"
 *                     num_telefono:
 *                       type: string
 *                       example: "+53 55555555"
 *       400:
 *         description: Datos de trabajador autorizado inválidos
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
 *                   example: "Ya existe un trabajador autorizado con ese carnet de identidad"
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
 *                   example: "Error al crear el trabajador autorizado"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión con la base de datos"
 */
router.post("/trabajadorAutorizado/CreateTrabajadorAutorizado",authenticate("Administrador", "Comercial"), trabajadorAutorizadoController.createTrabajadorAutorizado);

/**
 * @swagger
 * /trabajadorAutorizado/UpdateTrabajadorAutorizado{id}:
 *   put:
 *     summary: Actualiza un trabajador autorizado existente
 *     tags:
 *       - TrabajadorAutorizado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador autorizado
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cargo:
 *                 type: string
 *                 example: "Ingeniero de Software Senior"
 *               funcion:
 *                 type: string
 *                 example: "Firma"
 *                 enum:
 *                   - "Concidia"
 *                   - "Firma"
 *                   - "Concidia y Firma"
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               carnet_identidad:
 *                 type: string
 *                 example: "12345678901"
 *               num_telefono:
 *                 type: string
 *                 example: "+53 55555555"
 *     responses:
 *       200:
 *         description: Trabajador autorizado actualizado exitosamente
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
 *                   example: "Trabajador autorizado actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_trabajador_autorizado:
 *                       type: integer
 *                       example: 1
 *                     cargo:
 *                       type: string
 *                       example: "Ingeniero de Software Senior"
 *                     funcion:
 *                       type: string
 *                       example: "Firma"
 *                       enum:
 *                         - "Concidia"
 *                         - "Firma"
 *                         - "Concidia y Firma"
 *                     nombre:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     carnet_identidad:
 *                       type: string
 *                       example: "12345678901"
 *                     num_telefono:
 *                       type: string
 *                       example: "+53 55555555"
 *       400:
 *         description: Datos de trabajador autorizado inválidos
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
 *                   example: "Ya existe un trabajador autorizado con ese carnet de identidad"
 *       404:
 *         description: Trabajador autorizado no encontrado
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
 *                   example: "Trabajador autorizado no encontrado"
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
 *                   example: "Error al actualizar el trabajador autorizado"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión con la base de datos"
 * */
router.put("/trabajadorAutorizado/UpdateTrabajadorAutorizado/:id",authenticate("Administrador", "Comercial"), trabajadorAutorizadoController.updateTrabajadorAutorizado);

/**
 * @swagger
 * /trabajadorAutorizado/DeleteTrabajadorAutorizado/{id}:
 *   delete:
 *     summary: Elimina un trabajador autorizado
 *     tags:
 *       - TrabajadorAutorizado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador autorizado
 *         example: 1
 *     responses:
 *       200:
 *         description: Trabajador autorizado eliminado exitosamente
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
 *                   example: "Trabajador autorizado eliminado exitosamente"
 *       404:
 *         description: Trabajador autorizado no encontrado
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
 *                   example: "Trabajador autorizado no encontrado"
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
 *                   example: "Error al eliminar el trabajador autorizado"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión con la base de datos"
 * */
router.delete("/trabajadorAutorizado/DeleteTrabajadorAutorizado/:id",authenticate("Administrador", "Comercial"), trabajadorAutorizadoController.deleteTrabajadorAutorizado);

/**
 * @swagger
 * /trabajadorAutorizado/filter/{page}/{limit}:
 *   post:
 *     summary: Filtra trabajadores autorizados con paginación
 *     tags:
 *       - TrabajadorAutorizado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de página
 *         example: 1
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Límite de registros por página
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del trabajador autorizado (búsqueda parcial)
 *                 example: "Juan"
 *               cargo:
 *                 type: string
 *                 description: Cargo del trabajador autorizado (búsqueda parcial)
 *                 example: "Ingeniero"
 *               funcion:
 *                 type: string
 *                 description: Funcion del trabajador autorizado (búsqueda exacta o parcial según implementación)
 *                 example: "Firma"
 *                 enum:
 *                   - "Concidia"
 *                   - "Firma"
 *                   - "Concidia y Firma"
 *               carnet_identidad:
 *                 type: string
 *                 description: Carnet de identidad del trabajador autorizado (búsqueda parcial)
 *                 example: "12345678901"
 *               id_entidad:
 *                 type: integer
 *                 description: ID de la entidad para filtrar trabajadores relacionados
 *                 example: 1
 *     responses:
 *       200:
 *         description: Trabajadores autorizados filtrados exitosamente
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
 *                   example: "Trabajadores autorizados filtrados exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_trabajador_autorizado:
 *                         type: integer
 *                         example: 1
 *                       cargo:
 *                         type: string
 *                         example: "Ingeniero de Software"
 *                       funcion:
 *                         type: string
 *                         example: "Firma"
 *                         enum:
 *                           - "Concidia"
 *                           - "Firma"
 *                           - "Concidia y Firma"
 *                       nombre:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       carnet_identidad:
 *                         type: string
 *                         example: "12345678901"
 *                       num_telefono:
 *                         type: string
 *                         example: "+53 55555555"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Parámetros de paginación inválidos
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
 *                   example: "El número de página debe ser un número entero positivo"
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
 *                   example: "Error al filtrar trabajadores autorizados"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión con la base de datos"
 * */
router.post("/trabajadorAutorizado/filter/:page/:limit",authenticate(), trabajadorAutorizadoController.filterTrabajadores);

module.exports = router;