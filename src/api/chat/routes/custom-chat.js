module.exports = {
  routes: [
    { // Path defined with a URL parameter
      method: 'POST',
      path: '/chat/createRoom',
      handler: 'custom-chat.createRoom',
    },
    { // Path defined with a URL parameter
      method: 'POST',
      path: '/chat/sendMessage',
      handler: 'custom-chat.sendMessage',
    },
    {
      method: 'POST',
      path: '/chat/allChatRoomMessages',
      handler: 'custom-chat.allChatRoomMessages',
    },




  ]
}
