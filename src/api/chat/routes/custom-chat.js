module.exports = {
  routes: [
    { // Path defined with a URL parameter
      method: 'POST',
      path: '/chat/createRoom',
      handler: 'custom-chat.createRoom',
    }
  ]
}
