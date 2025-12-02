const OfertaService = require("../services/ofertaService.js");

/**
 * Controlador para la gestión de ofertas
 * Implementa el patrón MVC
 * Sigue los principios SOLID:
 * - Single Responsibility: Cada método tiene una única responsabilidad
 * - Open/Closed: Extensible para nuevas funcionalidades sin modificar el código existente
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de abstracciones (servicios) no de implementaciones concretas
 */
const OfertaController = {
  /**
   * Obtiene todas las ofertas
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getAllOfertas: async (req, res) => {
    try {
      const ofertas = await OfertaService.getAllOfertas();
      res.status(200).json({
        message: "Ofertas obtenidas exitosamente",
        data: ofertas
      });
    } catch (error) {
      console.error('Error en el controlador al obtener ofertas:', error);
      res.status(500).json({
        message: "Error al obtener ofertas",
        error: error.message
      });
    }
  },

  /**
   * Obtiene una oferta por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getOfertaById: async (req, res) => {
    try {
      const { id } = req.params;
      const oferta = await OfertaService.getOfertaById(id);
      
      res.status(200).json({
        message: "Oferta encontrada exitosamente",
        data: oferta
      });
    } catch (error) {
      console.error('Error en el controlador al obtener oferta:', error);
      if (error.message === 'Oferta no encontrada') {
        res.status(404).json({
          message: "Oferta no encontrada",
          error: error.message
        });
      } else {
        res.status(500).json({
          message: "Error al obtener oferta",
          error: error.message
        });
      }
    }
  },

  /**
   * Crea una nueva oferta con sus descripciones
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  createOferta: async (req, res) => {
    try {
      const { descripciones, ...ofertaData } = req.body;
      
      // Validar estado si está presente
      if (ofertaData.estado !== undefined && ofertaData.estado !== null) {
        const estadosValidos = ['vigente', 'facturada', 'vencida'];
        if (!estadosValidos.includes(ofertaData.estado)) {
          return res.status(400).json({
            message: "Error de validación",
            error: "El estado debe ser uno de: vigente, facturada, vencida"
          });
        }
      }
      
      const oferta = await OfertaService.createOferta(ofertaData, descripciones || []);
      
      res.status(201).json({
        message: "Oferta creada exitosamente",
        data: oferta
      });
    } catch (error) {
      console.error('Error en el controlador al crear oferta:', error);
      
      // Manejar específicamente el error de contrato vencido
      if (error.message.includes('contrato vencido')) {
        return res.status(400).json({
          message: "No se puede crear la oferta",
          error: error.message
        });
      }
      
      res.status(400).json({
        message: "Error al crear oferta",
        error: error.message
      });
    }
  },

  /**
   * Actualiza una oferta existente con sus descripciones
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  updateOferta: async (req, res) => {
    try {
      const { id } = req.params;
      const { descripciones, ...ofertaData } = req.body;
      
      // Validar estado si está presente
      if (ofertaData.estado !== undefined && ofertaData.estado !== null) {
        const estadosValidos = ['vigente', 'facturada', 'vencida'];
        if (!estadosValidos.includes(ofertaData.estado)) {
          return res.status(400).json({
            message: "Error de validación",
            error: "El estado debe ser uno de: vigente, facturada, vencida"
          });
        }
      }
      
      const oferta = await OfertaService.updateOferta(id, ofertaData, descripciones);
      
      res.status(200).json({
        message: "Oferta actualizada exitosamente",
        data: oferta
      });
    } catch (error) {
      console.error('Error en el controlador al actualizar oferta:', error);
      
      // Manejar específicamente el error de contrato vencido
      if (error.message.includes('contrato vencido')) {
        return res.status(400).json({
          message: "No se puede actualizar la oferta",
          error: error.message
        });
      }
      
      if (error.message === 'Oferta no encontrada') {
        res.status(404).json({
          message: "Oferta no encontrada",
          error: error.message
        });
      } else {
        res.status(400).json({
          message: "Error al actualizar oferta",
          error: error.message
        });
      }
    }
  },

  /**
   * Elimina una oferta
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  deleteOferta: async (req, res) => {
    try {
      const { id } = req.params;
      const oferta = await OfertaService.getOfertaById(id);
      if (!oferta) {
        return res.status(404).json({
          message: "Oferta no encontrada",
          error: "Oferta no encontrada"
        });
      }
      // Validar integridad referencial
      if (!oferta.contrato) {
        return res.status(400).json({
          message: "No se puede eliminar la oferta porque no está asociada a un contrato válido."
        });
      }
      if (!oferta.usuario) {
        return res.status(400).json({
          message: "No se puede eliminar la oferta porque no está asociada a un usuario válido."
        });
      }
      await OfertaService.deleteOferta(id);
      
      res.status(200).json({
        message: "Oferta eliminada exitosamente"
      });
    } catch (error) {
      console.error('Error en el controlador al eliminar oferta:', error);
      if (error.message === 'Oferta no encontrada') {
        res.status(404).json({
          message: "Oferta no encontrada",
          error: error.message
        });
      } else {
        res.status(500).json({
          message: "Error al eliminar oferta",
          error: error.message
        });
      }
    }
  },

  /**
   * Filtra ofertas según criterios específicos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  filterOfertas: async (req, res) => {
    try {
      const filters = req.body;
      const ofertas = await OfertaService.filterOfertas(filters);
      res.json(ofertas);
    } catch (error) {
      console.error('Error en filterOfertas:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = OfertaController; 