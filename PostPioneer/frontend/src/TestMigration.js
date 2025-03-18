import React, { useEffect, useState } from "react";
import firebaseConfig from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, update, get } from "firebase/database";

const db = getDatabase();

function TestMigration() {
  const [userId, setUserId] = useState(null); // Track user ID
  const [userPlan, setUserPlan] = useState(null); // Track user's plan

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Save the userId to state
        // Assuming your user data is under "Users/{user.uid}"

        const userRef = ref(db, `Users/${user.uid}`);
        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              setUserPlan(data.userType || "Basic"); // Set plan from database
            } else {
              setUserPlan("Basic");
            }
          })
          .catch((error) => {
            console.error("Error fetching user plan:", error);
          });
      } else {
        console.error("User is not authenticated");
        return;
      }
    });
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("User ID updated:", userId);
      // Perform actions that depend on userId here
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
            "pk_test_51QuKO2KsmLUG0fTBabd0NeLEOWXbIVpubKHBjvVsUGCfeWKXYy4TebUuQ069psydvIEY36yWgvbTivjH6ywAwqbV00yAeWgNPA",
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

      function initGooglePayFunction() {
        console.log("User id google function: " + userId);
        console.log("Initializing Google Pay...");
        if (
          !window.google ||
          !window.google.payments ||
          !window.google.payments.api
        ) {
          console.error("Google Pay API is not available.");
          return;
        }

        paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: "TEST",
        });

        const isReadyToPayRequest = Object.assign({}, baseRequest);
        isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];

        paymentsClient
          .isReadyToPay(isReadyToPayRequest)
          .then(function (response) {
            console.log("isReadyToPay response:", response);
            if (response.result) {
              // Check if the button already exists
              if (!document.getElementById("gpay-button")) {
                const button = paymentsClient.createButton({
                  onClick: onGooglePayButtonClicked,
                  buttonColor: "black",
                  buttonType: "pay",
                  buttonRadius: 17,
                  buttonLocale: "en",
                });
                button.id = "gpay-button"; // Assign an ID to the button
                document.getElementById("gpay-container").appendChild(button);
              }
            } else {
              console.warn(
                "Google Pay is not available on this device/browser."
              );
            }
          })
          .catch(function (err) {
            console.error("isReadyToPay error:", err);
          });
      }

      function onGooglePayButtonClicked() {
        console.log("User id google button: " + userId);
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

        console.log("Loading payment data...");
        paymentsClient
          .loadPaymentData(paymentDataRequest)
          .then(function (paymentData) {
            console.log("Payment data loaded:", paymentData);
            const paymentToken =
              paymentData.paymentMethodData.tokenizationData.token;
            console.log("Received payment token:", paymentToken);

            fetch("http://127.0.0.1:5000/process-payment", {
              // Changed to HTTP
              mode: "cors",
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentToken: paymentToken }),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log(data.status);
                if (data.status == "success") {
                  alert("Payment successful! Thank you for your purchase.");
                  update(ref(db, "Users/" + userId), { userType: "Pro" });
                  console.log(userId);
                  setUserPlan("Pro"); // Update the state to trigger a re-render
                } else {
                  alert("Payment failed. Please try again.");
                }
              })
              .catch((error) => {
                console.error("Error sending token to backend:", error);
                alert(
                  "An error occurred while processing the payment. Please try again."
                );
              });
          })
          .catch(function (err) {
            console.error("loadPaymentData error:", err);
          });
      }

      // Attach initGooglePayFunction to the window object
      window.initGooglePayFunction = initGooglePayFunction;

      // Call initGooglePayFunction if the script is already loaded
      if (
        window.google &&
        window.google.payments &&
        window.google.payments.api
      ) {
        initGooglePayFunction();
      } else {
        console.warn("Google Pay API script not yet loaded.");
      }
    }
  }, [userId]);

  function handleCancel() {
    const confirmed = window.confirm("Are you sure you want to cancel?");
    if (confirmed) {
      cancel();
    }
  }
  function cancel() {
    if (userId) {
      update(ref(db, "Users/" + userId), { userType: "Basic" });
      setUserPlan("Basic");
      // Reinitialize the Google Pay button
      if (window.initGooglePayFunction) {
        window.initGooglePayFunction();
      }
    }
  }

  function getUserPlan() {
    return userPlan;
  }

  return (
    <div className="bg-gray-100 flex">
      <div className="flex-1 m-3 mt-14 p-4 flex items-start justify-evenly gap-x-8 bg-gray-100">
        <div className="bg-gray-500 w-72 p-4 rounded-md flex-none h-[500px]">
          <h1 className="text-2xl font-bold">Basic</h1>
          <h2 className="text-lg font-semibold">Free</h2>
          <p>Get started with essential features for content generation.</p>
          <ul>
            <li>✔ Custom News Aggregation</li>
            <li>
              ✔ Generate content for Twitter, LinkedIn, Instagram, and Facebook
            </li>
            <li>✔ Automated Scheduling (daily, weekly, custom)</li>
            <li>✔ Customizable Templates</li>
            <li>✔ AI-Powered Content Summarization</li>
            <li>✔ Multi-Channel Delivery to social media and email lists</li>
            <li>✔ Dashboard Management for tracking and customization</li>
          </ul>
          <div>
            {getUserPlan() === "Pro" ? (
              <button
                type="button"
                className="w-full h-12 bg-red-500 text-white rounded-md mt-4"
                onClick={handleCancel}
              >
                Cancel Your Plan
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full h-12 bg-gray-300 text-gray-700 rounded-md mt-4"
              >
                Your Current Plan
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-500 w-72 p-4 rounded-md flex-none h-[500px] relative">
          <h1 className="text-2xl font-bold">Pro</h1>
          <h2 className="text-lg font-semibold">$X/month</h2>
          <p>
            Unlock premium features for advanced automation and global reach.
          </p>
          <ul>
            <li>✔ Everything in Basic</li>
            <li>✔ Multi-Language Support for global audiences</li>
            <li>✔ Priority Content Processing with faster generation times</li>
            <li>✔ Enhanced AI for deeper content personalization</li>
            <li>✔ Photo and Video Generation for different platforms</li>
          </ul>
          <div className="relative">
            {getUserPlan() === "Pro" ? (
              <button
                type="button"
                disabled
                className="absolute w-full h-12 bg-gray-300 text-gray-700 rounded-md mt-4 translate-y-10"
              >
                Your Current Plan
              </button>
            ) : (
              <div
                id="gpay-container"
                className="absolute bottom-0 mb-4 translate-y-32 translate-x-2"
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestMigration;
