const Oferta = require("../models/oferta.js");
const OfertaDescripcion = require("../models/oferta_descripcion.js");
const Contrato = require("../models/contrato.js");
const Usuario = require("../models/usuario.js");
const { Op } = require('sequelize');
const sequelize = require("../helpers/database.js");

/**
 * Servicio para la gestión de ofertas
 * Implementa el patrón Repository para el acceso a datos
 * Sigue los principios SOLID:
 * - Single Responsibility: Cada método tiene una única responsabilidad
 * - Open/Closed: Extensible para nuevas funcionalidades sin modificar el código existente
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de abstracciones (modelos) no de implementaciones concretas
 */
const OfertaService = {
  /**
   * Valida los datos de una oferta antes de crearla o actualizarla
   * @param {Object} data - Datos de la oferta a validar
   * @param {number} [excludeId] - ID de la oferta a excluir en validaciones (para actualizaciones)
   * @returns {Promise<Array>} Lista de errores encontrados
   */
  validateOferta: async (data) => {
    const errors = [];

    // Validar fecha_inicio
    if (!data.fecha_inicio) {
      errors.push('La fecha de inicio es requerida');
    } else {
      const fechaInicio = new Date(data.fecha_inicio);
      if (isNaN(fechaInicio.getTime())) {
        errors.push('La fecha de inicio debe ser una fecha válida');
      }
    }

    // Validar fecha_fin
    if (!data.fecha_fin) {
      errors.push('La fecha de fin es requerida');
    } else {
      const fechaFin = new Date(data.fecha_fin);
      if (isNaN(fechaFin.getTime())) {
        errors.push('La fecha de fin debe ser una fecha válida');
      }
    }

    // Validar que fecha_inicio sea menor o igual que fecha_fin
    if (data.fecha_inicio && data.fecha_fin) {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);
      if (fechaInicio > fechaFin) {
        errors.push('La fecha de inicio debe ser menor o igual que la fecha de fin');
      }
    }

    // Validar id_contrato
    if (!data.id_contrato) {
      errors.push('El ID del contrato es requerido');
    } else {
      const idContrato = parseInt(data.id_contrato);
      if (isNaN(idContrato) || !Number.isInteger(idContrato) || idContrato <= 0) {
        errors.push('El ID del contrato debe ser un número entero positivo');
      } else {
        const contrato = await Contrato.findByPk(idContrato);
        if (!contrato) {
          errors.push('El contrato especificado no existe');
        } else {
          // Validar que el contrato no esté vencido
          const fechaActual = new Date();
          const fechaFinContrato = new Date(contrato.fecha_fin);
          
          if (fechaActual > fechaFinContrato) {
            errors.push('No se puede crear/actualizar una oferta para un contrato vencido');
          }
        }
      }
    }

    // Validar id_usuario
    if (!data.id_usuario) {
      errors.push('El ID del usuario es requerido');
    } else {
      const idUsuario = parseInt(data.id_usuario);
      if (isNaN(idUsuario) || !Number.isInteger(idUsuario) || idUsuario <= 0) {
        errors.push('El ID del usuario debe ser un número entero positivo');
      } else {
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
          errors.push('El usuario especificado no existe');
        }
      }
    }



    // Validar estado si está presente
    if (data.estado !== undefined && data.estado !== null) {
      const estadosValidos = ['vigente', 'facturada', 'vencida'];
      if (!estadosValidos.includes(data.estado)) {
        errors.push('El estado debe ser uno de: vigente, facturada, vencida');
      }
    }

    return errors;
  },

  /**
   * Valida que un ID sea un número entero válido
   * @param {string|number} id - ID a validar
   * @returns {boolean} true si el ID es válido
   */
  validateId: (id) => {
    const idNum = parseInt(id);
    return !isNaN(idNum) && Number.isInteger(idNum) && idNum > 0;
  },

  /**
   * Obtiene todas las ofertas con información relacionada
   * @returns {Promise<Array>} Lista de ofertas
   */
  getAllOfertas: async () => {
    try {
      return await Oferta.findAll({
        include: [
          {
            model: Contrato,
            as: 'contrato',
            include: [
              {
                model: require('../models/entidad'),
                as: 'entidad'
              },
              {
                model: require('../models/tipo_contrato'),
                as: 'tipoContrato'
              }
            ]
          },
          {
            model: Usuario,
            as: 'usuario'
          },
          {
            model: require('../models/oferta_descripcion'),
            as: 'descripciones'
          }
        ],
        order: [['fecha_inicio', 'DESC']]
      });
    } catch (error) {
      console.error('Error al obtener ofertas:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al obtener ofertas');
        err.errors = [error.message || 'Error interno al obtener ofertas'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Obtiene una oferta por su ID con información relacionada
   * @param {number} id - ID de la oferta
   * @returns {Promise<Object>} Oferta encontrada
   * @throws {Error} Si la oferta no existe o el ID es inválido
   */
  getOfertaById: async (id) => {
    try {
      if (!OfertaService.validateId(id)) {
        throw new Error('ID de oferta inválido');
      }

      const oferta = await Oferta.findByPk(id, {
        include: [
          {
            model: Contrato,
            as: 'contrato',
            include: [
              {
                model: require('../models/entidad'),
                as: 'entidad'
              },
              {
                model: require('../models/tipo_contrato'),
                as: 'tipoContrato'
              }
            ]
          },
          {
            model: Usuario,
            as: 'usuario'
          },
          {
            model: require('../models/oferta_descripcion'),
            as: 'descripciones'
          }
        ]
      });

      if (!oferta) {
        throw new Error('Oferta no encontrada');
      }

      return oferta;
    } catch (error) {
      console.error('Error al obtener oferta:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al obtener oferta');
        err.errors = [error.message || 'Error interno al obtener oferta'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Crea una nueva oferta con sus descripciones
   * @param {Object} ofertaData - Datos de la oferta a crear
   * @param {Array<string>} descripciones - Lista de descripciones para la oferta
   * @returns {Promise<Object>} Oferta creada con sus descripciones
   * @throws {Error} Si hay errores de validación
   */
  createOferta: async (ofertaData, descripciones = []) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Validar datos de la oferta
      const errors = await OfertaService.validateOferta(ofertaData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Validar descripciones
      if (descripciones && !Array.isArray(descripciones)) {
        throw new Error('Las descripciones deben ser un array');
      }

      if (descripciones && descripciones.length > 0) {
        for (let i = 0; i < descripciones.length; i++) {
          const descripcion = descripciones[i];
          if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length === 0) {
            throw new Error(`La descripción ${i + 1} debe ser un texto no vacío`);
          }
        }
      }

      // Crear oferta dentro de la transacción
      const oferta = await Oferta.create(ofertaData, { transaction });

      // Crear descripciones si se proporcionan
      if (descripciones && descripciones.length > 0) {
        const descripcionesData = descripciones.map(descripcion => ({
          descripcion: descripcion.trim(),
          id_oferta: oferta.id_oferta
        }));

        await OfertaDescripcion.bulkCreate(descripcionesData, { transaction });
      }

      // Commit de la transacción
      await transaction.commit();

      // Retornar la oferta creada con sus descripciones
      return await OfertaService.getOfertaById(oferta.id_oferta);
    } catch (error) {
      // Rollback en caso de error
      await transaction.rollback();
      console.error('Error al crear oferta con transacción:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al crear oferta');
        err.errors = [error.message || 'Error interno al crear oferta'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Actualiza una oferta existente con sus descripciones
   * @param {number} id - ID de la oferta a actualizar
   * @param {Object} ofertaData - Datos actualizados de la oferta
   * @param {Array<string>} descripciones - Lista de descripciones para la oferta (opcional)
   * @returns {Promise<Object>} Oferta actualizada con sus descripciones
   * @throws {Error} Si la oferta no existe, el ID es inválido o hay errores de validación
   */
  updateOferta: async (id, ofertaData, descripciones = null) => {
    const transaction = await sequelize.transaction();
    
    try {
      if (!OfertaService.validateId(id)) {
        throw new Error('ID de oferta inválido');
      }

      // Verificar si la oferta existe
      const ofertaExistente = await OfertaService.getOfertaById(id);

      // Validar datos de la oferta
      const errors = await OfertaService.validateOferta(ofertaData, id);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Validar descripciones si se proporcionan
      if (descripciones !== null) {
        if (!Array.isArray(descripciones)) {
          throw new Error('Las descripciones deben ser un array');
        }

        if (descripciones.length > 0) {
          for (let i = 0; i < descripciones.length; i++) {
            const descripcion = descripciones[i];
            if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length === 0) {
              throw new Error(`La descripción ${i + 1} debe ser un texto no vacío`);
            }
          }
        }
      }

      // Actualizar oferta dentro de la transacción
      await ofertaExistente.update(ofertaData, { transaction });

      // Manejar descripciones si se proporcionan
      if (descripciones !== null) {
        // Eliminar todas las descripciones existentes
        await OfertaDescripcion.destroy({
          where: { id_oferta: id },
          transaction
        });

        // Crear nuevas descripciones si se proporcionan
        if (descripciones.length > 0) {
          const descripcionesData = descripciones.map(descripcion => ({
            descripcion: descripcion.trim(),
            id_oferta: id
          }));

          await OfertaDescripcion.bulkCreate(descripcionesData, { transaction });
        }
      }

      // Commit de la transacción
      await transaction.commit();

      // Retornar la oferta actualizada con sus descripciones
      return await OfertaService.getOfertaById(id);
    } catch (error) {
        // Rollback en caso de error
        await transaction.rollback();
        console.error('Error al actualizar oferta con transacción:', error);
        if (!error.errors || !Array.isArray(error.errors)) {
          const err = new Error(error.message || 'Error interno al actualizar oferta');
          err.errors = [error.message || 'Error interno al actualizar oferta'];
          err.status = error.status || 500;
          throw err;
        }
        throw error;
      }
  },

  /**
   * Elimina una oferta y todas sus descripciones
   * @param {number} id - ID de la oferta a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente
   * @throws {Error} Si la oferta no existe o el ID es inválido
   */
  deleteOferta: async (id) => {
    const transaction = await sequelize.transaction();
    
    try {
      if (!OfertaService.validateId(id)) {
        throw new Error('ID de oferta inválido');
      }

      // Verificar si la oferta existe
      const oferta = await OfertaService.getOfertaById(id);

      // Eliminar todas las descripciones de la oferta
      await OfertaDescripcion.destroy({
        where: { id_oferta: id },
        transaction
      });

      // Eliminar la oferta
      await oferta.destroy({ transaction });

      // Commit de la transacción
      await transaction.commit();
      return true;
    } catch (error) {
      // Rollback en caso de error
      await transaction.rollback();
      console.error('Error al eliminar oferta con transacción:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al eliminar oferta');
        err.errors = [error.message || 'Error interno al eliminar oferta'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Filtra ofertas según criterios específicos
   * @param {Object} filters - Criterios de filtrado
   * @param {string} [filters.fecha_inicio] - Fecha de inicio para filtrar
   * @param {string} [filters.fecha_fin] - Fecha de fin para filtrar
   * @param {number} [filters.id_contrato] - ID del contrato
   * @param {number} [filters.id_usuario] - ID del usuario
   * @returns {Promise<Array>} Lista de ofertas filtradas
   */
  filterOfertas: async (filters = {}) => {
    try {
      const whereClause = {};

      // Filtrar por fecha_inicio
      if (filters.fecha_inicio) {
        const fechaInicio = new Date(filters.fecha_inicio);
        if (!isNaN(fechaInicio.getTime())) {
          whereClause.fecha_inicio = {
            [Op.gte]: fechaInicio
          };
        }
      }

      // Filtrar por fecha_fin
      if (filters.fecha_fin) {
        const fechaFin = new Date(filters.fecha_fin);
        if (!isNaN(fechaFin.getTime())) {
          whereClause.fecha_fin = {
            [Op.lte]: fechaFin
          };
        }
      }

      // Filtrar por id_contrato
      if (filters.id_contrato) {
        const idContrato = parseInt(filters.id_contrato);
        if (!isNaN(idContrato) && Number.isInteger(idContrato) && idContrato > 0) {
          whereClause.id_contrato = idContrato;
        }
      }

      // Filtrar por id_usuario
      if (filters.id_usuario) {
        const idUsuario = parseInt(filters.id_usuario);
        if (!isNaN(idUsuario) && Number.isInteger(idUsuario) && idUsuario > 0) {
          whereClause.id_usuario = idUsuario;
        }
      }



      return await Oferta.findAll({
        where: whereClause,
        include: [
          {
            model: Contrato,
            as: 'contrato',
            include: [
              {
                model: require('../models/entidad'),
                as: 'entidad'
              },
              {
                model: require('../models/tipo_contrato'),
                as: 'tipoContrato'
              }
            ]
          },
          {
            model: Usuario,
            as: 'usuario'
          },
          {
            model: require('../models/oferta_descripcion'),
            as: 'descripciones'
          }
        ],
        order: [['fecha_inicio', 'DESC']]
      });
    } catch (error) {
      console.error('Error al filtrar ofertas:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al filtrar ofertas');
        err.errors = [error.message || 'Error interno al filtrar ofertas'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  }
};

module.exports = OfertaService; 