package org.getlantern.lantern.activity;

import android.app.Activity;
import android.os.Bundle;
import android.text.Html;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import android.support.v4.app.FragmentActivity;

import org.getlantern.lantern.sdk.Utils;

import org.getlantern.lantern.R;

public class SignInActivity extends FragmentActivity {

    private static final String TAG = "SignInActivity";

    private EditText emailInput;
    private TextView signinList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.sign_in);

        this.emailInput = (EditText)findViewById(R.id.email);

        Utils.configureEmailInput((EditText)findViewById(R.id.email), findViewById(R.id.emailSeparator));

        signinList = (TextView)findViewById(R.id.sign_in_list);
        signinList.setText(Html.fromHtml(getResources().getString(R.string.sign_in_list)));
    }

    public void sendLink(View view) {
        Log.d(TAG, "Send link button clicked");
        final String email = emailInput.getText().toString();
        if (!Utils.isEmailValid(email)) {
            Utils.showErrorDialog(this, "Invalid e-mail address");
            return;
        }
    }

}
