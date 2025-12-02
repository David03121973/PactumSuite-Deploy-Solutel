const express = require("express");
const router = express.Router();
const contratoController = require("../controllers/contratoController.js");
const authenticate = require("../helpers/authenticate");

/**
 * @swagger
 * tags:
 *   name: Contrato
 *   description: API para la gestión de contratos
 */

/**
 * @swagger
 * /contrato:
 *   get:
 *     summary: Obtiene todos los contratos
 *     tags:
 *       - Contrato
 *     responses:
 *       200:
 *         description: Lista de contratos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_contrato:
 *                     type: integer
 *                     description: ID único del contrato
 *                   id_entidad:
 *                     type: integer
 *                     description: ID de la entidad asociada
 *                   id_tipo_contrato:
 *                     type: integer
 *                     description: ID del tipo de contrato
 *                   fecha_inicio:
 *                     type: string
 *                     format: date
 *                     description: Fecha de inicio del contrato
 *                   fecha_fin:
 *                     type: string
 *                     format: date
 *                     description: Fecha de finalización del contrato
 *                 num_consecutivo:
 *                   type: integer
 *                   description: Número consecutivo único del contrato
 *                 clasificacion:
 *                   type: string
 *                   description: Clasificación del contrato
 *                 nota:
 *                   type: string
 *                   description: Notas adicionales del contrato
 *                 vigenciaFacturasDias:
 *                   type: integer
 *                   description: Vigencia en días para facturas
 *                 entidad:
 *                   type: object
 *                   description: Información de la entidad asociada
 *                 tipoContrato:
 *                   type: object
 *                   description: Información del tipo de contrato
 *                 ofertas:
 *                   type: array
 *                   description: Lista de ofertas asociadas
 *                 trabajadoresAutorizados:
 *                   type: array
 *                   description: Lista de trabajadores autorizados
 *             example:
 *               - id_contrato: 1
 *                 id_entidad: 1
 *                 id_tipo_contrato: 1
 *                 fecha_inicio: "2024-01-01"
 *                 fecha_fin: "2024-12-31"
 *                 num_consecutivo: 1001
 *                 clasificacion: "Servicios"
 *                 nota: "Contrato de servicios profesionales"
 *                 entidad:
 *                   id_entidad: 1
 *                   nombre: "Empresa ABC"
 *                 tipoContrato:
 *                   id_tipo_contrato: 1
 *                   nombre: "Contrato Temporal"
 *       500:
 *         description: Error del servidor
 */
router.get("/contrato", authenticate(), contratoController.getAllContratos);

/**
 * @swagger
 * /contrato/proximos-a-vencer:
 *   get:
 *     summary: Obtiene contratos que están próximos a vencer (1 mes o menos antes de la fecha fin)
 *     tags:
 *       - Contrato
 *     responses:
 *       200:
 *         description: Contratos próximos a vencer obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contratos próximos a vencer obtenidos exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_contrato:
 *                         type: integer
 *                         description: ID único del contrato
 *                       id_entidad:
 *                         type: integer
 *                         description: ID de la entidad asociada
 *                       id_tipo_contrato:
 *                         type: integer
 *                         description: ID del tipo de contrato
 *                       fecha_inicio:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio del contrato
 *                       fecha_fin:
 *                         type: string
 *                         format: date
 *                         description: Fecha de finalización del contrato
 *                       num_consecutivo:
 *                         type: integer
 *                         description: Número consecutivo único del contrato
 *                       clasificacion:
 *                         type: string
 *                         description: Clasificación del contrato
 *                       nota:
 *                         type: string
 *                         description: Notas adicionales del contrato
 *                       vigenciaFacturasDias:
 *                         type: integer
 *                         description: Vigencia en días para facturas
 *                       entidad:
 *                         type: object
 *                         description: Información de la entidad asociada
 *                       tipoContrato:
 *                         type: object
 *                         description: Información del tipo de contrato
 *                       ofertas:
 *                         type: array
 *                         description: Lista de ofertas asociadas
 *                       trabajadoresAutorizados:
 *                         type: array
 *                         description: Lista de trabajadores autorizados
 *                 count:
 *                   type: integer
 *                   description: Número total de contratos próximos a vencer
 *                   example: 5
 *             example:
 *               message: "Contratos próximos a vencer obtenidos exitosamente"
 *               data:
 *                 - id_contrato: 1
 *                   id_entidad: 1
 *                   id_tipo_contrato: 1
 *                   fecha_inicio: "2024-01-01"
 *                   fecha_fin: "2024-12-31"
 *                   num_consecutivo: 1001
 *                   clasificacion: "Servicios"
 *                   nota: "Contrato de servicios profesionales"
 *                   entidad:
 *                     id_entidad: 1
 *                     nombre: "Empresa ABC"
 *                   tipoContrato:
 *                     id_tipo_contrato: 1
 *                     nombre: "Contrato Temporal"
 *                   ofertas: []
 *                   trabajadoresAutorizados: []
 *               count: 1
 *       500:
 *         description: Error al obtener contratos próximos a vencer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener contratos próximos a vencer
 *                 error:
 *                   type: string
 */
