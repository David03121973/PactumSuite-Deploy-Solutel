const ContratoTrabajador = require("../models/contrato_trabajador");
const { ValidationError, Op } = require("sequelize");
const Contrato = require("../models/contrato");
const TrabajadorAutorizado = require("../models/trabajador_autorizado");
const Entidad = require("../models/entidad");
const TipoContrato = require("../models/tipo_contrato");

class ContratoTrabajadorService {
  /**
   * Configuración común de includes para las consultas
   * @returns {Array} Array de includes para las consultas
   */
  static getDefaultIncludes() {
    return [
      {
        model: Contrato,
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
      },
      {
        model: TrabajadorAutorizado
      }
    ];
  }

  /**
   * Valida los datos de la relación contrato-trabajador
   * @param {Object} relacionData - Datos de la relación a validar
   * @param {number} [excludeId] - ID a excluir en la validación de duplicados (para actualizaciones)
   * @returns {Promise<Array>} Lista de errores encontrados
   */
  static async validateRelacion(relacionData, excludeId = null) {
    const errors = [];

    // Validar campos requeridos
    if (!relacionData.id_contrato) {
      errors.push("El ID del contrato es requerido");
    }
    if (!relacionData.id_trabajador_autorizado) {
      errors.push("El ID del trabajador autorizado es requerido");
    }

    // Si hay campos requeridos, continuar con las validaciones
    if (relacionData.id_contrato && relacionData.id_trabajador_autorizado) {
      // Validar que el contrato exista
      const contrato = await Contrato.findByPk(relacionData.id_contrato);
      if (!contrato) {
        errors.push("El contrato especificado no existe");
      }

      // Validar que el trabajador autorizado exista
      const trabajador = await TrabajadorAutorizado.findByPk(relacionData.id_trabajador_autorizado);
      if (!trabajador) {
        errors.push("El trabajador autorizado especificado no existe");
      }

      // Validar que no exista una relación duplicada
      const whereClause = {
        id_contrato: relacionData.id_contrato,
        id_trabajador_autorizado: relacionData.id_trabajador_autorizado
      };

      if (excludeId) {
        whereClause.id_contrato_trabajador = { [Op.ne]: excludeId };
      }

      const existingRelacion = await ContratoTrabajador.findOne({ where: whereClause });
      if (existingRelacion) {
        errors.push("Ya existe una relación entre este contrato y trabajador");
      }
    }

    return errors;
  }

  /**
   * Obtiene todas las relaciones contrato-trabajador
   * @returns {Promise<Array>} Lista de relaciones contrato-trabajador
   */
  static async getAll() {
    try {
      return await ContratoTrabajador.findAll({
        include: this.getDefaultIncludes()
      });
    } catch (error) {
      throw new Error("Error al obtener las relaciones contrato-trabajador: " + error.message);
    }
  }

  /**
   * Obtiene una relación contrato-trabajador por su ID
   * @param {number} id - ID de la relación
   * @returns {Promise<Object>} Relación contrato-trabajador encontrada
   */
  static async getById(id) {
    try {
      const relacion = await ContratoTrabajador.findByPk(id, {
        include: this.getDefaultIncludes()
      });
      if (!relacion) {
        throw new Error("Relación contrato-trabajador no encontrada");
      }
      return relacion;
    } catch (error) {
      throw new Error("Error al obtener la relación contrato-trabajador: " + error.message);
    }
  }

  /**
   * Crea una nueva relación contrato-trabajador
   * @param {Object} relacionData - Datos de la relación
   * @returns {Promise<Object>} Relación contrato-trabajador creada
   */
  static async create(relacionData) {
    try {
      // Validar datos
      const errors = await this.validateRelacion(relacionData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const newRelacion = await ContratoTrabajador.create(relacionData);
      return await this.getById(newRelacion.id_contrato_trabajador);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error("Datos de relación inválidos: " + error.message);
      }
      throw new Error("Error al crear la relación contrato-trabajador: " + error.message);
    }
  }

  /**
   * Actualiza una relación contrato-trabajador existente
   * @param {number} id - ID de la relación
   * @param {Object} relacionData - Datos actualizados de la relación
   * @returns {Promise<Object>} Relación contrato-trabajador actualizada
   */
  static async update(id, relacionData) {
    try {
      const relacion = await ContratoTrabajador.findByPk(id);
      if (!relacion) {
        throw new Error("Relación contrato-trabajador no encontrada");
      }

      // Validar datos
      const errors = await this.validateRelacion(relacionData, id);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      await relacion.update(relacionData);
      return await this.getById(id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error("Datos de relación inválidos: " + error.message);
      }
      throw new Error("Error al actualizar la relación contrato-trabajador: " + error.message);
    }
  }

