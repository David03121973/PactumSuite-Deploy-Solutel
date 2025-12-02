// services/entradaService.js

const Entrada = require("../models/entrada");
const Producto = require("../models/producto");
const Contrato = require("../models/contrato");
const Factura = require("../models/factura");
const facturaService = require("../services/facturaService");
const { Op } = require('sequelize');
const sequelize = require("../helpers/database");

/**
 * Obtener todas las entradas
 */
const getAllEntradas = async () => {
  try {
    return await Entrada.findAll({
      include: [
        { model: Producto, as: 'producto' },
        { model: Contrato, as: 'contrato' }
      ]
    });
  } catch (error) {
    console.log("Error en los servicios de getAllEntradas: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener entradas');
      err.errors = [error.message || 'Error interno al obtener entradas'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Obtener una entrada por ID
 */
const getEntradaById = async (id) => {
  try {
    return await Entrada.findOne({
      where: { id_entrada: id },
      include: [
        { model: Producto, as: 'producto' },
        { model: Contrato, as: 'contrato' }
      ]
    });
  } catch (error) {
    console.log("Error en los servicios de getEntradaById: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener entrada');
      err.errors = [error.message || 'Error interno al obtener entrada'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Crear una nueva entrada
 */
const createEntrada = async (entradaData) => {
  try {
    return await sequelize.transaction(async (t) => {
      // Validaciones de pairing id_factura/id_contrato y nota
      const hasFactura = entradaData.id_factura !== undefined && entradaData.id_factura !== null;
      const hasContrato = entradaData.id_contrato !== undefined && entradaData.id_contrato !== null;
      if (hasFactura !== hasContrato) {
        const err = new Error('Parámetros inválidos');
        err.errors = ['Si se proporciona id_factura o id_contrato, ambos deben estar presentes'];
        err.status = 400;
        throw err;
      }
      if (!hasFactura && !hasContrato) {
        if (!entradaData.nota || String(entradaData.nota).trim() === '') {
          const err = new Error('Nota requerida');
          err.errors = ['Cuando id_factura e id_contrato son null, la nota es obligatoria'];
          err.status = 400;
          throw err;
        }
      }

      const producto = await Producto.findOne({
        where: { id_producto: entradaData.id_producto },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!producto) {
        const err = new Error('Producto no encontrado');
        err.errors = ['Producto no encontrado'];
        err.status = 404;
        throw err;
      }

      const cantidadEntradaNum = parseFloat(entradaData.cantidadEntrada);
      if (isNaN(cantidadEntradaNum) || cantidadEntradaNum <= 0) {
        const err = new Error('cantidadEntrada inválida');
        err.errors = ['El campo cantidadEntrada debe ser un número mayor a 0'];
        err.status = 400;
        throw err;
      }

      const nuevaExistencia = Math.round(((producto.cantidadExistencia || 0) + cantidadEntradaNum) * 100) / 100;
      await producto.update({ cantidadExistencia: nuevaExistencia }, { transaction: t });

      const creada = await Entrada.create(entradaData, { transaction: t });
      return creada;
    });
  } catch (error) {
    console.log("Error en el servicio de crear entrada: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al crear entrada');
      err.errors = [error.message || 'Error interno al crear entrada'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Actualizar una entrada
 */
const updateEntrada = async (id, entradaData) => {
  try {
    return await sequelize.transaction(async (t) => {
      const entrada = await Entrada.findOne({ where: { id_entrada: id }, transaction: t, lock: t.LOCK.UPDATE });
      if (!entrada) {
        const err = new Error('Entrada no encontrada');
        err.errors = ['Entrada no encontrada'];
        err.status = 404;
        throw err;
      }

      // Determinar nuevos valores propuestos para id_factura/id_contrato/nota
      const idFacturaNuevo = entradaData.id_factura !== undefined ? entradaData.id_factura : entrada.id_factura;
      const idContratoNuevo = entradaData.id_contrato !== undefined ? entradaData.id_contrato : entrada.id_contrato;
      const notaNueva = entradaData.nota !== undefined ? entradaData.nota : entrada.nota;

      const hasFactura = idFacturaNuevo !== null && idFacturaNuevo !== undefined;
      const hasContrato = idContratoNuevo !== null && idContratoNuevo !== undefined;
      if (hasFactura !== hasContrato) {
        const err = new Error('Parámetros inválidos');
        err.errors = ['Si se proporciona id_factura o id_contrato, ambos deben estar presentes'];
        err.status = 400;
        throw err;
      }
      if (!hasFactura && !hasContrato) {
        if (!notaNueva || String(notaNueva).trim() === '') {
          const err = new Error('Nota requerida');
          err.errors = ['Cuando id_factura e id_contrato son null, la nota es obligatoria'];
          err.status = 400;
          throw err;
        }
      }

      const cantidadEntradaNueva = entradaData.cantidadEntrada !== undefined ? parseFloat(entradaData.cantidadEntrada) : entrada.cantidadEntrada;
      if (isNaN(cantidadEntradaNueva) || cantidadEntradaNueva <= 0) {
        const err = new Error('cantidadEntrada inválida');
        err.errors = ['El campo cantidadEntrada debe ser un número mayor a 0'];
        err.status = 400;
        throw err;
      }

      const idProductoNuevo = entradaData.id_producto !== undefined ? entradaData.id_producto : entrada.id_producto;

      // Si cambia el producto, ajustar ambos productos; si no, ajustar uno con delta
      if (idProductoNuevo !== entrada.id_producto) {
        const productoViejo = await Producto.findOne({ where: { id_producto: entrada.id_producto }, transaction: t, lock: t.LOCK.UPDATE });
        const productoNuevo = await Producto.findOne({ where: { id_producto: idProductoNuevo }, transaction: t, lock: t.LOCK.UPDATE });

        if (!productoNuevo) {
          const err = new Error('Producto destino no encontrado');
          err.errors = ['Producto destino no encontrado'];
          err.status = 404;
          throw err;
        }

        const existenciaViejo = Math.round(((productoViejo.cantidadExistencia || 0) - entrada.cantidadEntrada) * 100) / 100;
        if (existenciaViejo < 0) {
          const err = new Error('Stock insuficiente al aplicar actualización');
          err.errors = ['La actualización dejaría el stock del producto original en negativo'];
          err.status = 400;
          throw err;
        }

        const existenciaNuevo = Math.round(((productoNuevo.cantidadExistencia || 0) + cantidadEntradaNueva) * 100) / 100;

        await productoViejo.update({ cantidadExistencia: existenciaViejo }, { transaction: t });
        await productoNuevo.update({ cantidadExistencia: existenciaNuevo }, { transaction: t });
      } else {
        const producto = await Producto.findOne({ where: { id_producto: entrada.id_producto }, transaction: t, lock: t.LOCK.UPDATE });
        const existencia = Math.round(((producto.cantidadExistencia || 0) - entrada.cantidadEntrada + cantidadEntradaNueva) * 100) / 100;
        if (existencia < 0) {
          const err = new Error('Stock insuficiente al aplicar actualización');
          err.errors = ['La actualización dejaría el stock en negativo'];
          err.status = 400;
          throw err;
        }
        await producto.update({ cantidadExistencia: existencia }, { transaction: t });
      }

      await entrada.update({
        id_producto: idProductoNuevo,
        id_contrato: idContratoNuevo,
        id_factura: idFacturaNuevo,
        cantidadEntrada: cantidadEntradaNueva,
        costo: entradaData.costo !== undefined ? entradaData.costo : entrada.costo,
        nota: notaNueva,
        fecha: entradaData.fecha !== undefined ? entradaData.fecha : entrada.fecha,
      }, { transaction: t });

      return entrada;
    });
  } catch (error) {
    console.log("Error en el servicio de actualizar entrada: ", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al actualizar entrada');
      err.errors = [error.message || 'Error interno al actualizar entrada'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Eliminar una entrada
 */
const deleteEntrada = async (id) => {
  try {
    return await sequelize.transaction(async (t) => {
      const entrada = await Entrada.findOne({ where: { id_entrada: id }, transaction: t, lock: t.LOCK.UPDATE });
      if (!entrada) {
        return false;
      }

      const producto = await Producto.findOne({ where: { id_producto: entrada.id_producto }, transaction: t, lock: t.LOCK.UPDATE });
      if (!producto) {
        const err = new Error('Producto no encontrado');
        err.errors = ['Producto no encontrado'];
        err.status = 404;
        throw err;
      }

      const nuevaExistencia = Math.round(((producto.cantidadExistencia || 0) - entrada.cantidadEntrada) * 100) / 100;
      if (nuevaExistencia < 0) {
        const err = new Error('Stock insuficiente al eliminar entrada');
        err.errors = ['La eliminación, no hay suficiente existencia del producto para restar la cantidad de la entrada'];
        err.status = 400;
        throw err;
      }

      await producto.update({ cantidadExistencia: nuevaExistencia }, { transaction: t });
      await entrada.destroy({ transaction: t });
      return true;
    });
  } catch (error) {
    console.error("Error en el servicio de eliminar entrada:", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al eliminar entrada');
      err.errors = [error.message || 'Error interno al eliminar entrada'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

/**
 * Filtrar entradas por múltiples criterios con paginación
 * @param {Object} filters - Objeto con los criterios de filtrado
 * @param {number} [filters.id_producto] - ID del producto
 * @param {number} [filters.id_contrato] - ID del contrato
 * @param {Object} [filters.cantidadEntrada] - Rango de cantidad de entrada
 * @param {number} [filters.cantidadEntrada.min] - Cantidad mínima
 * @param {number} [filters.cantidadEntrada.max] - Cantidad máxima
 * @param {Object} [filters.costo] - Rango de costo
 * @param {number} [filters.costo.min] - Costo mínimo
 * @param {number} [filters.costo.max] - Costo máximo
 * @param {string} [filters.nota] - Nota de la entrada (búsqueda case-insensitive)
 * @param {string} [filters.fecha_desde] - Fecha desde (YYYY-MM-DD)
 * @param {string} [filters.fecha_hasta] - Fecha hasta (YYYY-MM-DD)
 * @param {number} page - Número de página
 * @param {number} limit - Límite de registros por página
 * @returns {Promise<Object>} Objeto con las entradas filtradas y metadatos de paginación
 */
const filterEntradas = async (filters, page = 1, limit = 10) => {
  try {
    const whereClause = {};

    // Filtrar por id_producto
    if (filters.id_producto) {
      whereClause.id_producto = filters.id_producto;
    }

    // Filtrar por id_contrato
    if (filters.id_contrato !== undefined) {
      whereClause.id_contrato = filters.id_contrato;
    }

    // Filtrar por cantidadEntrada
    if (filters.cantidadEntrada) {
      if (filters.cantidadEntrada.min !== undefined) {
        whereClause.cantidadEntrada = { ...whereClause.cantidadEntrada, [Op.gte]: filters.cantidadEntrada.min };
      }
      if (filters.cantidadEntrada.max !== undefined) {
        whereClause.cantidadEntrada = { ...whereClause.cantidadEntrada, [Op.lte]: filters.cantidadEntrada.max };
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

    // Filtrar por fecha
    if (filters.fecha_desde || filters.fecha_hasta) {
      whereClause.fecha = {};
      if (filters.fecha_desde) {
        whereClause.fecha[Op.gte] = new Date(filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        whereClause.fecha[Op.lte] = new Date(filters.fecha_hasta);
      }
    }

    // Calcular offset para la paginación
    const offset = (page - 1) * limit;

    // Primero, contar el total de entradas que coinciden con los filtros
    const totalCount = await Entrada.count({
      where: whereClause
    });

    // Luego, obtener las entradas para la página actual
    const entradas = await Entrada.findAll({
      where: whereClause,
      include: [
        { model: Producto, as: 'producto' },
        { model: Contrato, as: 'contrato' },
        {
          model: Factura,
          as: 'factura',
          include: [
            { model: require('../models/servicio'), as: 'servicio' },
            { model: require('../models/producto'), as: 'productos', through: { attributes: ['cantidad', 'precioVenta', 'costoVenta'] } }
          ]
        }
      ],
      order: [['fecha', 'DESC'], ['id_entrada', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calcular suma_general para cada factura y agregarla
    const entradasConSuma = entradas.map(entrada => {
      if (entrada.factura) {
        const sumaGeneral = facturaService.calcularSumaGeneral(entrada.factura);
        const cargoAdicional = entrada.factura.cargoAdicional || 0;
        entrada.factura.dataValues.suma_general = Math.round((sumaGeneral.suma_general + cargoAdicional) * 100) / 100;
      }
      return entrada;
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      entradas: entradasConSuma,
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
    console.error("Error en el servicio de filtrar entradas:", error);
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al filtrar entradas');
      err.errors = [error.message || 'Error interno al filtrar entradas'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

// Exportar las funciones
module.exports = {
  getAllEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada,
  filterEntradas,
};
