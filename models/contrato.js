const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Contrato = sequelize.define("contrato", {
  id_contrato: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_entidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_tipo_contrato: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  num_consecutivo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  clasificacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nota: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ClienteOProveedor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Cliente",
    validate: {
      isIn: {
        args: [['Cliente', 'Proveedor']],
        msg: 'El campo ClienteOProveedor debe ser "Cliente" o "Proveedor"'
      }
    }
  },
  vigenciaFacturasDias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    validate: {
      min: {
        args: [0],
        msg: 'El campo vigenciaFacturasDias no puede ser negativo'
      }
    }
  },
}, {
  timestamps: true,
});

Contrato.associate = function(models) {
  Contrato.belongsTo(models.Entidad, {
    foreignKey: 'id_entidad',
    as: 'entidad',
  });
  Contrato.belongsTo(models.TipoContrato, {
    foreignKey: 'id_tipo_contrato',
    as: 'tipoContrato',
  });
  Contrato.hasMany(models.Oferta, {
    foreignKey: 'id_contrato',
  });
  Contrato.belongsToMany(models.TrabajadorAutorizado, {
    through: models.ContratoTrabajador,
    foreignKey: 'id_contrato',
    otherKey: 'id_trabajador_autorizado',
    as: 'trabajadoresAutorizados',
  });
  Contrato.hasMany(models.Factura, {
    foreignKey: 'id_contrato',
    as: 'facturas',
  });
};

module.exports = Contrato;