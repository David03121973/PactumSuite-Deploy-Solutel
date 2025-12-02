"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('productos', 'costo', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn('productos', 'tipoProducto', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Carne',
    });

    await queryInterface.addColumn('productos', 'cantidadExistencia', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: 0.00,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('productos', 'costo');
    await queryInterface.removeColumn('productos', 'tipoProducto');
    await queryInterface.removeColumn('productos', 'cantidadExistencia');
  }
};
