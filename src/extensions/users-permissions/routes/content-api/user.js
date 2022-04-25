'use strict';

module.exports = [

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
];
