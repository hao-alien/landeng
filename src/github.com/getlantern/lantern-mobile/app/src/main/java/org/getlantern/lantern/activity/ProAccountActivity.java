package org.getlantern.lantern.activity;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ImageView;

import android.support.v4.app.FragmentActivity;

import org.getlantern.lantern.R;
 

public class ProAccountActivity extends FragmentActivity {

    private static final String TAG = "ProAccountActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.pro_account);
    }
}

