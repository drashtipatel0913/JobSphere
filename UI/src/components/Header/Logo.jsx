import React from 'react';
import './Logo.css'
import { Link } from 'react-router-dom';
const Logo = () => {
  return (
    <div id="logo">
      <Link to={'/'}><img src="/assets/images/logo.svg" alt="JobSphere Logo" /></Link>
    </div>
  );
}

export default Logo;
