'use strict';
var base64 = require('base-64');
var utf8 = require('utf8');
const {ModelsUIDProvider} = require("../../../core/helpers");
const {REQUEST_ACCESS_ERROR_CODE} = require("../../../core/rest_api_response_code");


const {createCoreController} = require('@strapi/strapi').factories;
require('dotenv').config()

module.exports = createCoreController(ModelsUIDProvider.chatUID, ({strapi}) => ({


  async createRoom(ctx) {
    const {to} = ctx.request.body
    var {id} = ctx.state.user
    const privateKey = process.env.PRIVATE_KEY


    var encodedFrom = base64.encode(utf8.encode(`${privateKey}${id}`));
    var encodedTo = base64.encode(utf8.encode(`${privateKey}${to}`));
    const roomId = `${encodedFrom}/${encodedTo}`

    const generatedRoomId = strapi.service(ModelsUIDProvider.chatUID).generateRoomIdFrom(id, to)
    const currentUserBelongToThisChat = strapi.service(ModelsUIDProvider.chatUID).currentUserBelongToThisChat(generatedRoomId, id)

    if (!currentUserBelongToThisChat) {
      return {
        error: {
          "status": REQUEST_ACCESS_ERROR_CODE,
          "name": "AccessError",
          "message": "This chat not belong to you",
        }
      }
    } else {
      const fromListeningId = strapi.service(ModelsUIDProvider.chatUID).getFromIdFromRoomId(generatedRoomId, id)
      const toListeningId = strapi.service(ModelsUIDProvider.chatUID).getToIdFromRoomId(generatedRoomId, id)
      const chatRoom = await strapi.service(ModelsUIDProvider.chatUID).createChatRoom(generatedRoomId)

      return {
        data: {
          "from": id,
          "to": to,
          "ReceiverListeningId": fromListeningId,
          "RoomId": chatRoom["RoomId"],
        }
      }
    }

  }


}));
