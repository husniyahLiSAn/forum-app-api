/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken() {
    const user = {
      id: 'user-123',
      username: 'dicoding',
      password: 'secret_password',
      fullname: 'Dicoding Indonesia',
    };

    await UsersTableTestHelper.addUser(user);

    const payload = {
      id: 'user-123',
      username: 'dicoding',
    };
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = ServerTestHelper;
