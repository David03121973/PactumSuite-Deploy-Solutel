const Contrato = require("../models/contrato.js");
const Entidad = require("../models/entidad.js");
const TipoContrato = require("../models/tipo_contrato.js");
const Oferta = require("../models/oferta.js");
const TrabajadorAutorizado = require("../models/trabajador_autorizado.js");
const Factura = require("../models/factura.js");
const Servicio = require("../models/servicio.js");
const Producto = require("../models/producto.js");
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

/**
 * Función helper para parsear el número de num_consecutivo
 * Extrae el número antes del "/" y lo convierte a entero
 * @param {string|number} numConsecutivo - El num_consecutivo en formato string o número
 * @returns {number|null} El número parseado o null si inválido
 */
const parseNumConsecutivo = (numConsecutivo) => {
  if (numConsecutivo === null || numConsecutivo === undefined) {
    return null;
  }
  const valueAsString = String(numConsecutivo);
  const parts = valueAsString.split('/');
  const numPart = parts[0].trim();
  const parsed = parseInt(numPart, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Función helper para validar el formato de num_consecutivo
 * Debe empezar con un número entero válido, opcionalmente seguido de "/cualquiercosa"
 * @param {string|number} numConsecutivo - El num_consecutivo a validar
 * @returns {boolean} true si válido, false si no
 */
const validateNumConsecutivoFormat = (numConsecutivo) => {
  if (numConsecutivo === null || numConsecutivo === undefined) {
    return false;
  }
  const valueAsString = String(numConsecutivo);
  const parts = valueAsString.split('/');
  const numPart = parts[0].trim();
  // Verificar que sea un número entero válido (sin letras) y mayor que 0
  return /^\d+$/.test(numPart) && parseInt(numPart, 10) > 0;
};

// Función helper para calcular la suma general de una factura (copiada del servicio de factura)
const calcularSumaGeneral = (factura) => {
  let sumaServicios = 0;
  let sumaProductos = 0;

  // Calcular suma de servicios
  if (factura.servicio && Array.isArray(factura.servicio)) {
    sumaServicios = factura.servicio.reduce((total, servicio) => {
      const importe = parseFloat(servicio.importe) || 0;
      const cantidad = parseInt(servicio.cantidad) || 0;
      return total + (importe * cantidad);
    }, 0);
  }

  // Calcular suma de productos
  if (factura.productos && Array.isArray(factura.productos)) {
    sumaProductos = factura.productos.reduce((total, producto) => {
      const precio = parseFloat(producto.precio) || 0;
      const cantidad = parseFloat(producto.factura_producto?.cantidad) || 0;
      return total + (precio * cantidad);
    }, 0);
  }

  const sumaGeneral = sumaServicios + sumaProductos;

  return {
    suma_servicios: Math.round(sumaServicios * 100) / 100, // Redondear a 2 decimales
    suma_productos: Math.round(sumaProductos * 100) / 100,
    suma_general: Math.round(sumaGeneral * 100) / 100
  };
};

// Función helper para procesar facturas con sus sumas calculadas
const procesarFacturasConSumas = (facturas) => {
  if (!facturas || !Array.isArray(facturas)) {
    return [];
  }
  
  return facturas.map(factura => {
    const sumaGeneral = calcularSumaGeneral(factura);
    return {
      id_factura: factura.id_factura,
      num_consecutivo: factura.num_consecutivo,
      fecha: factura.fecha,
      estado: factura.estado,
      nota: factura.nota,
      created_at: factura.createdAt,
      updated_at: factura.updatedAt,
      suma_servicios: sumaGeneral.suma_servicios,
      suma_productos: sumaGeneral.suma_productos,
      suma_general: sumaGeneral.suma_general
    };
  });
};

// Includes base para facturas con sus relaciones necesarias para calcular sumas
const getFacturasIncludes = () => [
  {
    model: Servicio,
    as: 'servicio'
  },
  {
    model: Producto,
    as: 'productos',
    through: { attributes: ['cantidad'] }
  }
];

/**
 * Servicio para la gestión de contratos
 * Implementa el patrón Repository para el acceso a datos
 * Sigue los principios SOLID:
 * - Single Responsibility: Cada método tiene una única responsabilidad
 * - Open/Closed: Extensible para nuevas funcionalidades sin modificar el código existente
 * - Interface Segregation: Métodos específicos para cada operación
 * - Dependency Inversion: Depende de abstracciones (modelos) no de implementaciones concretas
 */
const ContratoService = {
  /**
   * Obtiene todos los contratos con sus relaciones
   * @returns {Promise<Array>} Lista de contratos con sus relaciones
   */
  getAll: async () => {
    const contratos = await Contrato.findAll({
      include: [
        {
          model: Entidad,
          as: 'entidad'
        },
        {
          model: TipoContrato,
          as: 'tipoContrato'
        },
        {
          model: Oferta,
          as: 'oferta'
        },
        {
          model: TrabajadorAutorizado,
          as: 'trabajadoresAutorizados'
        },
        {
          model: Factura,
          as: 'facturas',
          include: getFacturasIncludes()
        }
      ]
    });

    // Procesar facturas con sumas calculadas
    return contratos.map(contrato => {
      const contratoData = contrato.toJSON();
      contratoData.facturas = procesarFacturasConSumas(contratoData.facturas);
      return contratoData;
    });
  },

  /**
   * Obtiene un contrato por su ID con sus relaciones
   * @param {number} id - ID del contrato a buscar
   * @returns {Promise<Object|null>} Contrato encontrado o null
   */
  getById: async (id) => {
    const contrato = await Contrato.findByPk(id, {
      include: [
        {
          model: Entidad,
          as: 'entidad'
        },
        {
          model: TipoContrato,
          as: 'tipoContrato'
        },
        {
          model: Oferta,
          as: 'oferta'
        },
        {
          model: TrabajadorAutorizado,
          as: 'trabajadoresAutorizados'
        },
        {
          model: Factura,
          as: 'facturas',
          include: getFacturasIncludes()
        }
      ]
    });

    if (!contrato) {
      return null;
    }

    // Procesar facturas con sumas calculadas
    const contratoData = contrato.toJSON();
    contratoData.facturas = procesarFacturasConSumas(contratoData.facturas);
    return contratoData;
  },

  /**
   * Obtiene el siguiente número consecutivo disponible para un año específico
   * IMPORTANTE: Solo considera contratos de tipo "Cliente" ya que los de "Proveedor" pueden tener números duplicados
   * @param {number} year - Año para determinar el número consecutivo
   * @returns {Promise<number>} El siguiente número consecutivo disponible para contratos de Cliente
   * @throws {Error} Si el año es inválido
   */
  getNextConsecutivo: async (year) => {
    try {
      // Validar que el año sea un número válido
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2200) {
        throw new Error('El año debe ser un número válido entre 1900 y 2200');
      }

      // Calcular el rango de fechas para el año
      const startOfYear = new Date(yearNum, 0, 0);
      const endOfYear = new Date(yearNum, 11, 32);

      // Buscar todos los contratos de Cliente del año (solo los de Cliente necesitan números únicos)
      const contratos = await Contrato.findAll({
        where: {
          fecha_inicio: {
            [Op.between]: [startOfYear, endOfYear]
          },
          ClienteOProveedor: 'Cliente'
        },
        attributes: ['num_consecutivo'],
      });

      // Si no hay contratos en el año, retornar 1
      if (contratos.length === 0) {
        return 1;
      }

      // Obtener el número consecutivo más alto parseando los valores
      let maxConsecutivo = 0;
      contratos.forEach(c => {
        const parsed = parseNumConsecutivo(c.num_consecutivo);
        if (parsed !== null && parsed > maxConsecutivo) {
          maxConsecutivo = parsed;
        }
      });

      // Retornar el siguiente número consecutivo
      return maxConsecutivo + 1;
    } catch (error) {
      console.error('Error al obtener el siguiente número consecutivo:', error);
      throw new Error(`Error al obtener el siguiente número consecutivo: ${error.message}`);
    }
  },

  /**
   * Valida los datos de un contrato antes de crearlo o actualizarlo
   * @param {Object} data - Datos del contrato a validar
   * @param {number} [excludeId] - ID del contrato a excluir en validaciones (para actualizaciones)
   * @returns {Promise<Array>} Lista de errores encontrados
   */
  validateContrato: async (data, excludeId = null) => {
    const errors = [];

    // Validar formato de num_consecutivo
    if (data.num_consecutivo && !validateNumConsecutivoFormat(data.num_consecutivo)) {
      errors.push('El número consecutivo debe empezar con un número entero positivo válido (sin letras)');
    }

    // Validar fechas
    if (data.fecha_inicio && data.fecha_fin) {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);

      if (fechaInicio >= fechaFin) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    // Validar número consecutivo único por año solo para Clientes
    if (data.num_consecutivo && data.fecha_inicio && data.ClienteOProveedor === 'Cliente') {
      const fechaInicio = new Date(data.fecha_inicio);
      const year = fechaInicio.getUTCFullYear();
      const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
      const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

      // Buscar contratos con el mismo número parseado en el año
      const contratos = await Contrato.findAll({
        where: {
          fecha_inicio: {
            [Op.between]: [startOfYear, endOfYear]
          },
          ClienteOProveedor: 'Cliente'
        },
        attributes: ['num_consecutivo'],
      });

      const parsedNum = parseNumConsecutivo(data.num_consecutivo);
      if (parsedNum !== null) {
        for (const c of contratos) {
          const existingParsed = parseNumConsecutivo(c.num_consecutivo);
          if (existingParsed === parsedNum && (!excludeId || c.id_contrato !== excludeId)) {
            errors.push(`Ya existe un contrato de un Cliente con el número consecutivo ${parsedNum} en el año ${year}`);
            break;
          }
        }
      }
    }

    // Validar entidad
    if (data.id_entidad) {
      const entidad = await Entidad.findByPk(data.id_entidad);
      if (!entidad) {
        errors.push('La entidad especificada no existe');
      }
    }

    // Validar tipo de contrato
    if (data.id_tipo_contrato) {
      const tipoContrato = await TipoContrato.findByPk(data.id_tipo_contrato);
      if (!tipoContrato) {
        errors.push('El tipo de contrato especificado no existe');
      }
    }

    // Validar vigenciaFacturasDias si está presente
    if (data.vigenciaFacturasDias !== undefined && data.vigenciaFacturasDias !== null) {
      const v = Number(data.vigenciaFacturasDias);
      if (isNaN(v) || !Number.isInteger(v) || v < 0) {
        errors.push('La vigencia de la factura en días debe ser un número entero no negativo');
      }
    }

    // NOTE: Removed validation that prevented multiple Cliente contracts for the same entidad and tipo
    // The application now allows multiple Cliente contracts for the same entidad/tipo regardless of vigencia

    return errors;
  },

  /**
   * Crea un nuevo contrato
   * @param {Object} data - Datos del contrato a crear
   * @returns {Promise<Object>} Contrato creado
   * @throws {Error} Si hay errores de validación
   */
  create: async (data) => {
    // Validar datos
    const errors = await ContratoService.validateContrato(data);
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return await Contrato.create(data);
  },

  /**
   * Actualiza un contrato existente
   * @param {number} id - ID del contrato a actualizar
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object|null>} Contrato actualizado o null si no existe
   * @throws {Error} Si hay errores de validación
   */
  update: async (id, data) => {
    const contrato = await Contrato.findByPk(id);
    if (!contrato) {
      return null;
    }

    // Validar datos
    const errors = await ContratoService.validateContrato(data, id);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    await contrato.update(data);
    const contratoActualizado = await Contrato.findByPk(id, {
      include: [
        {
          model: Entidad,
          as: 'entidad'
        },
        {
          model: TipoContrato,
          as: 'tipoContrato'
        },
        {
          model: Oferta,
          as: 'oferta'
        },
        {
          model: TrabajadorAutorizado,
          as: 'trabajadoresAutorizados'
        },
        {
          model: Factura,
          as: 'facturas',
          include: getFacturasIncludes()
        }
      ]
    });

    // Procesar facturas con sumas calculadas
    const contratoData = contratoActualizado.toJSON();
    contratoData.facturas = procesarFacturasConSumas(contratoData.facturas);
    return contratoData;
  },

  /**
   * Elimina un contrato
   * @param {number} id - ID del contrato a eliminar
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  delete: async (id) => {
    const contrato = await Contrato.findByPk(id);
    if (contrato) {
      await contrato.destroy();
      return true;
    }
    return false;
  },

  /**
   * Filtra contratos según los criterios proporcionados
   * @param {Object} filters - Objeto con los criterios de filtrado
   * @param {string} [filters.nombre_entidad] - Nombre de la entidad (búsqueda case-insensitive)
   * @param {number} [filters.id_tipo_contrato] - ID del tipo de contrato
   * @param {Date} [filters.fecha_inicio] - Fecha de inicio mínima
   * @param {Date} [filters.fecha_fin] - Fecha de fin máxima
   * @param {number} [filters.num_consecutivo] - Número consecutivo
   * @param {string} [filters.ClienteOProveedor] - Tipo de contrato: 'Cliente' o 'Proveedor'
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros por página
   * @returns {Promise<Object>} Objeto con los contratos filtrados y metadatos de paginación
   */
  filterContratos: async (filters, page = 1, limit = 10) => {
    try {
      const whereClause = {};
      const includeClause = [
        {
          model: Entidad,
          as: 'entidad',
          attributes: ['id_entidad', 'nombre', 'direccion', 'telefono', 'email', 'tipo_entidad']
        },
        {
          model: TipoContrato,
          as: 'tipoContrato',
          attributes: ['id_tipo_contrato', 'nombre']
        },
        {
          model: Oferta,
          as: 'oferta'
        },
        {
          model: TrabajadorAutorizado,
          as: 'trabajadoresAutorizados'
        },
        {
          model: Factura,
          as: 'facturas',
          include: getFacturasIncludes()
        }
      ];

      // Filtrar por nombre de entidad (case-insensitive)
      if (filters.nombre_entidad) {
        includeClause[0].where = {
          nombre: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('entidad.nombre')),
            'LIKE',
            `%${filters.nombre_entidad.toLowerCase()}%`
          )
        };
      }

      // Filtrar por tipo de contrato
      if (filters.id_tipo_contrato) {
        whereClause.id_tipo_contrato = filters.id_tipo_contrato;
      }

      // Filtrar por fecha de inicio
      if (filters.fecha_inicio) {
        whereClause.fecha_inicio = {
          [Op.gte]: new Date(filters.fecha_inicio)
        };
      }

      // Filtrar por fecha de fin
      if (filters.fecha_fin) {
        whereClause.fecha_fin = {
          [Op.lte]: new Date(filters.fecha_fin)
        };
      }

      // Filtrar por número consecutivo (búsqueda parcial case-insensitive)
      if (filters.num_consecutivo) {
        whereClause.num_consecutivo = {
          [Op.iLike]: `%${filters.num_consecutivo}%`
        };
      }

      // Filtrar por ClienteOProveedor
      if (filters.ClienteOProveedor) {
        whereClause.ClienteOProveedor = filters.ClienteOProveedor;
      }

      // Calcular offset para la paginación
      const offset = (page - 1) * limit;

      // Primero, contar el total de contratos únicos que coinciden con los filtros
      // Solo incluir relaciones que no dupliquen registros (Entidad y TipoContrato)
      const countIncludeClause = includeClause.filter(include => 
        include.model === Entidad || include.model === TipoContrato
      );
      
      const totalCount = await Contrato.count({
        where: whereClause,
        include: countIncludeClause,
        distinct: true
      });

      // Luego, obtener los contratos con todas las relaciones para la página actual
      const contratos = await Contrato.findAll({
        where: whereClause,
        include: includeClause,
        order: [['fecha_inicio', 'DESC'], ['num_consecutivo', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      // Procesar facturas con sumas calculadas
      const contratosConFacturas = contratos.map(contrato => {
        const contratoData = contrato.toJSON();
        contratoData.facturas = procesarFacturasConSumas(contratoData.facturas);
        return contratoData;
      });

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        contratos: contratosConFacturas,
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
      console.error('Error al filtrar contratos:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al filtrar contratos');
        err.errors = [error.message || 'Error interno al filtrar contratos'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },

  /**
   * Obtiene contratos que están próximos a vencer (1 mes o menos antes de la fecha fin)
   * @returns {Promise<Array>} Lista de contratos próximos a vencer
   */
  getContratosProximosAVencer: async () => {
    try {
      const fechaActual = new Date();
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() + 1); // 1 mes desde hoy

      const contratos = await Contrato.findAll({
        where: {
          fecha_fin: {
            [Op.between]: [fechaActual, fechaLimite]
          }
        },
        include: [
          {
            model: Entidad,
            as: 'entidad',
            attributes: ['id_entidad', 'nombre', 'direccion', 'telefono', 'email', 'tipo_entidad']
          },
          {
            model: TipoContrato,
            as: 'tipoContrato',
            attributes: ['id_tipo_contrato', 'nombre']
          },
          {
            model: Factura,
            as: 'facturas',
            include: getFacturasIncludes()
          }
        ],
        order: [['fecha_fin', 'ASC']] // Ordenar por fecha de vencimiento (más próximos primero)
      });

      // Procesar facturas con sumas calculadas
      return contratos.map(contrato => {
        const contratoData = contrato.toJSON();
        contratoData.facturas = procesarFacturasConSumas(contratoData.facturas);
        return contratoData;
      });
    } catch (error) {
      console.error('Error al obtener contratos próximos a vencer:', error);
      if (!error.errors || !Array.isArray(error.errors)) {
        const err = new Error(error.message || 'Error interno al obtener contratos próximos a vencer');
        err.errors = [error.message || 'Error interno al obtener contratos próximos a vencer'];
        err.status = error.status || 500;
        throw err;
      }
      throw error;
    }
  },
};

module.exports = ContratoService; 