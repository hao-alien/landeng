package org.getlantern.lantern.sdk;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.os.Looper;
import android.util.Log;
import android.view.View;               
import android.view.View.OnClickListener;
import android.view.View.OnFocusChangeListener;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.InputStream;

import org.getlantern.lantern.R;

import java.util.Map;
import java.util.HashMap;

import org.yaml.snakeyaml.Yaml;

public class Utils {
    private static final String PREFS_NAME = "LanternPrefs";
    private static final String TAG = "Utils";
    private final static String PREF_USE_VPN = "pref_vpn";
    private final static Map settings;
    static {
        settings = new HashMap();
        settings.put("httpaddr", "127.0.0.1:8787");
        settings.put("socksaddr", "127.0.0.1:9131"); 
        settings.put("udpgwaddr", "127.0.0.1:7300"); 
    }


    // update START/STOP power Lantern button
    // according to our stored preference
    public static SharedPreferences getSharedPrefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME,
                Context.MODE_PRIVATE);
    }

    public static Map loadSettings(Context context, String filename) {

        InputStream in = null;
        OutputStream out = null;
        Map yamlSettings;

        try {
            Resources resources = context.getResources();
            String packageName = context.getPackageName();

            String resourceName = filename.substring(0, filename.lastIndexOf('.'));

            in = resources.openRawResource(
                    resources.getIdentifier("raw/" + resourceName,
                        "raw", packageName));

            if (in == null) {
                return settings;
            }

            Yaml yaml = new Yaml();
            yamlSettings = (Map)yaml.load(in);

            String newFileName = context.getFilesDir() + "/" + filename;

            out = new FileOutputStream(newFileName);

            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            in.close();
            in = null;
            out.flush();
            out.close();
            out = null;

            Log.d(TAG, "Finished copying file to new destination: " + filename);

            if (yamlSettings.get("httpaddr") != null) {
                settings.put("httpaddr", yamlSettings.get("httpaddr"));
            }
            if (yamlSettings.get("socksaddr") != null) {
                settings.put("socksaddr", yamlSettings.get("socksaddr"));
            }
        } catch (Exception e) {
            Log.e(TAG, "Unable to load settings file " + e.getMessage());
        }

        return settings;
    }

    public static void showAlertDialog(Activity activity, String title, String msg) {
        Log.d(TAG, "Showing alert dialog...");
        if (Looper.myLooper() == null) {
            Looper.prepare();
        }

        AlertDialog alertDialog = new AlertDialog.Builder(activity).create();
        alertDialog.setTitle("Lantern");
        alertDialog.setMessage(msg);
        alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
                new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                });
        alertDialog.show();

        Looper.loop();
    }

    public static void hideKeyboard(Context context, View view) {
        InputMethodManager inputMethodManager = (InputMethodManager)context.getSystemService(Activity.INPUT_METHOD_SERVICE);
        inputMethodManager.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }

    public static void configureEmailInput(final EditText emailInput, final View separator) {

        OnFocusChangeListener focusListener = new OnFocusChangeListener() {
            public void onFocusChange(View v, boolean hasFocus) {
                if (hasFocus) {
                    separator.setBackgroundResource(R.color.blue_color);
                    emailInput.setCompoundDrawablesWithIntrinsicBounds(R.drawable.email_active, 0, 0, 0);
                } else {
                    separator.setBackgroundResource(R.color.edittext_color);
                    emailInput.setCompoundDrawablesWithIntrinsicBounds(R.drawable.email_inactive, 0, 0, 0);    
                }
            }
        };
        emailInput.setOnFocusChangeListener(focusListener);

    }


    public static void clearPreferences(Context context) {

        SharedPreferences mPrefs = getSharedPrefs(context);

        if (mPrefs != null) {
            mPrefs.edit().remove(PREF_USE_VPN).commit();
        }
    }
}
