import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Nepal Career Guide</Link>
      </div>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link
            to="/"
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/health"
            className={location.pathname === '/health' ? 'nav-link active' : 'nav-link'}
          >
            Health Check
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/careers"
            className={location.pathname === '/careers' ? 'nav-link active' : 'nav-link'}
          >
            Careers
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/universities"
            className={location.pathname === '/universities' ? 'nav-link active' : 'nav-link'}
          >
            Universities
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
