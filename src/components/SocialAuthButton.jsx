import React from 'react';
import '../styles/Auth.css';

const SocialAuthButton = ({ provider, onClick, disabled, loading }) => {
  const getProviderConfig = () => {
    switch (provider.toLowerCase()) {
      case 'google':
        return {
          name: 'Google',
          icon: 'G',
          color: '#4285F4',
          hoverColor: '#3367D6'
        };
      case 'github':
        return {
          name: 'GitHub',
          icon: 'GH',
          color: '#333',
          hoverColor: '#222'
        };
      case 'facebook':
        return {
          name: 'Facebook',
          icon: 'f',
          color: '#1877F2',
          hoverColor: '#166FE5'
        };
      case 'twitter':
        return {
          name: 'Twitter',
          icon: 'X',
          color: '#1DA1F2',
          hoverColor: '#1A91DA'
        };
      default:
        return {
          name: provider,
          icon: '',
          color: '#666',
          hoverColor: '#555'
        };
    }
  };

  const config = getProviderConfig();

  return (
    <button
      className="social-auth-btn"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: config.color,
        borderColor: config.color
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = config.hoverColor;
        e.target.style.borderColor = config.hoverColor;
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = config.color;
        e.target.style.borderColor = config.color;
      }}
    >
      {loading ? (
        <span className="spinner"></span>
      ) : (
        <>
          <span className="social-icon">{config.icon}</span>
          <span className="social-text">Continue with {config.name}</span>
        </>
      )}
    </button>
  );
};

export default SocialAuthButton;