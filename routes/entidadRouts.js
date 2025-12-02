const express = require("express");
const router = express.Router();
const entidadController = require("../controllers/entidadController.js");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   name: Entidad
 *   description: API para la gestión de entidades
 */

/**
 * @swagger
 * /entidad:
 *   get:
 *     summary: Obtiene todas las entidades
 *     tags:
 *       - Entidad
 *     responses:
 *       200:
 *         description: Lista de entidades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_entidad:
 *                     type: integer
 *                     description: ID de la entidad
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la entidad
 *                   direccion:
 *                     type: string
 *                     description: Dirección de la entidad
 *                   telefono:
 *                     type: string
 *                     description: Número de teléfono
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Correo electrónico
 *                   consecutivo:
 *                     type: string
 *                     description: Consecutivo de la entidad
 *                   organismo:
 *                     type: string
 *                     description: Organismo de la entidad
 *                   cuenta_bancaria:
 *                     type: string
 *                     description: Número de cuenta bancaria
 *                   tipo_entidad:
 *                     type: string
 *                     description: Tipo de entidad (cliente, proveedor, etc.)
 *                   codigo_reo:
 *                     type: string
 *                     description: Código REO de la entidad
 *                   codigo_nit:
 *                     type: string
 *                     description: Código NIT de la entidad
 *             example:
 *               - id_entidad: 1
 *                 nombre: "Empresa ABC Ltda."
 *                 direccion: "Calle Principal 123"
 *                 telefono: "123-456-7890"
 *                 email: "contacto@empresaabc.com"
 *                 consecutivo: "CON-001"
 *                 organismo: "Organismo Público 1"
 *                 cuenta_bancaria: "1234-5678-9012-3456"
 *                 tipo_entidad: "cliente"
 *                 codigo_reo: "REO123456"
 *                 codigo_nit: "NIT123456789"
 *               - id_entidad: 2
 *                 nombre: "Proveedor XYZ S.A."
 *                 direccion: "Avenida Comercial 456"
 *                 telefono: "987-654-3210"
 *                 email: "info@proveedorxyz.com"
 *                 consecutivo: "CON-002"
 *                 organismo: "Organismo Privado 2"
 *                 cuenta_bancaria: "9876-5432-1098-7654"
 *                 tipo_entidad: "proveedor"
 *                 codigo_reo: "REO789012"
 *                 codigo_nit: "NIT987654321"
 *       500:
 *         description: Error del servidor
 */
router.get("/entidad",authenticate(), entidadController.getAllEntidades);

