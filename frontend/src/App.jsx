import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './page/Landing';
import Login from './page/Login';
import Register from './page/Register';
import Dashboard from './page/Dashboard';
import VocalsDashboard from './page/VocalsDashboard';
import NumbersDashboard from './page/NumbersDashboard';
import WordsDashboard from './page/WordsDashboard';
import MathSignsDashboard from './page/MathSignsDashboard';
import AlphabetDashboard from './page/AlphabetDashboard';
import OperationsDashboard from './page/OperationsDashboard';
import AdminDashboard from './page/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/numeros" element={<NumbersDashboard />} />
        <Route path="/vocals" element={<VocalsDashboard />} />
        <Route path="/words" element={<WordsDashboard />} />
        <Route path="/alphabet" element={<AlphabetDashboard />} />
        <Route path="/operations" element={<OperationsDashboard />} />
        <Route path="/math-signs" element={<MathSignsDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;