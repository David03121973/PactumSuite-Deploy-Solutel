const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Entrada = sequelize.define("entrada", {
  id_entrada: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_factura: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_contrato: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cantidadEntrada: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('cantidadEntrada', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
  costo: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('costo', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
  nota: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
}, {
  timestamps: true,
});

Entrada.associate = function(models) {
  Entrada.belongsTo(models.Factura, {
    foreignKey: 'id_factura',
    as: 'factura',
  });
  Entrada.belongsTo(models.Producto, {
    foreignKey: 'id_producto',
    as: 'producto',
  });
  Entrada.belongsTo(models.Contrato, {
    foreignKey: 'id_contrato',
    as: 'contrato',
  });
};

module.exports = Entrada;
