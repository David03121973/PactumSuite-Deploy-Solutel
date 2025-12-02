// controllers/servicioController.js
const servicioService = require('../services/servicioService');

/**
 * Obtener todos los servicios
 */
const getServicios = async (req, res) => {
    try {
        const servicios = await servicioService.getAllServicios();
        if (!servicios || servicios.length === 0) {
            return res.status(200).json([]);
        }
        const withTotals = servicios.map((s) => {
            const plain = s.toJSON ? s.toJSON() : s;
            const cantidad = Number(plain.cantidad || 1);
            const importe = Number(plain.importe || 0);
            return { ...plain, importe_total: cantidad * importe };
        });
        return res.status(200).json(withTotals);
    } catch (error) {
        console.error("Error al obtener los servicios:", error);
        return res.status(500).json({ errors: ["Error al obtener los servicios"] });
    }
};

/**
 * Obtener un servicio por ID
 */
const getServicioById = async (req, res) => {
    const { id } = req.params;
    try {
        const servicio = await servicioService.getServicioById(id);
        if (!servicio) {
            return res.status(404).json({ errors: ["Servicio no encontrado"] });
        }
        const plain = servicio.toJSON ? servicio.toJSON() : servicio;
        const cantidad = Number(plain.cantidad || 1);
        const importe = Number(plain.importe || 0);
        return res.status(200).json({ ...plain, importe_total: cantidad * importe });
    } catch (error) {
        console.error("Error al obtener el servicio:", error);
        return res.status(500).json({ errors: ["Error al obtener el servicio"] });
    }
};

/**
 * Crear un nuevo servicio
 */
const createServicio = async (req, res) => {
  const { descripcion, importe, cantidad, unidadMedida, id_factura } = req.body;
  const errors = [];

  // Validaciones básicas
  if (!descripcion || importe === undefined || id_factura === undefined || cantidad === undefined || !unidadMedida) {
    errors.push("Los campos obligatorios son: descripcion, importe, cantidad, unidadMedida, id_factura");
  }

  if (descripcion && (descripcion.length < 2 || descripcion.length > 255)) {
    errors.push("La descripción debe tener entre 2 y 255 caracteres");
  }

  if (importe !== undefined) {
    const importeNum = parseFloat(importe);
    if (isNaN(importeNum)) {
      errors.push("El importe debe ser un número válido");
    } else if (importeNum < 0) {
      errors.push("El importe no puede ser negativo");
    } else if (importeNum > 999999.99) {
      errors.push("El importe no puede ser mayor a 999,999.99");
    }
  }

  if (cantidad !== undefined) {
    const cantidadNum = parseInt(cantidad, 10);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      errors.push("La cantidad debe ser un entero mayor o igual a 1");
    }
  }

  // Validar unidadMedida
  if (unidadMedida) {
    if (unidadMedida.length < 1 || unidadMedida.length > 50) {
      errors.push("La unidad de medida debe tener entre 1 y 50 caracteres");
    }
  }

  // Validar id_factura numérico y presente
  if (id_factura === undefined) {
    errors.push("El id_factura es obligatorio");
  } else {
    const idFacturaNum = parseInt(id_factura, 10);
    if (Number.isNaN(idFacturaNum) || idFacturaNum <= 0) {
      errors.push("El id_factura debe ser un entero positivo");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Enforce 1:1 Servicio-Factura: no permitir dos servicios con la misma factura
    const exists = await servicioService.servicioExistsForFactura(id_factura);
    if (exists) {
      return res.status(400).json({ errors: ["Ya existe un servicio asociado a esta factura"] });
    }

    // Validar que la factura exista
    const facturaExiste = await servicioService.facturaExists(parseInt(id_factura, 10));
    if (!facturaExiste) {
      return res.status(400).json({ errors: ["La factura especificada no existe"] });
    }

    const newServicio = await servicioService.createServicio({
      descripcion,
      importe: parseFloat(importe),
      cantidad: cantidad !== undefined ? parseInt(cantidad, 10) : 1,
      unidadMedida,
      id_factura,
    });

    // Devolver el creado; el include de factura lo maneja el GET por id si se requiere
    return res.status(201).json({
      data: {
        id_servicio: newServicio.id_servicio,
        descripcion: newServicio.descripcion,
        importe: newServicio.importe,
        cantidad: newServicio.cantidad,
        unidadMedida: newServicio.unidadMedida,
        id_factura: newServicio.id_factura,
        importe_total: Number(newServicio.cantidad || 1) * Number(newServicio.importe || 0),
      }
    });
  } catch (error) {
    console.error("Error al crear el servicio:", error);
    return res.status(500).json({ errors: ["Error al crear el servicio"] });
  }
};

/**
 * Actualizar un servicio
 */
