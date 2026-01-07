const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Simple email template for user
const userOrderTemplate = (order, user) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
        .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #2c3e50; margin-top: 15px; padding-top: 10px; border-top: 2px solid #667eea; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center; }
        .payment-code { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🎉 Order Confirmed!</h2>
            <p>Thank you for shopping with us!</p>
        </div>
        <div class="content">
            <p>Hello ${user?.username || order.shippingAddress.firstName || 'Customer'},</p>
            <p>Your order has been received and is being processed.</p>
            
            <div class="order-details">
                <h3>📋 Order Details</h3>
                <p><strong>Order ID:</strong> ${order.orderId || order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                
                ${order.paymentCode ? `
                <div style="margin: 15px 0;">
                    <h4>🔐 Payment Code (for Cash on Delivery):</h4>
                    <div class="payment-code">${order.paymentCode}</div>
                    <p><small>Please provide this code to the delivery person when making payment.</small></p>
                </div>
                ` : ''}
                
                <h4>🛍️ Items Ordered:</h4>
                ${order.items.map(item => `
                    <div class="item">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                
                <div class="total">
                    <span>Total Amount:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-details">
                <h3>📍 Shipping Address</h3>
                <p><strong>Name:</strong> ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
                <p><strong>Address:</strong> ${order.shippingAddress.address}</p>
                <p><strong>City:</strong> ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}</p>
                <p><strong>Country:</strong> ${order.shippingAddress.country}</p>
            </div>
            
            <p>We'll notify you when your order ships!</p>
            <p>You can track your order from your account dashboard.</p>
        </div>
        <div class="footer">
            <p>If you have any questions, contact our support team at support@ecommerce.com</p>
            <p>© ${new Date().getFullYear()} E-commerce Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Simple email template for admin
const adminOrderTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
        .order-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #2c3e50; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📦 New Order Received!</h2>
            <p>Order #${order.orderId || order._id}</p>
        </div>
        <div class="content">
            <div class="alert">
                ⚡ <strong>Action Required:</strong> Please process this order
            </div>
            
            <div class="order-details">
                <h3>👤 Customer Information</h3>
                <p><strong>Name:</strong> ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
                <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
                <p><strong>Phone:</strong> ${order.shippingAddress.phone || 'Not provided'}</p>
                
                <h3>💰 Order Summary</h3>
                <p><strong>Order Value:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Total Items:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                
                <h4>🛒 Order Items:</h4>
                ${order.items.map(item => `
                    <div class="item">
                        <span>${item.name} (Qty: ${item.quantity})</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                
                <div class="total">
                    <span>Total Amount:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-details">
                <h3>📍 Shipping Details</h3>
                <p><strong>Address:</strong> ${order.shippingAddress.address}</p>
                <p><strong>City:</strong> ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}</p>
                <p><strong>Country:</strong> ${order.shippingAddress.country}</p>
            </div>
            
            <p style="text-align: center; margin-top: 20px;">
                <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin'}/orders/${order._id}" 
                   style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    View Order in Dashboard
                </a>
            </p>
        </div>
    </div>
</body>
</html>
`;

// Send email function
const sendEmail = async ({ to, subject, html }) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email not configured. Skipping email sending.');
      return { success: true, skipped: true, reason: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"E-commerce Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to, 'Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send order confirmation to user
const sendOrderConfirmation = async (order, user) => {
  const html = userOrderTemplate(order, user);
  
  const result = await sendEmail({
    to: order.shippingAddress.email,
    subject: `🎉 Order Confirmation - #${order.orderId || order._id}`,
    html,
  });
  
  return result;
};

// Send order notification to admin
const sendAdminNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  if (!adminEmail) {
    console.log('⚠️ ADMIN_EMAIL not configured. Skipping admin notification.');
    return { success: true, skipped: true, reason: 'Admin email not configured' };
  }
  
  const html = adminOrderTemplate(order);
  
  const result = await sendEmail({
    to: adminEmail,
    subject: `📦 New Order - #${order.orderId || order._id} - $${order.total}`,
    html,
  });
  
  return result;
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendAdminNotification,
};