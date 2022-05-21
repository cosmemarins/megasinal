'use strict';

const { encrypt } = require('../src/utils/crypto');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userId = await queryInterface.rawSelect('users', { where: {}, limit: 1 }, ['id']);
    if (!userId) {
      const limitId = await queryInterface.rawSelect('limits', { where: {}, limit: 1 }, ['id']);
      return queryInterface.bulkInsert('users', [{
        name: 'Cosme Marins',
        email: 'cosme.marins@gmail.com',
        password: bcrypt.hashSync('sardinha00'),
        limitId,
        isActive: true,
        accessKey: 'k96O3msZR8lZXTzx1DjosPJfnYIuXVMVEIBdnp5pzpnDR21FEYnIEI3kUTvCuAC8',
        secretKey: encrypt('dL8rXkwFR9CUcLKc2APD7jUs6Yz5wmyobm7o5ZBphJlqBlZJU762NhtnGwOV6pXv'),
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
