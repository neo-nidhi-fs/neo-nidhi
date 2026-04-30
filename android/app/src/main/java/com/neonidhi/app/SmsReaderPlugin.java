package com.neonidhi.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

@CapacitorPlugin(
    name = "SmsReader",
    permissions = {
        @Permission(
            alias = "sms",
            strings = {Manifest.permission.READ_SMS}
        )
    }
)
public class SmsReaderPlugin extends Plugin {
    private static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 200;

    @PluginMethod
    public void requestReadPermission(PluginCall call) {
        if (getPermissionState("sms") == PermissionState.GRANTED) {
            JSObject response = new JSObject();
            response.put("granted", true);
            call.resolve(response);
            return;
        }

        requestPermissionForAlias("sms", call, "onSmsPermissionResult");
    }

    @PluginMethod
    public void readRecentMessages(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            call.reject("READ_SMS permission not granted");
            return;
        }

        long sinceEpochMs = (long) call.getDouble("sinceEpochMs", 0d).doubleValue();
        int limit = call.getInt("limit", DEFAULT_LIMIT);
        if (limit < 1) limit = DEFAULT_LIMIT;
        if (limit > MAX_LIMIT) limit = MAX_LIMIT;

        JSArray messages = queryMessages(sinceEpochMs, limit);
        JSObject response = new JSObject();
        response.put("messages", messages);
        call.resolve(response);
    }

    @PermissionCallback
    @SuppressWarnings("unused")
    private void onSmsPermissionResult(PluginCall call) {
        JSObject response = new JSObject();
        response.put("granted", getPermissionState("sms") == PermissionState.GRANTED);
        call.resolve(response);
    }

    @SuppressLint("Range")
    private JSArray queryMessages(long sinceEpochMs, int limit) {
        JSArray result = new JSArray();
        Uri smsUri = Telephony.Sms.CONTENT_URI;
        String[] projection = new String[] {
            Telephony.Sms._ID,
            Telephony.Sms.ADDRESS,
            Telephony.Sms.BODY,
            Telephony.Sms.DATE
        };
        String selection = Telephony.Sms.DATE + " > ?";
        String[] selectionArgs = new String[] {String.valueOf(sinceEpochMs)};
        String sortOrder = Telephony.Sms.DATE + " DESC LIMIT " + limit;

        Cursor cursor = null;
        try {
            cursor = getContext().getContentResolver().query(
                smsUri,
                projection,
                selection,
                selectionArgs,
                sortOrder
            );

            if (cursor == null) return result;

            while (cursor.moveToNext()) {
                String id = cursor.getString(cursor.getColumnIndex(Telephony.Sms._ID));
                String sender = cursor.getString(cursor.getColumnIndex(Telephony.Sms.ADDRESS));
                String body = cursor.getString(cursor.getColumnIndex(Telephony.Sms.BODY));
                long dateMs = cursor.getLong(cursor.getColumnIndex(Telephony.Sms.DATE));

                JSObject row = new JSObject();
                row.put("id", id == null ? "" : id);
                row.put("sender", sender == null ? "" : sender);
                row.put("body", body == null ? "" : body);
                row.put("receivedAt", toIsoString(dateMs));
                result.put(row);
            }
        } finally {
            if (cursor != null) cursor.close();
        }

        return result;
    }

    private String toIsoString(long epochMs) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        return sdf.format(new Date(epochMs));
    }
}
