const TrabajadorAutorizado = require("../models/trabajador_autorizado");
const { ValidationError, Op } = require("sequelize");
const Contrato = require("../models/contrato");
const Entidad = require("../models/entidad");
const TipoContrato = require("../models/tipo_contrato");
const sequelize = require("sequelize");

// Valores permitidos para el campo 'funcion'
const ALLOWED_FUNCIONES = ['Concidia', 'Firma', 'Concidia y Firma'];

class TrabajadorAutorizadoService {
  /**
   * Configuración común de includes para las consultas
   * @returns {Array} Array de includes para las consultas
   */
  static getDefaultIncludes() {
    return [
      {
        model: Contrato,
        as: 'contratos',
        through: { attributes: [] },
        include: [
          {
            model: Entidad,
            as: 'entidad'
          },
          {
            model: TipoContrato,
            as: 'tipoContrato'
          }
        ]
      }
    ];
  }

  /**
   * Obtiene todos los trabajadores autorizados
   * @returns {Promise<Array>} Lista de trabajadores autorizados
   */
  static async getAll() {
    try {
      return await TrabajadorAutorizado.findAll({
        include: this.getDefaultIncludes()
      });
    } catch (error) {
      throw new Error("Error al obtener los trabajadores autorizados: " + error.message);
    }
  }

  /**
   * Obtiene un trabajador autorizado por su ID
   * @param {number} id - ID del trabajador autorizado
   * @returns {Promise<Object>} Trabajador autorizado encontrado
   */
  static async getById(id) {
    try {
      const trabajador = await TrabajadorAutorizado.findByPk(id, {
        include: this.getDefaultIncludes()
      });
      if (!trabajador) {
        throw new Error("Trabajador autorizado no encontrado");
      }
      return trabajador;
    } catch (error) {
      throw new Error("Error al obtener el trabajador autorizado: " + error.message);
    }
  }

