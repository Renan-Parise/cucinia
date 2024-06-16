import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard/Dashboard';
import Liked from '../Pages/Liked/Liked';
import Ingredients from '../Pages/Ingredients/Ingredients';
import Configs from '../Pages/Configs/Configs';
import Register from '../Pages/Register/Register';
import Login from '../Pages/Login/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/dashboard/add" element={<Ingredients />} />
        <Route path="/dashboard/config" element={<Configs />} />
        <Route path="/dashboard/liked" element={<Liked />} />
      </Routes>
    </Router>
  );
}

export default App;