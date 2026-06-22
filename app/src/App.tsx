import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Quantify from './pages/Quantify';
import Referral from './pages/Referral';
import Account from './pages/Account';
import Admin from './pages/Admin';
import FAQ from './pages/FAQ';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/quantify" element={<Quantify />} />
      <Route path="/referral" element={<Referral />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
