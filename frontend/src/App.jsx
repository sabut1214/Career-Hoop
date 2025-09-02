import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Home from './components/views/Home';
import HealthCheck from './components/views/HealthCheck';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/careers" element={<div className="container"><h2>Careers Page - Coming Soon</h2></div>} />
            <Route path="/universities" element={<div className="container"><h2>Universities Page - Coming Soon</h2></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
