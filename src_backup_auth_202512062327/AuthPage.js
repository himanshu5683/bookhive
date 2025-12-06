import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AuthPage.css';
import AuthContext from '../../auth/AuthContext';

const emptyLogin = { email: '', password: '' };
const emptySignup = { name: '', email: '', password: '', confirmPassword: '' };

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState(emptyLogin);
  const [signup, setSignup] = useState(emptySignup);
  const [errors, setErrors] = useState({});
  const [dark, setDark] = useState(false);
  const { login: authLogin, signup: authSignup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleTab = (m) => {
    setMode(m);
    setErrors({});
  };

  const handleInput = (e, form) => {
    const { name, value } = e.target;
    form === 'login' ? setLogin({ ...login, [name]: value }) : setSignup({ ...signup, [name]: value });
  };

  const validate = () => {
    let errs = {};
    if (mode === 'login') {
      if (!login.email) errs.email = 'Email/Username required';
      if (!login.password) errs.password = 'Password required';
    } else {
      if (!signup.name) errs.name = 'Name required';
      if (!signup.email) errs.email = 'Email required';
      if (!signup.password) errs.password = 'Password required';
      if (signup.password !== signup.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'login') {
        await authLogin(login.email, login.password);
        navigate('/dashboard');
      } else {
        await authSignup(signup.email, signup.password, signup.name);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`auth-root${dark ? ' dark' : ''}`}>
      <div className="auth-split">
        <div className="auth-visual">
          <h2>Welcome to BookHive</h2>
          <p>Connect, share, and discover your next favorite book.</p>
          <button className="mode-toggle" onClick={() => setDark(!dark)}>
            {dark ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <div className="auth-form-wrap">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => handleTab('login')}>Login</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => handleTab('signup')}>Sign Up</button>
          </div>
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            {mode === 'login' ? (
              <>
                <div className={`input-group${errors.email ? ' error' : ''}`}>
                  <input type="text" name="email" placeholder="Email or Username" value={login.email} onChange={e => handleInput(e, 'login')} autoFocus />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
                <div className={`input-group${errors.password ? ' error' : ''}`}>
                  <input type="password" name="password" placeholder="Password" value={login.password} onChange={e => handleInput(e, 'login')} />
                  {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>
                <div className="form-row">
                  <label className="remember-me">
                    <input type="checkbox" name="remember" /> Remember me
                  </label>
                  <button type="button" className="forgot-link" onClick={() => alert('Forgot Password clicked!')}>Forgot Password?</button>
                </div>
                <button className="auth-btn" type="submit">Login</button>
              </>
            ) : (
              <>
                <div className={`input-group${errors.name ? ' error' : ''}`}>
                  <input type="text" name="name" placeholder="Full Name" value={signup.name} onChange={e => handleInput(e, 'signup')} autoFocus />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>
                <div className={`input-group${errors.email ? ' error' : ''}`}>
                  <input type="email" name="email" placeholder="Email" value={signup.email} onChange={e => handleInput(e, 'signup')} />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
                <div className={`input-group${errors.password ? ' error' : ''}`}>
                  <input type="password" name="password" placeholder="Password" value={signup.password} onChange={e => handleInput(e, 'signup')} />
                  {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>
                <div className={`input-group${errors.confirmPassword ? ' error' : ''}`}>
                  <input type="password" name="confirmPassword" placeholder="Confirm Password" value={signup.confirmPassword} onChange={e => handleInput(e, 'signup')} />
                  {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                </div>
                <button className="auth-btn" type="submit">Create Account</button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
