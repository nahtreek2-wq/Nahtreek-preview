package com.nahtreek.push

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.ViewManager
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.lang.ref.WeakReference

object NahtreekPush {
  private var react = WeakReference<ReactApplicationContext>(null)
  fun initialize(context: Context, appId: String, apiKey: String, projectId: String, senderId: String) {
    if (appId.isBlank() || apiKey.isBlank() || projectId.isBlank() || senderId.isBlank()) return
    if (FirebaseApp.getApps(context).isEmpty()) {
      FirebaseApp.initializeApp(context, FirebaseOptions.Builder().setApplicationId(appId)
        .setApiKey(apiKey).setProjectId(projectId).setGcmSenderId(senderId).build())
    }
  }
  fun configured(context: Context) = FirebaseApp.getApps(context).isNotEmpty()
  fun attach(context: ReactApplicationContext) { react = WeakReference(context) }
  fun emit(name: String) {
    val context = react.get() ?: return
    if (context.hasActiveReactInstance()) context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(name, null)
  }
  fun enabled(context: Context) = context.getSharedPreferences("nahtreek_push", Context.MODE_PRIVATE).getBoolean("enabled", false)
  private val deepLinkKeys = listOf("destination", "conversationId", "serviceRequestId", "senderName", "notificationId", "kind")
  fun extrasPayload(intent: Intent?): Map<String, String>? {
    if (intent == null) return null
    val out = mutableMapOf<String, String>()
    for (key in deepLinkKeys) intent.getStringExtra("nahtreek_push_$key")?.let { out[key] = it }
    return if (out.isEmpty()) null else out
  }
  fun clearPayload(intent: Intent?) {
    if (intent == null) return
    for (key in deepLinkKeys) intent.removeExtra("nahtreek_push_$key")
  }
  fun emitOpened(intent: Intent?) {
    val payload = extrasPayload(intent) ?: return
    val context = react.get() ?: return
    if (!context.hasActiveReactInstance()) return
    val map = Arguments.createMap()
    for ((key, value) in payload) map.putString(key, value)
    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("NahtreekPushOpened", map)
  }
}

class NahtreekPushModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  init { NahtreekPush.attach(context) }
  override fun getName() = "NahtreekPush"
  override fun getConstants(): MutableMap<String, Any> = mutableMapOf("configured" to NahtreekPush.configured(context))
  @ReactMethod fun addListener(name: String) {}
  @ReactMethod fun removeListeners(count: Double) {}
  @ReactMethod fun getToken(promise: Promise) {
    if (!NahtreekPush.configured(context)) { promise.resolve(null); return }
    context.getSharedPreferences("nahtreek_push", Context.MODE_PRIVATE).edit().putBoolean("enabled", true).apply()
    FirebaseMessaging.getInstance().isAutoInitEnabled = true
    FirebaseMessaging.getInstance().token.addOnSuccessListener { promise.resolve(it) }
      .addOnFailureListener { promise.reject("PUSH_TOKEN", "Could not enable notifications. Please try again.") }
  }
  @ReactMethod fun disable() {
    context.getSharedPreferences("nahtreek_push", Context.MODE_PRIVATE).edit().putBoolean("enabled", false).apply()
    (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancelAll()
    if (NahtreekPush.configured(context)) FirebaseMessaging.getInstance().isAutoInitEnabled = false
  }
  @ReactMethod fun getInitialNotification(promise: Promise) {
    val intent = currentActivity?.intent
    val payload = NahtreekPush.extrasPayload(intent)
    NahtreekPush.clearPayload(intent)
    if (payload == null) { promise.resolve(null); return }
    val map = Arguments.createMap()
    for ((key, value) in payload) map.putString(key, value)
    promise.resolve(map)
  }
}

class NahtreekPushPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(NahtreekPushModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class NahtreekMessagingService : FirebaseMessagingService() {
  override fun onNewToken(token: String) { NahtreekPush.emit("NahtreekPushTokenChanged") }
  override fun onMessageReceived(message: RemoteMessage) {
    if (!NahtreekPush.enabled(this)) return
    val id = message.data["notificationId"] ?: return
    NahtreekPush.emit("NahtreekPushReceived")
    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val kind = message.data["kind"] ?: "update"
    val tip = kind == "offer"
    val channel = if (tip) "nahtreek_tips" else "nahtreek_updates"
    if (Build.VERSION.SDK_INT >= 26) manager.createNotificationChannel(NotificationChannel(channel, if (tip) "Helpful reminders and tips" else "Work and account updates", if (tip) NotificationManager.IMPORTANCE_DEFAULT else NotificationManager.IMPORTANCE_HIGH))
    val intent = packageManager.getLaunchIntentForPackage(packageName) ?: return
    intent.action = "com.nahtreek.push.OPEN"
    for ((key, value) in message.data) intent.putExtra("nahtreek_push_$key", value)
    val pending = PendingIntent.getActivity(this, id.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val builder = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(this, channel) else Notification.Builder(this)
    val icon = resources.getIdentifier("ic_stat_nahtreek", "drawable", packageName)
    val title = message.data["title"]?.take(120) ?: when (kind) { "request" -> "Booking update"; "reminder" -> "Reminder"; "message" -> "A new message is waiting"; "verification" -> "Your profile has an update"; "offer" -> "Something worth a look"; else -> "NAHTREEK" }
    val body = message.data["body"]?.take(240) ?: when (kind) { "request" -> "Tap to see the latest on your request."; "reminder" -> "Tap to open your booking."; "message" -> "Open NAHTREEK to read and reply."; "offer" -> "Tap to see what is new for your home."; else -> "Open NAHTREEK to see what needs your attention." }
    builder.setSmallIcon(if (icon != 0) icon else applicationInfo.icon).setContentTitle(title)
      .setContentText(body).setStyle(Notification.BigTextStyle().bigText(body))
      .setContentIntent(pending).setAutoCancel(true)
    manager.notify(id, 1, builder.build())
  }
}
