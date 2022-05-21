'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const limitId = await queryInterface.rawSelect('limits', { where: {}, limit: 1 }, ['id']);
    if (!limitId) {
      return queryInterface.bulkInsert('limits', [{
        name: 'Gold',
        maxAutomations: 8,
        maxMonitors: 8,
        maxBacktests: 8,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Silver',
        maxAutomations: 6,
        maxMonitors: 6,
        maxBacktests: 6,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bronze',
        maxAutomations: 4,
        maxMonitors: 4,
        maxBacktests: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('limits', null, {});
  }
};
