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
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import android.net.Uri;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;

import java.text.NumberFormat;
import java.util.Locale;

import org.getlantern.lantern.activity.PaymentActivity;
import org.getlantern.lantern.activity.CheckoutActivity;
import org.getlantern.lantern.R;

public class PlansActivity extends Activity {

    private static final String TAG = "PlansActivity";
    private static final String mCheckoutUrl = "https://s3.amazonaws.com/lantern-android/checkout.html?amount=%d";
    private static final boolean useAlipay = false;

    private static final NumberFormat currencyFormatter = 
        NumberFormat.getCurrencyInstance(new Locale("en", "US"));

    private static final Integer monthCost = 799;
    private static final Integer yearCost = 499 * 12;

    private Button getCodeBtn, monthBtn, yearBtn;
    private TextView featuresList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.pro_plans);

        monthBtn = (Button)findViewById(R.id.month_btn);
        monthBtn.setTag(monthCost);

        yearBtn = (Button)findViewById(R.id.year_btn); 
        yearBtn.setTag(yearCost);

        featuresList = (TextView)findViewById(R.id.features_list);
        featuresList.setText(Html.fromHtml(getResources().getString(R.string.features_list)));

        LinearLayout plansView = (LinearLayout)findViewById(R.id.plans_view);
        plansView.bringToFront();

    }

    public void selectPlan(View view) {
		Log.d(TAG, "Plan selected...");
        Intent intent;
        Integer amount = (Integer)view.getTag();
        if (useAlipay) {
            Log.d(TAG, "Chinese user detected; opening Alipay by default");
            intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(String.format(mCheckoutUrl, amount)));
        } else {
            intent = new Intent(this, PaymentActivity.class);
            String amountStr = currencyFormatter.format(amount / 100.0);
            intent.putExtra("AMOUNT_TO_CHARGE_STR", amountStr);
            intent.putExtra("AMOUNT_TO_CHARGE", (Integer)amount);
        }
        startActivity(intent);
    }
}  
