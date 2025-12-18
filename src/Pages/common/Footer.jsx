import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/Footer.css';

const Footer = () => (
  <motion.footer 
    className="bh-footer"
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <div className="container footer-inner">
      <div className="footer-grid">
        <motion.div 
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4>BookHive</h4>
          <p className="small">A community library for sharing notes, books, and learning resources.</p>
        </motion.div>

        <motion.div 
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4>Explore</h4>
          <ul>
            <li><a href="#library">Library</a></li>
            <li><a href="#collections">Collections</a></li>
            <li><a href="#upload">Upload</a></li>
          </ul>
        </motion.div>

        <motion.div 
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h4>Contact</h4>
          <p className="small">hello@bookhive.example</p>
          <div className="socials">
            <a href="#twitter">Twitter</a> · <a href="#github">GitHub</a> · <a href="#linkedin">LinkedIn</a>
          </div>
        </motion.div>

        <motion.div 
          className="footer-col footer-newsletter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h4>Newsletter</h4>
          <p className="small">Get curated book picks and community highlights.</p>
          <form onSubmit={(e)=>{ e.preventDefault(); alert('Subscribed!'); }}>
            <input className="footer-input" placeholder="Email address" aria-label="Newsletter email" />
            <motion.button 
              className="btn btn-primary" 
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </form>
        </motion.div>
      </div>

      <motion.div 
        className="footer-bottom small"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        © {new Date().getFullYear()} BookHive — Built with care for readers.
      </motion.div>
    </div>
  </motion.footer>
);

export default Footer;