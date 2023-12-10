import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import LandingPage from './Landing';
import Dashboard from './Dashboard';
import VerificationPage from './Verification';
import { LogInWithAnonAadhaar, useAnonAadhaar } from 'anon-aadhaar-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SupplyPage from './SupplyPage';

const ethers = require('ethers');

function App() {
  const [account, setAccount] = useState('');

  const navigate = useNavigate();
  const [anonAadhaar] = useAnonAadhaar();
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error(error);
      }
    } else {
      window.alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    const fetchAccount = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          // Get the list of accounts
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const address = accounts[0];
            setAccount(address);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchAccount();
  }, [account]);

  // let retriveItem = JSON.parse(localStorage.getItem('status'));
  useEffect(() => {
    if (anonAadhaar?.status === 'logged-out' && account.length > 0) {
      navigate('/verification');
    }
    console.log('anonAadhaar?.status', anonAadhaar?.status);
    if (anonAadhaar?.status === 'logged-out' && account.length === 0) {
      navigate('/');
    }
    // else if (anonAadhaar?.status === 'logged-in' && account.length === 0) {
    //   navigate('/');
    // }
    else if (anonAadhaar?.status === 'logged-in' && account.length > 0) {
      navigate('/borrow');
    }
  }, [anonAadhaar?.status, account]);
  return (
    <div className='App '>
      {/* <Router> */}
      <Navbar />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/verification' element={<VerificationPage />} />
        <Route path='/borrow' element={<Dashboard />} />
        <Route path='/supply' element={<SupplyPage />} />
      </Routes>
      {/* </Router> */}
    </div>
  );
}

export default App;
