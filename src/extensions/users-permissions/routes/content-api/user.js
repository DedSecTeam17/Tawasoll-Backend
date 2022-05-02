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
    path: '/users/verify',
    handler: 'user.verify',
    config: {
      prefix: '',
    },
  },
  {
    method: 'POST',
    path: '/users/contacts',
    handler: 'user.contacts',
    config: {
      prefix: '',
    },
  },
  {
    method: 'POST',
    path: '/users/updateFcm',
    handler: 'user.updateFcm',
    config: {
      prefix: '',
    },
  },







];
