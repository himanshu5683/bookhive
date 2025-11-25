import React from 'react';
import '../styles/Footer.css';

const Footer = () => (
  <footer className="bh-footer">
    <div className="container footer-inner">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>BookHive</h4>
          <p className="small">A community library for sharing notes, books, and learning resources.</p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="/" onClick={(e) => e.preventDefault()}>Library</a></li>
            <li><a href="/" onClick={(e) => e.preventDefault()}>Collections</a></li>
            <li><a href="/" onClick={(e) => e.preventDefault()}>Upload</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p className="small">hello@bookhive.example</p>
          <div className="socials">
            <a href="/" onClick={(e) => e.preventDefault()}>Twitter</a> · <a href="/" onClick={(e) => e.preventDefault()}>GitHub</a> · <a href="/" onClick={(e) => e.preventDefault()}>LinkedIn</a>
          </div>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>Newsletter</h4>
          <p className="small">Get curated book picks and community highlights.</p>
          <form onSubmit={(e)=>{ e.preventDefault(); alert('Subscribed!'); }}>
            <input className="footer-input" placeholder="Email address" aria-label="Newsletter email" />
            <button className="btn btn-primary" type="submit" style={{marginTop:'.5rem'}}>Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom small" style={{marginTop:'1.25rem', textAlign:'center'}}>
        © {new Date().getFullYear()} BookHive — Built with care for readers.
      </div>
    </div>
  </footer>
);

export default Footer;
