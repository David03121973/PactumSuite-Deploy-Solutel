const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const FacturaProducto = sequelize.define("factura_producto", {
  id_factura_producto: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_factura: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
    }
  },
  precioVenta: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('precioVenta', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
  costoVenta: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('costoVenta', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
}, {
  timestamps: true,
});

FacturaProducto.associate = function(models) {
  FacturaProducto.belongsTo(models.Factura, {
    foreignKey: 'id_factura',
    as: 'factura',
  });
  FacturaProducto.belongsTo(models.Producto, {
    foreignKey: 'id_producto',
    as: 'producto',
  });
};

module.exports = FacturaProducto;
