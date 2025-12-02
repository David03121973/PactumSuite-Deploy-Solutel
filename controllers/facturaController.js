// controllers/facturaController.js
const facturaService = require('../services/facturaService');

const getFacturas = async (req, res) => {
  try {
    const facturas = await facturaService.getAllFacturas();
    
    // Agregar suma general a cada factura
    const facturasConSuma = facturas.map(factura => {
      const sumaGeneral = facturaService.calcularSumaGeneral(factura);
      return {
        ...factura.toJSON(),
        suma_servicios: sumaGeneral.suma_servicios,
        suma_productos: sumaGeneral.suma_productos,
        suma_costo: sumaGeneral.suma_costo,
        suma_general: sumaGeneral.suma_general
      };
    });
    
    return res.status(200).json(facturasConSuma || []);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    const status = error.status || 500;
    const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener facturas'];
    return res.status(status).json({ errors: errs });
  }
};

const getFacturaById = async (req, res) => {
  const { id } = req.params;
  try {
    const factura = await facturaService.getFacturaById(id);
    if (!factura) return res.status(404).json({ errors: ["Factura no encontrada"] });
    
    // Agregar suma general a la factura
    const sumaGeneral = facturaService.calcularSumaGeneral(factura);
    const facturaConSuma = {
      ...factura.toJSON(),
      suma_servicios: sumaGeneral.suma_servicios,
      suma_productos: sumaGeneral.suma_productos,
      suma_costo: sumaGeneral.suma_costo,
      suma_general: sumaGeneral.suma_general
    };
    
    return res.status(200).json(facturaConSuma);
  } catch (error) {
    console.error('Error al obtener la factura:', error);
    const status = error.status || 500;
    const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener la factura'];
    return res.status(status).json({ errors: errs });
  }
};

