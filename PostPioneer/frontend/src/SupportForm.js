import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";

function SupportForm() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* Card Container */}
      <Card className="max-w-md w-full shadow-lg rounded-lg p-4">
        <CardContent>
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Contact Support
          </h2>

          {/* Intro Text */}
          <p className="text-gray-600 mb-4 text-center leading-relaxed">
            We typically respond within 24 hours. For immediate assistance,
            please check out our{" "}
            <a href="/faq" className="text-blue-600 underline">
              FAQ
            </a>{" "}
            or email us at{" "}
            <a
              href="mailto:support@postpioneer.com"
              className="text-blue-600 underline"
            >
              support@postpioneer.com
            </a>
            .
          </p>
          <p className="text-gray-600 mb-6 text-center leading-relaxed">
            <strong>Support Hours:</strong> Monday – Friday, 9 AM – 5 PM (ET).
            <br />
            <strong>Phone:</strong> +1 (555) 123-4567
          </p>

          {/* Contact Form */}
          <form
            action="https://formsubmit.co/7d16a2e7eae6e29c1d16d5066c1fe39c"
            method="POST"
            className="space-y-4"
          >
            {/* Topic Field */}
            <div>
              <Input
                type="text"
                name="Topic"
                placeholder="Your Topic"
                required
                disableUnderline
                className="w-full border border-gray-300 rounded-md px-3 py-2 
                           text-gray-800 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email Field */}
            <div>
              <Input
                type="email"
                name="Email"
                placeholder="Your Email"
                required
                disableUnderline
                className="w-full border border-gray-300 rounded-md px-3 py-2 
                           text-gray-800 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Message Field */}
            <div>
              <TextField
                name="Message"
                placeholder="Your Message"
                required
                multiline
                rows={4}
                variant="outlined"
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 
                         rounded-md normal-case shadow-md focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:ring-offset-1"
            >
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SupportForm;