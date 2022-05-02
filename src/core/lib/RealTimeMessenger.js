require("dotenv").config();


const PubNub = require('pubnub');
const pubnub = new PubNub({
  publishKey: "pub-c-34261a60-264b-4738-af87-0e51d6bd706d",
  subscribeKey: "sub-c-6c7e2cc4-5735-11eb-b457-5af98b55985e",
  uuid: "myUniqueUUID",
});

class RealTimeMessenger {

  channel = ""

  init(channel) {
    this.channel = channel
    pubnub.subscribe({
      channels: [channel]
    });
  }


  sentMessage(message) {
    const payload = {
      channel: this.channel,
      message: message
    }

    // console.log(payload)
    pubnub.publish(payload, function (status, response) {
      console.log(status, response);
    })
  }
}

module.exports = {
  RealTimeMessenger
}
