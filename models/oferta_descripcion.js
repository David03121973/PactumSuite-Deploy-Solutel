const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const OfertaDescripcion = sequelize.define("oferta_descripcion", {
  id_oferta_descripcion: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción no puede estar vacía'
      }
    }
  },
  id_oferta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

OfertaDescripcion.associate = function(models) {
  OfertaDescripcion.belongsTo(models.Oferta, {
    foreignKey: 'id_oferta',
    as: 'oferta',
  });
};

module.exports = OfertaDescripcion; 