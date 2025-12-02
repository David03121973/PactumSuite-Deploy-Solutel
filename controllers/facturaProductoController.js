// controllers/facturaProductoController.js
const facturaProductoService = require('../services/facturaProductoService');

const getFacturaProductos = async (req, res) => {
  try {
    const facturaProductos = await facturaProductoService.getAllFacturaProductos();
    return res.status(200).json(facturaProductos || []);
  } catch (error) {
    console.error('Error al obtener relaciones factura-producto:', error);
    return res.status(500).json({ errors: ["Error al obtener relaciones factura-producto"] });
  }
};

const getFacturaProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const facturaProducto = await facturaProductoService.getFacturaProductoById(id);
    if (!facturaProducto) return res.status(404).json({ errors: ["Relación factura-producto no encontrada"] });
    return res.status(200).json(facturaProducto);
  } catch (error) {
    console.error('Error al obtener la relación factura-producto:', error);
    return res.status(500).json({ errors: ["Error al obtener la relación factura-producto"] });
  }
};

const createFacturaProducto = async (req, res) => {
  const { id_factura, id_producto, cantidad } = req.body || {};
  const errors = [];

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

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const result = await facturaProductoService.createFacturaProducto({
      id_factura, id_producto, cantidad
    });
    if (result.errors) return res.status(400).json({ errors: result.errors });
    const nueva = result.data;
    return res.status(201).json({
      data: {
        id_factura_producto: nueva.id_factura_producto,
        id_factura: nueva.id_factura,
        id_producto: nueva.id_producto,
        cantidad: nueva.cantidad,
      }
    });
  } catch (error) {
    console.error('Error al crear la relación factura-producto:', error);
    return res.status(500).json({ errors: ["Error al crear la relación factura-producto"] });
  }
};

const updateFacturaProducto = async (req, res) => {
  const { id } = req.params;
  const { id_factura, id_producto, cantidad } = req.body || {};
  const errors = [];

  if (id_factura !== undefined) {
    const n = parseInt(id_factura, 10);
    if (Number.isNaN(n) || n <= 0) errors.push("id_factura debe ser un entero positivo");
  }
  if (id_producto !== undefined) {
    const n = parseInt(id_producto, 10);
    if (Number.isNaN(n) || n <= 0) errors.push("id_producto debe ser un entero positivo");
  }
  if (cantidad !== undefined) {
    const n = parseInt(cantidad, 10);
    if (Number.isNaN(n) || n < 0) errors.push("cantidad debe ser un entero mayor o igual a 0");
  }
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const facturaProducto = await facturaProductoService.getFacturaProductoById(id);
    if (!facturaProducto) return res.status(404).json({ errors: ["Relación factura-producto no encontrada"] });

    const updated = await facturaProductoService.updateFacturaProducto(id, req.body || {});
    if (updated && updated.errors) return res.status(400).json({ errors: updated.errors });
    if (!updated || !updated.data) return res.status(500).json({ errors: ["No se pudo actualizar la relación factura-producto"] });
    const refreshed = await facturaProductoService.getFacturaProductoById(id);
    return res.status(200).json(refreshed);
  } catch (error) {
    console.error('Error al actualizar la relación factura-producto:', error);
    return res.status(500).json({ errors: ["Error al actualizar la relación factura-producto"] });
  }
};

const deleteFacturaProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const facturaProducto = await facturaProductoService.getFacturaProductoById(id);
    if (!facturaProducto) return res.status(404).json({ errors: ["Relación factura-producto no encontrada"] });
    const ok = await facturaProductoService.deleteFacturaProducto(id);
    if (!ok) return res.status(500).json({ errors: ["Error al eliminar la relación factura-producto"] });
    return res.status(200).json({ 
      facturaProducto: { 
        id_factura_producto: facturaProducto.id_factura_producto,
        id_factura: facturaProducto.id_factura,
        id_producto: facturaProducto.id_producto
      } 
    });
  } catch (error) {
    console.error('Error al eliminar la relación factura-producto:', error);
    return res.status(500).json({ errors: ["Error al eliminar la relación factura-producto"] });
  }
};

const filterFacturaProductos = async (req, res) => {
  try {
    const page = parseInt(req.params.page, 10) || 1;
    const limit = parseInt(req.params.limit, 10) || 10;
    if (page < 1) return res.status(400).json({ errors: ["El número de página debe ser mayor a 0"] });
    if (limit < 1 || limit > 100) return res.status(400).json({ errors: ["El límite debe estar entre 1 y 100"] });

    const filters = req.body || {};
    const result = await facturaProductoService.filterFacturaProductos(filters, page, limit);
    return res.status(200).json({ data: result.facturaProductos, pagination: result.pagination });
  } catch (error) {
    console.error('Error al filtrar relaciones factura-producto:', error);
    return res.status(500).json({ errors: ["Error al filtrar relaciones factura-producto"] });
  }
};

module.exports = {
  getFacturaProductos,
  getFacturaProductoById,
  createFacturaProducto,
  updateFacturaProducto,
  deleteFacturaProducto,
  filterFacturaProductos,
};
