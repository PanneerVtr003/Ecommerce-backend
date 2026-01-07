const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter
transporter.verify((err, success) => {
  if (err) console.log("❌ Mailer Error:", err);
  else console.log("✅ Mailer ready to send emails");
});

// Email template
const userOrderTemplate = (order, user) => `
<h2>🎉 Order Confirmed!</h2>
<p>Hello ${user?.username || "Customer"},</p>
<p>Thanks for your order! Your Order ID: <strong>${order._id}</strong></p>
<p>Total Amount: $${order.total.toFixed(2)}</p>
<p>Payment Method: ${order.paymentMethod}</p>
<h3>Items:</h3>
<ul>
${order.items.map(item => `<li>${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</li>`).join("")}
</ul>
<p>We will notify you when your order ships!</p>
`;

const sendOrderConfirmation = async (order, user) => {
  try {
    const mailOptions = {
      from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
      to: order.shippingAddress.email,
      subject: `Order Confirmation - #${order._id}`,
      html: userOrderTemplate(order, user),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { success: true };
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendOrderConfirmation };
