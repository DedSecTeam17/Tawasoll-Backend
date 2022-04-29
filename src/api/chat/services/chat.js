'use strict';

/**
 * chat service.
 */
var base64 = require('base-64');
var utf8 = require('utf8');
const {ModelsUIDProvider} = require("../../../core/helpers");
require('dotenv').config()

const {createCoreService} = require('@strapi/strapi').factories;
const privateKey = process.env.PRIVATE_KEY

module.exports = createCoreService('api::chat.chat', ({strapi}) => ({


  generateRoomIdFrom(sender, receiver) {

    var encodedFrom = base64.encode(utf8.encode(`${privateKey}${sender}`));
    var encodedTo = base64.encode(utf8.encode(`${privateKey}${receiver}`));
    return `${encodedFrom}/${encodedTo}`
  },
  getFromIdFromRoomId(roomId, from) {

    const roomIdSeperated = roomId.split("/")

    if (roomIdSeperated[0] === from) {
      return roomIdSeperated[0]
    } else {
      return roomIdSeperated[1]
    }
  },
  getToIdFromRoomId(roomId, from) {
    const roomIdSeperated = roomId.split("/")

    if (roomIdSeperated[0] !== from) {
      return roomIdSeperated[0]
    } else {
      return roomIdSeperated[1]
    }
  },
  currentUserBelongToThisChat(roomId, userId) {
    const roomIdSeperated = roomId.split("/")
    const decodedFrom = base64.decode(roomIdSeperated[0]).replaceAll(privateKey, "")
    const decodedTo = base64.decode(roomIdSeperated[1]).replaceAll(privateKey, "")

    return userId.toString() === decodedFrom || userId.toString() === decodedTo
  },
  async createChatRoom(roomId) {
    // const result = await strapi.service(ModelsUIDProvider.chatUID).find({"id": roomId})

    const chatRoomByRoomId = await strapi.db.query(ModelsUIDProvider.chatUID).findOne({
      where: {
        "RoomId": roomId,
      },
    });


    if (chatRoomByRoomId) {
      return chatRoomByRoomId
    } else {
      return await strapi.entityService.create(ModelsUIDProvider.chatUID, {
        data: {
          "RoomId": roomId
        },
      });


    }

  }

}));
//receiver
