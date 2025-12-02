const salidaService = require('../services/salidaService');

const getSalidas = async (req, res) => {
  try {
    const salidas = await salidaService.getAll();
    return res.status(200).json(salidas || []);
  } catch (error) {
    console.error('Error al obtener salidas:', error);
    return res.status(error.status || 500).json({ errors: error.errors || ['Error al obtener salidas'] });
  }
};

const getSalidaById = async (req, res) => {
  const { id } = req.params;
  try {
    const salida = await salidaService.getById(id);
    if (!salida) return res.status(404).json({ errors: ['Salida no encontrada'] });
    return res.status(200).json(salida);
  } catch (error) {
    console.error('Error al obtener salida:', error);
    return res.status(error.status || 500).json({ errors: error.errors || ['Error al obtener salida'] });
  }
};

const createSalida = async (req, res) => {
  const { id_producto, id_usuario, fecha, descripcion, cantidad } = req.body;
  const errors = [];

  if (id_producto === undefined) errors.push('El campo id_producto es obligatorio');
  if (id_usuario === undefined) errors.push('El campo id_usuario es obligatorio');
  if (fecha === undefined) errors.push('El campo fecha es obligatorio');
  if (descripcion === undefined || String(descripcion).trim() === '') errors.push('El campo descripcion es obligatorio');
  if (cantidad === undefined) errors.push('El campo cantidad es obligatorio');

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const nueva = await salidaService.create({ id_producto, id_usuario, fecha, descripcion, cantidad });
    return res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear salida:', error);
    return res.status(error.status || 500).json({ errors: error.errors || ['Error al crear salida'] });
  }
};

const updateSalida = async (req, res) => {
  const { id } = req.params;
  const { id_producto, id_usuario, fecha, descripcion, cantidad } = req.body;

  try {
    const actualizada = await salidaService.update(id, { id_producto, id_usuario, fecha, descripcion, cantidad });
    if (!actualizada) return res.status(404).json({ errors: ['Salida no encontrada'] });
    return res.status(200).json(actualizada);
  } catch (error) {
    console.error('Error al actualizar salida:', error);
    return res.status(error.status || 500).json({ errors: error.errors || ['Error al actualizar salida'] });
  }
};

const deleteSalida = async (req, res) => {
  const { id } = req.params;
  try {
    const ok = await salidaService.remove(id);
    if (!ok) return res.status(404).json({ errors: ['Salida no encontrada'] });
    return res.status(200).json({ message: 'Salida eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar salida:', error);
    return res.status(error.status || 500).json({ errors: error.errors || ['Error al eliminar salida'] });
  }
};

const filterSalidas = async (req, res) => {
  try {
    const filters = req.body || {};
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    if (page < 1) return res.status(400).json({ errors: ['El número de página debe ser mayor a 0'] });
    if (limit < 1 || limit > 100) return res.status(400).json({ errors: ['El límite debe estar entre 1 y 100'] });

    const result = await salidaService.filter(filters, page, limit);
    return res.status(200).json({ data: result.salidas, pagination: result.pagination });
  } catch (error) {
    console.error('Error al filtrar salidas:', error);
    return res.status(error.status || 500).json({ errors: error.errors || ['Error al filtrar salidas'] });
  }
};

module.exports = {
  getSalidas,
  getSalidaById,
  createSalida,
  updateSalida,
  deleteSalida,
  filterSalidas,
};


