'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const settingsId = await queryInterface.rawSelect('settings', { where: {}, limit: 1 }, ['id']);
    if (!settingsId) {
      return queryInterface.bulkInsert('settings', [{
        email: 'cosmemarins@gmail.com',
        password: bcrypt.hashSync('sardinha00'),
        apiUrl: 'https://testnet.binance.vision/api',
        streamUrl: 'wss://testnet.binance.vision/ws',
        phone: null,
        sendGridKey: null,
        twilioSid: null,
        twilioToken: null,
        twilioPhone: null,
        telegramBot: '5191383434:AAHNoeJVN6EJqU5Bf9MMCipV5VQStuN_sS4',
        telegramToken: null,
        telegramChat: 868716758,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('settings', null, {});
  }
};