const createFactura = async (req, res) => {
  const { num_consecutivo, fecha, estado, id_contrato, id_trabajador_autorizado, id_usuario, nota, services, products } = req.body || {};
  const errors = [];

  if (num_consecutivo === undefined || fecha === undefined || id_contrato === undefined) {
    errors.push("Campos obligatorios: num_consecutivo, fecha, id_contrato");
  }

  const numConsecutivoNum = parseInt(num_consecutivo, 10);
  if (Number.isNaN(numConsecutivoNum) || numConsecutivoNum <= 0) {
    errors.push("num_consecutivo debe ser un entero positivo");
  }

  if (!fecha || isNaN(Date.parse(fecha))) {
    errors.push("fecha debe ser una fecha válida");
  }

  const idContratoNum = parseInt(id_contrato, 10);
  if (Number.isNaN(idContratoNum) || idContratoNum <= 0) {
    errors.push("id_contrato debe ser un entero positivo");
  }

  const idUsuarioNum = id_usuario !== undefined && id_usuario !== null && id_usuario !== '' ? parseInt(id_usuario, 10) : null;
  if (id_usuario !== undefined && id_usuario !== null && id_usuario !== '') {
    if (Number.isNaN(idUsuarioNum) || idUsuarioNum <= 0) {
      errors.push("id_usuario debe ser un entero positivo");
    }
  }

  const idTANum = id_trabajador_autorizado !== undefined && id_trabajador_autorizado !== null && id_trabajador_autorizado !== '' ? parseInt(id_trabajador_autorizado, 10) : null;
  if (id_trabajador_autorizado !== undefined && id_trabajador_autorizado !== null && id_trabajador_autorizado !== '') {
    if (Number.isNaN(idTANum) || idTANum <= 0) {
      errors.push("id_trabajador_autorizado debe ser un entero positivo");
    }
  }

  if (estado && !['Facturado', 'No Facturado', 'Cancelado'].includes(estado)) {
    errors.push('estado debe ser "Facturado", "No Facturado" o "Cancelado"');
  }

  // Validar que las cantidades de productos sean mayores a 0
  if (products !== undefined) {
    if (!Array.isArray(products)) {
      errors.push('products debe ser un arreglo');
    } else {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product || typeof product !== 'object') {
          errors.push(`Producto en posición ${i} no es válido`);
          continue;
        }
        if (product.id_producto === undefined) {
          errors.push(`Producto en posición ${i} debe tener id_producto`);
          continue;
        }
        if (product.cantidad === undefined) {
          errors.push(`Producto en posición ${i} debe tener cantidad`);
          continue;
        }
        const cantidadNum = parseFloat(product.cantidad);
        if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
          errors.push(`La cantidad de un producto es igual o menor a 0`);
        }
      }
    }
  }

  // Validar services si viene
  if (services !== undefined) {
    if (!Array.isArray(services)) {
      errors.push('services debe ser un arreglo');
    } else {
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        if (!service || typeof service !== 'object') {
          errors.push(`Servicio en posición ${i} no es válido`);
          continue;
        }
        if (service.descripcion === undefined) {
          errors.push(`Servicio en posición ${i} debe tener descripcion`);
          continue;
        }
        if (service.importe === undefined) {
          errors.push(`Servicio en posición ${i} debe tener importe`);
          continue;
        }
        if (service.cantidad === undefined) {
          errors.push(`Servicio en posición ${i} debe tener cantidad`);
          continue;
        }
        if (service.unidadMedida === undefined) {
          errors.push(`Servicio en posición ${i} debe tener unidadMedida`);
          continue;
        }
        const importeNum = parseFloat(service.importe);
        if (Number.isNaN(importeNum) || importeNum <= 0) {
          errors.push(`El importe del servicio debe ser un número positivo`);
        }
        const cantidadNum = parseInt(service.cantidad, 10);
        if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
          errors.push(`La cantidad del servicio debe ser un entero positivo`);
        }
      }
    }
  }

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const contratoOk = await facturaService.contratoExists(idContratoNum);
    if (!contratoOk) return res.status(400).json({ errors: ["El contrato especificado no existe"] });
    if (idTANum !== null && !Number.isNaN(idTANum) && idTANum > 0) {
      const taOk = await facturaService.trabajadorAutorizadoExists(idTANum);
      if (!taOk) return res.status(400).json({ errors: ["El trabajador autorizado especificado no existe"] });
    }
    if (idUsuarioNum !== null && !Number.isNaN(idUsuarioNum) && idUsuarioNum > 0) {
      const uOk = await facturaService.usuarioExists(idUsuarioNum);
      if (!uOk) return res.status(400).json({ errors: ["El usuario especificado no existe"] });
    }

    const result = await facturaService.createFactura({
      num_consecutivo, fecha, estado, id_contrato, id_trabajador_autorizado, id_usuario, nota, services, products
    });
    if (result.errors) return res.status(400).json({ errors: result.errors });
    
    // Obtener la factura completa con relaciones para calcular sumas
    const facturaCompleta = await facturaService.getFacturaById(result.data.id_factura);
    const sumaGeneral = facturaService.calcularSumaGeneral(facturaCompleta);
    
    return res.status(201).json({
      data: {
        id_factura: facturaCompleta.id_factura,
        num_consecutivo: facturaCompleta.num_consecutivo,
        fecha: facturaCompleta.fecha,
        estado: facturaCompleta.estado,
        id_contrato: facturaCompleta.id_contrato,
  id_trabajador_autorizado: facturaCompleta.id_trabajador_autorizado,
  id_usuario: facturaCompleta.id_usuario,
  nota: facturaCompleta.nota,
        suma_servicios: sumaGeneral.suma_servicios,
        suma_productos: sumaGeneral.suma_productos,
        suma_costo: sumaGeneral.suma_costo,
        suma_general: sumaGeneral.suma_general,
        servicio: facturaCompleta.servicio,
        productos: facturaCompleta.productos,
        contrato: facturaCompleta.contrato,
        trabajadorAutorizado: facturaCompleta.trabajadorAutorizado
      }
    });
  } catch (error) {
    console.error('Error al crear la factura:', error);
    const status = error.status || 500;
    const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al crear la factura'];
    return res.status(status).json({ errors: errs });
  }
};