  /**
   * Elimina una relación contrato-trabajador
   * @param {number} id - ID de la relación
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  static async delete(id) {
    try {
      const relacion = await ContratoTrabajador.findByPk(id);
      if (!relacion) {
        // No lanzar error, simplemente retornar false
        return false;
      }

      await relacion.destroy();
      return true;
    } catch (error) {
      throw new Error("Error al eliminar la relación contrato-trabajador: " + error.message);
    }
  }

  /**
   * Filtra relaciones contrato-trabajador según criterios específicos
   * @param {Object} filters - Criterios de filtrado
   * @returns {Promise<Array>} Lista de relaciones contrato-trabajador filtradas
   */
  static async filter(filters) {
    try {
      const whereClause = {};
      
      if (filters.id_contrato) {
        whereClause.id_contrato = filters.id_contrato;
      }
      
      if (filters.id_trabajador_autorizado) {
        whereClause.id_trabajador_autorizado = filters.id_trabajador_autorizado;
      }

      return await ContratoTrabajador.findAll({
        where: whereClause,
        include: this.getDefaultIncludes()
      });
    } catch (error) {
      throw new Error("Error al filtrar relaciones contrato-trabajador: " + error.message);
    }
  }

  /**
   * Obtiene todos los trabajadores autorizados de un contrato específico
   * @param {number} contratoId - ID del contrato
   * @returns {Promise<Array>} Lista de trabajadores autorizados del contrato
   */
  static async getTrabajadoresByContrato(contratoId) {
    try {
      const relaciones = await ContratoTrabajador.findAll({
        where: { id_contrato: contratoId },
        include: [
          {
            model: TrabajadorAutorizado
          }
        ]
      });
      return relaciones.map(relacion => relacion.TrabajadorAutorizado);
    } catch (error) {
      throw new Error("Error al obtener los trabajadores del contrato: " + error.message);
    }
  }

  /**
   * Obtiene todos los contratos de un trabajador autorizado específico
   * @param {number} trabajadorId - ID del trabajador autorizado
   * @returns {Promise<Array>} Lista de contratos del trabajador
   */
  static async getContratosByTrabajador(trabajadorId) {
    try {
      const relaciones = await ContratoTrabajador.findAll({
        where: { id_trabajador_autorizado: trabajadorId },
        include: [
          {
            model: Contrato,
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
        ]
      });
      return relaciones.map(relacion => relacion.Contrato);
    } catch (error) {
      throw new Error("Error al obtener los contratos del trabajador: " + error.message);
    }
  }

  static async syncTrabajadorContratos(id_trabajador_autorizado, ids_contratos) {
    // Validar existencia del trabajador autorizado
    const trabajador = await TrabajadorAutorizado.findByPk(id_trabajador_autorizado);
    if (!trabajador) {
      throw new Error('El trabajador autorizado especificado no existe');
    }
    // Validar existencia de los contratos
    const contratos = await Contrato.findAll({ where: { id_contrato: ids_contratos } });
    if (contratos.length !== ids_contratos.length) {
      throw new Error('Uno o más contratos especificados no existen');
    }
    // Obtener relaciones actuales
    const relacionesActuales = await ContratoTrabajador.findAll({
      where: { id_trabajador_autorizado },
    });
    const contratosActuales = relacionesActuales.map(r => r.id_contrato);
    // Determinar cuáles eliminar y cuáles crear
    const aEliminar = relacionesActuales.filter(r => !ids_contratos.includes(r.id_contrato));
    const aCrear = ids_contratos.filter(id => !contratosActuales.includes(id));
    // Eliminar relaciones que sobran
    for (const rel of aEliminar) {
      await rel.destroy();
    }
    // Crear relaciones que faltan
    for (const id_contrato of aCrear) {
      await ContratoTrabajador.create({ id_contrato, id_trabajador_autorizado });
    }
    // Devolver el estado final
    return await ContratoTrabajador.findAll({
      where: { id_trabajador_autorizado },
      include: this.getDefaultIncludes()
    });
  }
}

module.exports = ContratoTrabajadorService; 