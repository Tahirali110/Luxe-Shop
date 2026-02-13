const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Generate professional order confirmation HTML email
const generateOrderConfirmationHTML = (order) => {
    const { shippingAddress, items, totals } = order;
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const itemsHTML = items.map(item => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #eee;">
                <div style="display: flex; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${item.name}</p>
                        ${item.selectedColor ? `<p style="margin: 4px 0 0; font-size: 13px; color: #666;">Color: ${item.selectedColor}</p>` : ''}
                        ${item.selectedSize ? `<p style="margin: 2px 0 0; font-size: 13px; color: #666;">Size: ${item.selectedSize}</p>` : ''}
                    </div>
                </div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: center; color: #666;">
                ${item.quantity}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #1a1a1a;">
                $${(item.price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Luxe Shop</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">LUXE SHOP</h1>
            <p style="margin: 10px 0 0; color: #cccccc; font-size: 14px;">Premium Fashion & Lifestyle</p>
        </div>

        <!-- Success Icon & Message -->
        <div style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #eee;">
            <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; color: #fff;">✓</span>
            </div>
            <h2 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
            <p style="margin: 12px 0 0; color: #666; font-size: 15px;">Thank you for your purchase. We're preparing your order.</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 30px; background-color: #fafafa;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div>
                    <p style="margin: 0; font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                    <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #1a1a1a;">#${orderId}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Order Date</p>
                    <p style="margin: 4px 0 0; font-size: 15px; color: #1a1a1a;">${orderDate}</p>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div style="padding: 0 30px;">
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #f9f9f9;">
                        <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #eee;">Item</th>
                        <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #eee;">Qty</th>
                        <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #eee;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <div style="padding: 20px 30px; background-color: #fafafa;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Subtotal</span>
                <span style="color: #1a1a1a;">$${totals.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Shipping</span>
                <span style="color: #1a1a1a;">${totals.shipping === 0 ? 'Free' : '$' + totals.shipping.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #666;">Tax (GST)</span>
                <span style="color: #1a1a1a;">$${totals.tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #1a1a1a;">
                <span style="font-size: 18px; font-weight: 700; color: #1a1a1a;">Total</span>
                <span style="font-size: 18px; font-weight: 700; color: #1a1a1a;">$${totals.total.toFixed(2)}</span>
            </div>
        </div>

        <!-- Shipping Address -->
        <div style="padding: 30px;">
            <h3 style="margin: 0 0 15px; font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h3>
            <div style="background-color: #f9f9f9; border-radius: 12px; padding: 20px;">
                <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${shippingAddress.firstName} ${shippingAddress.lastName}</p>
                <p style="margin: 8px 0 0; color: #666; line-height: 1.6;">
                    ${shippingAddress.addressLine1}<br>
                    ${shippingAddress.addressLine2 ? shippingAddress.addressLine2 + '<br>' : ''}
                    ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                    ${shippingAddress.country}
                </p>
                <p style="margin: 12px 0 0; color: #666;">
                    📧 ${shippingAddress.email}<br>
                    📱 ${shippingAddress.phone}
                </p>
            </div>
        </div>

        <!-- Estimated Delivery -->
        ${order.estimatedDelivery ? `
        <div style="padding: 0 30px 30px;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #0369a1; text-transform: uppercase; letter-spacing: 1px;">Estimated Delivery</p>
                <p style="margin: 8px 0 0; font-size: 18px; font-weight: 600; color: #0c4a6e;">${order.estimatedDelivery}</p>
            </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 14px;">Need help? Contact us at</p>
            <a href="mailto:support@luxeshop.com" style="color: #ffffff; font-size: 15px; text-decoration: none;">support@luxeshop.com</a>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
                <p style="margin: 0; color: #666; font-size: 12px;">© ${new Date().getFullYear()} Luxe Shop. All rights reserved.</p>
                <p style="margin: 8px 0 0; color: #666; font-size: 11px;">This email was sent to ${shippingAddress.email}</p>
            </div>
        </div>

    </div>
</body>
</html>
    `;
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order, userEmail) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Luxe Shop'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@luxeshop.com'}>`,
            to: userEmail,
            subject: `Order Confirmed! #${order._id.toString().slice(-8).toUpperCase()} - Luxe Shop`,
            html: generateOrderConfirmationHTML(order),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        // Don't throw - email failure shouldn't block order creation
        return { success: false, error: error.message };
    }
};

// Generic email sender
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Luxe Shop'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@luxeshop.com'}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    sendOrderConfirmationEmail,
    generateOrderConfirmationHTML
};
