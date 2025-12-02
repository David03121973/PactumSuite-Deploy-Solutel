const ContratoTrabajadorService = require("../services/contratoTrabajadorService.js");

const ContratoTrabajadorController = {
  getAllContratoTrabajadores: async (req, res) => {
    try {
      const contratoTrabajadores = await ContratoTrabajadorService.getAll();
      res.status(200).json({
        success: true,
        data: contratoTrabajadores
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener las relaciones contrato-trabajador",
        error: error.message
      });
    }
  },

  getContratoTrabajadorById: async (req, res) => {
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

      const contratoTrabajador = await ContratoTrabajadorService.getById(id);
      res.status(200).json({
        success: true,
        data: contratoTrabajador
      });
    } catch (error) {
      if (error.message.includes("no encontrada")) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al obtener la relación contrato-trabajador",
          error: error.message
        });
      }
    }
  },

  createContratoTrabajador: async (req, res) => {
    try {
      const newContratoTrabajador = await ContratoTrabajadorService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Relación contrato-trabajador creada exitosamente",
        data: newContratoTrabajador
      });
    } catch (error) {
      if (error.message.includes("inválidos") || error.message.includes("existe")) {
        res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: error.message.split(', ')
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al crear la relación contrato-trabajador",
          error: error.message
        });
      }
    }
  },

  updateContratoTrabajador: async (req, res) => {
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

      const updatedContratoTrabajador = await ContratoTrabajadorService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: "Relación contrato-trabajador actualizada exitosamente",
        data: updatedContratoTrabajador
      });
    } catch (error) {
      if (error.message.includes("no encontrada")) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes("inválidos") || error.message.includes("existe")) {
        res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: error.message.split(', ')
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al actualizar la relación contrato-trabajador",
          error: error.message
        });
      }
    }
  },

  deleteContratoTrabajador: async (req, res) => {
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

      await ContratoTrabajadorService.delete(id);
      res.status(200).json({
        success: true,
        message: "Relación contrato-trabajador eliminada exitosamente"
      });
    } catch (error) {
      if (error.message.includes("no encontrada")) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error al eliminar la relación contrato-trabajador",
          error: error.message
        });
      }
    }
  },

  filterContratoTrabajadores: async (req, res) => {
    try {
      const filters = req.query;
      const contratoTrabajadores = await ContratoTrabajadorService.filter(filters);
      res.status(200).json({
        success: true,
        data: contratoTrabajadores
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al filtrar relaciones contrato-trabajador",
        error: error.message
      });
    }
  },
  
  syncTrabajadorContratos: async (req, res) => {
    const { id_trabajador_autorizado, ids_contratos } = req.body;
    const errors = [];

    // Validaciones básicas
    if (!id_trabajador_autorizado || isNaN(id_trabajador_autorizado)) {
      errors.push("El id_trabajador_autorizado es obligatorio y debe ser un número entero");
    }
    if (!Array.isArray(ids_contratos)) {
      errors.push("ids_contratos debe ser un arreglo de números");
    } else if (ids_contratos.some(id => isNaN(id) || !Number.isInteger(Number(id)))) {
      errors.push("Todos los ids de contratos deben ser números enteros");
    }
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Errores de validación",
        errors
      });
    }

    try {
      const result = await ContratoTrabajadorService.syncTrabajadorContratos(id_trabajador_autorizado, ids_contratos);
      return res.status(200).json({
        success: true,
        message: "Sincronización exitosa",
        data: result
      });
    } catch (error) {
      console.error("Error en syncTrabajadorContratos:", error);
      return res.status(500).json({
        success: false,
        message: "Error al sincronizar contratos del trabajador autorizado",
        error: error.message
      });
    }
  },
};

module.exports = ContratoTrabajadorController; 