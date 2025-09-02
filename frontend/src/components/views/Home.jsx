import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Nepal Career Guidance Platform</h1>
        <p>Discover your ideal career path based on your skills, interests, and academic performance</p>
        <div className="cta-buttons">
          <Link to="/careers" className="btn btn-primary">
            Explore Careers
          </Link>
          <Link to="/universities" className="btn btn-secondary">
            Find Universities
          </Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Career Suggestions</h3>
            <p>Get personalized career recommendations based on your profile</p>
          </div>
          <div className="feature-card">
            <h3>Education Paths</h3>
            <p>Discover the best educational institutions in Nepal for your chosen career</p>
          </div>
          <div className="feature-card">
            <h3>Skill Assessment</h3>
            <p>Evaluate your soft skills and get improvement recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
