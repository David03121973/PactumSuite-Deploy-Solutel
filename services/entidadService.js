const Entidad = require("../models/entidad.js");
const Contrato = require("../models/contrato.js");
const TipoContrato = require("../models/tipo_contrato.js");
const Oferta = require("../models/oferta.js");
const TrabajadorAutorizado = require("../models/trabajador_autorizado.js");
const { ValidationError } = require('sequelize');
const { Op } = require('sequelize');

/**
 * Servicio para la gestión de entidades
 * Implementa el patrón Repository para el acceso a datos
 * Sigue el principio de Responsabilidad Única (SRP) al encapsular toda la lógica de negocio relacionada con entidades
 */
const EntidadService = {
  /**
   * Obtiene todas las entidades del sistema
   * @returns {Promise<Array>} Lista de entidades
   */
  getAll: async () => {
    try {
      return await Entidad.findAll({
        include: [{
          model: Contrato,
          as: 'contratos',
          include: [
            {
              model: TipoContrato,
              as: 'tipoContrato'
            },
            {
              model: Oferta,
              as: 'oferta'
            },
            {
              model: TrabajadorAutorizado,
              as: 'trabajadoresAutorizados'
            }
          ]
        }]
      });
    } catch (error) {
      console.error("Error en el servicio getAll de entidades:", error);
      const err = new Error('Error al obtener entidades');
      err.errors = [error.message || 'Error interno'];
      err.status = 500;
      throw err;
    }
  },

  /**
   * Obtiene una entidad específica por su ID
   * @param {number} id - ID de la entidad a buscar
   * @returns {Promise<Object|null>} Entidad encontrada o null
   */
  getById: async (id) => {
    try {
      return await Entidad.findByPk(id, {
        include: [{
          model: Contrato,
          as: 'contratos',
          include: [
            {
              model: TipoContrato,
              as: 'tipoContrato'
            },
            {
              model: Oferta,
              as: 'oferta'
            },
            {
              model: TrabajadorAutorizado,
              as: 'trabajadoresAutorizados'
            }
          ]
        }]
      });
    } catch (error) {
      console.error("Error en el servicio getById de entidades:", error);
      const err = new Error('Error al obtener entidad');
      err.errors = [error.message || 'Error interno'];
      err.status = 500;
      throw err;
    }
  },

  /**
   * Valida los datos de una entidad antes de crearla o actualizarla
   * @param {Object} data - Datos de la entidad a validar
   * @returns {Array} Lista de errores encontrados
   */
  validateEntidad: (data) => {
    const errors = [];

    // Validar nombre (requerido)
    if (!data.nombre || data.nombre.trim() === '') {
      errors.push('El nombre de la entidad es requerido');
    }

    // Validar cuenta bancaria si está presente
    if (data.cuenta_bancaria) {
      const accountRegex = /^[0-9-]{10,20}$/;
      if (!accountRegex.test(data.cuenta_bancaria)) {
        errors.push('El formato de la cuenta bancaria no es válido');
      }
    }

    // Nota: Los campos 'consecutivo' y 'organismo' son opcionales y no requieren validación especial.

    return errors;
  },

  /**
   * Crea una nueva entidad
   * @param {Object} data - Datos de la entidad a crear
   * @returns {Promise<Object>} Entidad creada
   * @throws {Error} Si hay errores de validación
   */
  create: async (data) => {
    try {
      // Validar datos
      const validationErrors = EntidadService.validateEntidad(data);
      if (validationErrors.length > 0) {
        // Throw a structured error so controllers can return only the array
        const err = new Error('Validation failed');
        err.errors = validationErrors;
        err.status = 400;
        throw err;
      }

      // Verificar si ya existe una entidad con el mismo nombre
      const existingEntidad = await Entidad.findOne({ where: { nombre: data.nombre } });
      if (existingEntidad) {
        const err = new Error('Entidad duplicada');
        err.errors = ['Ya existe una entidad con ese nombre'];
        err.status = 400;
        throw err;
      }

      // Verificar si ya existe una entidad con el mismo consecutivo
      if (data.consecutivo) {
        const existingConsecutivo = await Entidad.findOne({ where: { consecutivo: data.consecutivo } });
        if (existingConsecutivo) {
          const err = new Error('Entidad duplicada');
          err.errors = ['Ya existe una entidad con ese consecutivo'];
          err.status = 400;
          throw err;
        }
      }

      return await Entidad.create(data);
    } catch (error) {
      console.error("Error en el servicio create de entidades:", error);
      if (error instanceof ValidationError) {
        const messages = error.errors.map(e => e.message);
        const err = new Error('Sequelize validation error');
        err.errors = messages;
        err.status = 400;
        throw err;
      }
      // If the error already has an errors array, rethrow as is
      if (error && Array.isArray(error.errors)) {
        throw error;
      }
      // For unexpected errors, wrap into an array to keep API shape
      const err = new Error('Internal error');
      err.errors = [error.message || 'Error interno'];
      err.status = 500;
      throw err;
    }
  },

  /**
   * Actualiza una entidad existente
   * @param {number} id - ID de la entidad a actualizar
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object|null>} Entidad actualizada o null si no existe
   * @throws {Error} Si hay errores de validación
   */
  update: async (id, data) => {
    try {
      // Validar datos
      const validationErrors = EntidadService.validateEntidad(data);
      if (validationErrors.length > 0) {
        const err = new Error('Validation failed');
        err.errors = validationErrors;
        err.status = 400;
        throw err;
      }

      const entidad = await Entidad.findByPk(id);
      if (!entidad) {
        return null;
      }

      // Verificar si el nuevo nombre ya existe en otra entidad
      if (data.nombre && data.nombre !== entidad.nombre) {
        const existingEntidad = await Entidad.findOne({ where: { nombre: data.nombre } });
        if (existingEntidad) {
          const err = new Error('Entidad duplicada');
          err.errors = ['Ya existe una entidad con ese nombre'];
          err.status = 400;
          throw err;
        }
      }

      // Verificar si el nuevo consecutivo ya existe en otra entidad
      if (data.consecutivo && data.consecutivo !== entidad.consecutivo) {
        const existingConsecutivo = await Entidad.findOne({ where: { consecutivo: data.consecutivo } });
        if (existingConsecutivo) {
          const err = new Error('Entidad duplicada');
          err.errors = ['Ya existe una entidad con ese consecutivo'];
          err.status = 400;
          throw err;
        }
      }

      return await entidad.update(data);
    } catch (error) {
      console.error("Error en el servicio update de entidades:", error);
      if (error instanceof ValidationError) {
        const messages = error.errors.map(e => e.message);
        const err = new Error('Sequelize validation error');
        err.errors = messages;
        err.status = 400;
        throw err;
      }
      if (error && Array.isArray(error.errors)) {
        throw error;
      }
      const err = new Error('Internal error');
      err.errors = [error.message || 'Error interno'];
      err.status = 500;
      throw err;
    }
  },

  /**
   * Elimina una entidad
   * @param {number} id - ID de la entidad a eliminar
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  delete: async (id) => {
    try {
      const entidad = await Entidad.findByPk(id);
      if (entidad) {
        await entidad.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en el servicio delete de entidades:", error);
      const err = new Error('Error al eliminar entidad');
      err.errors = [error.message || 'Error interno'];
      err.status = 500;
      throw err;
    }
  },



  /**
   * Filtra entidades por múltiples criterios con paginación
   * @param {Object} filters - Objeto con los criterios de filtrado
   * @param {number} page - Número de página (comienza en 1)
   * @param {number} limit - Número de elementos por página
   * @returns {Object} Objeto con las entidades filtradas y datos de paginación
   */
  filterEntidades: async (filters, page = 1, limit = 10) => {
    try {
      const offset = (page - 1) * limit;
      
      // Construir el whereClause para los filtros
      const whereClause = {};
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          whereClause[key] = {
            [Op.iLike]: `%${value}%`
          };
        }
      }

      // Obtener el total de registros que coinciden con los filtros
      const total = await Entidad.count({ where: whereClause });

      // Obtener las entidades con paginación
      const entidades = await Entidad.findAll({
        where: whereClause,
        include: [{
          model: Contrato,
          as: 'contratos',
          include: [
            {
              model: TipoContrato,
              as: 'tipoContrato'
            },
            {
              model: Oferta,
              as: 'oferta'
            },
            {
              model: TrabajadorAutorizado,
              as: 'trabajadoresAutorizados'
            }
          ]
        }],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        entidades,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error("Error en filterEntidades:", error);
      const err = new Error('Error al filtrar entidades');
      err.errors = [error.message || 'Error interno'];
      err.status = 500;
      throw err;
    }
  }
};

module.exports = EntidadService; 