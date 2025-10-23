import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;

