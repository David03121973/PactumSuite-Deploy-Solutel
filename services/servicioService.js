// services/servicioService.js

const Servicio = require("../models/servicio");
const Factura = require("../models/factura");
const { Op } = require("sequelize");

/**
 * Obtener todos los servicios incluyendo la factura asociada
 */
const getAllServicios = async () => {
  try {
    return await Servicio.findAll({
      include: [{ model: Factura, as: "factura" }],
      order: [["descripcion", "ASC"], ["id_servicio", "ASC"]],
    });
  } catch (error) {
    console.error("Error en los servicios de getAllServicios: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener servicios');
      err.errors = [error.message || 'Error interno al obtener servicios'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Obtener un servicio por ID incluyendo la factura
 */
const getServicioById = async (id) => {
  try {
    return await Servicio.findOne({
      where: { id_servicio: id },
      include: [{ model: Factura, as: "factura" }],
    });
  } catch (error) {
    console.error("Error en los servicios de getServicioById: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener servicio');
      err.errors = [error.message || 'Error interno al obtener servicio'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Validar si existe un servicio para una factura (1:1)
 */
const servicioExistsForFactura = async (idFactura) => {
  try {
    const servicio = await Servicio.findOne({ where: { id_factura: idFactura } });
    return servicio !== null;
  } catch (error) {
    console.error("Error en los servicios de servicioExistsForFactura: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al verificar servicio');
      err.errors = [error.message || 'Error interno al verificar servicio'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Crear un nuevo servicio
 */
const createServicio = async (servicioData) => {
  try {
    return await Servicio.create(servicioData);
  } catch (error) {
    console.error("Error en el servicio de crear servicio: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al crear servicio');
      err.errors = [error.message || 'Error interno al crear servicio'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Actualizar un servicio
 */
const updateServicio = async (id, servicioData) => {
  try {
    const servicio = await Servicio.findOne({ where: { id_servicio: id } });
    if (servicio) {
      await servicio.update(servicioData);
      return servicio;
    }
    return null;
  } catch (error) {
    console.error("Error en el servicio de actualizar servicio: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al actualizar servicio');
      err.errors = [error.message || 'Error interno al actualizar servicio'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Eliminar un servicio
 */
const deleteServicio = async (id) => {
  try {
    const servicio = await Servicio.findOne({ where: { id_servicio: id } });
    if (servicio) {
      await servicio.destroy();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error en el servicio de eliminar servicio:", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al eliminar servicio');
      err.errors = [error.message || 'Error interno al eliminar servicio'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Filtrar servicios por descripción (búsqueda case-insensitive, sin paginación)
 */
const filterServicios = async (descripcion, idFactura) => {
  try {
    const whereClause = {};
    if (descripcion) {
      whereClause.descripcion = { [Op.iLike]: `%${String(descripcion).toLowerCase()}%` };
    }
    if (idFactura !== undefined && idFactura !== null && idFactura !== "") {
      const idFacturaNum = parseInt(idFactura, 10);
      if (!Number.isNaN(idFacturaNum)) {
        whereClause.id_factura = idFacturaNum;
      }
    }
    return await Servicio.findAll({
      where: whereClause,
      include: [{ model: Factura, as: "factura" }],
      order: [["descripcion", "ASC"], ["id_servicio", "ASC"]],
    });
  } catch (error) {
    console.error("Error en el servicio de filtrar servicios:", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al filtrar servicios');
      err.errors = [error.message || 'Error interno al filtrar servicios'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

module.exports = {
  getAllServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
  servicioExistsForFactura,
  filterServicios,
};
/**
 * Verificar si existe la factura
 */
const facturaExists = async (idFactura) => {
  try {
    const factura = await Factura.findOne({ where: { id_factura: idFactura } });
    return factura !== null;
  } catch (error) {
    console.error("Error en los servicios de facturaExists: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al verificar factura');
      err.errors = [error.message || 'Error interno al verificar factura'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

module.exports.facturaExists = facturaExists;


