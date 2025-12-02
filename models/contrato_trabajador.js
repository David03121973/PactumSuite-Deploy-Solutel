const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const ContratoTrabajador = sequelize.define("contrato_trabajador", {
  id_contrato_trabajador: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_contrato: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_trabajador_autorizado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

ContratoTrabajador.associate = function(models) {
  ContratoTrabajador.belongsTo(models.Contrato, {
    foreignKey: 'id_contrato',
  });
  ContratoTrabajador.belongsTo(models.TrabajadorAutorizado, {
    foreignKey: 'id_trabajador_autorizado',
  });
};

module.exports = ContratoTrabajador; 