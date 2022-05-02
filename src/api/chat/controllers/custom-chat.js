'use strict';
var base64 = require('base-64');
var utf8 = require('utf8');
const {ModelsUIDProvider} = require("../../../core/helpers");
const {
  REQUEST_ACCESS_ERROR_CODE,
  REQUEST_SUCCESS_CREATED_CODE,
  REQUEST_SUCCESS_EMPTY_DATA
} = require("../../../core/rest_api_response_code");


const {createCoreController} = require('@strapi/strapi').factories;
require('dotenv').config()

const {getService} = require('@strapi/utils');
const mime = require("mime");
const {RealTimeMessenger} = require("../../../core/lib/RealTimeMessenger");

// const uploadService = getService('upload');

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
          "status": REQUEST_SUCCESS_CREATED_CODE,
          "from": id,
          "to": to,
          "ReceiverListeningId": toListeningId,
          "SenderListeningId": fromListeningId,

          "RoomId": chatRoom["RoomId"],
        }
      }
    }

  },
  async sendMessage(ctx) {

    const realTimeMessenger = new RealTimeMessenger()


    const {type, RoomId, to, ReceiverListeningId} = ctx.request.body
    console.log(ReceiverListeningId)
    realTimeMessenger.init(ReceiverListeningId)
    const isTextMessage = type === "text"
    const chatRoomByRoomId = await strapi.db.query(ModelsUIDProvider.chatUID).findOne({
      where: {
        "RoomId": RoomId,
      },
    });

    if (isTextMessage) {
      const message = ctx.request.body["message"]
      const chatMessage = await strapi.entityService.create(ModelsUIDProvider.chatMessageUID, {
        data: {
          "message": message,
          "from": ctx.state.user["id"],
          "to": parseInt(to),
          "chat": chatRoomByRoomId["id"]
        },
        populate: "deep"

      });

      const data = {
        "status": REQUEST_SUCCESS_CREATED_CODE,
        "from": chatMessage["from"]["id"],
        "to": chatMessage["to"]["id"],
        "type": type,
        "message": chatMessage["message"],
        "createdAt": chatMessage["createdAt"]

      }
      realTimeMessenger.sentMessage(data)
      const notificationResponse =  await strapi.service(ModelsUIDProvider.chatUID).sendNotificationToDevice("New message", "Attachment", data, to)

      console.log(notificationResponse)
      return data
    } else {
      const file = ctx.request.files["file"]

      const uploadedFile = await strapi.plugins.upload.services.upload.upload({
        data: {}, //mandatory declare the data(can be empty), otherwise it will give you an undefined error.
        files: {
          path: file["path"],
          name: file["name"],
          type: file["type"], // mime type of the file
          size: file["size"],
        },
      });

      const chatMedia = await strapi.entityService.create(ModelsUIDProvider.chatMediaUID, {
        data: {
          "from": ctx.state.user["id"],
          "to": parseInt(to),
          "chat": chatRoomByRoomId["id"],
          "ChatFile": uploadedFile[0]["id"]
        },
        populate: "deep"
      });


      const data = {
        "data": {
          "status": REQUEST_SUCCESS_CREATED_CODE,
          "from": chatMedia["from"]["id"],
          "to": chatMedia["to"]["id"],
          "type": type,
          "message": chatMedia["ChatFile"]["formats"]["small"]["url"],
          "createdAt": chatMedia["createdAt"]

        }
      }

     const notificationResponse =  await strapi.service(ModelsUIDProvider.chatUID).sendNotificationToDevice("New message", "Attachment", data, to)

      console.log(notificationResponse)
      realTimeMessenger.sentMessage(data)


      return data

      // return "file"
    }
  },

  async allChatRoomMessages(ctx) {

    const {to, RoomId} = ctx.request.body
    const chatRoomByRoomId = await strapi.db.query(ModelsUIDProvider.chatUID).findOne({
      where: {
        "RoomId": RoomId,
      },
    },);


    const entries = await strapi.entityService.findMany(ModelsUIDProvider.chatUID, {
      filters: {"RoomId": RoomId},
      sort: {createdAt: 'DESC'},
      populate: "deep"
    });

    if (entries.length > 0) {


      const chatRoom = entries[0]

      const chatMessages = chatRoom["chat_messages"]
      const chatMedia = chatRoom["chat_medias"]
      let chatRoomMessages = [];


      chatMessages.forEach(message => {
        console.log(message)
        chatRoomMessages.push(
          {
            "from": message["from"]["id"],
            "to": message["to"]["id"],
            "type": "message",
            "message": message["message"],
            "createdAt": message["createdAt"]
          }
        )
      })

      chatMedia.forEach((media) => {
        chatRoomMessages.push(
          {
            "from": media["from"]["id"],
            "to": media["to"]["id"],
            "type": "file",
            "message": media["ChatFile"]["formats"]["small"]["url"],
            "createdAt": media["createdAt"]
          }
        )
      })
      return chatRoomMessages.sort(function (a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });


    } else {
      return {
        "data": {
          "status": REQUEST_SUCCESS_EMPTY_DATA,
          "messages": [],
        }
      }
    }

  }


}));
