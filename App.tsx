import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
import Home from './components/Home';
import Upload from './components/Upload';
import Gallery from './components/Gallery';
import About from './components/About';
import StoryPage from './components/StoryPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/story/:id" element={<StoryPage />} />
        </Routes>
      </Layout>
      <Analytics />
    </Router>
  );
};

export default App;