import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Orderscreen from './orderScreen';
import Orderform from './newOrder';

function App() {
  return (
    <>
<Router>
      <Routes>
        <Route path="/" element={<Orderscreen />} />
        <Route path="/neworder" element={<Orderform/>}/>
        <Route path="/editorder/:orderId" element={<Orderform/>}/>
        
        
      </Routes>
    </Router>
    </>
  );
}

export default App;
