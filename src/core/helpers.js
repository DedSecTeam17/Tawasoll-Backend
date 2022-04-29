class PluginsNameHelper {
  static userPermissionPlugin = "plugin::users-permissions.user"
  static userPermissionPluginRole = "plugin::users-permissions.role"

}


class ModelsUIDProvider {
  static chatUID = "api::chat.chat"

}

module.exports = {
  PluginsNameHelper,
  ModelsUIDProvider
}
