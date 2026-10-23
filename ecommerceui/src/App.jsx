import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from './component/Nav'
import Footer from './component/Footer'
import laptopImage from './imagez/laptop.jpg'
import sofaImage from './imagez/sofa.jpg'
import Login from './page/Login'
import Signup from './page/Signup'
import Home from './page/Home'
export default function App()

{
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} ></Route>
      <Route path="/signup" element={<Signup />} ></Route>
      <Route path="/home" element={<Home />} ></Route>
    </Routes>

    </BrowserRouter>
    
  );
} 
