class PluginsNameHelper {
  static userPermissionPlugin = "plugin::users-permissions.user"
  static userPermissionPluginRole = "plugin::users-permissions.role"

}


class ModelsUIDProvider {
  static chatUID = "api::chat.chat"
  static chatMessageUID = "api::chat-message.chat-message"
  static chatMediaUID = "api::chat-media.chat-media"


}

module.exports = {
  PluginsNameHelper,
  ModelsUIDProvider
}