const updateFactura = async (req, res) => {
  const { id } = req.params;
  const { num_consecutivo, fecha, estado, id_contrato, id_trabajador_autorizado, nota, products, services, usuario } = req.body || {};
  // Do not allow changing the user who signed the invoice
  if (usuario) {
    req.body.usuario = "";
  }
  const errors = [];

  if (num_consecutivo !== undefined) {
    const n = parseInt(num_consecutivo, 10);
    if (Number.isNaN(n) || n <= 0) errors.push("num_consecutivo debe ser un entero positivo");
  }
  if (fecha !== undefined && (isNaN(Date.parse(fecha)))) errors.push("fecha debe ser una fecha válida");
  if (estado !== undefined && !['Facturado', 'No Facturado', 'Cancelado'].includes(estado)) errors.push('estado debe ser "Facturado", "No Facturado" o "Cancelado"');
  if (id_contrato !== undefined) {
    const n = parseInt(id_contrato, 10);
    if (Number.isNaN(n) || n <= 0) errors.push("id_contrato debe ser un entero positivo");
  }
  if (id_trabajador_autorizado !== undefined) {
    if (id_trabajador_autorizado === null || id_trabajador_autorizado === '') {
      // Allow null/empty values
    } else {
      const n = parseInt(id_trabajador_autorizado, 10);
      if (Number.isNaN(n) || n <= 0) errors.push("id_trabajador_autorizado debe ser un entero positivo");
    }
  }
  // id_usuario updates are not allowed (handled above)

  // Validar que las cantidades de productos sean mayores a 0
  if (products !== undefined) {
    if (!Array.isArray(products)) {
      errors.push('products debe ser un arreglo');
    } else {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product || typeof product !== 'object') {
          errors.push(`Producto en posición ${i} no es válido`);
          continue;
        }
        if (product.id_producto === undefined) {
          errors.push(`Producto en posición ${i} debe tener id_producto`);
          continue;
        }
        if (product.cantidad === undefined) {
          errors.push(`Producto en posición ${i} debe tener cantidad`);
          continue;
        }
        const cantidadNum = parseFloat(product.cantidad);
        if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
          errors.push(`La cantidad de un producto es igual o menor a 0`);
        }
      }
    }
  }

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const factura = await facturaService.getFacturaById(id);
    if (!factura) return res.status(404).json({ errors: ["Factura no encontrada"] });

    if (id_contrato !== undefined) {
      const ok = await facturaService.contratoExists(parseInt(id_contrato, 10));
      if (!ok) return res.status(400).json({ errors: ["El contrato especificado no existe"] });
    }
    if (id_trabajador_autorizado !== undefined && id_trabajador_autorizado !== null && id_trabajador_autorizado !== '') {
      const ok = await facturaService.trabajadorAutorizadoExists(parseInt(id_trabajador_autorizado, 10));
      if (!ok) return res.status(400).json({ errors: ["El trabajador autorizado especificado no existe"] });
    }
    // id_usuario existence check removed: cannot change signer of an existing factura

    const updateData = {};
    if (num_consecutivo !== undefined) updateData.num_consecutivo = parseInt(num_consecutivo, 10);
    if (fecha !== undefined) updateData.fecha = new Date(fecha);
    if (estado !== undefined) updateData.estado = estado;
    if (id_contrato !== undefined) updateData.id_contrato = parseInt(id_contrato, 10);
    if (id_trabajador_autorizado !== undefined) {
      if (id_trabajador_autorizado === null || id_trabajador_autorizado === '') {
        updateData.id_trabajador_autorizado = null;
      } else {
        updateData.id_trabajador_autorizado = parseInt(id_trabajador_autorizado, 10);
      }
    }
    // id_usuario not included in updateData on purpose
    if (nota !== undefined) updateData.nota = nota;
    if (products !== undefined) updateData.products = products;
    if (services !== undefined) updateData.services = services;

  const updated = await facturaService.updateFactura(id, updateData);
    if (updated && updated.errors) return res.status(400).json({ errors: updated.errors });
    if (!updated || !updated.data) return res.status(500).json({ errors: ["No se pudo actualizar la factura"] });
    
    // Obtener la factura actualizada con relaciones para calcular sumas
    const refreshed = await facturaService.getFacturaById(id);
    const sumaGeneral = facturaService.calcularSumaGeneral(refreshed);
    
    const facturaConSuma = {
      ...refreshed.toJSON(),
      suma_servicios: sumaGeneral.suma_servicios,
      suma_productos: sumaGeneral.suma_productos,
      suma_costo: sumaGeneral.suma_costo,
      suma_general: sumaGeneral.suma_general
    };
    
    return res.status(200).json(facturaConSuma);
  } catch (error) {
    console.error('Error al actualizar la factura:', error);
    const status = error.status || 500;
    const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al actualizar la factura'];
    return res.status(status).json({ errors: errs });
  }
};

