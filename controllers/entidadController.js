const EntidadService = require("../services/entidadService.js");

/**
 * Controlador para la gestión de entidades
 */
const EntidadController = {
  /** Obtener todas las entidades */
  getAllEntidades: async (req, res) => {
    try {
      const entidades = await EntidadService.getAll();
      return res.status(200).json({ message: "Entidades obtenidas exitosamente", data: entidades });
    } catch (error) {
      console.error("Error al obtener las entidades:", error);
      const errs = error && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener las entidades'];
      const status = error && error.status ? error.status : 500;
      return res.status(status).json({ errors: errs });
    }
  },

  /** Obtener una entidad por su ID */
  getEntidadById: async (req, res) => {
    const { id } = req.params;
  if (isNaN(id) || !Number.isInteger(Number(id))) return res.status(400).json({ errors: ["El ID debe ser un número entero válido"] });
    try {
      const entidad = await EntidadService.getById(Number(id));
  if (!entidad) return res.status(404).json({ errors: [`No se encontró la entidad con ID: ${id}`] });
      return res.status(200).json(entidad);
    } catch (error) {
      console.error("Error al obtener la entidad:", error);
      const errs = error && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al obtener la entidad'];
      const status = error && error.status ? error.status : 500;
      return res.status(status).json({ errors: errs });
    }
  },

  /** Crear una nueva entidad */
  createEntidad: async (req, res) => {
    const { nombre, direccion, telefono, email, tipo_entidad, activo, codigo_reo, codigo_nit, cuenta_bancaria, consecutivo, organismo } = req.body;
    const errors = [];
    if (!nombre || !direccion || !telefono || !tipo_entidad) errors.push("Todos los campos son obligatorios: nombre, direccion, telefono, tipo_entidad");
    if (direccion) {
      if (direccion.length < 5 || direccion.length > 200) errors.push("La dirección debe tener entre 5 y 200 caracteres");
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,#-]+$/.test(direccion)) errors.push("La dirección solo puede contener letras, números, espacios y los caracteres: ., # -");
    }
    if (telefono && !/^\+?[0-9\s-]{8,15}$/.test(telefono)) errors.push("El teléfono debe tener entre 8 y 15 dígitos y puede incluir +, espacios y guiones");
    if (email && email.trim() !== '' && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) errors.push("El email debe tener un formato válido (ejemplo: usuario@dominio.com)");
    if (activo !== undefined && typeof activo !== 'boolean') errors.push("El campo activo debe ser un valor booleano (true/false)");
    if (cuenta_bancaria && !/^[0-9-]{10,20}$/.test(cuenta_bancaria)) errors.push("La cuenta bancaria debe tener entre 10 y 20 dígitos y puede incluir guiones");
  if (errors.length > 0) return res.status(400).json({ errors });
    const entidadData = { nombre, direccion, telefono, email, tipo_entidad, activo: activo !== undefined ? activo : true, codigo_reo: codigo_reo || "", codigo_nit: codigo_nit || "", cuenta_bancaria: cuenta_bancaria || "", consecutivo: consecutivo || null, organismo: organismo || null };
    if (typeof entidadData.email === 'string' && entidadData.email.trim() === '') delete entidadData.email;
    try {
      const newEntidad = await EntidadService.create(entidadData);
      return res.status(201).json({ message: "Entidad creada exitosamente", data: newEntidad });
    } catch (error) {
      console.error("Error al crear la entidad:", error);
      const errs = error && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al crear la entidad'];
      const status = error && error.status ? error.status : 500;
      return res.status(status).json({ errors: errs });
    }
  },

  /** Actualizar una entidad existente */
  updateEntidad: async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, telefono, email, tipo_entidad, activo, codigo_reo, codigo_nit, cuenta_bancaria, consecutivo, organismo } = req.body;
    const errors = [];
  if (isNaN(id) || !Number.isInteger(Number(id))) return res.status(400).json({ errors: ["El ID debe ser un número entero válido"] });
    if (nombre && (nombre.length < 3 || nombre.length > 100)) errors.push("El nombre debe tener entre 3 y 100 caracteres");
    if (direccion && (direccion.length < 5 || direccion.length > 200)) errors.push("La dirección debe tener entre 5 y 200 caracteres");
    if (email && email.trim() !== '' && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) errors.push("El email debe tener un formato válido (ejemplo: usuario@dominio.com)");
    if (activo !== undefined && typeof activo !== 'boolean') errors.push("El campo activo debe ser un valor booleano (true/false)");
    if (cuenta_bancaria && !/^[0-9-]{10,20}$/.test(cuenta_bancaria)) errors.push("La cuenta bancaria debe tener entre 10 y 20 dígitos y puede incluir guiones");
  if (errors.length > 0) return res.status(400).json({ errors });
    try {
      const entidad = await EntidadService.getById(Number(id));
  if (!entidad) return res.status(404).json({ errors: [`No se encontró la entidad con ID: ${id}`] });
      const entidadData = { nombre, direccion, telefono, email, tipo_entidad, activo: activo !== undefined ? activo : entidad.activo, codigo_reo: codigo_reo !== undefined ? codigo_reo : entidad.codigo_reo, codigo_nit: codigo_nit !== undefined ? codigo_nit : entidad.codigo_nit, consecutivo: consecutivo !== undefined ? consecutivo : entidad.consecutivo, organismo: organismo !== undefined ? organismo : entidad.organismo };
      if (typeof entidadData.email === 'string' && entidadData.email.trim() === '') delete entidadData.email;
      const updatedEntidad = await EntidadService.update(Number(id), entidadData);
      return res.status(200).json({ message: "Entidad actualizada exitosamente", data: updatedEntidad });
    } catch (error) {
      console.error("Error al actualizar la entidad:", error);
      const errs = error && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al actualizar la entidad'];
      const status = error && error.status ? error.status : 500;
      return res.status(status).json({ errors: errs });
    }
  },

  /** Elimina una entidad */
  deleteEntidad: async (req, res) => {
    const { id } = req.params;
  if (isNaN(id) || !Number.isInteger(Number(id))) return res.status(400).json({ errors: ["El ID debe ser un número entero válido"] });
    try {
      const entidad = await EntidadService.getById(Number(id));
  if (!entidad) return res.status(404).json({ errors: [`No se encontró la entidad con ID: ${id}`] });
      if (entidad.contratos && entidad.contratos.length > 0) {
        const relaciones = entidad.contratos.map(c => ({ id_contrato: c.id_contrato, descripcion: c.nota || c.clasificacion || '' }));
  return res.status(400).json({ errors: [`No se puede eliminar la entidad porque está relacionada con contratos. Relaciones: ${JSON.stringify(relaciones)}`] });
      }
      await EntidadService.delete(Number(id));
      return res.status(200).json({ message: "Entidad eliminada exitosamente" });
    } catch (error) {
      console.error("Error al eliminar la entidad:", error);
      const errs = error && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al eliminar la entidad'];
      const status = error && error.status ? error.status : 500;
      return res.status(status).json({ errors: errs });
    }
  },

  /** Filtrar entidades por múltiples criterios */
  filterEntidades: async (req, res) => {
    const { nombre, direccion, telefono, cuenta_bancaria, tipo_entidad, codigo_reo, codigo_nit, organismo } = req.body;
    const { page, limit } = req.params;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
  if (isNaN(pageNumber) || pageNumber < 1) return res.status(400).json({ errors: ["El número de página debe ser un número entero positivo"] });
  if (isNaN(limitNumber) || limitNumber < 1) return res.status(400).json({ errors: ["El límite debe ser un número entre positivo"] });
    const filters = {};
    if (nombre) filters.nombre = nombre;
    if (direccion) filters.direccion = direccion;
    if (telefono) filters.telefono = telefono;
    if (cuenta_bancaria) filters.cuenta_bancaria = cuenta_bancaria;
    if (tipo_entidad) filters.tipo_entidad = tipo_entidad;
    if (codigo_reo) filters.codigo_reo = codigo_reo;
    if (codigo_nit) filters.codigo_nit = codigo_nit;
    if (organismo) filters.organismo = organismo;
    try {
      const { entidades, pagination } = await EntidadService.filterEntidades(filters, pageNumber, limitNumber);
      return res.status(200).json({ message: "Entidades filtradas exitosamente", data: entidades, pagination });
    } catch (error) {
      console.error("Error al filtrar entidades:", error);
      const errs = error && Array.isArray(error.errors) ? error.errors : [error.message || 'Error al filtrar entidades'];
      const status = error && error.status ? error.status : 500;
      return res.status(status).json({ errors: errs });
    }
  }
};

module.exports = EntidadController;