router.get("/contrato/proximos-a-vencer", authenticate(), contratoController.getContratosProximosAVencer);

/**
 * @swagger
 * /contrato/{id}:
 *   get:
 *     summary: Obtiene un contrato por ID
 *     tags:
 *       - Contrato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del contrato a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contrato obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_contrato:
 *                   type: integer
 *                   description: ID único del contrato
 *                 id_entidad:
 *                   type: integer
 *                   description: ID de la entidad asociada
 *                 id_tipo_contrato:
 *                   type: integer
 *                   description: ID del tipo de contrato
 *                 fecha_inicio:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio del contrato
 *                 fecha_fin:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización del contrato
 *                 num_consecutivo:
 *                   type: integer
 *                   description: Número consecutivo único del contrato
 *                 clasificacion:
 *                   type: string
 *                   description: Clasificación del contrato
 *                   nota:
 *                     type: string
 *                     description: Notas adicionales del contrato
 *                   vigenciaFacturasDias:
 *                     type: integer
 *                     description: Vigencia en días para facturas
 *                 entidad:
 *                   type: object
 *                   description: Información de la entidad asociada
 *                 tipoContrato:
 *                   type: object
 *                   description: Información del tipo de contrato
 *                 ofertas:
 *                   type: array
 *                   description: Lista de ofertas asociadas
 *                 trabajadoresAutorizados:
 *                   type: array
 *                   description: Lista de trabajadores autorizados
 *             example:
 *               id_contrato: 1
 *               id_entidad: 1
 *               id_tipo_contrato: 1
 *               fecha_inicio: "2024-01-01"
 *               fecha_fin: "2024-12-31"
 *               num_consecutivo: 1001
 *               clasificacion: "Servicios"
 *               nota: "Contrato de servicios profesionales"
 *               entidad:
 *                 id_entidad: 1
 *                 nombre: "Empresa ABC"
 *               tipoContrato:
 *                 id_tipo_contrato: 1
 *                 nombre: "Contrato Temporal"
 *       404:
 *         description: Contrato no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/contrato/:id", authenticate(), contratoController.getContratoById);

/**
 * @swagger
 * /contrato/CreateContrato:
 *   post:
 *     summary: Crea un nuevo contrato
 *     tags:
 *       - Contrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_entidad
 *               - id_tipo_contrato
 *               - fecha_inicio
 *               - fecha_fin
 *               - num_consecutivo
 *             properties:
 *               id_entidad:
 *                 type: integer
 *                 description: ID de la entidad asociada (obligatorio)
 *               id_tipo_contrato:
 *                 type: integer
 *                 description: ID del tipo de contrato (obligatorio)
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del contrato (obligatorio)
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de finalización del contrato (obligatorio)
 *               num_consecutivo:
 *                 type: string
 *                 description: Número consecutivo único del contrato (obligatorio)
 *               clasificacion:
 *                 type: string
 *                 description: Clasificación del contrato (opcional)
 *               nota:
 *                 type: string
 *                 description: Notas adicionales del contrato (opcional)
 *               ClienteOProveedor:
 *                 type: string
 *                 enum: [Cliente, Proveedor]
 *                 description: Tipo de contrato - Cliente o Proveedor (opcional, por defecto 'Cliente')
 *               vigenciaFacturasDias:
 *                 type: integer
 *                 minimum: 0
 *                 description: Vigencia en días para facturas (opcional, por defecto 30, no negativo)
 *           example:
 *             id_entidad: 1
 *             id_tipo_contrato: 1
 *             fecha_inicio: "2024-01-01"
 *             fecha_fin: "2024-12-31"
 *             num_consecutivo: "1001"
 *             clasificacion: "Servicios de consultoría"
 *             nota: "Contrato para servicios de TI"
 *             ClienteOProveedor: "Cliente"
 *             vigenciaFacturasDias: 30
 *     responses:
 *       201:
 *         description: Contrato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_contrato:
 *                   type: integer
 *                   description: ID del contrato creado
 *                 id_entidad:
 *                   type: integer
 *                   description: ID de la entidad asociada
 *                 id_tipo_contrato:
 *                   type: integer
 *                   description: ID del tipo de contrato
 *                 fecha_inicio:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio del contrato
 *                 fecha_fin:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización del contrato
 *                 num_consecutivo:
 *                   type: integer
 *                   description: Número consecutivo único del contrato
 *                 clasificacion:
 *                   type: string
 *                   description: Clasificación del contrato
 *                 nota:
 *                   type: string
 *                   description: Notas adicionales del contrato
 *                 vigenciaFacturasDias:
 *                   type: integer
 *                   description: Vigencia en días para facturas
 *                 entidad:
 *                   type: object
 *                   description: Información de la entidad asociada
 *                   properties:
 *                     id_entidad:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                 tipoContrato:
 *                   type: object
 *                   description: Información del tipo de contrato
 *                   properties:
 *                     id_tipo_contrato:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                 ofertas:
 *                   type: array
 *                   description: Lista de ofertas asociadas
 *                 trabajadoresAutorizados:
 *                   type: array
 *                   description: Lista de trabajadores autorizados
 *             example:
 *               id_contrato: 1
 *               id_entidad: 1
 *               id_tipo_contrato: 1
 *               fecha_inicio: "2024-01-01"
 *               fecha_fin: "2024-12-31"
 *               num_consecutivo: 1001
 *               clasificacion: "Servicios"
 *               nota: "Contrato de servicios profesionales"
 *               vigenciaFacturasDias: 30
 *               entidad:
 *                 id_entidad: 1
 *                 nombre: "Empresa ABC"
 *               tipoContrato:
 *                 id_tipo_contrato: 1
 *                 nombre: "Contrato Temporal"
 *               ofertas: []
 *               trabajadoresAutorizados: []
 *       400:
 *         description: Datos de entrada inválidos o entidad/tipo de contrato no encontrados
 *       500:
 *         description: Error del servidor
 */
