// backend/routes/twoFactor.js - Two-Factor Authentication Routes

import express from 'express';
import User from '../models/User.js';
import qrcode from 'qrcode';

const router = express.Router();

/**
 * POST /api/twofactor/setup
 * Generate 2FA setup QR code
 * Body: { userId }
 */
router.post('/setup', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate 2FA secret
    const secret = user.generateTwoFactorSecret();
    await user.save();
    
    // Generate QR code URL
    const qrUrl = secret.otpauth_url;
    
    // Generate QR code image
    const qrImage = await qrcode.toDataURL(qrUrl);
    
    res.status(200).json({
      message: '2FA setup initiated',
      qrCode: qrImage,
      secret: secret.base32
    });
  } catch (error) {
    console.error('2FA Setup Error:', error);
    res.status(500).json({ error: 'Server error setting up 2FA' });
  }
});

/**
 * POST /api/twofactor/verify
 * Verify 2FA setup
 * Body: { userId, token }
 */
router.post('/verify', async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ error: 'userId and token required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify token
    const isValid = user.verifyTwoFactorToken(token);
    
    if (isValid) {
      // Enable 2FA
      user.twoFactorEnabled = true;
      
      // Generate recovery codes
      const recoveryCodes = user.generateRecoveryCodes();
      await user.save();
      
      res.status(200).json({
        message: '2FA verified and enabled',
        recoveryCodes
      });
    } else {
      res.status(400).json({ error: 'Invalid 2FA token' });
    }
  } catch (error) {
    console.error('2FA Verification Error:', error);
    res.status(500).json({ error: 'Server error verifying 2FA' });
  }
});

/**
 * POST /api/twofactor/disable
 * Disable 2FA
 * Body: { userId }
 */
router.post('/disable', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorRecoveryCodes = [];
    await user.save();
    
    res.status(200).json({
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA Disable Error:', error);
    res.status(500).json({ error: 'Server error disabling 2FA' });
  }
});

/**
 * POST /api/twofactor/recovery
 * Use recovery code for 2FA
 * Body: { userId, code }
 */
router.post('/recovery', async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      return res.status(400).json({ error: 'userId and code required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify recovery code
    const isValid = user.verifyRecoveryCode(code);
    
    if (isValid) {
      await user.save();
      res.status(200).json({
        message: 'Recovery code accepted'
      });
    } else {
      res.status(400).json({ error: 'Invalid recovery code' });
    }
  } catch (error) {
    console.error('2FA Recovery Error:', error);
    res.status(500).json({ error: 'Server error processing recovery code' });
  }
});

/**
 * GET /api/twofactor/status/:userId
 * Get 2FA status for user
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      twoFactorEnabled: user.twoFactorEnabled,
      hasRecoveryCodes: user.twoFactorRecoveryCodes && user.twoFactorRecoveryCodes.length > 0
    });
  } catch (error) {
    console.error('2FA Status Error:', error);
    res.status(500).json({ error: 'Server error retrieving 2FA status' });
  }
});

export default router;
