import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';
import { twoFactorService } from '../services/api'; // Fixed: Import twoFactorService instead of apiClient
import '../styles/TwoFactorSetup.css';

const TwoFactorSetup = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState('intro'); // intro, setup, verify, complete
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.twoFactorAPI.setup(user.id);
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setStep('setup');
    } catch (err) {
      setError(err.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!token.trim()) {
      setError('Please enter the 6-digit code from your authenticator app');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.twoFactorAPI.verify(user.id, token);
      setRecoveryCodes(response.recoveryCodes);
      setStep('complete');
    } catch (err) {
      setError(err.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    setError('');
    
    try {
      await apiClient.twoFactorAPI.disable(user.id);
      setStep('intro');
      alert('Two-factor authentication has been disabled');
    } catch (err) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    alert('Recovery codes copied to clipboard!');
  };

  const downloadRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookhive-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="twofactor-setup-container">
      <div className="twofactor-setup-card">
        <div className="twofactor-header">
          <h1>🔐 Two-Factor Authentication</h1>
          <p>Secure your account with an extra layer of protection</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {step === 'intro' && (
          <div className="step-content">
            <div className="intro-section">
              <h2>Protect Your Account</h2>
              <p>
                Two-factor authentication (2FA) adds an extra layer of security to your account. 
                In addition to your password, you'll need to enter a code from your phone when signing in.
              </p>
              
              <div className="security-benefits">
                <h3>Security Benefits:</h3>
                <ul>
                  <li>🛡️ Protection against password theft</li>
                  <li>🔒 Secure even if your password is compromised</li>
                  <li>📱 Easy to use with authenticator apps</li>
                </ul>
              </div>

              <div className="actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleEnable2FA}
                  disabled={loading}
                >
                  {loading ? 'Setting up...' : 'Enable 2FA'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'setup' && (
          <div className="step-content">
            <div className="setup-section">
              <h2>Set Up Your Authenticator</h2>
              <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              
              <div className="qr-code-container">
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="qr-code" />}
              </div>
              
              <div className="manual-setup">
                <p>Or enter this code manually:</p>
                <code className="secret-code">{secret}</code>
              </div>
              
              <div className="instructions">
                <h3>Instructions:</h3>
                <ol>
                  <li>Install an authenticator app on your phone</li>
                  <li>Scan the QR code or enter the code manually</li>
                  <li>Enter the 6-digit code shown in the app</li>
                </ol>
              </div>
              
              <div className="verification-input">
                <label htmlFor="token">6-Digit Code:</label>
                <input
                  type="text"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456"
                  maxLength="6"
                  className="token-input"
                />
              </div>
              
              <div className="actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleVerify2FA}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify and Enable'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setStep('intro')}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="step-content">
            <div className="complete-section">
              <div className="success-icon">✅</div>
              <h2>2FA Enabled Successfully!</h2>
              <p>Your account is now more secure with two-factor authentication.</p>
              
              <div className="recovery-codes-section">
                <h3>Recovery Codes</h3>
                <p className="important-note">
                  ⚠️ Save these codes in a secure place. You can use them to sign in if you lose access to your phone.
                </p>
                
                <div className="recovery-codes">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="recovery-code">
                      {code}
                    </div>
                  ))}
                </div>
                
                <div className="recovery-actions">
                  <button className="btn btn-secondary" onClick={copyRecoveryCodes}>
                    Copy to Clipboard
                  </button>
                  <button className="btn btn-secondary" onClick={downloadRecoveryCodes}>
                    Download as Text File
                  </button>
                </div>
              </div>
              
              <div className="actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/profile')}
                >
                  Go to Profile
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDisable2FA}
                  disabled={loading}
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;