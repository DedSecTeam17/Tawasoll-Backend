'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/users',
    handler: 'user.find',
    config: {
      auth: {},
      prefix: '',
    },
  },
  {
    method: 'POST',
    path: '/users',
    handler: 'user.create',
    config: {
      prefix: '',
    },
  },
  {
    method: 'POST',
    path: '/users/test',
    handler: 'user.test',
    config: {
      prefix: '',
    },
  },
  {
    method: 'POST',
    path: '/users/verify',
    handler: 'user.verify',
    config: {
      prefix: '',
    },
  },


];
