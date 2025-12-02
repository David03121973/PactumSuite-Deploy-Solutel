// services/facturaProductoService.js

const { Op } = require('sequelize');
const sequelize = require('../helpers/database');
const FacturaProducto = require('../models/factura_producto');
const Factura = require('../models/factura');
const Producto = require('../models/producto');

const baseIncludes = () => ([
  { model: Factura, as: 'factura' },
  { model: Producto, as: 'producto' },
]);

const getAllFacturaProductos = async () => {
  try {
    return await FacturaProducto.findAll({
      include: baseIncludes(),
      order: [["id_factura_producto", "DESC"]],
    });
  } catch (error) {
    console.error('Error en getAllFacturaProductos:', error);
    throw error;
  }
};

const getFacturaProductoById = async (id) => {
  try {
    return await FacturaProducto.findOne({
      where: { id_factura_producto: id },
      include: baseIncludes(),
    });
  } catch (error) {
    console.error('Error en getFacturaProductoById:', error);
    throw error;
  }
};

const createFacturaProducto = async (data) => {
  try {
    const errors = [];
    const { id_factura, id_producto, cantidad } = data || {};

    if (id_factura === undefined || id_producto === undefined || cantidad === undefined) {
      errors.push("Campos obligatorios: id_factura, id_producto, cantidad");
    }

    const idFacturaNum = parseInt(id_factura, 10);
    if (Number.isNaN(idFacturaNum) || idFacturaNum <= 0) {
      errors.push("id_factura debe ser un entero positivo");
    }

    const idProductoNum = parseInt(id_producto, 10);
    if (Number.isNaN(idProductoNum) || idProductoNum <= 0) {
      errors.push("id_producto debe ser un entero positivo");
    }

    const cantidadNum = parseFloat(cantidad);
    if (Number.isNaN(cantidadNum) || cantidadNum < 0) {
      errors.push("cantidad debe ser un número decimal mayor o igual a 0");
    }

    // Validar existencia de FK
    if (!Number.isNaN(idFacturaNum) && idFacturaNum > 0) {
      const facturaOk = await facturaExists(idFacturaNum);
      if (!facturaOk) errors.push("La factura especificada no existe");
    }
    if (!Number.isNaN(idProductoNum) && idProductoNum > 0) {
      const productoOk = await productoExists(idProductoNum);
      if (!productoOk) errors.push("El producto especificado no existe");
    }

    // Validar que no exista ya la relación
    if (errors.length === 0) {
      const existing = await FacturaProducto.findOne({
        where: { id_factura: idFacturaNum, id_producto: idProductoNum }
      });
      if (existing) {
        errors.push("Ya existe una relación entre esta factura y este producto");
      }
    }

    if (errors.length > 0) {
      return { errors };
    }

    const nueva = await FacturaProducto.create({
      id_factura: idFacturaNum,
      id_producto: idProductoNum,
      cantidad: cantidadNum,
    });

    return { data: nueva };
  } catch (error) {
    console.error('Error en createFacturaProducto:', error);
    throw error;
  }
};

const updateFacturaProducto = async (id, data) => {
  try {
    const facturaProducto = await FacturaProducto.findOne({ where: { id_factura_producto: id } });
    if (!facturaProducto) return { errors: ["Relación factura-producto no encontrada"] };

    const errors = [];
    const { id_factura, id_producto, cantidad } = data || {};

    const updateData = {};
    if (id_factura !== undefined) {
      const n = parseInt(id_factura, 10);
      if (Number.isNaN(n) || n <= 0) errors.push("id_factura debe ser un entero positivo");
      else {
        const ok = await facturaExists(n);
        if (!ok) errors.push("La factura especificada no existe");
        else updateData.id_factura = n;
      }
    }
    if (id_producto !== undefined) {
      const n = parseInt(id_producto, 10);
      if (Number.isNaN(n) || n <= 0) errors.push("id_producto debe ser un entero positivo");
      else {
        const ok = await productoExists(n);
        if (!ok) errors.push("El producto especificado no existe");
        else updateData.id_producto = n;
      }
    }
    if (cantidad !== undefined) {
      const n = parseInt(cantidad, 10);
      if (Number.isNaN(n) || n < 0) errors.push("cantidad debe ser un entero mayor o igual a 0");
      else updateData.cantidad = n;
    }

    // Validar que no exista ya la nueva relación (si se está cambiando)
    if (errors.length === 0 && (id_factura !== undefined || id_producto !== undefined)) {
      const newFacturaId = id_factura !== undefined ? parseInt(id_factura, 10) : facturaProducto.id_factura;
      const newProductoId = id_producto !== undefined ? parseInt(id_producto, 10) : facturaProducto.id_producto;
      
      const existing = await FacturaProducto.findOne({
        where: { 
          id_factura: newFacturaId, 
          id_producto: newProductoId,
          id_factura_producto: { [Op.ne]: id }
        }
      });
      if (existing) {
        errors.push("Ya existe una relación entre esta factura y este producto");
      }
    }

    if (errors.length > 0) return { errors };

    await facturaProducto.update(updateData);
    return { data: facturaProducto };
  } catch (error) {
    console.error('Error en updateFacturaProducto:', error);
    throw error;
  }
};

