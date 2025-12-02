"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // NOTE: If your usuarios table already has rows, you'll need to provide a default value
    // or run a data-migration step first. This migration assumes it's safe to add a NOT NULL unique column.
    await queryInterface.addColumn('usuarios', 'carnet_identidad', {
      type: Sequelize.STRING(11),
      // Allow null initially so we can backfill existing rows, then a follow-up migration
      // will set NOT NULL and create a unique constraint if desired.
      allowNull: true,
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'carnet_identidad');
  }
};
