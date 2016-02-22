package org.getlantern.lantern.activity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.LayoutInflater;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import android.support.v4.app.Fragment;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentActivity;

import com.stripe.android.Stripe;
import com.stripe.android.TokenCallback;
import com.stripe.android.model.Card;
import com.stripe.exception.APIException;
import com.stripe.exception.APIConnectionException;
import com.stripe.exception.AuthenticationException;
import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.model.Charge;
import com.stripe.android.model.Token;

import java.io.File;
import java.util.Map;
import java.util.HashMap;

import org.getlantern.lantern.fragment.PaymentFormFragment;
import org.getlantern.lantern.model.ErrorDialogFragment;
import org.getlantern.lantern.model.ProgressDialogFragment;
import org.getlantern.lantern.model.PaymentForm;
import org.getlantern.lantern.R;

import info.hoang8f.android.segmented.SegmentedGroup;

import org.getlantern.lantern.sdk.Utils;
 

public class PaymentActivity extends FragmentActivity implements View.OnClickListener {

    private static final String TAG = "PaymentActivity";
    private static final String publishableApiKey = "pk_test_4MSPZvz9QtXGWEKdODmzV9ql";
    private static final String mCheckoutUrl = "https://s3.amazonaws.com/lantern-android/checkout.html?amount=%d";

    private EditText emailInput;

    private Context mContext;
    private SharedPreferences mPrefs = null;

    private ProgressDialogFragment progressFragment;
    private Button checkoutBtn, cardBtn, alipayBtn;
    private SegmentedGroup segmented; 
    private PaymentFormFragment paymentForm;
    private int chargeAmount;
    private TextView chargeAmountView;

