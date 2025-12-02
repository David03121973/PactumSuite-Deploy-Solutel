const TipoContratoService = require("../services/tipoContratoService.js");

/**
 * Controlador para la gestión de tipos de contrato
 * Implementa el patrón MVC y sigue los principios SOLID:
 * - Single Responsibility: Cada método tiene una única responsabilidad
 * - Open/Closed: Extensible para nuevas funcionalidades sin modificar el código existente
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de abstracciones (TipoContratoService) no de implementaciones concretas
 */
const TipoContratoController = {
  /**
   * Obtiene todos los tipos de contrato
   * Responsabilidad: Recuperar y devolver la lista completa de tipos de contrato
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getAllTipoContratos: async (req, res) => {
    try {
      const tipoContratos = await TipoContratoService.getAll();
      res.status(200).json({
        message: "Tipos de contrato obtenidos exitosamente",
        data: tipoContratos
      });
    } catch (error) {
      console.error("Error al obtener tipos de contrato:", error);
      res.status(500).json({ 
        message: "Error al obtener tipos de contrato",
        error: error.message 
      });
    }
  },

  /**
   * Obtiene un tipo de contrato por su ID
   * Responsabilidad: Validar el ID y recuperar un tipo de contrato específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  getTipoContratoById: async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        message: "El ID debe ser un número entero válido",
        error: "ID inválido"
      });
    }

    try {
      const tipoContrato = await TipoContratoService.getById(Number(id));
      if (tipoContrato) {
        res.status(200).json({
          message: "Tipo de contrato encontrado exitosamente",
          data: tipoContrato
        });
      } else {
        res.status(404).json({ 
          message: `No se encontró el tipo de contrato con ID: ${id}`,
          error: "Tipo de contrato no encontrado"
        });
      }
    } catch (error) {
      console.error("Error al obtener tipo de contrato:", error);
      res.status(500).json({ 
        message: "Error al obtener tipo de contrato",
        error: error.message 
      });
    }
  },

  /**
   * Crea un nuevo tipo de contrato
   * Responsabilidad: Validar los datos y crear un nuevo tipo de contrato
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  createTipoContrato: async (req, res) => {
    const { nombre } = req.body;
    const errors = [];

    // Validar campos requeridos
    if (!nombre) {
      errors.push("El nombre es obligatorio");
    }

    // Validar formato del nombre
    if (nombre) {
      if (nombre.length < 3 || nombre.length > 100) {
        errors.push("El nombre debe tener entre 3 y 100 caracteres");
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,&-]+$/.test(nombre)) {
        errors.push("El nombre solo puede contener letras, números, espacios y los caracteres: ., & -");
      }
    }

    // Si hay errores de validación, retornarlos todos juntos
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Errores de validación",
        errors: errors
      });
    }

    try {
      // Verificar si ya existe un tipo de contrato con el mismo nombre
      const existingTipoContrato = await TipoContratoService.getByName(nombre);
      if (existingTipoContrato) {
        return res.status(400).json({
          message: "Ya existe un tipo de contrato con ese nombre",
          error: "Nombre duplicado"
        });
      }

      const newTipoContrato = await TipoContratoService.create({ nombre });

      res.status(201).json({
        message: "Tipo de contrato creado exitosamente",
        data: newTipoContrato
      });
    } catch (error) {
      console.error("Error al crear tipo de contrato:", error);
      res.status(500).json({ 
        message: "Error al crear tipo de contrato",
        error: error.message 
      });
    }
  },

  /**
   * Actualiza un tipo de contrato existente
   * Responsabilidad: Validar los datos y actualizar un tipo de contrato existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  updateTipoContrato: async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const errors = [];

    // Validar que el ID sea un número
    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        message: "El ID debe ser un número entero válido",
        error: "ID inválido"
      });
    }

    // Validar formato del nombre si se proporciona
    if (nombre) {
      if (nombre.length < 3 || nombre.length > 100) {
        errors.push("El nombre debe tener entre 3 y 100 caracteres");
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,&-]+$/.test(nombre)) {
        errors.push("El nombre solo puede contener letras, números, espacios y los caracteres: ., & -");
      }
    }

    // Si hay errores de validación, retornarlos todos juntos
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Errores de validación",
        errors: errors
      });
    }

    try {
      // Verificar si existe el tipo de contrato
      const existingTipoContrato = await TipoContratoService.getById(Number(id));
      if (!existingTipoContrato) {
        return res.status(404).json({
          message: `No se encontró el tipo de contrato con ID: ${id}`,
          error: "Tipo de contrato no encontrado"
        });
      }

      // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
      if (nombre && nombre !== existingTipoContrato.nombre) {
        const duplicateTipoContrato = await TipoContratoService.getByName(nombre);
        if (duplicateTipoContrato) {
          return res.status(400).json({
            message: "Ya existe un tipo de contrato con ese nombre",
            error: "Nombre duplicado"
          });
        }
      }

      const updatedTipoContrato = await TipoContratoService.update(Number(id), {
        nombre: nombre || existingTipoContrato.nombre
      });

      res.status(200).json({
        message: "Tipo de contrato actualizado exitosamente",
        data: updatedTipoContrato
      });
    } catch (error) {
      console.error("Error al actualizar tipo de contrato:", error);
      res.status(500).json({ 
        message: "Error al actualizar tipo de contrato",
        error: error.message 
      });
    }
  },

  /**
   * Elimina un tipo de contrato
   * Responsabilidad: Validar el ID y eliminar un tipo de contrato existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  deleteTipoContrato: async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        message: "El ID debe ser un número entero válido",
        error: "ID inválido"
      });
    }

    try {
      // Verificar si existe el tipo de contrato
      const existingTipoContrato = await TipoContratoService.getById(Number(id));
      if (!existingTipoContrato) {
        return res.status(404).json({
          message: `No se encontró el tipo de contrato con ID: ${id}`,
          error: "Tipo de contrato no encontrado"
        });
      }

      // Validar si tiene contratos asociados
      if (existingTipoContrato.contratos && existingTipoContrato.contratos.length > 0) {
        return res.status(400).json({
          message: `No se puede eliminar el tipo de contrato porque está relacionado con contratos.`,
          relaciones: existingTipoContrato.contratos.map(c => ({
            id_contrato: c.id_contrato,
            descripcion: c.nota || c.clasificacion || ''
          }))
        });
      }

      await TipoContratoService.delete(Number(id));
      res.status(200).json({
        message: "Tipo de contrato eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error al eliminar tipo de contrato:", error);
      res.status(500).json({ 
        message: "Error al eliminar tipo de contrato",
        error: error.message 
      });
    }
  },
};

module.exports = TipoContratoController; 