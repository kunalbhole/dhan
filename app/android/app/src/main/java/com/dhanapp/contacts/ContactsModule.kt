package com.dhanapp.contacts

import android.content.pm.PackageManager
import android.provider.ContactsContract
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Read-only bridge to the device's contact list, for src/lib/contactMatcher.ts
 * to match SMS-derived people names against. Only ever reads — this app never
 * writes to the Contacts provider. Deliberately returns just id + display
 * name: nothing else (phone numbers, photos) is needed for name matching,
 * and not reading it is one less sensitive field to carry around.
 */
class ContactsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val TAG = "DhanContacts"
    const val NAME = "ContactsModule"
  }

  override fun getName() = NAME

  private fun hasContactsPermission(): Boolean =
    ContextCompat.checkSelfPermission(
      reactApplicationContext,
      android.Manifest.permission.READ_CONTACTS,
    ) == PackageManager.PERMISSION_GRANTED

  @ReactMethod
  fun hasPermission(promise: Promise) {
    promise.resolve(hasContactsPermission())
  }

  /**
   * Every distinct contact's display name, deduplicated by contact id (the
   * Contacts table can otherwise return one row per linked raw-contact
   * source for the same person).
   */
  @ReactMethod
  fun readContacts(promise: Promise) {
    if (!hasContactsPermission()) {
      promise.reject("PERMISSION_DENIED", "Contacts permission not granted")
      return
    }
    try {
      val array = Arguments.createArray()
      val seen = HashSet<String>()
      val cursor = reactApplicationContext.contentResolver.query(
        ContactsContract.Contacts.CONTENT_URI,
        arrayOf(
          ContactsContract.Contacts._ID,
          ContactsContract.Contacts.DISPLAY_NAME_PRIMARY,
        ),
        "${ContactsContract.Contacts.DISPLAY_NAME_PRIMARY} IS NOT NULL",
        null,
        null,
      )
      cursor?.use {
        val idIdx = it.getColumnIndex(ContactsContract.Contacts._ID)
        val nameIdx = it.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME_PRIMARY)
        while (it.moveToNext()) {
          val id = if (idIdx >= 0) it.getString(idIdx) else null
          val name = if (nameIdx >= 0) it.getString(nameIdx) else null
          if (id == null || name.isNullOrBlank() || !seen.add(id)) continue
          val map = Arguments.createMap().apply {
            putString("id", id)
            putString("name", name)
          }
          array.pushMap(map)
        }
      }
      Log.d(TAG, "readContacts: returned ${array.size()} contacts")
      promise.resolve(array)
    } catch (e: Exception) {
      Log.e(TAG, "readContacts error: ${e.message}", e)
      promise.reject("READ_CONTACTS_ERROR", e.message, e)
    }
  }
}
