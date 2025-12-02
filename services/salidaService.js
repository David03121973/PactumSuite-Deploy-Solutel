const Salida = require("../models/salida");
const Producto = require("../models/producto");
const Usuario = require("../models/usuario");
const { Op } = require('sequelize');

// Helpers
const isPositiveDecimal = (value) => {
  const n = parseFloat(value);
  return !Number.isNaN(n) && n > 0;
};

const getAll = async () => {
  try {
    return await Salida.findAll({
      include: [
        { model: Producto, as: 'producto' },
        { model: Usuario, as: 'usuario' },
      ],
      order: [['fecha', 'DESC'], ['id_salida', 'DESC']]
    });
  } catch (error) {
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener salidas');
      err.errors = [error.message || 'Error interno al obtener salidas'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

const getById = async (id) => {
  try {
    return await Salida.findOne({
      where: { id_salida: id },
      include: [
        { model: Producto, as: 'producto' },
        { model: Usuario, as: 'usuario' },
      ]
    });
  } catch (error) {
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al obtener salida');
      err.errors = [error.message || 'Error interno al obtener salida'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

const validateCreateOrUpdate = async (data, isUpdate = false) => {
  const errors = [];

  // Campos requeridos en create
  if (!isUpdate) {
    if (data.id_producto === undefined || data.id_producto === null) errors.push('El campo id_producto es obligatorio');
    if (data.id_usuario === undefined || data.id_usuario === null) errors.push('El campo id_usuario es obligatorio');
    if (data.fecha === undefined || data.fecha === null) errors.push('El campo fecha es obligatorio');
    if (data.descripcion === undefined || data.descripcion === null || String(data.descripcion).trim() === '') errors.push('El campo descripcion es obligatorio');
    if (data.cantidad === undefined || data.cantidad === null) errors.push('El campo cantidad es obligatorio');
  }

  // Validaciones de tipos/valores si están presentes
  if (data.id_producto !== undefined && (Number.isNaN(parseInt(data.id_producto, 10)) || parseInt(data.id_producto, 10) <= 0)) errors.push('id_producto debe ser un entero positivo');
  if (data.id_usuario !== undefined && (Number.isNaN(parseInt(data.id_usuario, 10)) || parseInt(data.id_usuario, 10) <= 0)) errors.push('id_usuario debe ser un entero positivo');
  if (data.fecha !== undefined && Number.isNaN(Date.parse(data.fecha))) errors.push('fecha debe ser una fecha válida');
  if (data.descripcion !== undefined && String(data.descripcion).trim() === '') errors.push('descripcion no puede estar vacía');
  if (data.cantidad !== undefined && !isPositiveDecimal(data.cantidad)) errors.push('cantidad debe ser un número decimal positivo');

  // FK existencia
  if (data.id_producto !== undefined && !Number.isNaN(parseInt(data.id_producto, 10)) && parseInt(data.id_producto, 10) > 0) {
    const prod = await Producto.findOne({ where: { id_producto: parseInt(data.id_producto, 10) } });
    if (!prod) errors.push('El producto especificado no existe');
  }
  if (data.id_usuario !== undefined && !Number.isNaN(parseInt(data.id_usuario, 10)) && parseInt(data.id_usuario, 10) > 0) {
    const user = await Usuario.findOne({ where: { id_usuario: parseInt(data.id_usuario, 10) } });
    if (!user) errors.push('El usuario especificado no existe');
  }

  return errors;
};

const create = async (data) => {
  try {
    const errors = await validateCreateOrUpdate(data, false);
    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.errors = errors;
      err.status = 400;
      throw err;
    }

    const idProducto = parseInt(data.id_producto, 10);
    const cantidadSalida = parseFloat(data.cantidad);
    const producto = await Producto.findOne({ where: { id_producto: idProducto } });

    // Validar stock suficiente
    const existenciaActual = parseFloat(producto.cantidadExistencia || 0);
    if (existenciaActual < cantidadSalida) {
      const err = new Error('Cantidad insuficiente en existencia para realizar la salida');
      err.errors = ['Cantidad insuficiente en existencia para realizar la salida'];
      err.status = 400;
      throw err;
    }

    // Crear salida y ajustar stock en una transacción
    return await Salida.sequelize.transaction(async (t) => {
      const nuevaSalida = await Salida.create({
        id_producto: idProducto,
        id_usuario: parseInt(data.id_usuario, 10),
        fecha: new Date(data.fecha),
        descripcion: String(data.descripcion).trim(),
        cantidad: cantidadSalida,
      }, { transaction: t });

      producto.cantidadExistencia = Math.round((existenciaActual - cantidadSalida) * 100) / 100;
      await producto.save({ transaction: t });

      return nuevaSalida;
    });
  } catch (error) {
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al crear salida');
      err.errors = [error.message || 'Error interno al crear salida'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

const update = async (id, data) => {
  try {
    const salida = await Salida.findOne({ where: { id_salida: id } });
    if (!salida) return null;

    const errors = await validateCreateOrUpdate(data, true);
    if (errors.length > 0) {
      const err = new Error(errors.join(', '));
      err.errors = errors;
      err.status = 400;
      throw err;
    }

    return await Salida.sequelize.transaction(async (t) => {
      const salidaAnterior = await Salida.findOne({ where: { id_salida: id }, transaction: t, lock: t.LOCK.UPDATE });
      const productoAnterior = await Producto.findOne({ where: { id_producto: salidaAnterior.id_producto }, transaction: t, lock: t.LOCK.UPDATE });

      const idProductoNuevo = data.id_producto !== undefined ? parseInt(data.id_producto, 10) : salidaAnterior.id_producto;
      const cantidadNueva = data.cantidad !== undefined ? Math.round(parseFloat(data.cantidad) * 100) / 100 : salidaAnterior.cantidad;

      if (Number.isNaN(idProductoNuevo) || Number.isNaN(cantidadNueva)) {
        const err = new Error('Datos inválidos para actualizar la salida');
        err.errors = ['Datos inválidos para actualizar la salida'];
        err.status = 400;
        throw err;
      }

      if (idProductoNuevo === salidaAnterior.id_producto) {
        // Misma referencia de producto: aplicar delta
        const delta = Math.round((cantidadNueva - salidaAnterior.cantidad) * 100) / 100;
        if (delta > 0) {
          // Se necesita disminuir stock adicional
          if (productoAnterior.cantidadExistencia < delta) {
            const err = new Error('Cantidad insuficiente en existencia para aumentar la salida');
            err.errors = ['Cantidad insuficiente en existencia para aumentar la salida'];
            err.status = 400;
            throw err;
          }
          productoAnterior.cantidadExistencia = Math.round((productoAnterior.cantidadExistencia - delta) * 100) / 100;
        } else if (delta < 0) {
          // Se libera stock
          productoAnterior.cantidadExistencia = Math.round((productoAnterior.cantidadExistencia + (-delta)) * 100) / 100;
        }
        await productoAnterior.save({ transaction: t });
      } else {
        // Cambió el producto: devolver cantidad al anterior y restar del nuevo
        productoAnterior.cantidadExistencia = Math.round((productoAnterior.cantidadExistencia + salidaAnterior.cantidad) * 100) / 100;
        await productoAnterior.save({ transaction: t });

        const productoNuevo = await Producto.findOne({ where: { id_producto: idProductoNuevo }, transaction: t, lock: t.LOCK.UPDATE });
        if (!productoNuevo) {
          const err = new Error('El nuevo producto especificado no existe');
          err.errors = ['El nuevo producto especificado no existe'];
          err.status = 400;
          throw err;
        }
        if (productoNuevo.cantidadExistencia < cantidadNueva) {
          const err = new Error('Cantidad insuficiente en existencia para el nuevo producto');
          err.errors = ['Cantidad insuficiente en existencia para el nuevo producto'];
          err.status = 400;
          throw err;
        }
        productoNuevo.cantidadExistencia = Math.round((productoNuevo.cantidadExistencia - cantidadNueva) * 100) / 100;
        await productoNuevo.save({ transaction: t });
      }

      const updateData = {};
      if (data.id_producto !== undefined) updateData.id_producto = idProductoNuevo;
      if (data.id_usuario !== undefined) updateData.id_usuario = parseInt(data.id_usuario, 10);
      if (data.fecha !== undefined) updateData.fecha = new Date(data.fecha);
      if (data.descripcion !== undefined) updateData.descripcion = String(data.descripcion).trim();
      if (data.cantidad !== undefined) updateData.cantidad = cantidadNueva;

      await salida.update(updateData, { transaction: t });
      return await Salida.findOne({ where: { id_salida: id }, include: [{ model: Producto, as: 'producto' }, { model: Usuario, as: 'usuario' }], transaction: t });
    });
  } catch (error) {
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al actualizar salida');
      err.errors = [error.message || 'Error interno al actualizar salida'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

const remove = async (id) => {
  try {
    const salida = await Salida.findOne({ where: { id_salida: id } });
    if (!salida) return false;

    return await Salida.sequelize.transaction(async (t) => {
      const producto = await Producto.findOne({ where: { id_producto: salida.id_producto }, transaction: t, lock: t.LOCK.UPDATE });
      producto.cantidadExistencia = Math.round((parseFloat(producto.cantidadExistencia || 0) + parseFloat(salida.cantidad || 0)) * 100) / 100;
      await producto.save({ transaction: t });

      await salida.destroy({ transaction: t });
      return true;
    });
  } catch (error) {
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al eliminar salida');
      err.errors = [error.message || 'Error interno al eliminar salida'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

// Filtrado con paginación por descripcion y rango de fechas
const filter = async (filters, page = 1, limit = 10) => {
  try {
    const whereClause = {};
    const include = [];

    if (filters.descripcion) {
      whereClause.descripcion = { [Op.iLike]: `%${String(filters.descripcion).toLowerCase()}%` };
    }
    if (filters.fecha_desde || filters.fecha_hasta) {
      whereClause.fecha = {};
      if (filters.fecha_desde) whereClause.fecha[Op.gte] = new Date(filters.fecha_desde);
      if (filters.fecha_hasta) whereClause.fecha[Op.lte] = new Date(filters.fecha_hasta);
    }
    if (filters.cantidad && (filters.cantidad.min !== undefined || filters.cantidad.max !== undefined)) {
      whereClause.cantidad = {};
      if (filters.cantidad.min !== undefined) whereClause.cantidad[Op.gte] = parseFloat(filters.cantidad.min);
      if (filters.cantidad.max !== undefined) whereClause.cantidad[Op.lte] = parseFloat(filters.cantidad.max);
    }

    // Filtro por nombre de producto
    if (filters.producto_nombre) {
      include.push({
        model: Producto,
        as: 'producto',
        where: { nombre: { [Op.iLike]: `%${String(filters.producto_nombre).toLowerCase()}%` } },
      });
    } else {
      include.push({ model: Producto, as: 'producto' });
    }

    // Filtro por nombre de usuario
    if (filters.usuario_nombre) {
      include.push({
        model: Usuario,
        as: 'usuario',
        where: { nombre: { [Op.iLike]: `%${String(filters.usuario_nombre).toLowerCase()}%` } },
      });
    } else {
      include.push({ model: Usuario, as: 'usuario' });
    }

    const offset = (page - 1) * limit;

    const totalCount = await Salida.count({ where: whereClause, include });

    const salidas = await Salida.findAll({
      where: whereClause,
      include,
      order: [['fecha', 'DESC'], ['id_salida', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      salidas,
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
    if (!error.errors || !Array.isArray(error.errors)) {
      const err = new Error(error.message || 'Error interno al filtrar salidas');
      err.errors = [error.message || 'Error interno al filtrar salidas'];
      err.status = error.status || 500;
      throw err;
    }
    throw error;
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  filter,
};


