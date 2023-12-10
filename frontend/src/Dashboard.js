import React, { useEffect, useState } from 'react';
import { createClient, cacheExchange, fetchExchange } from 'urql/core';
import Web3 from "web3"
import abi from './utils/abi.json'
function Dashboard() {
  const [loanData, setLoanData] = useState({
    loanApplieds: [],
    loanRepaids: [],
  });

  const CONTRACT_ADDRESS = '0xe1080033754882Bca4514fA5E616405279C94Ec0';


  const APIURL =
    'https://api.studio.thegraph.com/query/60981/zerolend/v0.0.0.2';

  const tokensQuery = `
  query {
  loanApplieds( where:{borrower:"0xfd476b0dac0b737858ccfd77483f2fe05674f0cf"}){
    id 
    borrower
    amount
  }
  loanRepaids(where:{borrower:"0xfd476b0dac0b737858ccfd77483f2fe05674f0cf"}){
    id
    borrower
    amount
  }
}
  
`;
  const client = createClient({
    url: APIURL,
    exchanges: [cacheExchange, fetchExchange],
  });

  useEffect(() => {
    const getData = async () => {
      const response = await client.query(tokensQuery).toPromise();
      if (response && response.data) {
        setLoanData(response.data);
      }
    };
    getData();
  }, []);

  const showBorrowComponent = loanData.loanApplieds.length === loanData.loanRepaids.length;

  console.log('loanData' + loanData);

  console.log('showBorrowComponent', showBorrowComponent);
  const RepaymentComponent = ({ web3, account }) => {
    const [loanDetails, setLoanDetails] = useState({
      borrowedAmount: 0,
      interestAccrued: 0,
      totalDue: 0,
    });

    // Fetch data from your smart contract here
    //   useEffect(() => {
    //     // Example: Fetch loan details as an object
    //     // This should be based on your smart contract's methods and user's account
    //     // Assuming the contract returns an object like { borrowedAmount, interestAccrued, totalDue }
    //     const fetchLoanDetails = async () => {
    //       // Replace with actual contract call
    //       const detailsFromContract = await getLoanDetailsFromContract(account);
    //       setLoanDetails(detailsFromContract);
    //     };

    //     fetchLoanDetails();
    //   }, [account, web3]);

    const handleRepayment = () => {

      const web3 = new Web3(window.ethereum);

// Define the contract ABI and address
const contractABI = abi; // Replace with your contract's ABI
const contractAddress = CONTRACT_ADDRESS;

// Create a contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Get the current user's account address
web3.eth.getAccounts().then(accounts => {
    const currentUserAddress = accounts[0]; // Assumes the first account is the user's

    // Define the repayment amount in Wei
    // This should be the total amount due (loan amount + interest + any penalties)
    // You need to calculate or retrieve this amount from somewhere
    const repaymentAmount = web3.utils.toWei('0.0011', 'ether'); // Example: 1 ether, replace with the actual repayment amount

    // Send the transaction to the repayLoan function
    contract.methods.repayLoan().send({
        from: currentUserAddress,
        value: repaymentAmount, // Value in Wei to be sent with the transaction
        // gas: 1000000, // Optionally set the gas limit
    })
    .then(function(receipt){
        console.log("Transaction receipt:", receipt);
    })
    .catch(function(error){
        console.log("Error:", error);
    });
});


    };

    return (
      <div className='p-4 max-w-md mx-auto max-h-[230px] bg-white rounded-xl shadow-md'>
        <h2 className='text-xl font-bold mb-4'>Loan Repayment</h2>
        <div className='mb-4'>
          <p>
            <strong>Borrowed Amount:</strong> ${loanDetails.borrowedAmount}
          </p>
          <p>
            <strong>Interest Accrued:</strong> ${loanDetails.interestAccrued}
          </p>
          <p>
            <strong>Total Due:</strong> ${loanDetails.totalDue}
          </p>
        </div>
        <button
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          onClick={handleRepayment}
        >
          Repay Amount
        </button>
      </div>
    );
  };

  const BorrowComponent = ({ web3, account }) => {
    const [maxLoanAmount, setMaxLoanAmount] = useState(0);
    const [loanAmount, setLoanAmount] = useState('');
    const [interestRate, setInterestRate] = useState(0);
    const [hasActiveLoan, setHasActiveLoan] = useState(false);
    const [dueDate, setDueDate] = useState('');

    // Fetch data from your smart contract here
    useEffect(() => {
      // Example: Fetch max loan amount, interest rate, and active loan status
      // This will depend on your smart contract's structure and functions
    }, [account, web3]);

    const handleBorrow = () => {
    
      

      const web3 = new Web3(window.ethereum);

      // Define the contract ABI and address
      const contractABI = abi; // Replace with your contract's ABI
      const contractAddress = CONTRACT_ADDRESS;
      
      // Create a contract instance
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      
      // Define the method and parameters
      const methodName = 'applyForLoan';
      const amount = web3.utils.toWei(loanAmount, 'ether'); // Example: applying for 1 ether loan, replace with desired amount
      const methodParams = [amount]; // Add method parameters here
      
      // Get the current user's account address
      web3.eth.getAccounts().then(accounts => {
          const currentUserAddress = accounts[0]; // Assumes the first account is the user's
      
          // Send the transaction
          contract.methods[methodName](...methodParams).send({
              from: currentUserAddress,
              // value: 'value_in_wei', // Add this if the function requires sending Ether
              // gas: 1000000, // Optionally set the gas limit
          })
          .then(function(receipt){
              console.log("Transaction receipt:", receipt);
          })
          .catch(function(error){
              console.log("Error:", error);
          });
      });
      

    };

    return (
      <div className='p-4 max-w-md mx-auto bg-white rounded-xl shadow-md'>
        <h2 className='text-xl font-bold mb-4'>Borrow Funds</h2>
        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>
            Loan Amount
          </label>
          <input
            type='number'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder='Enter amount to borrow'
          />
        </div>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          onClick={handleBorrow}
        >
          Borrow
        </button>
        <div className='mt-4'>
          <p>
            <strong>Max Loan Amount:</strong> {maxLoanAmount}
          </p>
          <p>
            <strong>Interest Rate:</strong> {interestRate}%
          </p>
          <p>
            <strong>Due Date:</strong> {dueDate}
          </p>
          <p>
            <strong>Has Active Loan:</strong> {hasActiveLoan ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    );
  };
  const SupplyComponent = ({ web3, account }) => {
    const [amountToSupply, setAmountToSupply] = useState('');
    const [apy, setApy] = useState(0);

    // Fetch APY from your smart contract here
    // This could be a fixed value or dynamically calculated based on the contract's state
    // setApy(fetchedApy);

    const handleSupply = () => {
      // Logic to initiate supply transaction
      // Interact with your smart contract's supply function
      console.log(`Supplying ${amountToSupply} at APY: ${apy}`);
      // Add your contract interaction logic here
    };

    return (
      <div className='p-4 max-w-md mx-auto bg-white rounded-xl shadow-md'>
        <h2 className='text-xl font-bold mb-4'>Supply Liquidity</h2>
        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>
            Amount to Supply
          </label>
          <input
            type='number'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            value={amountToSupply}
            onChange={(e) => setAmountToSupply(e.target.value)}
            placeholder='Enter amount'
          />
        </div>
        <div className='mb-4'>
          <p>
            <strong>APY:</strong> {apy}%
          </p>
        </div>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          onClick={handleSupply}
        >
          Supply
        </button>
      </div>
    );
  };

  const MicrofinanceExplainerComponent = () => {
    return (
      <div className='p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden'>
        <h2 className='text-2xl font-bold text-center mb-4'>
          How Our Microfinance Works
        </h2>
        <p className='text-gray-700 text-base mb-4'>
          Our microfinance platform provides an easy and accessible way for
          individuals to borrow and supply funds. Here's how you can get
          started:
        </p>
        <ul className='list-decimal list-inside text-gray-700 text-base'>
          <li>
            <strong>Borrowing Funds:</strong> To borrow funds, simply connect
            your wallet and choose the amount you need. The loan comes with a
            competitive interest rate and must be repaid within the specified
            period.
          </li>
          <li>
            <strong>Interest Rates:</strong> We offer a fixed interest rate of
            10%. If the loan is repaid on time, you're eligible for a higher
            amount on your next loan.
          </li>
          <li>
            <strong>Supplying Funds:</strong> As a liquidity provider, you can
            supply funds to the pool and earn interest. Your funds help others
            access the loans they need.
          </li>
          <li>
            <strong>Withdrawals:</strong> You can withdraw your supplied funds
            and earned interest at any time, subject to availability in the
            pool.
          </li>
        </ul>
        <p className='text-gray-700 text-base mt-4'>
          Our platform is designed to be user-friendly and secure, ensuring a
          positive experience for all users. Start with us today to explore easy
          microfinancing options.
        </p>
      </div>
    );
  };

  const WithdrawalComponent = ({ web3, account }) => {
    const [withdrawalDetails, setWithdrawalDetails] = useState({
      withdrawableAmount: 0,
      interestEarned: 0,
    });
    const [amountToWithdraw, setAmountToWithdraw] = useState('');

    // Fetch withdrawal details from your smart contract here
    // useEffect(() => {
    //   // Example: Fetch withdrawal details as an object
    //   // Assuming the contract returns an object like { withdrawableAmount, interestEarned }
    //   const fetchWithdrawalDetails = async () => {
    //     // Replace with actual contract call
    //     const detailsFromContract = await getWithdrawalDetailsFromContract(
    //       account
    //     );
    //     setWithdrawalDetails(detailsFromContract);
    //   };

    //   fetchWithdrawalDetails();
    // }, [account, web3]);

    const handleWithdraw = () => {
      // Logic to initiate withdrawal transaction
      console.log(`Withdrawing ${amountToWithdraw}`);
      // Add your contract interaction logic here
    };

    return (
      <div className='p-4 max-w-md mx-auto bg-white rounded-xl shadow-md'>
        <h2 className='text-xl font-bold mb-4'>Withdraw Funds</h2>
        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-bold mb-2'>
            Amount to Withdraw
          </label>
          <input
            type='number'
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            value={amountToWithdraw}
            onChange={(e) => setAmountToWithdraw(e.target.value)}
            placeholder='Enter amount'
          />
        </div>
        <div className='mb-4'>
          <p>
            <strong>Withdrawable Amount:</strong> $
            {withdrawalDetails.withdrawableAmount}
          </p>
          <p>
            <strong>Interest Earned:</strong> $
            {withdrawalDetails.interestEarned}
          </p>
        </div>
        <button
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          onClick={handleWithdraw}
        >
          Withdraw
        </button>
      </div>
    );
  };
  return (
    <div className='flex flex-col justify-center h-screen w-full md:w-screen font-mono bg-[#06283D]'>
      <div className='flex flex-col items-center justify-between'>
        <div className='flex flex-col md:flex-row justify-between mt-4 w-[90%]'>
          {/* <div className='left-container '>left-container</div> */}
          <MicrofinanceExplainerComponent />
          {showBorrowComponent ? <BorrowComponent /> : <RepaymentComponent />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
