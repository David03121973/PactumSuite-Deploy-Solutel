const TrabajadorAutorizadoService = require("../services/trabajadorAutorizadoService.js");

const TrabajadorAutorizadoController = {
  /**
   * Obtiene todos los trabajadores autorizados
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAllTrabajadoresAutorizados: async (req, res) => {
    try {
      const trabajadoresAutorizados = await TrabajadorAutorizadoService.getAll();
      res.status(200).json({
        success: true,
        data: trabajadoresAutorizados
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los trabajadores autorizados",
        error: error.message
      });
    }
  },

  /**
   * Obtiene un trabajador autorizado por su ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getTrabajadorAutorizadoById: async (req, res) => {
    try {
      const { id } = req.params;
      const errors = [];
      
      // Validar que el ID sea un número
      if (isNaN(id) || !Number.isInteger(Number(id))) {
        errors.push("El ID debe ser un número entero");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors
        });
      }

      const trabajadorAutorizado = await TrabajadorAutorizadoService.getById(id);
      res.status(200).json({
        success: true,
        data: trabajadorAutorizado
      });
    } catch (error) {
      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al obtener el trabajador autorizado",
          error: error.message
        });
      }
    }
  },

  /**
   * Crea un nuevo trabajador autorizado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createTrabajadorAutorizado: async (req, res) => {
    try {
      const trabajadorData = req.body;
      const errors = [];

      // Validar campos obligatorios
      if (!trabajadorData.nombre) {
        errors.push("El nombre es obligatorio");
      }
      if (!trabajadorData.carnet_identidad) {
        errors.push("El carnet de identidad es obligatorio");
      }

      // Validar formato del carnet de identidad
      if (trabajadorData.carnet_identidad && !/^\d{11}$/.test(trabajadorData.carnet_identidad)) {
        errors.push("El carnet de identidad debe tener exactamente 11 dígitos");
      }

      // Validar campo funcion si fue provisto
      if (trabajadorData.funcion && typeof trabajadorData.funcion !== 'string') {
        errors.push("El campo funcion debe ser una cadena de texto");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors
        });
      }

      const newTrabajadorAutorizado = await TrabajadorAutorizadoService.create(trabajadorData);
      res.status(201).json({
        success: true,
        message: "Trabajador autorizado creado exitosamente",
        data: newTrabajadorAutorizado
      });
    } catch (error) {
      if (error.message.includes("inválidos") || error.message.includes("existe")) {
        res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: [error.message]
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al crear el trabajador autorizado",
          error: error.message
        });
      }
    }
  },

  /**
   * Actualiza un trabajador autorizado existente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateTrabajadorAutorizado: async (req, res) => {
    try {
      const { id } = req.params;
      const trabajadorData = req.body;
      const errors = [];

      // Validar que el ID sea un número
      if (isNaN(id) || !Number.isInteger(Number(id))) {
        errors.push("El ID debe ser un número entero");
      }

      // Si se está actualizando el carnet de identidad, validar su formato
      if (trabajadorData.carnet_identidad && !/^[0-9]{11}$/.test(trabajadorData.carnet_identidad)) {
        errors.push("El carnet de identidad debe tener exactamente 11 dígitos");
      }

      // Validar campo funcion si fue provisto
      if (trabajadorData.funcion && typeof trabajadorData.funcion !== 'string') {
        errors.push("El campo funcion debe ser una cadena de texto");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors
        });
      }

      const updatedTrabajadorAutorizado = await TrabajadorAutorizadoService.update(id, trabajadorData);
      res.status(200).json({
        success: true,
        message: "Trabajador autorizado actualizado exitosamente",
        data: updatedTrabajadorAutorizado
      });
    } catch (error) {
      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes("inválidos") || error.message.includes("existe")) {
        res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: [error.message]
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al actualizar el trabajador autorizado",
          error: error.message
        });
      }
    }
  },

  /**
   * Elimina un trabajador autorizado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  deleteTrabajadorAutorizado: async (req, res) => {
    try {
      const { id } = req.params;
      const errors = [];

      // Validar que el ID sea un número
      if (isNaN(id) || !Number.isInteger(Number(id))) {
        errors.push("El ID debe ser un número entero");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: errors
        });
      }

      const trabajador = await TrabajadorAutorizadoService.getById(id);
      if (!trabajador) {
        return res.status(404).json({
          success: false,
          message: "Trabajador autorizado no encontrado"
        });
      }

      // Validar si tiene contratos asociados
      if (trabajador.contratos && trabajador.contratos.length > 0) {
        return res.status(400).json({
          success: false,
          message: "No se puede eliminar el trabajador autorizado porque está relacionado con contratos.",
          relaciones: trabajador.contratos.map(c => ({
            id_contrato: c.id_contrato,
            descripcion: c.nota || c.clasificacion || ''
          }))
        });
      }

      await TrabajadorAutorizadoService.delete(id);
      res.status(200).json({
        success: true,
        message: "Trabajador autorizado eliminado exitosamente"
      });
    } catch (error) {
      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al eliminar el trabajador autorizado",
          error: error.message
        });
      }
    }
  },

  /**
   * Filtra trabajadores autorizados según criterios específicos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  filterTrabajadoresAutorizados: async (req, res) => {
    try {
      const filters = req.query;
      const trabajadoresAutorizados = await TrabajadorAutorizadoService.filter(filters);
      res.status(200).json({
        success: true,
        data: trabajadoresAutorizados
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al filtrar trabajadores autorizados",
        error: error.message
      });
    }
  },

  /**
   * Filtrar trabajadores autorizados con paginación
   */
  filterTrabajadores: async (req, res) => {
    const { page, limit } = req.params;
    const filters = req.body;

    // Validar que page y limit sean números
    if (isNaN(page) || !Number.isInteger(Number(page)) || Number(page) < 1) {
      return res.status(400).json({
        message: "El número de página debe ser un número entero positivo",
        error: "Página inválida"
      });
    }

    if (isNaN(limit) || !Number.isInteger(Number(limit)) || Number(limit) < 1) {
      return res.status(400).json({
        message: "El límite debe ser un número entero positivo",
        error: "Límite inválido"
      });
    }

    // Validar campo funcion si fue provisto
    if (filters.funcion && typeof filters.funcion !== 'string') {
      return res.status(400).json({
        message: "El campo funcion debe ser una cadena de texto",
        error: "Campo funcion inválido"
      });
    }

    try {
      const result = await TrabajadorAutorizadoService.filterWithPagination(
        filters,
        Number(page),
        Number(limit)
      );

      return res.status(200).json({
        message: "Trabajadores autorizados filtrados exitosamente",
        data: result.trabajadores,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error("Error al filtrar trabajadores autorizados:", error);
      return res.status(500).json({
        message: "Error al filtrar trabajadores autorizados",
        error: error.message
      });
    }
  }
};

module.exports = TrabajadorAutorizadoController; 