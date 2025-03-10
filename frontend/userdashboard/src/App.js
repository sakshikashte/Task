import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Orderscreen from './orderScreen';
import Orderform from './newOrder';
import Kmltask from './Kmltask';

function App() {
  return (
    <>
<Router>
      <Routes>
        <Route path="/" element={<Kmltask />} />
        <Route path="/neworder" element={<Orderform/>}/>
        <Route path="/editorder/:orderId" element={<Orderform/>}/>

          {/* <Route path="/kml" element={<Kmltask/>}/> */}
        
      </Routes>
    </Router>
    </>
  );
}

export default App;
