const Notification = require('../models/Notification')
const { NOTIFICATION_STATUS_UNREAD } = require('../constants/notification')
/**
 * @class UploadHelper
 * @description Upload files helper
 */
module.exports = class NotificationHelper {
  /**
   * send notification to user
   * @param {object} params
   * @param {string} params.userId
   * @param {string} params.title
   * @param {string} params.message
   * @param {"read" | "unread"} params.status
   * @param {string} params.model
   * @param {string} params.modelId
   * @returns
   */
  static generate = async ({
    userId,
    title,
    message,
    status = NOTIFICATION_STATUS_UNREAD,
    model,
    modelId,
  }) => {
    const notificationObject = {
      title,
      message,
      status,
      user: userId,
      model,
      modelId,
    }
    const notification = await Notification.create(notificationObject)

    return notification
  }
}
