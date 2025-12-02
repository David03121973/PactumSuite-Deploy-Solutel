// controllers/entradaController.js

const entradaService = require('../services/entradaService');

/**
 * Obtener todas las entradas
 */
const getEntradas = async (req, res) => {
  try {
    const entradas = await entradaService.getAllEntradas();
    if (!entradas || entradas.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(entradas);
  } catch (error) {
    console.error("Error al obtener las entradas:", error);
    return res.status(500).json({ errors: ["Error al obtener las entradas"] });
  }
};

/**
 * Obtener una entrada por ID
 */
const getEntradaById = async (req, res) => {
  const { id } = req.params;
  try {
    const entrada = await entradaService.getEntradaById(id);
    if (!entrada) {
      return res.status(404).json({ errors: ["Entrada no encontrada"] });
    }
    return res.status(200).json(entrada);
  } catch (error) {
    console.error("Error al obtener la entrada:", error);
    return res.status(500).json({ errors: ["Error al obtener la entrada"] });
  }
};

/**
 * Crear una nueva entrada
 */
const createEntrada = async (req, res) => {
  const { id_producto, id_contrato, id_factura, cantidadEntrada, costo, nota, fecha } = req.body;
  const errors = [];

  // Validaciones básicas
  if (!id_producto) {
    errors.push("El campo id_producto es obligatorio");
  }
  if (cantidadEntrada === undefined || cantidadEntrada === null) {
    errors.push("El campo cantidadEntrada es obligatorio");
  } else if (isNaN(cantidadEntrada) || cantidadEntrada <= 0) {
    errors.push("El campo cantidadEntrada debe ser un número mayor a 0");
  }
  if (costo !== undefined && costo !== null) {
    if (isNaN(costo) || costo < 0) {
      errors.push("El campo costo debe ser un número mayor o igual a 0");
    }
  }
  if (!fecha) {
    errors.push("El campo fecha es obligatorio");
  } else if (isNaN(Date.parse(fecha))) {
    errors.push("El campo fecha debe ser una fecha válida");
  }

  // Reglas: si se pasa uno entre id_factura/id_contrato, deben venir ambos; si ambos son null, nota obligatoria
  const hasFactura = id_factura !== undefined && id_factura !== null;
  const hasContrato = id_contrato !== undefined && id_contrato !== null;
  if (hasFactura !== hasContrato) {
    errors.push("Si se envía id_factura o id_contrato, ambos deben estar presentes");
  }
  if (!hasFactura && !hasContrato) {
    if (!nota || String(nota).trim() === '') {
      errors.push("Cuando no hay factura ni contrato, la nota es obligatorio");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newEntrada = await entradaService.createEntrada({
      id_producto,
      id_contrato: hasContrato ? id_contrato : null,
      id_factura: hasFactura ? id_factura : null,
      cantidadEntrada,
      costo: costo !== undefined ? costo : 0,
      nota: nota || null,
      fecha,
    });
    return res.status(201).json(newEntrada);
  } catch (error) {
    console.error("Error al crear la entrada:", error);
    const status = error.status || 500;
    const errors = error.errors || ["Error al crear la entrada"];
    return res.status(status).json({ errors });
  }
};

/**
 * Actualizar una entrada
 */
const updateEntrada = async (req, res) => {
  const { id } = req.params;
  const { id_producto, id_contrato, id_factura, cantidadEntrada, costo, nota, fecha } = req.body;
  const errors = [];

  // Validaciones básicas para campos opcionales
  if (cantidadEntrada !== undefined) {
    if (isNaN(cantidadEntrada) || cantidadEntrada <= 0) {
      errors.push("El campo cantidadEntrada debe ser un número mayor a 0");
    }
  }
  if (costo !== undefined) {
    if (isNaN(costo) || costo < 0) {
      errors.push("El campo costo debe ser un número mayor o igual a 0");
    }
  }
  if (fecha !== undefined) {
    if (isNaN(Date.parse(fecha))) {
      errors.push("El campo fecha debe ser una fecha válida");
    }
  }

  // Reglas pairing/nota para update: se evalúan sobre los valores nuevos (o existentes si no vienen)
  if (id_contrato !== undefined || id_factura !== undefined || nota !== undefined) {
    const entradaActual = await entradaService.getEntradaById(id);
    if (!entradaActual) {
      return res.status(404).json({ errors: ["Entrada no encontrada"] });
    }
    const idFacturaNuevo = id_factura !== undefined ? id_factura : entradaActual.id_factura;
    const idContratoNuevo = id_contrato !== undefined ? id_contrato : entradaActual.id_contrato;
    const notaNueva = nota !== undefined ? nota : entradaActual.nota;
    const hasFactura = idFacturaNuevo !== null && idFacturaNuevo !== undefined;
    const hasContrato = idContratoNuevo !== null && idContratoNuevo !== undefined;
    if (hasFactura !== hasContrato) {
      errors.push("Si se envía id_factura o id_contrato, ambos deben estar presentes");
    }
    if (!hasFactura && !hasContrato) {
      if (!notaNueva || String(notaNueva).trim() === '') {
        errors.push("Cuando id_factura e id_contrato son null, el campo nota es obligatorio");
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedEntrada = await entradaService.updateEntrada(id, {
      id_producto,
      id_contrato,
      id_factura,
      cantidadEntrada,
      costo,
      nota,
      fecha,
    });
    if (!updatedEntrada) {
      return res.status(404).json({ errors: ["Entrada no encontrada"] });
    }
    return res.status(200).json(updatedEntrada);
  } catch (error) {
    console.error("Error al actualizar la entrada:", error);
    const status = error.status || 500;
    const errors = error.errors || ["Error al actualizar la entrada"];
    return res.status(status).json({ errors });
  }
};

/**
 * Eliminar una entrada
 */
const deleteEntrada = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await entradaService.deleteEntrada(id);
    if (!deleted) {
      return res.status(404).json({ errors: ["Entrada no encontrada"] });
    }
    return res.status(200).json({ message: "Entrada eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar la entrada:", error);
    const status = error.status || 500;
    const errors = error.errors || ["Error al eliminar la entrada"];
    return res.status(status).json({ errors });
  }
};

/**
 * Filtrar entradas con paginación
 */
const filterEntradas = async (req, res) => {
  try {
    const filters = req.body;
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    if (page < 1) {
      return res.status(400).json({ errors: ["El número de página debe ser mayor a 0"] });
    }
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ errors: ["El límite debe estar entre 1 y 100"] });
    }

    const result = await entradaService.filterEntradas(filters, page, limit);
    return res.status(200).json({
      data: result.entradas,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error al filtrar las entradas:", error);
    return res.status(500).json({ errors: ["Error al filtrar las entradas"] });
  }
};

module.exports = {
  getEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada,
  filterEntradas,
};
