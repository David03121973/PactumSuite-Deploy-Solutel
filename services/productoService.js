// services/productoService.js

const Producto = require("../models/producto");
const { Op } = require('sequelize');

/**
 * Obtener todos los productos
 */
const getAllProductos = async () => {
  try {
    return await Producto.findAll();
  } catch (error) {
    console.log("Error en los servicios de getAllProductos: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener productos');
      err.errors = [error.message || 'Error interno al obtener productos'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Obtener un producto por ID
 */
const getProductoById = async (id) => {
  try {
    return await Producto.findOne({
      where: { id_producto: id }
    });
  } catch (error) {
    console.log("Error en los servicios de getProductoById: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener producto');
      err.errors = [error.message || 'Error interno al obtener producto'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Verificar si un producto existe por código
 */
const productoExists = async (codigo) => {
  try {
    const producto = await Producto.findOne({ where: { codigo } });
    return producto !== null; // Devuelve true si el producto existe, false si no
  } catch (error) {
    console.log("Error en los servicios de productoExists: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al verificar producto');
      err.errors = [error.message || 'Error interno al verificar producto'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Crear un nuevo producto
 */
const createProducto = async (productoData) => {
  try {
    return await Producto.create(productoData);
  } catch (error) {
    console.log("Error en el servicio de crear producto: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al crear producto');
      err.errors = [error.message || 'Error interno al crear producto'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Actualizar un producto
 */
const updateProducto = async (id, productoData) => {
  try {
    const producto = await Producto.findOne({ where: { id_producto: id } });
    if (producto) {
      await producto.update(productoData);
      return producto;
    }
    return null;
  } catch (error) {
    console.log("Error en el servicio de actualizar producto: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al actualizar producto');
      err.errors = [error.message || 'Error interno al actualizar producto'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Eliminar un producto
 */
const deleteProducto = async (id) => {
  try {
    const producto = await Producto.findOne({
      where: { id_producto: id }
    });
    
    if (producto) {
      await producto.destroy();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error en el servicio de eliminar producto:", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al eliminar producto');
      err.errors = [error.message || 'Error interno al eliminar producto'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Filtrar productos por múltiples criterios con paginación
 * @param {Object} filters - Objeto con los criterios de filtrado
 * @param {string} [filters.codigo] - Código del producto (búsqueda case-insensitive)
 * @param {string} [filters.nombre] - Nombre del producto (búsqueda case-insensitive)
 * @param {string} [filters.tipoProducto] - Tipo de producto (búsqueda case-insensitive)
 * @param {Object} [filters.precio] - Rango de precios para filtrar
 * @param {number} [filters.precio.min] - Precio mínimo
 * @param {number} [filters.precio.max] - Precio máximo
 * @param {Object} [filters.cantidadExistencia] - Rango de cantidad de existencia para filtrar
 * @param {number} [filters.cantidadExistencia.min] - Cantidad mínima
 * @param {number} [filters.cantidadExistencia.max] - Cantidad máxima
 * @param {Object} [filters.costo] - Rango de costos para filtrar
 * @param {number} [filters.costo.min] - Costo mínimo
 * @param {number} [filters.costo.max] - Costo máximo
 * @param {string} [filters.nota] - Nota del producto (búsqueda case-insensitive)
 * @param {number} page - Número de página
 * @param {number} limit - Límite de registros por página
 * @returns {Promise<Object>} Objeto con los productos filtrados y metadatos de paginación
 */
const filterProductos = async (filters, page = 1, limit = 10) => {
  try {
    const whereClause = {};

    // Filtrar por código
    if (filters.codigo) {
      whereClause.codigo = { [Op.iLike]: `%${filters.codigo.toLowerCase()}%` };
    }

    // Filtrar por nombre
    if (filters.nombre) {
      whereClause.nombre = { [Op.iLike]: `%${filters.nombre.toLowerCase()}%` };
    }

    // Filtrar por tipoProducto
    if (filters.tipoProducto) {
      whereClause.tipoProducto = { [Op.iLike]: `%${filters.tipoProducto.toLowerCase()}%` };
    }

    // Filtrar por precio
    if (filters.precio) {
      if (filters.precio.min !== undefined) {
        whereClause.precio = { ...whereClause.precio, [Op.gte]: filters.precio.min };
      }
      if (filters.precio.max !== undefined) {
        whereClause.precio = { ...whereClause.precio, [Op.lte]: filters.precio.max };
      }
    }

    // Filtrar por cantidadExistencia
    if (filters.cantidadExistencia) {
      if (filters.cantidadExistencia.min !== undefined) {
        whereClause.cantidadExistencia = { ...whereClause.cantidadExistencia, [Op.gte]: filters.cantidadExistencia.min };
      }
      if (filters.cantidadExistencia.max !== undefined) {
        whereClause.cantidadExistencia = { ...whereClause.cantidadExistencia, [Op.lte]: filters.cantidadExistencia.max };
      }
    }

    // Filtrar por costo
    if (filters.costo) {
      if (filters.costo.min !== undefined) {
        whereClause.costo = { ...whereClause.costo, [Op.gte]: filters.costo.min };
      }
      if (filters.costo.max !== undefined) {
        whereClause.costo = { ...whereClause.costo, [Op.lte]: filters.costo.max };
      }
    }

    // Filtrar por nota
    if (filters.nota) {
      whereClause.nota = { [Op.iLike]: `%${filters.nota.toLowerCase()}%` };
    }

    // Calcular offset para la paginación
    const offset = (page - 1) * limit;

    // Primero, contar el total de productos que coinciden con los filtros
    const totalCount = await Producto.count({
      where: whereClause
    });

    // Luego, obtener los productos para la página actual
    const productos = await Producto.findAll({
      where: whereClause,
      order: [['nombre', 'ASC'], ['codigo', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      productos,
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
    console.error("Error en el servicio de filtrar productos:", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al filtrar productos');
      err.errors = [error.message || 'Error interno al filtrar productos'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Buscar productos por código
 */
const getProductoByCodigo = async (codigo) => {
  try {
    return await Producto.findOne({ where: { codigo } });
  } catch (error) {
    console.log("Error al obtener el producto por código:", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener producto por código');
      err.errors = [error.message || 'Error interno al obtener producto por código'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

// Exportar las funciones
module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  productoExists,
  getProductoByCodigo,
  filterProductos,
};
