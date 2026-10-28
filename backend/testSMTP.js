require("dotenv").config();

const transporter = require("./utils/mailer");

async function testSMTP() {
  try {
    await transporter.verify();
    console.log("Brevo SMTP connection successful!");
  } catch (error) {
    console.error("SMTP test failed:", error);
  }
}

testSMTP();