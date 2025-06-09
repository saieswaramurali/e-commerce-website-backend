import User from "../models/user.model.js";
import nodemailer from 'nodemailer';
import bcrypt from "bcryptjs" ; 
import jwt from "jsonwebtoken" ; 
import {jwtDecode} from 'jwt-decode'; 
import {JWT_EXPIRES_IN, JWT_SECRET, EMAIL_PASSWORD, EMAIL_USER} from "../config/env.js" ; 

export const signUp = async (req, res) => {
  try {
    const { name, email, password, authProvider = 'local' } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });

    // For local signup, password is required
    if (authProvider === 'local' && !password) {
      return res.status(400).json({ error: "Password is required for local signup" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.authProvider === 'google' && authProvider === 'local') {
        return res.status(409).json({ message: "Email registered via Google. Please login using Google Sign-In." });
      }
      return res.status(409).json({ message: "Email already exists" });
    }

    let hashedPassword = null;
    if (authProvider === 'local') {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider,
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: newUser,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(400).json({ error: "Email not registered" });

    if (user.authProvider === 'google') {
      return res.status(400).json({ error: "Please log in using Google Sign-In" });
    }

    const validCreds = await bcrypt.compare(password, user.password);

    if (!validCreds) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      data: {
        token,
        User: user,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const signOut = (req, res) => {
    res.send('signed-out successfully') ; 
} ; 

export const GoogleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Credential token missing' });
    }

    const decoded = jwtDecode(credential);

    const { email, name } = decoded;

    if (!email) {
      return res.status(400).json({ error: "Google token doesn't contain email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        authProvider: 'google',
        isVerified: true, 
      });

      await user.save();
    } else {
    if (user.authProvider !== 'google') {
        return res.status(400).json({ error: 'Please login using your email and password' });
      }
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user,
      },
      message: "User authenticated via Google token",
    });

  } catch (error) {
    console.error('Google Sign-In error:', error);
    return res.status(500).json({ error: 'Invalid Google token' });
  }
};




export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "No Email is provided!!!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "No user exist with the email!!!" });

    if (user.authProvider === 'google')
      return res.status(400).json({ error: "Email is registered using Google!!!" });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // expires in 15 minutes
    );

    // Create URL
    const resetLink = `https://e-commerce-website-frontend-smoky.vercel.app/reset-password/${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>Hello ${user.name || 'user'},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Reset link sent to your email!" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save the hashed password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully!" });

  } catch (err) {
    console.error("ResetPassword error:", err);
    return res.status(400).json({ error: err.message || "Invalid or expired token." });
  }
};


//admin controllers 
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({ message: 'Use your OAuth provider to log in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // 👇 Inline token generation
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      dashboardUrl: `https://e-commerce-website-frontend-smoky.vercel.app/admin/dashboard?token=${token}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
