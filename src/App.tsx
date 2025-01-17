import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Studies } from './pages/Studies';
import { Polls } from './pages/Polls';
import { Data } from './pages/Data';
import { Visualizations } from './pages/Visualizations';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          <Navigation />
          <div className="col-span-9">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studies" element={<Studies />} />
              <Route path="/polls" element={<Polls />} />
              <Route path="/data" element={<Data />} />
              <Route path="/visualizations" element={<Visualizations />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}