const deleteFacturaProducto = async (id) => {
  try {
    const facturaProducto = await FacturaProducto.findOne({ where: { id_factura_producto: id } });
    if (!facturaProducto) return false;
    await facturaProducto.destroy();
    return true;
  } catch (error) {
    console.error('Error en deleteFacturaProducto:', error);
    throw error;
  }
};

const filterFacturaProductos = async (filters, page = 1, limit = 10) => {
  try {
    const where = {};
    const include = baseIncludes();

    // Referencias a includes para aplicar filtros relacionados
    const facturaInclude = include.find(i => i.as === 'factura');
    const productoInclude = include.find(i => i.as === 'producto');

    if (filters.id_factura) {
      const idFactura = parseInt(filters.id_factura, 10);
      if (!Number.isNaN(idFactura)) where.id_factura = idFactura;
    }

    if (filters.id_producto) {
      const idProducto = parseInt(filters.id_producto, 10);
      if (!Number.isNaN(idProducto)) where.id_producto = idProducto;
    }

    // Filtro por nombre de producto (case-insensitive)
    if (filters.nombre_producto && productoInclude) {
      productoInclude.where = productoInclude.where || {};
      productoInclude.where.nombre = { [Op.iLike]: `%${String(filters.nombre_producto).trim()}%` };
      productoInclude.required = true;
    }

    // Filtro por código de producto (case-insensitive)
    if (filters.codigo_producto && productoInclude) {
      productoInclude.where = productoInclude.where || {};
      productoInclude.where.codigo = { [Op.iLike]: `%${String(filters.codigo_producto).trim()}%` };
      productoInclude.required = true;
    }

    // Filtro por número consecutivo exacto de factura
    if (filters.num_consecutivo && facturaInclude) {
      const num = parseInt(filters.num_consecutivo, 10);
      if (!Number.isNaN(num)) {
        facturaInclude.where = facturaInclude.where || {};
        facturaInclude.where.num_consecutivo = num;
        facturaInclude.required = true;
      }
    }

    // Filtro por estado de la factura
    if (filters.estado && facturaInclude) {
      facturaInclude.where = facturaInclude.where || {};
      facturaInclude.where.estado = String(filters.estado);
      facturaInclude.required = true;
    }

    // Filtro por rango de fechas de la factura
    if ((filters.fecha_desde || filters.fecha_hasta) && facturaInclude) {
      facturaInclude.where = facturaInclude.where || {};
      facturaInclude.where.fecha = {};
      if (filters.fecha_desde) facturaInclude.where.fecha[Op.gte] = new Date(filters.fecha_desde);
      if (filters.fecha_hasta) facturaInclude.where.fecha[Op.lte] = new Date(filters.fecha_hasta);
      facturaInclude.required = true;
    }

    // Filtro por precio mínimo y máximo calculado por ítem: cantidad * precioVenta
    if (filters.precio_min || filters.precio_max) {
      const hasMin = filters.precio_min !== undefined && filters.precio_min !== null && String(filters.precio_min) !== '';
      const hasMax = filters.precio_max !== undefined && filters.precio_max !== null && String(filters.precio_max) !== '';
      const pmin = hasMin ? parseFloat(filters.precio_min) : undefined;
      const pmax = hasMax ? parseFloat(filters.precio_max) : undefined;

      if ((hasMin && !Number.isNaN(pmin)) || (hasMax && !Number.isNaN(pmax))) {
        const totalExpr = sequelize.literal('("factura_producto"."precioVenta" * "factura_producto"."cantidad")');
        where[Op.and] = where[Op.and] || [];

        if (hasMin && hasMax && !Number.isNaN(pmin) && !Number.isNaN(pmax)) {
          where[Op.and].push(sequelize.where(totalExpr, { [Op.between]: [pmin, pmax] }));
        } else if (hasMin && !Number.isNaN(pmin)) {
          where[Op.and].push(sequelize.where(totalExpr, { [Op.gte]: pmin }));
        } else if (hasMax && !Number.isNaN(pmax)) {
          where[Op.and].push(sequelize.where(totalExpr, { [Op.lte]: pmax }));
        }
      }
    }

    const offset = (page - 1) * limit;

    const totalCount = await FacturaProducto.count({ 
      where, 
      include,
      distinct: true,
      col: 'id_factura_producto'
    });

    const facturaProductos = await FacturaProducto.findAll({
      where,
      include,
      order: [["id_factura_producto", "DESC"]],
      limit: parseInt(limit, 10),
      offset,
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      facturaProductos,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: parseInt(page, 10),
        limit: parseInt(limit, 10),
        hasNextPage,
        hasPrevPage,
      },
    };
  } catch (error) {
    console.error('Error en filterFacturaProductos:', error);
    throw error;
  }
};

// Validaciones de existencia de FK
const facturaExists = async (idFactura) => {
  try {
    const f = await Factura.findOne({ where: { id_factura: idFactura } });
    return f !== null;
  } catch (error) {
    console.error('Error en facturaExists:', error);
    throw error;
  }
};

const productoExists = async (idProducto) => {
  try {
    const p = await Producto.findOne({ where: { id_producto: idProducto } });
    return p !== null;
  } catch (error) {
    console.error('Error en productoExists:', error);
    throw error;
  }
};

module.exports = {
  getAllFacturaProductos,
  getFacturaProductoById,
  createFacturaProducto,
  updateFacturaProducto,
  deleteFacturaProducto,
  filterFacturaProductos,
  facturaExists,
  productoExists,
};
