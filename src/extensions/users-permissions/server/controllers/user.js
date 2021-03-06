'use strict';
const {PluginsNameHelper, ModelsUIDProvider} = require("../../../../core/helpers");
const {getService} = require("@strapi/plugin-users-permissions/server/utils");
require('dotenv').config()


// let {userPermissionPlugin} = require("../../../../core/helpers");

// twilio stuff


const twilio = {
  id: process.env.TWILIO_SECRET_TOKEN,
  token: process.env.TWILIO_AUTH_TOKEN,
  phone: "+16626667122"
};

const smsClient = require('twilio')(twilio.id, twilio.token);


const utils = require('@strapi/utils');
const {SmsClient} = require("../../../../core/lib/SmsClient");
const {
  REQUEST_SUCCESS_CODE,
  REQUEST_SUCCESS_EMPTY_DATA,
  REQUEST_SUCCESS_UPDATED_CODE
} = require("../../../../core/rest_api_response_code");
const {sanitize} = utils;
const {ApplicationError, ValidationError} = utils.errors;

const sanitizeOutput = (user, ctx) => {
  const schema = strapi.getModel('plugin::users-permissions.user');
  const {auth} = ctx.state;

  return sanitize.contentAPI.output(user, schema, {auth});
};

module.exports = {


  async create(ctx) {

    const {phone} = ctx.request.body;
    if (!phone) return ctx.badRequest('missing.phone');

    console.log(PluginsNameHelper.userPermissionPlugin)

    const userWithPhoneNumber = await strapi
      .query(PluginsNameHelper.userPermissionPlugin)
      .findOne({where: {"PrimaryPhone": phone}});

    const token = Math.floor(Math.pow(10, 3) + Math.random() * (Math.pow(10, 4) - Math.pow(10, 3) - 1))
    let user = {
      PrimaryPhone: phone,
      provider: 'local',
      token
    };


    const advanced = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    const defaultRole = await strapi
      .query(PluginsNameHelper.userPermissionPluginRole)
      .findOne({where: {type: advanced.default_role}});

    user.role = defaultRole.id;

    try {

      let isNewCustomer = true
      let sanitizedData = {}

      if (userWithPhoneNumber) {
        const data = await getService('user').edit(userWithPhoneNumber.id, user);
        sanitizedData = await sanitizeOutput(data, ctx);
        isNewCustomer = false
      } else {
        const data = await getService('user').add(user);
        sanitizedData = await sanitizeOutput(data, ctx);
        isNewCustomer = true

      }
      await new SmsClient().sendMessage(phone, `Your verification code from Tawasoll is ${token}`)

      return {
        "success": true,
        "new_user": isNewCustomer,
        "user": sanitizedData
      };

    } catch (e) {
      throw new ApplicationError(e.message);

    }

  },

  async verify(ctx) {


    const {phone, token} = ctx.request.body;


    if (!phone) return ctx.badRequest('missing.phone');
    if (!token) return ctx.badRequest('missing.token');


    try {

      const userWhereTokenAndPhone = await strapi
        .query(PluginsNameHelper.userPermissionPlugin)
        .findOne({where: {"PrimaryPhone": phone, token}});

      if (!userWhereTokenAndPhone) {
        return {
          success: false,
          message: 'Invalid Verification Code',
        };
      } else {
        let updateData = {
          token: token,
          confirmed: true
        };
        const data = await getService('user').edit(userWhereTokenAndPhone.id, updateData);
        const jwt = await getService('jwt').issue({
          id: data.id,
        });


        const {email, username} = data
        return {
          success: true,
          message: 'User verified successfully',
          "jwt": jwt,
          "user": data
        };

      }

    } catch (e) {
      throw new ApplicationError(e.message);

    }


  },

  async find(ctx, next, {populate} = {}) {
    console.log(populate)
    const users = await getService('user').fetchAll(ctx.query.filters, populate);

    ctx.body = await Promise.all(users.map(user => sanitizeOutput(user, ctx)));
  },

  async contacts(ctx) {
    const {contacts} = ctx.request.body
    const {PrimaryPhone} = ctx.state.user
    const parsedContacts = JSON.parse(contacts)
    const contactsWithOutMyNumber = parsedContacts.filter(contact => contact !== PrimaryPhone)


    let result = await strapi.query(PluginsNameHelper.userPermissionPlugin).findMany({
      where: {
        "PrimaryPhone": contactsWithOutMyNumber
      },
    });


    if (result.length > 0) {
      return {
        "data": {
          "status": REQUEST_SUCCESS_CODE,
          "contacts": result.map((contact) => {
            return {
              "to": contact["id"],
              "PrimaryPhone": contact["PrimaryPhone"]
            }
          })
        }
      }
    } else {
      return {
        "data": {
          "status": REQUEST_SUCCESS_EMPTY_DATA,
          "contacts": []
        }
      }
    }
  },

  async updateFcm(ctx) {
    const {token} = ctx.request.body;
    if (!token) return ctx.badRequest('missing.token');
    const user = ctx.state.user

    try {
      const data = await getService('user').edit(user.id, {
        "firebase_token": token
      });
      return {
        "data": {
          "status": REQUEST_SUCCESS_UPDATED_CODE,
          "message": "Firebase token updated successfully"
        }
      };
    } catch (e) {
      throw new ApplicationError(e.message);

    }


  }
}
;