router.post("/contrato/CreateContrato", authenticate("Administrador", "Comercial"), contratoController.createContrato);

/**
 * @swagger
 * /contrato/UpdateContrato/{id}:
 *   put:
 *     summary: Actualiza un contrato existente
 *     tags:
 *       - Contrato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del contrato a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_entidad:
 *                 type: integer
 *                 description: ID de la entidad asociada (opcional)
 *               id_tipo_contrato:
 *                 type: integer
 *                 description: ID del tipo de contrato (opcional)
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del contrato
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de finalización del contrato
 *               num_consecutivo:
 *                 type: string
 *                 description: Número consecutivo único del contrato
 *               clasificacion:
 *                 type: string
 *                 description: Clasificación del contrato
 *               nota:
 *                 type: string
 *                 description: Notas adicionales del contrato
 *               ClienteOProveedor:
 *                 type: string
 *                 enum: [Cliente, Proveedor]
 *                 description: Tipo de contrato - Cliente o Proveedor
 *               vigenciaFacturasDias:
 *                 type: integer
 *                 minimum: 0
 *                 description: Vigencia en días para facturas (opcional, no negativo)
 *           example:
 *             id_entidad: 1
 *             id_tipo_contrato: 1
 *             fecha_inicio: "2024-01-01"
 *             fecha_fin: "2024-12-31"
 *             num_consecutivo: "1001"
 *             clasificacion: "Servicios"
 *             nota: "Contrato de servicios profesionales actualizado"
 *             ClienteOProveedor: "Cliente"
 *             vigenciaFacturasDias: 30
 *     responses:
 *       200:
 *         description: Contrato actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_contrato:
 *                   type: integer
 *                   description: ID del contrato actualizado
 *                 id_entidad:
 *                   type: integer
 *                   description: ID de la entidad asociada
 *                 id_tipo_contrato:
 *                   type: integer
 *                   description: ID del tipo de contrato
 *                 fecha_inicio:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio del contrato
 *                 fecha_fin:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización del contrato
 *                 num_consecutivo:
 *                   type: integer
 *                   description: Número consecutivo único del contrato
 *                 clasificacion:
 *                   type: string
 *                   description: Clasificación del contrato
 *                 nota:
 *                   type: string
 *                   description: Notas adicionales del contrato
 *                 entidad:
 *                   type: object
 *                   description: Información de la entidad asociada
 *                   properties:
 *                     id_entidad:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                 tipoContrato:
 *                   type: object
 *                   description: Información del tipo de contrato
 *                   properties:
 *                     id_tipo_contrato:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                 ofertas:
 *                   type: array
 *                   description: Lista de ofertas asociadas
 *                 trabajadoresAutorizados:
 *                   type: array
 *                   description: Lista de trabajadores autorizados
 *             example:
 *               id_contrato: 1
 *               id_entidad: 1
 *               id_tipo_contrato: 1
 *               fecha_inicio: "2024-01-01"
 *               fecha_fin: "2024-12-31"
 *               num_consecutivo: 1001
 *               clasificacion: "Servicios"
 *               nota: "Contrato de servicios profesionales actualizado"
 *               entidad:
 *                 id_entidad: 1
 *                 nombre: "Empresa ABC"
 *               tipoContrato:
 *                 id_tipo_contrato: 1
 *                 nombre: "Contrato Temporal"
 *               ofertas: []
 *               trabajadoresAutorizados: []
 *       400:
 *         description: Datos de entrada inválidos o entidad/tipo de contrato no encontrados
 *       404:
 *         description: Contrato no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/contrato/UpdateContrato/:id", authenticate("Administrador", "Comercial"), contratoController.updateContrato);

/**
 * @swagger
 * /contrato/deleteContrato/{id}:
 *   delete:
 *     summary: Elimina un contrato
 *     tags:
 *       - Contrato
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del contrato a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contrato eliminado exitosamente
 *       404:
 *         description: Contrato no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/contrato/deleteContrato/:id", authenticate("Administrador", "Comercial"), contratoController.deleteContrato);

/**
 * @swagger
 * /contrato/next-consecutivo/{year}:
 *   get:
 *     summary: Obtiene el siguiente número consecutivo disponible para un año (solo considera contratos de Cliente)
 *     tags:
 *       - Contrato
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *         required: true
 *         description: Año para determinar el número consecutivo (formato YYYY) - Solo considera contratos de tipo Cliente
 *     responses:
 *       200:
 *         description: Siguiente número consecutivo obtenido exitosamente (basado solo en contratos de Cliente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Siguiente número consecutivo obtenido exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     siguiente_consecutivo:
 *                       type: integer
 *                       example: 24
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener el siguiente número consecutivo
 *                 error:
 *                   type: string
 *                   example: El año debe ser un número válido entre 1900 y 2100
 */
router.get("/contrato/next-consecutivo/:year", authenticate(), contratoController.getNextConsecutivo);

/**
 * @swagger
 * /contrato/filter/{page}/{limit}:
 *   post:
 *     summary: Filtra contratos según criterios específicos con paginación
 *     tags:
 *       - Contrato
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
 *               nombre_entidad:
 *                 type: string
 *                 description: Nombre de la entidad (búsqueda case-insensitive)
 *               id_tipo_contrato:
 *                 type: integer
 *                 description: ID del tipo de contrato
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio mínima
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin máxima
 *               num_consecutivo:
 *                 type: integer
 *                 description: Número consecutivo
 *               ClienteOProveedor:
 *                 type: string
 *                 enum: [Cliente, Proveedor]
 *                 description: Tipo de contrato - Cliente o Proveedor
 *     responses:
 *       200:
 *         description: Contratos filtrados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contratos filtrados exitosamente
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
 *         description: Error al filtrar contratos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al filtrar contratos
 *                 error:
 *                   type: string
 */
router.post("/contrato/filter/:page/:limit", authenticate(),  contratoController.filterContratos);

module.exports = router; 