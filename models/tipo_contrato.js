const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const TipoContrato = sequelize.define("tipo_contrato", {
  id_tipo_contrato: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: true
});

TipoContrato.associate = function(models) {
  const { Contrato } = models;
  if (Contrato) {
    TipoContrato.hasMany(Contrato, {
      foreignKey: 'id_tipo_contrato',
      as: 'contratos'
    });
  }
};

module.exports = TipoContrato;
