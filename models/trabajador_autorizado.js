const { DataTypes } = require("sequelize");
const sequelize = require("../helpers/database.js");

const TrabajadorAutorizado = sequelize.define("trabajador_autorizado", {
  id_trabajador_autorizado: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  funcion: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['Concidia', 'Firma', 'Concidia y Firma']],
        msg: 'El campo funcion debe ser uno de: Concidia, Firma, Concidia y Firma'
      }
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  carnet_identidad: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [11, 11],
        msg: "El carnet de identidad debe tener exactamente 11 caracteres"
      }
    }
  },
  num_telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true
});

TrabajadorAutorizado.associate = function(models) {
  TrabajadorAutorizado.belongsToMany(models.Contrato, {
    through: models.ContratoTrabajador,
    foreignKey: 'id_trabajador_autorizado',
    otherKey: 'id_contrato',
    as: 'contratos',
  });
  TrabajadorAutorizado.hasMany(models.Factura, {
    foreignKey: 'id_trabajador_autorizado',
    as: 'facturas',
  });
};

module.exports = TrabajadorAutorizado;
