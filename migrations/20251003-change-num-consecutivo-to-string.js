"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('contratos', 'num_consecutivo', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('contratos', 'num_consecutivo', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
