const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Servicio = sequelize.define("servicio", {
  id_servicio: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  importe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true,
    },
    set(value) {
      // Redondear a 2 decimales
      this.setDataValue('importe', Math.round(parseFloat(value || 0) * 100) / 100);
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    validate: {
      min: 1,
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
  id_factura: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Servicio.associate = function(models) {
  Servicio.belongsTo(models.Factura, {
    foreignKey: 'id_factura',
    as: 'factura',
  });
};

module.exports = Servicio;
