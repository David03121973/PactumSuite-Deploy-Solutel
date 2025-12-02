const OfertaDescripcionService = require("../services/ofertaDescripcionService.js");

/**
 * Controlador para la gestión de descripciones de ofertas
 * Implementa el patrón MVC
 * Sigue los principios SOLID:
 * - Single Responsibility: Cada método tiene una única responsabilidad
 * - Open/Closed: Extensible para nuevas funcionalidades sin modificar el código existente
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de abstracciones (servicios) no de implementaciones concretas
 */
const OfertaDescripcionController = {
  /**
   * Obtiene todas las descripciones de ofertas
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getAllOfertaDescripciones: async (req, res) => {
    try {
      const descripciones = await OfertaDescripcionService.getAllOfertaDescripciones();
      res.status(200).json({
        message: "Descripciones de ofertas obtenidas exitosamente",
        data: descripciones
      });
    } catch (error) {
      console.error('Error en el controlador al obtener descripciones de ofertas:', error);
      res.status(500).json({
        message: "Error al obtener descripciones de ofertas",
        error: error.message
      });
    }
  },

  /**
   * Obtiene una descripción de oferta por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getOfertaDescripcionById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número
      if (isNaN(id) || !Number.isInteger(Number(id))) {
        return res.status(400).json({
          message: "El ID debe ser un número entero válido",
          error: "ID inválido"
        });
      }

      const descripcion = await OfertaDescripcionService.getOfertaDescripcionById(Number(id));
      
      res.status(200).json({
        message: "Descripción de oferta encontrada exitosamente",
        data: descripcion
      });
    } catch (error) {
      console.error('Error en el controlador al obtener descripción de oferta:', error);
      if (error.message === 'Descripción de oferta no encontrada') {
        res.status(404).json({
          message: "Descripción de oferta no encontrada",
          error: error.message
        });
      } else {
        res.status(500).json({
          message: "Error al obtener descripción de oferta",
          error: error.message
        });
      }
    }
  },

  /**
   * Obtiene todas las descripciones de una oferta específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getDescripcionesByOfertaId: async (req, res) => {
    try {
      const { idOferta } = req.params;
      
      // Validar que el ID sea un número
      if (isNaN(idOferta) || !Number.isInteger(Number(idOferta))) {
        return res.status(400).json({
          message: "El ID de la oferta debe ser un número entero válido",
          error: "ID inválido"
        });
      }

      const descripciones = await OfertaDescripcionService.getDescripcionesByOfertaId(Number(idOferta));
      
      res.status(200).json({
        message: "Descripciones de oferta obtenidas exitosamente",
        data: descripciones,
        count: descripciones.length
      });
    } catch (error) {
      console.error('Error en el controlador al obtener descripciones de oferta:', error);
      res.status(500).json({
        message: "Error al obtener descripciones de oferta",
        error: error.message
      });
    }
  },

  /**
   * Crea una nueva descripción de oferta
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  createOfertaDescripcion: async (req, res) => {
    try {
      const descripcionData = req.body;
      
      const descripcion = await OfertaDescripcionService.createOfertaDescripcion(descripcionData);
      
      res.status(201).json({
        message: "Descripción de oferta creada exitosamente",
        data: descripcion
      });
    } catch (error) {
      console.error('Error en el controlador al crear descripción de oferta:', error);
      
      // Manejar errores de validación
      if (error.message.includes('Errores de validación')) {
        return res.status(400).json({
          message: "Error de validación",
          error: error.message
        });
      }
      
      res.status(500).json({
        message: "Error al crear descripción de oferta",
        error: error.message
      });
    }
  },

  /**
   * Actualiza una descripción de oferta existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  updateOfertaDescripcion: async (req, res) => {
    try {
      const { id } = req.params;
      const descripcionData = req.body;
      
      // Validar que el ID sea un número
      if (isNaN(id) || !Number.isInteger(Number(id))) {
        return res.status(400).json({
          message: "El ID debe ser un número entero válido",
          error: "ID inválido"
        });
      }
      
      const descripcion = await OfertaDescripcionService.updateOfertaDescripcion(Number(id), descripcionData);
      
      res.status(200).json({
        message: "Descripción de oferta actualizada exitosamente",
        data: descripcion
      });
    } catch (error) {
      console.error('Error en el controlador al actualizar descripción de oferta:', error);
      
      if (error.message === 'Descripción de oferta no encontrada') {
        return res.status(404).json({
          message: "Descripción de oferta no encontrada",
          error: error.message
        });
      }
      
      // Manejar errores de validación
      if (error.message.includes('Errores de validación')) {
        return res.status(400).json({
          message: "Error de validación",
          error: error.message
        });
      }
      
      res.status(500).json({
        message: "Error al actualizar descripción de oferta",
        error: error.message
      });
    }
  },

  /**
   * Elimina una descripción de oferta
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  deleteOfertaDescripcion: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número
      if (isNaN(id) || !Number.isInteger(Number(id))) {
        return res.status(400).json({
          message: "El ID debe ser un número entero válido",
          error: "ID inválido"
        });
      }
      
      await OfertaDescripcionService.deleteOfertaDescripcion(Number(id));
      
      res.status(200).json({
        message: "Descripción de oferta eliminada exitosamente"
      });
    } catch (error) {
      console.error('Error en el controlador al eliminar descripción de oferta:', error);
      
      if (error.message === 'Descripción de oferta no encontrada') {
        return res.status(404).json({
          message: "Descripción de oferta no encontrada",
          error: error.message
        });
      }
      
      res.status(500).json({
        message: "Error al eliminar descripción de oferta",
        error: error.message
      });
    }
  },

  /**
   * Filtra descripciones de ofertas según los criterios proporcionados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  filterOfertaDescripciones: async (req, res) => {
    try {
      const filters = req.body;
      const page = parseInt(req.params.page) || 1;
      const limit = parseInt(req.params.limit) || 10;

      const result = await OfertaDescripcionService.filterOfertaDescripciones(filters, page, limit);
      
      res.status(200).json({
        message: "Descripciones de ofertas filtradas exitosamente",
        data: result.descripciones,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error en el controlador al filtrar descripciones de ofertas:', error);
      res.status(500).json({
        message: "Error al filtrar descripciones de ofertas",
        error: error.message
      });
    }
  },
};

module.exports = OfertaDescripcionController; 