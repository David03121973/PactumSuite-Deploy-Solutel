const ContratoService = require("../services/contratoService.js");

/**
 * Controlador para la gestión de contratos
 * Implementa el patrón MVC y sigue los principios SOLID:
 * - Single Responsibility: Cada método tiene una única responsabilidad
 * - Open/Closed: Extensible para nuevas funcionalidades sin modificar el código existente
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de abstracciones (ContratoService) no de implementaciones concretas
 */
const ContratoController = {
  /**
   * Obtiene todos los contratos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getAllContratos: async (req, res) => {
    try {
      const contratos = await ContratoService.getAll();
      return res.status(200).json({
        message: "Contratos obtenidos exitosamente",
        data: contratos
      });
    } catch (error) {
      console.error("Error al obtener los contratos:", error);
      const status = error.status || 500;
      const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener los contratos'];
      return res.status(status).json({ errors: errs });
    }
  },

  /**
   * Obtiene un contrato por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getContratoById: async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        errors: ["El ID debe ser un número entero válido"]
      });
    }

    try {
      const contrato = await ContratoService.getById(Number(id));
      if (!contrato) {
        return res.status(404).json({
          errors: [`No se encontró el contrato con ID: ${id}`]
        });
      }
      return res.status(200).json({
        message: "Contrato encontrado exitosamente",
        data: contrato
      });
    } catch (error) {
      console.error("Error al obtener el contrato:", error);
      const status = error.status || 500;
      const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener el contrato'];
      return res.status(status).json({ errors: errs });
    }
  },

  /**
   * Crea un nuevo contrato
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.body - Datos del contrato
   * @param {number} req.body.id_entidad - ID de la entidad (requerido)
   * @param {number} req.body.id_tipo_contrato - ID del tipo de contrato (requerido)
   * @param {Date} req.body.fecha_inicio - Fecha de inicio del contrato (requerido)
   * @param {Date} req.body.fecha_fin - Fecha de fin del contrato (requerido)
   * @param {number} req.body.num_consecutivo - Número consecutivo (requerido)
   * @param {string} [req.body.clasificacion] - Clasificación del contrato (opcional)
   * @param {string} [req.body.nota] - Nota del contrato (opcional)
   * @param {string} [req.body.ClienteOProveedor] - Tipo de contrato: 'Cliente' o 'Proveedor' (opcional, por defecto 'Cliente')
   * @param {Object} res - Objeto de respuesta Express
   */
  createContrato: async (req, res) => {
    const {
      id_entidad,
      id_tipo_contrato,
      fecha_inicio,
      fecha_fin,
      num_consecutivo,
      clasificacion,
      nota,
      ClienteOProveedor,
      vigenciaFacturasDias
    } = req.body;

    // Validar campos requeridos
    const camposRequeridos = [
      'id_entidad',
      'id_tipo_contrato',
      'fecha_inicio',
      'fecha_fin',
      'num_consecutivo'
    ];

    const camposFaltantes = camposRequeridos.filter(campo => !req.body[campo]);
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        errors: [`Faltan campos requeridos: ${camposFaltantes.join(', ')}`]
      });
    }

    // Validar campo ClienteOProveedor
    if (ClienteOProveedor && !['Cliente', 'Proveedor'].includes(ClienteOProveedor)) {
      return res.status(400).json({
        errors: ["El campo ClienteOProveedor debe ser 'Cliente' o 'Proveedor'"]
      });
    }

    // Validar vigenciaFacturasDias si se proporciona
    if (vigenciaFacturasDias !== undefined) {
      if (isNaN(vigenciaFacturasDias) || vigenciaFacturasDias < 0) {
        return res.status(400).json({
          errors: ["El campo vigenciaFacturasDias debe ser un número entero no negativo"]
        });
      }
    }

    try {
      const newContrato = await ContratoService.create({
        id_entidad,
        id_tipo_contrato,
        fecha_inicio,
        fecha_fin,
        num_consecutivo,
        clasificacion,
        nota,
        ClienteOProveedor,
        vigenciaFacturasDias
      });

      return res.status(201).json({
        message: "Contrato creado exitosamente",
        data: newContrato
      });
    } catch (error) {
        console.error("Error al crear el contrato:", error);
        const status = error.status || 400;
        const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al crear el contrato'];
        return res.status(status).json({ errors: errs });
    }
  },

  /**
   * Actualiza un contrato existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {number} req.params.id - ID del contrato a actualizar
   * @param {Object} req.body - Datos del contrato a actualizar
   * @param {number} [req.body.id_entidad] - ID de la entidad
   * @param {number} [req.body.id_tipo_contrato] - ID del tipo de contrato
   * @param {Date} [req.body.fecha_inicio] - Fecha de inicio del contrato
   * @param {Date} [req.body.fecha_fin] - Fecha de fin del contrato
   * @param {number} [req.body.num_consecutivo] - Número consecutivo
   * @param {string} [req.body.clasificacion] - Clasificación del contrato
   * @param {string} [req.body.nota] - Nota del contrato
   * @param {string} [req.body.ClienteOProveedor] - Tipo de contrato: 'Cliente' o 'Proveedor'
   * @param {Object} res - Objeto de respuesta Express
   */
  updateContrato: async (req, res) => {
    const { id } = req.params;
    const {
      id_entidad,
      id_tipo_contrato,
      fecha_inicio,
      fecha_fin,
      num_consecutivo,
      clasificacion,
      nota,
      ClienteOProveedor,
      vigenciaFacturasDias
    } = req.body;

    // Validar que el ID sea un número
    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        errors: ["El ID debe ser un número entero válido"]
      });
    }

    // Validar campo ClienteOProveedor
    if (ClienteOProveedor && !['Cliente', 'Proveedor'].includes(ClienteOProveedor)) {
      return res.status(400).json({
        errors: ["El campo ClienteOProveedor debe ser 'Cliente' o 'Proveedor'"]
      });
    }

    // Validar vigenciaFacturasDias si se proporciona
    if (vigenciaFacturasDias !== undefined) {
      if (isNaN(vigenciaFacturasDias) || vigenciaFacturasDias < 0) {
        return res.status(400).json({
          errors: ["El campo vigenciaFacturasDias debe ser un número entero no negativo"]
        });
      }
    }

    try {
      const updatedContrato = await ContratoService.update(Number(id), {
        id_entidad,
        id_tipo_contrato,
        fecha_inicio,
        fecha_fin,
        num_consecutivo,
        clasificacion,
        nota,
        ClienteOProveedor,
        vigenciaFacturasDias
      });

      if (!updatedContrato) {
        return res.status(404).json({
          errors: [`No se encontró el contrato con ID: ${id}`]
        });
      }

      return res.status(200).json({
        message: "Contrato actualizado exitosamente",
        data: updatedContrato
      });
    } catch (error) {
      console.error("Error al actualizar el contrato:", error);
      const status = error.status || 400;
      const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al actualizar el contrato'];
      return res.status(status).json({ errors: errs });
    }
  },

  /**
   * Elimina un contrato
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  deleteContrato: async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        errors: ["El ID debe ser un número entero válido"]
      });
    }

    try {
      const contrato = await ContratoService.getById(Number(id));
      if (!contrato) {
        return res.status(404).json({
          errors: [`No se encontró el contrato con ID: ${id}`]
        });
      }

      // Validar si tiene ofertas asociadas
      if (contrato.oferta && contrato.oferta.length > 0) {
        return res.status(400).json({
          errors: [`No se puede eliminar el contrato porque está relacionado con ofertas`]
        });
      }
      // Validar si tiene trabajadores autorizados asociados
      if (contrato.trabajadoresAutorizados && contrato.trabajadoresAutorizados.length > 0) {
        return res.status(400).json({
          errors: [`No se puede eliminar el contrato porque está relacionado con trabajadores autorizados`]
        });
      }
      // Validar si tiene facturas asociadas
      if (contrato.facturas && contrato.facturas.length > 0) {
        return res.status(400).json({
          errors: [`No se puede eliminar el contrato porque está relacionado con facturas`]
        });
      }

      const deleted = await ContratoService.delete(Number(id));
      if (!deleted) {
        return res.status(404).json({
          errors: [`No se encontró el contrato con ID: ${id}`]
        });
      }

      return res.status(200).json({
        message: "Contrato eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error al eliminar el contrato:", error);
      const status = error.status || 500;
      const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al eliminar el contrato'];
      return res.status(status).json({ errors: errs });
    }
  },

  /**
   * Obtiene el siguiente número consecutivo disponible para un año específico
   * IMPORTANTE: Solo considera contratos de tipo "Cliente" ya que los de "Proveedor" pueden tener números duplicados
   * @param {Object} req - Objeto de solicitud Express
   * @param {string} req.params.year - Año para determinar el número consecutivo
   * @param {Object} res - Objeto de respuesta Express
   */
  getNextConsecutivo: async (req, res) => {
    const { year } = req.params;

    if (!year) {
      return res.status(400).json({
        errors: ["El año es requerido"]
      });
    }

    // Validar que el año sea un número
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return res.status(400).json({
        errors: ["El año debe ser un número"]
      });
    }

    try {
      const nextConsecutivo = await ContratoService.getNextConsecutivo(yearNum);
      return res.status(200).json({
        message: "Siguiente número consecutivo obtenido exitosamente",
        data: {
          year: yearNum,
          siguiente_consecutivo: nextConsecutivo
        }
      });
    } catch (error) {
      console.error("Error al obtener el siguiente número consecutivo:", error);
      const status = error.status || 400;
      const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener el siguiente número consecutivo'];
      return res.status(status).json({ errors: errs });
    }
  },

  /**
   * Filtra contratos según los criterios proporcionados
   * @param {Object} req - Objeto de solicitud Express
   * @param {number} req.params.page - Número de página
   * @param {number} req.params.limit - Límite de registros por página
   * @param {Object} req.body - Criterios de filtrado
   * @param {string} [req.body.nombre_entidad] - Nombre de la entidad (búsqueda case-insensitive)
   * @param {number} [req.body.id_tipo_contrato] - ID del tipo de contrato
   * @param {Date} [req.body.fecha_inicio] - Fecha de inicio mínima
   * @param {Date} [req.body.fecha_fin] - Fecha de fin máxima
   * @param {number} [req.body.num_consecutivo] - Número consecutivo
   * @param {string} [req.body.ClienteOProveedor] - Tipo de contrato: 'Cliente' o 'Proveedor'
   * @param {Object} res - Objeto de respuesta Express
   */
  filterContratos: async (req, res) => {
    try {
      const filters = req.body;
      const page = parseInt(req.params.page) || 1;
      const limit = parseInt(req.params.limit) || 10;

      // Validar filtro ClienteOProveedor si está presente
      if (filters.ClienteOProveedor && !['Cliente', 'Proveedor'].includes(filters.ClienteOProveedor)) {
        return res.status(400).json({
          errors: ["El filtro ClienteOProveedor debe ser 'Cliente' o 'Proveedor'"]
        });
      }

      const result = await ContratoService.filterContratos(filters, page, limit);
      
      res.status(200).json({
        message: "Contratos filtrados exitosamente",
        data: result.contratos,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error en el controlador al filtrar contratos:', error);
      const status = error.status || 500;
      const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al filtrar contratos'];
      res.status(status).json({ errors: errs });
    }
  },

  /**
   * Obtiene contratos que están próximos a vencer (1 mes o menos antes de la fecha fin)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getContratosProximosAVencer: async (req, res) => {
    try {
      const contratos = await ContratoService.getContratosProximosAVencer();
      
      return res.status(200).json({
        message: "Contratos próximos a vencer obtenidos exitosamente",
        data: contratos,
        count: contratos.length
      });
    } catch (error) {
      console.error("Error al obtener contratos próximos a vencer:", error);
      const status = error.status || 500;
      const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener contratos próximos a vencer'];
      return res.status(status).json({ errors: errs });
    }
  },
};

module.exports = ContratoController; 