const deleteFactura = async (req, res) => {
  const { id } = req.params;
  try {
    const factura = await facturaService.getFacturaById(id);
    if (!factura) return res.status(404).json({ errors: ["Factura no encontrada"] });
    const ok = await facturaService.deleteFactura(id);
    if (!ok) return res.status(500).json({ errors: ["Error al eliminar la factura"] });
    return res.status(200).json({ factura: { id_factura: factura.id_factura, num_consecutivo: factura.num_consecutivo } });
  } catch (error) {
    console.error('Error al eliminar la factura:', error);
    const status = error.status || 500;
    const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al eliminar la factura'];
    return res.status(status).json({ errors: errs });
  }
};

const filterFacturas = async (req, res) => {
  try {
    const page = parseInt(req.params.page, 10) || 1;
    const limit = parseInt(req.params.limit, 10) || 10;
    if (page < 1) return res.status(400).json({ errors: ["El número de página debe ser mayor a 0"] });
    if (limit < 1 || limit > 100) return res.status(400).json({ errors: ["El límite debe estar entre 1 y 100"] });

    const filters = req.body || {};
    const result = await facturaService.filterFacturas(filters, page, limit);
    
    // Agregar suma general a cada factura
    const facturasConSuma = result.facturas.map(factura => {
      const sumaGeneral = facturaService.calcularSumaGeneral(factura);
      return {
        ...factura.toJSON(),
        suma_servicios: sumaGeneral.suma_servicios,
        suma_productos: sumaGeneral.suma_productos,
        suma_costo: sumaGeneral.suma_costo,
        suma_general: sumaGeneral.suma_general
      };
    });
    
    return res.status(200).json({ data: facturasConSuma, pagination: result.pagination });
  } catch (error) {
    console.error('Error al filtrar facturas:', error);
    const status = error.status || 500;
    const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al filtrar facturas'];
    return res.status(status).json({ errors: errs });
  }
};

const getNextConsecutivo = async (req, res) => {
  const { year } = req.params;
  try {
    const result = await facturaService.getNextConsecutivo(year);
    return res.status(200).json({
      data: {
        year: parseInt(year, 10),
        nextConsecutivo: result.nextConsecutivo,
        message: result.message
      }
    });
  } catch (error) {
    console.error('Error al obtener siguiente número consecutivo:', error);
    const status = error.status || (error.message && error.message.includes('año debe ser un número válido') ? 400 : 500);
    const errs = error.errors && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener siguiente número consecutivo'];
    return res.status(status).json({ errors: errs });
  }
};

module.exports = {
  getFacturas,
  getFacturaById,
  createFactura,
  updateFactura,
  deleteFactura,
  filterFacturas,
  getNextConsecutivo,
};


