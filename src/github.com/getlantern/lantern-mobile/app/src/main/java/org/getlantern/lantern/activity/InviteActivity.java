package org.getlantern.lantern.activity;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import org.getlantern.lantern.R;

import org.getlantern.lantern.model.ProgressDialogFragment;
import org.getlantern.lantern.sdk.Utils;

import android.support.v4.app.FragmentActivity;

import go.lantern.Lantern;

public class InviteActivity extends FragmentActivity {

    private static final String TAG = "InviteActivity";

    private ProgressDialogFragment progressFragment;


    private EditText emailInput;
    private Button getCodeBtn;
    private String code;
    private TextView referralCode;
    private View getCodeView;
    private View referralView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.invite_friends);

        progressFragment = ProgressDialogFragment.newInstance(R.string.progressMessage2);
        referralCode = (TextView)findViewById(R.id.referral_code);

        getCodeView = findViewById(R.id.get_code_view);
        referralView = findViewById(R.id.referral_code_view);

        Utils.configureEmailInput((EditText)findViewById(R.id.email), findViewById(R.id.emailSeparator));

        this.emailInput = (EditText)findViewById(R.id.email);
        this.getCodeBtn = (Button)findViewById(R.id.getCodeBtn);

        this.getCodeBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, "Get code button pressed");
                getCode(v);
            }
        });

        ImageView backBtn = (ImageView)findViewById(R.id.inviteAvatar);

        backBtn.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                Log.d(TAG, "Back button pressed");
                finish();
            }
        });

    }

    private void startProgress() {
        progressFragment.show(getSupportFragmentManager(), "progress");
    }

    private void finishProgress() {
        progressFragment.dismiss();
    }

    public void getCode(View view) {
        final String email = emailInput.getText().toString();
        if (!Utils.isEmailValid(email)) {
            Utils.showErrorDialog(this, "Invalid e-mail address");
            return;
        }

        this.code = Lantern.ReferralCode(email);

        referralCode.setText(code);

        referralView.setVisibility(View.VISIBLE);
        getCodeView.setVisibility(View.INVISIBLE);

    }

    public void textInvite(View view) {
        Log.d(TAG, "Invite friends button clicked!");
        Intent sendIntent = new Intent(Intent.ACTION_VIEW);         
        sendIntent.setData(Uri.parse("sms:"));
        sendIntent.putExtra("sms_body", "For a free month of Lantern Pro, use this referral code: " + this.code); 
        startActivity(sendIntent);
    }

    public void emailInvite(View view) {
        Log.d(TAG, "Continue to Pro button clicked!");

        Intent emailIntent = new Intent(Intent.ACTION_SENDTO, 
                Uri.fromParts("mailto","", null));
        emailIntent.putExtra(Intent.EXTRA_SUBJECT, "Invitation to Join Lantern Pro");
        emailIntent.putExtra(Intent.EXTRA_TEXT, "For a free month of Lantern Pro, use this referral code: " + this.code);
        startActivity(Intent.createChooser(emailIntent, "Send email..."));
    }
}