/**
 * @swagger
 * /entidad/{id}:
 *   get:
 *     summary: Obtiene una entidad por ID
 *     tags:
 *       - Entidad
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la entidad a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entidad obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_entidad:
 *                   type: integer
 *                   description: ID de la entidad
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la entidad
 *                 direccion:
 *                   type: string
 *                   description: Dirección de la entidad
 *                 telefono:
 *                   type: string
 *                   description: Número de teléfono
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Correo electrónico
 *                 consecutivo:
 *                   type: string
 *                   description: Consecutivo de la entidad
 *                 organismo:
 *                   type: string
 *                   description: Organismo de la entidad
 *                 cuenta_bancaria:
 *                   type: string
 *                   description: Número de cuenta bancaria
 *                 tipo_entidad:
 *                   type: string
 *                   description: Tipo de entidad (cliente, proveedor, etc.)
 *                 codigo_reo:
 *                   type: string
 *                   description: Código REO de la entidad
 *                 codigo_nit:
 *                   type: string
 *                   description: Código NIT de la entidad
 *             example:
 *               id_entidad: 1
 *               nombre: "Empresa ABC Ltda."
 *               direccion: "Calle Principal 123"
 *               telefono: "123-456-7890"
 *               email: "contacto@empresaabc.com"
 *               consecutivo: "CON-001"
 *               organismo: "Organismo Público 1"
 *               cuenta_bancaria: "1234-5678-9012-3456"
 *               tipo_entidad: "cliente"
 *               codigo_reo: "REO123456"
 *               codigo_nit: "NIT123456789"
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/entidad/:id",authenticate(), entidadController.getEntidadById);

/**
 * @swagger
 * /entidad/CreateEntidad:
 *   post:
 *     summary: Crea una nueva entidad
 *     tags:
 *       - Entidad
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
 *                 description: Nombre de la entidad
 *               direccion:
 *                 type: string
 *                 description: Dirección de la entidad
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico (opcional)
 *               consecutivo:
 *                 type: string
 *                 description: Consecutivo de la entidad (opcional)
 *               organismo:
 *                 type: string
 *                 description: Organismo de la entidad (opcional)
 *               cuenta_bancaria:
 *                 type: string
 *                 description: Número de cuenta bancaria
 *               tipo_entidad:
 *                 type: string
 *                 description: Tipo de entidad (cliente, proveedor, etc.)
 *               codigo_reo:
 *                 type: string
 *                 description: Código REO de la entidad
 *               codigo_nit:
 *                 type: string
 *                 description: Código NIT de la entidad
 *           example:
 *             nombre: "Nueva Empresa Ltda."
 *             direccion: "Avenida Siempre Viva 742"
 *             telefono: "987-654-3210"
 *             email: "info@nuevaempresa.com"
 *             consecutivo: "CON-003"
 *             organismo: "Organismo Nuevo"
 *             cuenta_bancaria: "1234-5678-9012-3456"
 *             tipo_entidad: "proveedor"
 *             codigo_reo: "REO123456"
 *             codigo_nit: "NIT123456789"
 *     responses:
 *       201:
 *         description: Entidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_entidad:
 *                   type: integer
 *                   description: ID de la entidad creada
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la entidad
 *                 direccion:
 *                   type: string
 *                   description: Dirección de la entidad
 *                 telefono:
 *                   type: string
 *                   description: Número de teléfono
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Correo electrónico
 *                 consecutivo:
 *                   type: string
 *                   description: Consecutivo de la entidad
 *                 organismo:
 *                   type: string
 *                   description: Organismo de la entidad
 *                 cuenta_bancaria:
 *                   type: string
 *                   description: Número de cuenta bancaria
 *                 tipo_entidad:
 *                   type: string
 *                   description: Tipo de entidad
 *                 codigo_reo:
 *                   type: string
 *                   description: Código REO de la entidad
 *                 codigo_nit:
 *                   type: string
 *                   description: Código NIT de la entidad
 *             example:
 *               id_entidad: 3
 *               nombre: "Nueva Empresa Ltda."
 *               direccion: "Avenida Siempre Viva 742"
 *               telefono: "987-654-3210"
 *               email: "info@nuevaempresa.com"
 *               consecutivo: "CON-003"
 *               organismo: "Organismo Nuevo"
 *               cuenta_bancaria: "1234-5678-9012-3456"
 *               tipo_entidad: "proveedor"
 *               codigo_reo: "REO123456"
 *               codigo_nit: "NIT123456789"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/entidad/CreateEntidad",authenticate("Administrador", "Comercial"), entidadController.createEntidad);

/**
 * @swagger
 * /entidad/UpdateEntidad/{id}:
 *   put:
 *     summary: Actualiza una entidad existente
 *     tags:
 *       - Entidad
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la entidad a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la entidad
 *               direccion:
 *                 type: string
 *                 description: Dirección de la entidad
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico
 *               consecutivo:
 *                 type: string
 *                 description: Consecutivo de la entidad
 *               organismo:
 *                 type: string
 *                 description: Organismo de la entidad
 *               cuenta_bancaria:
 *                 type: string
 *                 description: Número de cuenta bancaria
 *               tipo_entidad:
 *                 type: string
 *                 description: Tipo de entidad (cliente, proveedor, etc.)
 *               codigo_reo:
 *                 type: string
 *                 description: Código REO de la entidad
 *               codigo_nit:
 *                 type: string
 *                 description: Código NIT de la entidad
 *           example:
 *             nombre: "Nombre Actualizado Entidad"
 *             direccion: "Nueva Calle 456"
 *             telefono: "111-222-3333"
 *             email: "contacto_act@ejemplo.com"
 *             consecutivo: "CON-004"
 *             organismo: "Organismo Actualizado"
 *             cuenta_bancaria: "9876-5432-1098-7654"
 *             tipo_entidad: "cliente"
 *             codigo_reo: "REO789012"
 *             codigo_nit: "NIT987654321"
 *     responses:
 *       200:
 *         description: Entidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_entidad:
 *                   type: integer
 *                   description: ID de la entidad actualizada
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la entidad
 *                 direccion:
 *                   type: string
 *                   description: Dirección de la entidad
 *                 telefono:
 *                   type: string
 *                   description: Número de teléfono
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Correo electrónico
 *                 consecutivo:
 *                   type: string
 *                   description: Consecutivo de la entidad
 *                 organismo:
 *                   type: string
 *                   description: Organismo de la entidad
 *                 cuenta_bancaria:
 *                   type: string
 *                   description: Número de cuenta bancaria
 *                 tipo_entidad:
 *                   type: string
 *                   description: Tipo de entidad
 *                 codigo_reo:
 *                   type: string
 *                   description: Código REO de la entidad
 *                 codigo_nit:
 *                   type: string
 *                   description: Código NIT de la entidad
 *             example:
 *               id_entidad: 1
 *               nombre: "Nombre Actualizado Entidad"
 *               direccion: "Nueva Calle 456"
 *               telefono: "111-222-3333"
 *               email: "contacto_act@ejemplo.com"
 *               consecutivo: "CON-004"
 *               organismo: "Organismo Actualizado"
 *               cuenta_bancaria: "9876-5432-1098-7654"
 *               tipo_entidad: "cliente"
 *               codigo_reo: "REO789012"
 *               codigo_nit: "NIT987654321"
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/entidad/UpdateEntidad/:id",authenticate("Administrador", "Comercial"), entidadController.updateEntidad);

/**
 * @swagger
 * /entidad/deleteEntidad/{id}:
 *   delete:
 *     summary: Elimina una entidad
 *     tags:
 *       - Entidad
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la entidad a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Entidad eliminada exitosamente
 *       404:
 *         description: Entidad no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/entidad/deleteEntidad/:id",authenticate("Administrador", "Comercial"), entidadController.deleteEntidad);

/**
 * @swagger
 * /entidad/filter/{page}/{limit}:
 *   post:
 *     summary: Filtrar entidades por múltiples criterios
 *     description: Permite buscar entidades utilizando diferentes criterios de búsqueda. La búsqueda es insensible a mayúsculas/minúsculas y permite coincidencias parciales. Incluye paginación de resultados.
 *     tags: [Entidad]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página a consultar
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la entidad (búsqueda parcial)
 *               direccion:
 *                 type: string
 *                 description: Dirección de la entidad (búsqueda parcial)
 *               telefono:
 *                 type: string
 *                 description: Teléfono de la entidad (búsqueda parcial)
 *               consecutivo:
 *                 type: string
 *                 description: Consecutivo de la entidad (búsqueda parcial)
 *               organismo:
 *                 type: string
 *                 description: Organismo de la entidad (búsqueda parcial)
 *               cuenta_bancaria:
 *                 type: string
 *                 description: Cuenta bancaria de la entidad (búsqueda parcial)
 *               tipo_entidad:
 *                 type: string
 *                 enum: [cliente, proveedor, cliente_proveedor]
 *                 description: Tipo de entidad
 *               codigo_reo:
 *                 type: string
 *                 description: Código REO de la entidad (búsqueda parcial)
 *               codigo_nit:
 *                 type: string
 *                 description: Código NIT de la entidad (búsqueda parcial)
 *           example:
 *             nombre: "Empresa Ejemplo S.A.S"
 *             direccion: "Calle 123 #45-67"
 *             telefono: "6012345678"
 *             consecutivo: "CON-005"
 *             organismo: "Organismo Ejemplo"
 *             cuenta_bancaria: "1234-5678-9012-3456"
 *             tipo_entidad: "cliente_proveedor"
 *             codigo_reo: "REO123456"
 *             codigo_nit: "9012345678-9"
 *     responses:
 *       200:
 *         description: Lista de entidades que coinciden con los criterios de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Entidades filtradas exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Entidad'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Número total de registros que coinciden con los filtros
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       description: Página actual
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: Número de elementos por página
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       description: Número total de páginas
 *                       example: 5
 *       400:
 *         description: Error en los parámetros de paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El número de página debe ser un número entero positivo
 *                 error:
 *                   type: string
 *                   example: PAGE_INVALID
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al filtrar entidades
 *                 error:
 *                   type: string
 *                   example: Error interno del servidor
 */
router.post('/entidad/filter/:page/:limit', authenticate(), entidadController.filterEntidades);

module.exports = router;