  /**
   * Crea un nuevo trabajador autorizado
   * @param {Object} trabajadorData - Datos del trabajador autorizado
   * @returns {Promise<Object>} Trabajador autorizado creado
   */
  static async create(trabajadorData) {
    try {
      // Validar que el carnet de identidad no exista
      const existingTrabajador = await TrabajadorAutorizado.findOne({
        where: { carnet_identidad: trabajadorData.carnet_identidad }
      });

      if (existingTrabajador) {
        throw new Error("Ya existe un trabajador autorizado con ese carnet de identidad");
      }

      // Validar campo 'funcion' si fue provisto
      if (trabajadorData.funcion && !ALLOWED_FUNCIONES.includes(trabajadorData.funcion)) {
        throw new Error("El campo funcion debe ser uno de: " + ALLOWED_FUNCIONES.join(', '));
      }

      const newTrabajador = await TrabajadorAutorizado.create(trabajadorData);
      return await this.getById(newTrabajador.id_trabajador_autorizado);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error("Datos de trabajador autorizado inválidos: " + error.message);
      }
      throw new Error("Error al crear el trabajador autorizado: " + error.message);
    }
  }

  /**
   * Actualiza un trabajador autorizado existente
   * @param {number} id - ID del trabajador autorizado
   * @param {Object} trabajadorData - Datos actualizados del trabajador
   * @returns {Promise<Object>} Trabajador autorizado actualizado
   */
  static async update(id, trabajadorData) {
    try {
      const trabajador = await TrabajadorAutorizado.findByPk(id);
      if (!trabajador) {
        throw new Error("Trabajador autorizado no encontrado");
      }

      // Si se está actualizando el carnet de identidad, verificar que no exista
      if (trabajadorData.carnet_identidad && trabajadorData.carnet_identidad !== trabajador.carnet_identidad) {
        const existingTrabajador = await TrabajadorAutorizado.findOne({
          where: { carnet_identidad: trabajadorData.carnet_identidad }
        });

        if (existingTrabajador) {
          throw new Error("Ya existe un trabajador autorizado con ese carnet de identidad");
        }
      }

      // Validar campo 'funcion' si fue provisto en la actualización
      if (trabajadorData.funcion && !ALLOWED_FUNCIONES.includes(trabajadorData.funcion)) {
        throw new Error("El campo funcion debe ser uno de: " + ALLOWED_FUNCIONES.join(', '));
      }

      await trabajador.update(trabajadorData);
      return await this.getById(id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error("Datos de trabajador autorizado inválidos: " + error.message);
      }
      throw new Error("Error al actualizar el trabajador autorizado: " + error.message);
    }
  }

  /**
   * Elimina un trabajador autorizado
   * @param {number} id - ID del trabajador autorizado
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  static async delete(id) {
    try {
      const trabajador = await TrabajadorAutorizado.findByPk(id);
      if (!trabajador) {
        throw new Error("Trabajador autorizado no encontrado");
      }

      await trabajador.destroy();
      return true;
    } catch (error) {
      throw new Error("Error al eliminar el trabajador autorizado: " + error.message);
    }
  }

  /**
   * Filtra trabajadores autorizados según criterios específicos
   * @param {Object} filters - Criterios de filtrado
   * @returns {Promise<Array>} Lista de trabajadores autorizados filtrados
   */
  static async filter(filters) {
    try {
      const whereClause = {};

      if (filters.cargo) {
        whereClause.cargo = filters.cargo;
      }

      if (filters.nombre) {
        whereClause.nombre = filters.nombre;
      }

      if (filters.carnet_identidad) {
        whereClause.carnet_identidad = filters.carnet_identidad;
      }

      if (filters.funcion) {
        whereClause.funcion = filters.funcion;
      }

      return await TrabajadorAutorizado.findAll({
        where: whereClause,
        include: this.getDefaultIncludes()
      });
    } catch (error) {
      throw new Error("Error al filtrar trabajadores autorizados: " + error.message);
    }
  }

  /**
   * Filtra trabajadores autorizados con paginación y búsqueda por entidad
   * @param {Object} filters - Criterios de filtrado
   * @param {number} page - Número de página
   * @param {number} limit - Límite de registros por página
   * @returns {Promise<Object>} Objeto con los trabajadores filtrados y metadatos de paginación
   */
  static async filterWithPagination(filters, page, limit) {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Convertir los criterios de búsqueda a minúsculas para búsqueda insensible a mayúsculas
      if (filters.nombre) {
        whereClause.nombre = {
          [Op.iLike]: `%${filters.nombre.toLowerCase()}%`
        };
      }

      if (filters.cargo) {
        whereClause.cargo = {
          [Op.iLike]: `%${filters.cargo.toLowerCase()}%`
        };
      }

      if (filters.carnet_identidad) {
        whereClause.carnet_identidad = {
          [Op.iLike]: `%${filters.carnet_identidad.toLowerCase()}%`
        };
      }

      if (filters.funcion) {
        whereClause.funcion = filters.funcion;
      }

      // Configurar la búsqueda por entidad si se proporciona
      const includeOptions = [...this.getDefaultIncludes()];
      if (filters.id_entidad) {
        includeOptions[0].include[0].where = {
          id_entidad: filters.id_entidad
        };
        // Agregar subconsulta para encontrar trabajadores relacionados con la entidad
        whereClause.id_trabajador_autorizado = {
          [Op.in]: sequelize.literal(`(
            SELECT DISTINCT ct.id_trabajador_autorizado
            FROM contrato_trabajadors AS ct
            INNER JOIN contratos AS c ON ct.id_contrato = c.id_contrato
            WHERE c.id_entidad = ${filters.id_entidad}
          )`)
        };
      }

      // Obtener el total de registros que coinciden con los filtros
      const total = await TrabajadorAutorizado.count({
        where: whereClause,
        include: includeOptions,
        distinct: true
      });

      // Obtener los registros paginados
      const trabajadores = await TrabajadorAutorizado.findAll({
        where: whereClause,
        include: includeOptions,
        limit: limit,
        offset: offset,
        order: [['nombre', 'ASC']]
      });

      return {
        trabajadores,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error("Error al filtrar trabajadores autorizados: " + error.message);
    }
  }
}

module.exports = TrabajadorAutorizadoService;
