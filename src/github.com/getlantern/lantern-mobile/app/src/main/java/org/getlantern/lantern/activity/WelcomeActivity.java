package org.getlantern.lantern.activity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;                          

import org.getlantern.lantern.activity.InviteActivity;
import org.getlantern.lantern.sdk.Utils;
import org.getlantern.lantern.R;

import go.lantern.Lantern;

public class WelcomeActivity extends Activity {
    private static final String TAG = "WelcomeActivity";

    private String stripeToken, stripeEmail;
    private Context mContext;
    private SharedPreferences mPrefs = null;
    private MediaPlayer mMediaPlayer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.pro_welcome);

        mContext = this.getApplicationContext();
        mPrefs = Utils.getSharedPrefs(mContext);
            
        Intent intent = getIntent();
        Uri data = intent.getData();

        if (intent.getExtras() != null) {
            stripeToken = intent.getStringExtra("stripeToken"); 
            stripeEmail = intent.getStringExtra("stripeEmail");
        } else if (data != null) {
            stripeToken = data.getQueryParameter("stripeToken");
            stripeEmail = data.getQueryParameter("stripeEmail");  
        }

        if (stripeToken != "" && stripeEmail != "") {
            Log.d(TAG, "Stripe token is " + stripeToken +
                    "; email is " + stripeEmail);

            Thread mThread = new Thread() {
                public void run() {
                    Lantern.NewProUser(
                            stripeEmail,
                            stripeToken,
                            "year"
                            );
                }
            };
            mThread.start();

            mPrefs.edit().putBoolean("proUser", true).commit();

            playWelcomeSound();
        }
    }

    public void inviteFriends(View view) {
        Log.d(TAG, "Invite friends button clicked!");
        startActivity(new Intent(this, InviteActivity.class));
    }

    public void continueToPro(View view) {
        Log.d(TAG, "Continue to Pro button clicked!");
        startActivity(new Intent(this, LanternMainActivity.class));
    }

    public void playWelcomeSound() {
        mMediaPlayer = MediaPlayer.create(this, R.raw.welcome);
        mMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
        mMediaPlayer.setLooping(false);
        mMediaPlayer.start();
    }
}