    private View cardView;
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.checkout);

        emailInput = (EditText)findViewById(R.id.email);

        mContext = this.getApplicationContext();

        segmented = (SegmentedGroup)findViewById(R.id.segmented2);
        segmented.setTintColor(getResources().getColor(R.color.pro_blue_color));

        cardBtn = (Button)findViewById(R.id.cardBtn);
        alipayBtn = (Button)findViewById(R.id.alipayBtn);
        cardBtn.setOnClickListener(this);
        alipayBtn.setOnClickListener(this);

        cardView = (View)findViewById(R.id.cardview);
        mWebView = (WebView)findViewById(R.id.webview);

        mPrefs = Utils.getSharedPrefs(mContext);

        Intent intent = getIntent();

        chargeAmount = intent.getIntExtra("AMOUNT_TO_CHARGE", 799);
        chargeAmountView = (TextView)findViewById(R.id.amount_to_charge);
        chargeAmountView.setText(intent.getStringExtra("AMOUNT_TO_CHARGE_STR"));


        paymentForm = (PaymentFormFragment)getSupportFragmentManager().findFragmentById(R.id.payment_form);

        checkoutBtn = (Button)findViewById(R.id.checkoutBtn);
        checkoutBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                submitCard();
            }
        });

        progressFragment = ProgressDialogFragment.newInstance(R.string.progressMessage);
    }

    @Override
    public void onClick(View v) {
        Log.d(TAG, "onclick called...");
        switch (v.getId()) {
            case R.id.alipayBtn:
                Log.d(TAG, "Alipay button pressed");
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(String.format(mCheckoutUrl, chargeAmount)));
                startActivity(intent);
                return;
            case R.id.cardBtn:
                Log.d(TAG, "Card button pressed");
                return;
            default:
                // Nothing to do
        }
    }

    // loads Stripe checkout inside of a WebView 
    // for Alipay users
    public void loadWebView() {

        mWebView.clearCache(true);

        WebSettings mWebSettings = mWebView.getSettings();
        mWebSettings.setJavaScriptEnabled(true);
        mWebSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        mWebSettings.setSupportMultipleWindows(true);
        mWebView.setScrollBarStyle(View.SCROLLBARS_OUTSIDE_OVERLAY);
        mWebView.setWebChromeClient(new MyWebChromeClient(mContext));
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {    
                // load the checkout page in the browser
                view.loadUrl(url);    
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }
        });
        mWebView.loadUrl(String.format(mCheckoutUrl, chargeAmount));
    }

    private class MyWebChromeClient extends WebChromeClient {
        private Context mContext;

        public MyWebChromeClient(Context context) {
            super();
            this.mContext = context;
        }

        @Override
        public boolean onConsoleMessage (ConsoleMessage consoleMessage) {
            Log.d(TAG, "Got a new console message: " 
                    + consoleMessage.message());
            return true;
        }

        @Override
        public boolean onJsAlert(WebView view, String url, String message, final android.webkit.JsResult result)  
        {
            Log.d("alert", message);
            Toast.makeText(mContext, message, 3000).show();
            result.confirm();
            return true;
        }; 
    }


	public void submitCard() {

        final String email = emailInput.getText().toString();
        if (!Utils.isEmailValid(email)) {
            Utils.showErrorDialog(this, "Invalid e-mail address");
            return;
        }

        // TODO: replace with your own test key
		Log.d(TAG, "Submit card button clicked..");
		//final String publishableApiKey = BuildConfig.DEBUG ?
		//"pk_test_4MSPZvz9QtXGWEKdODmzV9ql" :
		//getString(R.string.com_stripe_publishable_key);
        //
        Card card = new Card(
                paymentForm.getCardNumber(),
                paymentForm.getExpMonth(),
                paymentForm.getExpYear(),
                paymentForm.getCvc());

        boolean validation = card.validateCard();
        if (validation) {
            startProgress();
            Stripe stripe = new Stripe();
            stripe.createToken(card, publishableApiKey, new TokenCallback() {
                public void onSuccess(Token token) {
                    // TODO: Send Token information to your backend to initiate a charge
                    chargeUser(token.getId());

                    // update shared preferences to indicate Pro user
                    // which affects how the main screen is displayed
                    mPrefs.edit().putBoolean("proUser", true).commit();

                    /*Toast.makeText(
                            getApplicationContext(),
                            "Token created: " + token.getId(),
                            Toast.LENGTH_LONG).show();*/
                    finishProgress(token.getId());
                }

                public void onError(Exception error) {
                    Log.d("Stripe", error.getLocalizedMessage());
                    handleError(error.getLocalizedMessage());
                }
            });
        } else if (!card.validateNumber()) {
            handleError("The card number that you entered is invalid");
        } else if (!card.validateExpiryDate()) {
            handleError("The expiration date that you entered is invalid");
        } else if (!card.validateCVC()) {
            handleError("The CVC code that you entered is invalid");
        } else {
            handleError("The card details that you entered are invalid");
        }
	}

    private void chargeUser(String token) {
        try {
            Map<String, Object> chargeParams = new HashMap<String, Object>();
            chargeParams.put("amount", 5988); 
            chargeParams.put("currency", "usd");
            chargeParams.put("source", token);
            chargeParams.put("description", "Lantern Pro Subscription");
            Map<String, String> initialMetadata = new HashMap<String, String>();
            //initialMetadata.put("order_id", "6735");
            //chargeParams.put("metadata", initialMetadata);

            Charge charge = Charge.create(chargeParams);

        } catch (APIException e) {
            handleError("API error");
        } catch (APIConnectionException e) {
            handleError("Could not connect to API");
        } catch (CardException e) {
            handleError("Card entered has been declined");
        } catch (AuthenticationException e) {
            handleError("Could not authenticate.");  
        } catch (InvalidRequestException e) {
            handleError("Invalid request.");  
        }
    }


    private void startProgress() {
        progressFragment.show(getSupportFragmentManager(), "progress");
    }

    private void finishProgress(String token) {
        progressFragment.dismiss();

        String email = emailInput.getText().toString();
        // submit token to Pro server here
        Intent intent = new Intent(this, WelcomeActivity.class);
        intent.putExtra("stripeToken", token);
        intent.putExtra("stripeEmail", email);
        this.startActivity(intent);
    }

    private void handleError(String error) {
        DialogFragment fragment = ErrorDialogFragment.newInstance(R.string.validation_errors, error);
        fragment.show(getSupportFragmentManager(), "error");
    }
}
