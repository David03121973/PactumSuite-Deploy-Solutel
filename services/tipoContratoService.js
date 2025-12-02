const TipoContrato = require("../models/tipo_contrato.js");

/**
 * Servicio para la gestión de tipos de contrato
 * Implementa la lógica de negocio y la interacción con la base de datos
 */
const TipoContratoService = {
  /**
   * Obtiene todos los tipos de contrato
   * @returns {Promise<Array>} Lista de tipos de contrato
   */
  getAll: async () => {
    try {
      return await TipoContrato.findAll();
    } catch (error) {
      console.error('Error en TipoContratoService.getAll:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al obtener tipos de contrato');
        err.errors = [error.message || 'Error interno al obtener tipos de contrato'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Obtiene un tipo de contrato por su ID
   * @param {number} id - ID del tipo de contrato
   * @returns {Promise<Object|null>} Tipo de contrato encontrado o null
   */
  getById: async (id) => {
    try {
      return await TipoContrato.findByPk(id);
    } catch (error) {
      console.error('Error en TipoContratoService.getById:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al obtener tipo de contrato');
        err.errors = [error.message || 'Error interno al obtener tipo de contrato'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Obtiene un tipo de contrato por su nombre
   * @param {string} nombre - Nombre del tipo de contrato
   * @returns {Promise<Object|null>} Tipo de contrato encontrado o null
   */
  getByName: async (nombre) => {
    try {
      return await TipoContrato.findOne({
        where: {
          nombre: nombre
        }
      });
    } catch (error) {
      console.error('Error en TipoContratoService.getByName:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al obtener tipo de contrato por nombre');
        err.errors = [error.message || 'Error interno al obtener tipo de contrato por nombre'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Crea un nuevo tipo de contrato
   * @param {Object} tipoContratoData - Datos del tipo de contrato
   * @returns {Promise<Object>} Tipo de contrato creado
   */
  create: async (tipoContratoData) => {
    try {
      return await TipoContrato.create(tipoContratoData);
    } catch (error) {
      console.error('Error en TipoContratoService.create:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al crear tipo de contrato');
        err.errors = [error.message || 'Error interno al crear tipo de contrato'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Actualiza un tipo de contrato existente
   * @param {number} id - ID del tipo de contrato
   * @param {Object} tipoContratoData - Datos actualizados del tipo de contrato
   * @returns {Promise<Object|null>} Tipo de contrato actualizado o null
   */
  update: async (id, tipoContratoData) => {
    try {
      const tipoContrato = await TipoContrato.findByPk(id);
      if (tipoContrato) {
        await tipoContrato.update(tipoContratoData);
        return tipoContrato;
      }
      return null;
    } catch (error) {
      console.error('Error en TipoContratoService.update:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al actualizar tipo de contrato');
        err.errors = [error.message || 'Error interno al actualizar tipo de contrato'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Elimina un tipo de contrato
   * @param {number} id - ID del tipo de contrato
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  delete: async (id) => {
    try {
      const tipoContrato = await TipoContrato.findByPk(id);
      if (tipoContrato) {
        await tipoContrato.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en TipoContratoService.delete:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al eliminar tipo de contrato');
        err.errors = [error.message || 'Error interno al eliminar tipo de contrato'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },
};

module.exports = TipoContratoService; 