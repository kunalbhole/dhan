package com.dhanapp.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

/**
 * Pure capture — no parsing, no category/amount/merchant logic. That all
 * lives in JS (see Dhan App 2/sms-parser.js), so a raw payload is all this
 * forwards.
 */
class SmsReceiver(
  private val onSmsReceived: (sender: String?, body: String, timestamp: Long) -> Unit,
) : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    Log.d("DhanSms", "SmsReceiver.onReceive: action=${intent.action}")
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
    Log.d("DhanSms", "SmsReceiver.onReceive: messages=${messages?.size ?: 0}")
    if (messages.isNullOrEmpty()) return

    // A single logical SMS can arrive as several PDUs (long/concatenated
    // messages); the framework splits them but keeps one sender/timestamp,
    // so just join the bodies back into one string.
    val sender = messages[0].originatingAddress
    val timestamp = messages[0].timestampMillis
    val body = messages.joinToString(separator = "") { it.messageBody ?: "" }

    onSmsReceived(sender, body, timestamp)
  }
}
