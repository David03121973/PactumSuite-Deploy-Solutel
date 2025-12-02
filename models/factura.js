const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Factura = sequelize.define("factura", {
  id_factura: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  num_consecutivo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "No Facturado",
    validate: {
      isIn: {
        args: [['Facturado', 'No Facturado', 'Cancelado']],
        msg: 'El campo estado debe ser "Facturado", "No Facturado" o "Cancelado"'
      }
    }
  },
  id_contrato: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_trabajador_autorizado: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nota: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cargoAdicional: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'El campo cargoAdicional no puede ser negativo'
      }
    }
  },
}, {
  timestamps: true,
});

Factura.associate = function(models) {
  Factura.belongsTo(models.Contrato, {
    foreignKey: 'id_contrato',
    as: 'contrato',
  });
  Factura.belongsTo(models.TrabajadorAutorizado, {
    foreignKey: 'id_trabajador_autorizado',
    as: 'trabajadorAutorizado',
  });
  Factura.hasMany(models.Servicio, {
    foreignKey: 'id_factura',
    as: 'servicio',
  });
  Factura.belongsToMany(models.Producto, {
    through: models.FacturaProducto,
    foreignKey: 'id_factura',
    otherKey: 'id_producto',
    as: 'productos',
  });
  // Asociación con Usuario: una factura es firmada por un usuario
  Factura.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario',
    as: 'usuario',
  });
};

module.exports = Factura;
