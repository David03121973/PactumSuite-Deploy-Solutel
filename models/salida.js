const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Salida = sequelize.define("salida", {
  id_salida: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_usuario: {
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
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción no puede estar vacía'
      }
    }
  },
  cantidad: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('cantidad', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
}, {
  timestamps: true,
});

Salida.associate = function(models) {
  Salida.belongsTo(models.Producto, {
    foreignKey: 'id_producto',
    as: 'producto',
  });
  Salida.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario',
    as: 'usuario',
  });
};

module.exports = Salida;


