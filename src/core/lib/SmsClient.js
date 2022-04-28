const twilio = {
  id: process.env.TWILIO_SECRET_TOKEN,
  token: process.env.TWILIO_AUTH_TOKEN,
  phone: "+16626667122"
};
const smsClient = require('twilio')(twilio.id, twilio.token);


class SmsClient {

  async sendMessage(phone, messageToSend) {
    var smsClientResponse = await smsClient.messages.create({
      to: phone,
      from: twilio.phone,
      body: messageToSend
    })
  }

}


module.exports = {
  SmsClient
}
