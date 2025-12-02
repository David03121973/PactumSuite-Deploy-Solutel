const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Producto = sequelize.define("producto", {
  id_producto: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El código no puede estar vacío'
      }
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre no puede estar vacío'
      }
    }
  },
  unidadMedida: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
    validate: {
      notEmpty: {
        msg: 'La unidad de medida no puede estar vacío'
      }
    }
  },
  precio: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('precio', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
  costo: {
    type: DataTypes.DOUBLE,
    allowNull: false,
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
  tipoProducto: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Carne",
    validate: {
      notEmpty: {
        msg: 'El tipo de producto no puede estar vacío'
      }
    }
  },
  cantidadExistencia: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('cantidadExistencia', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
}, {
  timestamps: true,
});

Producto.associate = function(models) {
  Producto.belongsToMany(models.Factura, {
    through: models.FacturaProducto,
    foreignKey: 'id_producto',
    otherKey: 'id_factura',
    as: 'facturas',
  });
  Producto.hasMany(models.Salida, {
    foreignKey: 'id_producto',
    as: 'salidas'
  });
};

module.exports = Producto;
