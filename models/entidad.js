const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const Entidad = sequelize.define("entidad", {
  id_entidad: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
    defaultValue: null
  },
  consecutivo: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
    defaultValue: null
  },
  organismo: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
    defaultValue: null
  },
  cuenta_bancaria: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  tipo_entidad: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  codigo_reo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  codigo_nit: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
}, {
  timestamps: true,
});

Entidad.associate = function(models) {
  Entidad.hasMany(models.Contrato, {
    foreignKey: 'id_entidad',
  });
};

module.exports = Entidad; 