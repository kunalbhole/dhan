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
 * Bridges incoming-SMS capture to JS. This module's only jobs are:
 *   1. requesting RECEIVE_SMS / READ_SMS at runtime,
 *   2. registering/unregistering the BroadcastReceiver, and
 *   3. forwarding the raw sender/body/timestamp as an "onSmsReceived" event.
 * No message parsing happens here — that's JS's job (sms-parser.js).
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
    // SMS_RECEIVED is a protected broadcast — only privileged system
    // processes can send it, so no arbitrary app can spoof it and
    // RECEIVER_EXPORTED is safe. RECEIVER_NOT_EXPORTED silently drops it
    // here: the telephony stack broadcasts as uid 1001 (radio/phone), not
    // the literal system uid, and NOT_EXPORTED's same-app-or-system check
    // excludes that sender.
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

  // Required by NativeEventEmitter on Android even though we don't need to
  // react to (un)subscribe counts — the JS side manages listener lifecycle.
  @ReactMethod
  fun addListener(eventName: String) {}

  @ReactMethod
  fun removeListeners(count: Int) {}

  override fun invalidate() {
    stopListening()
    super.invalidate()
  }
}
