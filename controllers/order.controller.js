import Order from "../models/order.model.js"; 
import User from "../models/user.model.js" ; 
import mongoose from 'mongoose';
import {EMAIL_PASSWORD, EMAIL_USER} from "../config/env.js" ; 


import nodemailer from 'nodemailer';


const sendOrderConfirmationEmail = async (email, name, orderItems, shippingAddress, totalPrice) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,       // your email (use app password)
      pass: EMAIL_PASSWORD,   // your app-specific password
    },
  });

  const orderItemsHTML = orderItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td>${item.quantity}</td>
      <td>${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <h2>Hello ${name},</h2>
    <p>Your order has been placed successfully. Here are the details:</p>

    <h3>Shipping Address:</h3>
    <p>
      ${shippingAddress?.addressLine1 || ''}${shippingAddress?.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''}<br/>
      ${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} - ${shippingAddress?.postalCode || ''}<br/>
      ${shippingAddress?.country || ''}<br/>
      📞 ${shippingAddress?.phoneNumber || ''}
    </p>


    <h3>Order Summary:</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Price (₹)</th>
          <th>Quantity</th>
          <th>Subtotal (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHTML}
      </tbody>
    </table>

    <h4>Total Price: ₹${totalPrice}</h4>
    <p>Thank you for shopping with us!</p>
  `;

  const mailOptions = {
    from: `"DL Food Products" <${EMAIL_USER}>`,
    to: email,
    subject: 'Your Order Confirmation',
    html: html,
  };

  await transporter.sendMail(mailOptions);
};



export const placeOrder = async (req, res) => {
  try {
    const {
      user,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentResult,
    } = req.body;

    if (!user || !orderItems || orderItems.length === 0 || !shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Missing required order fields." });
    }

    const userInfo = await User.findById(user);
    if (!userInfo || !userInfo.email) {
      return res.status(400).json({ message: "User email not found." });
    }

    const newOrder = new Order({
      user,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const savedOrder = await newOrder.save();

    await sendOrderConfirmationEmail(userInfo.email, userInfo.name, orderItems, shippingAddress, totalPrice);

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });

  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getAllOrders = (req, res) => {
    res.send('got all orders') ; 
} ; 

export const getOrder = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch all orders for the user
    const orders = await Order.find({ user: userId }).lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    // Classify orders based on isDelivered attribute
    const currentOrders = orders.filter(order => order.isDelivered === false);
    const pastOrders = orders.filter(order => order.isDelivered === true);

    // Respond with classified orders
    res.json({
      currentOrders,
      pastOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateOrder = (req, res) => {
    res.send('order updated') ; 
} ; 

export const deleteOrder = (req, res) => {
    res.send('order deleted') ;
} ; 
