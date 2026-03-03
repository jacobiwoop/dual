import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Creators from './pages/Creators';
import Withdrawals from './pages/Withdrawals';
import Clients from './pages/Clients';
import Moderation from './pages/Moderation';
import Media from './pages/Media';
import Transactions from './pages/Transactions';
import CoinRequests from './pages/CoinRequests';
import Commissions from './pages/Commissions';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Account from './pages/Account';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="creators" element={<Creators />} />
          <Route path="clients" element={<Clients />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="media" element={<Media />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="coin-requests" element={<CoinRequests />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="logs" element={<Logs />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