const updateServicio = async (req, res) => {
  const { id } = req.params;
  const { descripcion, importe, cantidad, unidadMedida, id_factura } = req.body;
  const errors = [];

  if (!descripcion && importe === undefined && cantidad === undefined && unidadMedida === undefined && id_factura === undefined) {
    return res.status(400).json({ errors: ["Debe proporcionar al menos un campo para actualizar"] });
  }

  if (descripcion) {
    if (descripcion.length < 2 || descripcion.length > 255) {
      errors.push("La descripción debe tener entre 2 y 255 caracteres");
    }
  }

  if (importe !== undefined) {
    const importeNum = parseFloat(importe);
    if (isNaN(importeNum)) {
      errors.push("El importe debe ser un número válido");
    } else if (importeNum < 0) {
      errors.push("El importe no puede ser negativo");
    } else if (importeNum > 999999.99) {
      errors.push("El importe no puede ser mayor a 999,999.99");
    }
  }

  if (cantidad !== undefined) {
    const cantidadNum = parseInt(cantidad, 10);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      errors.push("La cantidad debe ser un entero mayor o igual a 1");
    }
  }

  // Validar unidadMedida si se proporciona
  if (unidadMedida !== undefined) {
    if (unidadMedida.length < 1 || unidadMedida.length > 50) {
      errors.push("La unidad de medida debe tener entre 1 y 50 caracteres");
    }
  }

  if (id_factura !== undefined) {
    // No permitir reasignar a una factura que ya tiene servicio distinto
    try {
      const exists = await servicioService.servicioExistsForFactura(id_factura);
      const current = await servicioService.getServicioById(id);
      if (exists && current && current.id_factura !== parseInt(id_factura, 10)) {
        return res.status(400).json({ errors: ["Ya existe un servicio asociado a esta factura"] });
      }
      const facturaExiste = await servicioService.facturaExists(parseInt(id_factura, 10));
      if (!facturaExiste) {
        return res.status(400).json({ errors: ["La factura especificada no existe"] });
      }
    } catch (e) {
      console.error("Error validando id_factura en actualización:", e);
      return res.status(500).json({ errors: ["Error al actualizar el servicio"] });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const servicio = await servicioService.getServicioById(id);
    if (!servicio) {
      return res.status(404).json({ errors: ["Servicio no encontrado"] });
    }

    const updateData = {};
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (importe !== undefined) updateData.importe = parseFloat(importe);
    if (cantidad !== undefined) updateData.cantidad = parseInt(cantidad, 10);
    if (unidadMedida !== undefined) updateData.unidadMedida = unidadMedida;
    if (id_factura !== undefined) updateData.id_factura = parseInt(id_factura, 10);

    const updated = await servicioService.updateServicio(id, updateData);
    if (!updated) {
      return res.status(500).json({ errors: ["No se pudo actualizar el servicio"] });
    }

    const updatedServicio = await servicioService.getServicioById(id);
    const plain = updatedServicio && updatedServicio.toJSON ? updatedServicio.toJSON() : updatedServicio;
    const cantidadCalc = Number((plain && plain.cantidad) || 1);
    const importeCalc = Number((plain && plain.importe) || 0);
    return res.status(200).json({ ...plain, importe_total: cantidadCalc * importeCalc });
  } catch (error) {
    console.error("Error al actualizar el servicio:", error);
    return res.status(500).json({ errors: ["Error al actualizar el servicio"] });
  }
};

/**
 * Eliminar un servicio
 */
const deleteServicio = async (req, res) => {
  const { id } = req.params;
  try {
    const servicio = await servicioService.getServicioById(id);
    if (!servicio) {
      return res.status(404).json({ errors: ["Servicio no encontrado"] });
    }

    const result = await servicioService.deleteServicio(id);
    if (!result) {
      return res.status(500).json({ errors: ["Error al eliminar el servicio"] });
    }

    return res.status(200).json({
      servicio: {
        id_servicio: servicio.id_servicio,
        descripcion: servicio.descripcion,
        importe_total: Number(servicio.cantidad || 1) * Number(servicio.importe || 0),
      }
    });
  } catch (error) {
    console.error("Error al eliminar el servicio:", error);
    return res.status(500).json({ errors: ["Error al eliminar el servicio"] });
  }
};

/**
 * Filtrar servicios por descripción (sin paginación)
 */
const filterServicios = async (req, res) => {
  try {
    const { descripcion, id_factura } = req.body || {};
    const servicios = await servicioService.filterServicios(descripcion || "", id_factura);
    const withTotals = (servicios || []).map((s) => {
      const plain = s.toJSON ? s.toJSON() : s;
      const cantidad = Number(plain.cantidad || 1);
      const importe = Number(plain.importe || 0);
      return { ...plain, importe_total: cantidad * importe };
    });
    return res.status(200).json(withTotals);
  } catch (error) {
    console.error('Error en el controlador al filtrar servicios:', error);
    return res.status(500).json({ errors: ["Error al filtrar servicios"] });
  }
};

module.exports = {
    getServicios,
    getServicioById,
    createServicio,
    updateServicio,
    deleteServicio,
    filterServicios,
};


