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

var serviceAccount = require("./practiceapp-d1c04-firebase-adminsdk-hagiu-8bc43423ef.json");

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://practiceapp-d1c04.firebaseio.com"
});


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

  },
  async sendNotificationToDevice(title, body, data, userId) {
    data["click_action"] = "FLUTTER_NOTIFICATION_CLICK";

    // from user id get user token

    let user = await strapi.plugins["users-permissions"].services.user.fetch({
      id: userId,
    });

    if (user["firebase_token"]) {

      // console.log(user);
      const message_notification = {
        notification: {
          title: title,
          body: body,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        data: data,
      };
      const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24,
      };
      try {
        const response = await admin
          .messaging()
          .sendToDevice(
            user["firebase_token"],
            message_notification,
            notification_options
          );
        console.log(response);

        if (response.failureCount) {
          if (response.failureCount === 0) {
            return {success: true, message: "notification sent successfully"};
            //successfully
          } else {
            return {
              success: false,
              error: response.results[0].error,
            };
          }
        } else {
          return {success: true, message: "notification sent successfully"};
        }
      } catch (e) {
        return {
          success: false,
          error: "error",
        };
      }
    } else {
      return {
        success: true,
        message: "Notification not sent due invalid toke",
      };
    }
  },


}));
//receiver
