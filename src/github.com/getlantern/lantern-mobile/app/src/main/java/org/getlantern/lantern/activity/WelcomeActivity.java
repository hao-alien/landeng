package org.getlantern.lantern.activity;

import android.app.Activity;
import android.content.Intent;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.util.Log;
import android.view.View;                          

import org.getlantern.lantern.activity.InviteActivity;
import org.getlantern.lantern.R;

public class WelcomeActivity extends Activity {
    private static final String TAG = "WelcomeActivity";

    private MediaPlayer mMediaPlayer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.pro_welcome);

        playWelcomeSound();
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
