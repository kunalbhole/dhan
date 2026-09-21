package com.dhanapp.sms

import android.Manifest
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.provider.Telephony
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

/**
 * Bridges incoming-SMS capture to JS. This module's jobs are:
 *   1. requesting RECEIVE_SMS / READ_SMS at runtime,
 *   2. registering/unregistering the BroadcastReceiver,
 *   3. querying Telephony.Sms.Inbox to scan existing past SMS messages, and
 *   4. forwarding raw sender/body/timestamp as an "onSmsReceived" event.
 * No message parsing happens here — that's JS's job (smsParser.ts).
 */
class SmsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val TAG = "DhanSms"
    const val NAME = "SmsModule"
    private const val PERMISSION_REQUEST_CODE = 5501
    private val SMS_PERMISSIONS =
      arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
  }

  private var receiver: SmsReceiver? = null

  override fun getName() = NAME

  // Covers the case where permission was granted in a previous session:
  // register the receiver as soon as the module spins up, without waiting
  // for JS to call requestPermission() again.
  override fun initialize() {
    super.initialize()
    if (hasSmsPermissions()) {
      Log.d(TAG, "initialize: permission already granted, starting listener")
      startListening()
    }
  }

  private fun hasSmsPermissions(): Boolean =
    SMS_PERMISSIONS.all {
      ContextCompat.checkSelfPermission(reactApplicationContext, it) ==
        PackageManager.PERMISSION_GRANTED
    }

  @ReactMethod
  fun hasPermission(promise: Promise) {
    promise.resolve(hasSmsPermissions())
  }

  /**
   * Fires the OS permission dialog. JS is expected to show its own
   * in-app rationale UI *before* calling this — this method only wraps the
   * native prompt + the resulting receiver registration.
   */
  @ReactMethod
  fun requestPermission(promise: Promise) {
    if (hasSmsPermissions()) {
      Log.d(TAG, "requestPermission: already granted")
      startListening()
      promise.resolve(true)
      return
    }

    val activity = reactApplicationContext.currentActivity
    if (activity !is PermissionAwareActivity) {
      Log.d(TAG, "requestPermission: no PermissionAwareActivity available")
      promise.reject("NO_ACTIVITY", "No foreground activity to request permissions from")
      return
    }

    Log.d(TAG, "requestPermission: launching OS prompt")
    activity.requestPermissions(
      SMS_PERMISSIONS,
      PERMISSION_REQUEST_CODE,
      PermissionListener { requestCode, _, grantResults ->
        if (requestCode != PERMISSION_REQUEST_CODE) return@PermissionListener false
        val granted =
          grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }
        Log.d(TAG, "requestPermission: result granted=$granted")
        if (granted) startListening()
        promise.resolve(granted)
        true
      },
    )
  }

  /**
   * Queries content://sms/inbox to read existing bank/transaction SMS messages
   * already present in the user's phone inbox.
   */
  @ReactMethod
  fun readExistingSms(limit: Int, promise: Promise) {
    if (!hasSmsPermissions()) {
      promise.reject("PERMISSION_DENIED", "SMS permissions not granted")
      return
    }

    try {
      val maxCount = if (limit > 0) limit else 500
      val cursor = reactApplicationContext.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        arrayOf(
          Telephony.Sms.ADDRESS,
          Telephony.Sms.BODY,
          Telephony.Sms.DATE
        ),
        null,
        null,
        "${Telephony.Sms.DATE} DESC LIMIT $maxCount"
      )

      val array = Arguments.createArray()
      cursor?.use {
        val addressIdx = it.getColumnIndex(Telephony.Sms.ADDRESS)
        val bodyIdx = it.getColumnIndex(Telephony.Sms.BODY)
        val dateIdx = it.getColumnIndex(Telephony.Sms.DATE)

        while (it.moveToNext()) {
          val sender = if (addressIdx >= 0) it.getString(addressIdx) else null
          val body = if (bodyIdx >= 0) it.getString(bodyIdx) else ""
          val date = if (dateIdx >= 0) it.getLong(dateIdx) else System.currentTimeMillis()

          val map = Arguments.createMap().apply {
            putString("sender", sender)
            putString("body", body)
            putDouble("timestamp", date.toDouble())
          }
          array.pushMap(map)
        }
      }
      Log.d(TAG, "readExistingSms: successfully scanned ${array.size()} messages")
      promise.resolve(array)
    } catch (e: Exception) {
      Log.e(TAG, "readExistingSms error: ${e.message}", e)
      promise.reject("READ_SMS_ERROR", e.message, e)
    }
  }

  /**
   * Total row count of the inbox — used by the JS-side history scanner
   * (src/lib/historyScanner.ts) purely to compute a progress percentage.
   */
  @ReactMethod
  fun getSmsCount(promise: Promise) {
    if (!hasSmsPermissions()) {
      promise.reject("PERMISSION_DENIED", "SMS permissions not granted")
      return
    }
    try {
      val cursor = reactApplicationContext.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        arrayOf(Telephony.Sms._ID),
        null,
        null,
        null
      )
      val count = cursor?.use { it.count } ?: 0
      promise.resolve(count)
    } catch (e: Exception) {
      Log.e(TAG, "getSmsCount error: ${e.message}", e)
      promise.reject("READ_SMS_ERROR", e.message, e)
    }
  }

  /**
   * Cursor-paged read for the full-history scan, oldest-first, ordered by
   * the inbox's own stable row id (not DATE) — so a page boundary never
   * shifts under us if a new SMS arrives mid-scan, and "resume from where
   * we stopped" is just "give me rows with _id > lastSeenId". `afterId`
   * is 0 on the very first page (SMS row ids start at 1).
   */
  @ReactMethod
  fun readSmsPage(afterId: Double, limit: Int, promise: Promise) {
    if (!hasSmsPermissions()) {
      promise.reject("PERMISSION_DENIED", "SMS permissions not granted")
      return
    }
    try {
      val maxCount = if (limit > 0) limit else 200
      val cursor = reactApplicationContext.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        arrayOf(
          Telephony.Sms._ID,
          Telephony.Sms.ADDRESS,
          Telephony.Sms.BODY,
          Telephony.Sms.DATE
        ),
        "${Telephony.Sms._ID} > ?",
        arrayOf(afterId.toLong().toString()),
        "${Telephony.Sms._ID} ASC LIMIT $maxCount"
      )

      val array = Arguments.createArray()
      cursor?.use {
        val idIdx = it.getColumnIndex(Telephony.Sms._ID)
        val addressIdx = it.getColumnIndex(Telephony.Sms.ADDRESS)
        val bodyIdx = it.getColumnIndex(Telephony.Sms.BODY)
        val dateIdx = it.getColumnIndex(Telephony.Sms.DATE)

        while (it.moveToNext()) {
          val id = if (idIdx >= 0) it.getLong(idIdx) else 0L
          val sender = if (addressIdx >= 0) it.getString(addressIdx) else null
          val body = if (bodyIdx >= 0) it.getString(bodyIdx) else ""
          val date = if (dateIdx >= 0) it.getLong(dateIdx) else System.currentTimeMillis()

          val map = Arguments.createMap().apply {
            putDouble("id", id.toDouble())
            putString("sender", sender)
            putString("body", body)
            putDouble("timestamp", date.toDouble())
          }
          array.pushMap(map)
        }
      }
      promise.resolve(array)
    } catch (e: Exception) {
      Log.e(TAG, "readSmsPage error: ${e.message}", e)
      promise.reject("READ_SMS_ERROR", e.message, e)
    }
  }

  private fun startListening() {
    if (receiver != null) {
      Log.d(TAG, "startListening: already registered, skipping")
      return
    }
    val onSms: (String?, String, Long) -> Unit = { sender, body, timestamp ->
      Log.d(TAG, "onSms: sender=$sender body.len=${body.length} timestamp=$timestamp")
      val payload =
        Arguments.createMap().apply {
          putString("sender", sender)
          putString("body", body)
          putDouble("timestamp", timestamp.toDouble())
        }
      reactApplicationContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("onSmsReceived", payload)
    }
    val r = SmsReceiver(onSms)
    ContextCompat.registerReceiver(
      reactApplicationContext,
      r,
      IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION),
      ContextCompat.RECEIVER_EXPORTED,
    )
    receiver = r
    Log.d(TAG, "startListening: receiver registered")
  }

  private fun stopListening() {
    receiver?.let {
      reactApplicationContext.unregisterReceiver(it)
      Log.d(TAG, "stopListening: receiver unregistered")
    }
    receiver = null
  }

  @ReactMethod
  fun addListener(eventName: String) {}

  @ReactMethod
  fun removeListeners(count: Int) {}

  override fun invalidate() {
    stopListening()
    super.invalidate()
  }
}
