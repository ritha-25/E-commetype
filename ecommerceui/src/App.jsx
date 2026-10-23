import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from './page/Login'
import Signup from './page/Signup'
import Home from './page/Home'
import ProductPag from './page/Product'
export default function App()

{
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} ></Route>
      <Route path="/login" element={<Login />} ></Route>
      <Route path="/signup" element={<Signup />} ></Route>
      <Route path="/home" element={<Home />} ></Route>
      <Route path="/product/:id" element={<ProductPag />} ></Route>
    </Routes>

    </BrowserRouter>
    
  );
} 
