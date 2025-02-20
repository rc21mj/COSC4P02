let paymentsClient;

const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};
const tokenizationSpecification = {
  type: "PAYMENT_GATEWAY",
  parameters: {
    gateway: "stripe",
    "stripe:version": "2018-10-31", 
    "stripe:publishableKey":
      "pk_test_51QuVJuQPFKNWMbqF0imvL31RnlWQnfELMUktwAuVFqM4JpxOSgZMDSNAGZel0sIEHUXnlFngp1Mwn6QWeqVPgjhb00b3epl9uv",
  },
};

const allowedCardNetworks = ["AMEX", "INTERAC", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
const baseCardPaymentMethod = {
  type: "CARD",
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks,
    billingAddressRequired: true, 
    billingAddressParameters: {
      format: "FULL", 
    },
  },
};
const cardPaymentMethod = Object.assign(
  { tokenizationSpecification: tokenizationSpecification },
  baseCardPaymentMethod
);

function initGooglePay() {

    paymentsClient = new google.payments.api.PaymentsClient({
      environment: "TEST",
      });
   
    const isReadyToPayRequest = Object.assign({}, baseRequest);
    isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];

    paymentsClient.isReadyToPay(isReadyToPayRequest).then(function (response) {
        console.log("isReadyToPay response:", response);
        if (response.result) {
          
          const button = paymentsClient.createButton({
            onClick: onGooglePayButtonClicked,
            buttonColor: "black",
            buttonType: "pay",
            buttonRadius: 17,
            buttonLocale: "en",
          });
          
          document.getElementById("gpay-container").appendChild(button);
        } else {
          console.warn(
            "Google Pay is not available on this device/browser."
          );
        }
      }).catch(function (err) {
        console.error("isReadyToPay error:", err);
      });
}

function onGooglePayButtonClicked() {
      
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];

    
    paymentDataRequest.transactionInfo = {
      totalPriceStatus: "FINAL",
      totalPrice: "1.00", 
      currencyCode: "CAD",
      countryCode: "CA",
    };

    
    paymentDataRequest.merchantInfo = {
      merchantName: "Example Merchant",
      merchantId: "12345678901234567890",
    };

    
    paymentsClient.loadPaymentData(paymentDataRequest).then(function (paymentData) {
        
        const paymentToken =
          paymentData.paymentMethodData.tokenizationData.token;
        console.log("Received payment token:", paymentToken);

       
        fetch("http://127.0.0.1:5000/process-payment", {
          mode: "cors",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentToken: paymentToken }),
        }).then((response) => response.json()).then((data) => {
            console.log("Server response:", data);
            
          }).catch((error) => {
            console.error("Error sending token to backend:", error);
          });
      }).catch(function (err) {
        console.error("loadPaymentData error:", err);
      });

      window.addEventListener("pageshow", function (event) {
          initGooglePay();
        });
  }