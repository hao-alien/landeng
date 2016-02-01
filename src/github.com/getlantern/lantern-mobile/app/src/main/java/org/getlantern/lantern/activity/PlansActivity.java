package org.getlantern.lantern.activity;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.os.Message;
import android.text.Html;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.webkit.ConsoleMessage;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import android.net.Uri;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;

import org.getlantern.lantern.activity.PaymentActivity;
import org.getlantern.lantern.activity.CheckoutActivity;
import org.getlantern.lantern.R;

public class PlansActivity extends Activity {

    private static final String TAG = "PlansActivity";
	private static final String mCheckoutUrl = "file:///android_asset/checkout.html";
    private static final boolean useWebView = true;

    private Button getCodeBtn, monthBtn, yearBtn;
    private TextView featuresList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.pro_plans);

        monthBtn = (Button)findViewById(R.id.month_btn);
        monthBtn.setTag("$7.99");
        yearBtn = (Button)findViewById(R.id.year_btn); 
        yearBtn.setTag("$59.88");

        ImageView backBtn = (ImageView)findViewById(R.id.plansAvatar);

        featuresList = (TextView)findViewById(R.id.features_list);
        featuresList.setText(Html.fromHtml(getResources().getString(R.string.features_list)));

        LinearLayout plansView = (LinearLayout)findViewById(R.id.plans_view);
        plansView.bringToFront();

        backBtn.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                Log.d(TAG, "Back button pressed");
                finish();
            }
        });

    }

    public void selectPlan(View view) {
		Log.d(TAG, "Plan selected...");
        Intent intent = new Intent(this, PaymentActivity.class);
        intent.putExtra("AMOUNT_TO_CHARGE", (String)view.getTag());
        startActivity(intent);
    }

}  
