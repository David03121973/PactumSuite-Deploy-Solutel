"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure unique constraint exists and set NOT NULL
    await queryInterface.changeColumn('usuarios', 'carnet_identidad', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('usuarios', 'carnet_identidad', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
  }
};
