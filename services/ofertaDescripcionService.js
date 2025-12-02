const OfertaDescripcion = require("../models/oferta_descripcion.js");
const Oferta = require("../models/oferta.js");
const { Op } = require("sequelize");

/**
 * Servicio para la gestión de descripciones de ofertas
 * Implementa el patrón Repository para el acceso a datos
 * Sigue los principios SOLID:
 * - Single Responsibility: Cada método tiene una única responsabilidad
 * - Open/Closed: Extensible para nuevas funcionalidades sin modificar el código existente
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de abstracciones (modelos) no de implementaciones concretas
 */
const OfertaDescripcionService = {
  /**
   * Valida los datos de una descripción de oferta antes de crearla o actualizarla
   * @param {Object} data - Datos de la descripción a validar
   * @returns {Promise<Array>} Lista de errores encontrados
   */
  validateOfertaDescripcion: async (data) => {
    const errors = [];

    // Validar descripcion
    if (!data.descripcion) {
      errors.push('La descripción es requerida');
    } else if (typeof data.descripcion !== 'string' || data.descripcion.trim().length === 0) {
      errors.push('La descripción debe ser un texto no vacío');
    }

    // Validar id_oferta
    if (!data.id_oferta) {
      errors.push('El ID de la oferta es requerido');
    } else {
      const idOferta = parseInt(data.id_oferta);
      if (isNaN(idOferta) || !Number.isInteger(idOferta) || idOferta <= 0) {
        errors.push('El ID de la oferta debe ser un número entero positivo');
      } else {
        const oferta = await Oferta.findByPk(idOferta);
        if (!oferta) {
          errors.push('La oferta especificada no existe');
        }
      }
    }

    return errors;
  },

  /**
   * Obtiene todas las descripciones de ofertas
   * @returns {Promise<Array>} Lista de descripciones de ofertas
   */
  getAllOfertaDescripciones: async () => {
    return await OfertaDescripcion.findAll({
      include: [
        {
          model: Oferta,
          as: 'oferta',
          attributes: ['id_oferta', 'fecha_inicio', 'fecha_fin', 'estado']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  },

  /**
   * Obtiene una descripción de oferta por su ID
   * @param {number} id - ID de la descripción a buscar
   * @returns {Promise<Object|null>} Descripción encontrada o null
   */
  getOfertaDescripcionById: async (id) => {
    const ofertaDescripcion = await OfertaDescripcion.findByPk(id, {
      include: [
        {
          model: Oferta,
          as: 'oferta',
          attributes: ['id_oferta', 'fecha_inicio', 'fecha_fin', 'estado']
        }
      ]
    });

    if (!ofertaDescripcion) {
      throw new Error('Descripción de oferta no encontrada');
    }

    return ofertaDescripcion;
  },

  /**
   * Obtiene todas las descripciones de una oferta específica
   * @param {number} idOferta - ID de la oferta
   * @returns {Promise<Array>} Lista de descripciones de la oferta
   */
  getDescripcionesByOfertaId: async (idOferta) => {
    return await OfertaDescripcion.findAll({
      where: {
        id_oferta: idOferta
      },
      include: [
        {
          model: Oferta,
          as: 'oferta',
          attributes: ['id_oferta', 'fecha_inicio', 'fecha_fin', 'estado']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  },

  /**
   * Crea una nueva descripción de oferta
   * @param {Object} data - Datos de la descripción a crear
   * @returns {Promise<Object>} Descripción creada
   */
  createOfertaDescripcion: async (data) => {
    // Validar datos
    const errors = await OfertaDescripcionService.validateOfertaDescripcion(data);
    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }

    // Crear la descripción
    const ofertaDescripcion = await OfertaDescripcion.create({
      descripcion: data.descripcion.trim(),
      id_oferta: parseInt(data.id_oferta)
    });

    // Retornar la descripción creada con sus relaciones
    return await OfertaDescripcionService.getOfertaDescripcionById(ofertaDescripcion.id_oferta_descripcion);
  },

  /**
   * Actualiza una descripción de oferta existente
   * @param {number} id - ID de la descripción a actualizar
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Descripción actualizada
   */
  updateOfertaDescripcion: async (id, data) => {
    // Verificar que la descripción existe
    const existingDescripcion = await OfertaDescripcion.findByPk(id);
    if (!existingDescripcion) {
      throw new Error('Descripción de oferta no encontrada');
    }

    // Validar datos
    const errors = await OfertaDescripcionService.validateOfertaDescripcion(data);
    if (errors.length > 0) {
      throw new Error(`Errores de validación: ${errors.join(', ')}`);
    }

    // Actualizar la descripción
    await OfertaDescripcion.update({
      descripcion: data.descripcion.trim(),
      id_oferta: parseInt(data.id_oferta)
    }, {
      where: { id_oferta_descripcion: id }
    });

    // Retornar la descripción actualizada
    return await OfertaDescripcionService.getOfertaDescripcionById(id);
  },

  /**
   * Elimina una descripción de oferta
   * @param {number} id - ID de la descripción a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  deleteOfertaDescripcion: async (id) => {
    const ofertaDescripcion = await OfertaDescripcion.findByPk(id);
    if (!ofertaDescripcion) {
      throw new Error('Descripción de oferta no encontrada');
    }

    await OfertaDescripcion.destroy({
      where: { id_oferta_descripcion: id }
    });

    return true;
  },

  /**
   * Filtra descripciones de ofertas según criterios específicos
   * @param {Object} filters - Criterios de filtrado
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros por página
   * @returns {Promise<Object>} Objeto con las descripciones filtradas y metadatos de paginación
   */
  filterOfertaDescripciones: async (filters, page = 1, limit = 10) => {
    try {
      const whereClause = {};
      const includeClause = [
        {
          model: Oferta,
          as: 'oferta',
          attributes: ['id_oferta', 'fecha_inicio', 'fecha_fin', 'estado']
        }
      ];

      // Filtrar por descripción (case-insensitive)
      if (filters.descripcion) {
        whereClause.descripcion = {
          [Op.iLike]: `%${filters.descripcion.toLowerCase()}%`
        };
      }

      // Filtrar por ID de oferta
      if (filters.id_oferta) {
        whereClause.id_oferta = filters.id_oferta;
      }

      // Calcular offset para la paginación
      const offset = (page - 1) * limit;

      // Contar el total de registros
      const totalCount = await OfertaDescripcion.count({
        where: whereClause,
        include: includeClause,
        distinct: true
      });

      // Obtener las descripciones con paginación
      const descripciones = await OfertaDescripcion.findAll({
        where: whereClause,
        include: includeClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        descripciones,
        pagination: {
          total: totalCount,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      };
    } catch (error) {
      console.error('Error al filtrar descripciones de ofertas:', error);
      throw new Error(`Error al filtrar descripciones de ofertas: ${error.message}`);
    }
  },
};

module.exports = OfertaDescripcionService; 