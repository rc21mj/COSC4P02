from flask import Flask, request, jsonify,json
import stripe
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

stripe.api_key = "sk_test_51QuVJuQPFKNWMbqFxaSanAZwst6cJ0mansT0PiYwkQWgfXGcW4IfNI5hXt97YzGNTiyiXxZYBFiEOdhuZhGxFAb700uFIM2BaW"  # Replace with your actual Stripe secret key.

@app.route("/process-payment", methods=["POST"])
def process_payment():
    data = request.get_json()
    payment_token_str = data.get("paymentToken")
    print(f"Receieved payment token: {payment_token_str}")
    print(f"Request payload: {data}")
    
    if not payment_token_str:
        return jsonify({"error": "Missing payment token"}), 400

    try:
        payment_token = json.loads(payment_token_str).get("id")

        charge = stripe.Charge.create(
            amount=100,  
            currency="cad",
            source=payment_token,
            description="Test payment"
        )
        return jsonify({"status": "success", "charge": charge})
    except Exception as e:
        print(f"Error processing payment: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
