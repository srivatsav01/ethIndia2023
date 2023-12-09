// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MicrofinanceWithLiquidityPool {
    // Events
    event LoanApplied(address borrower, uint256 amount);
    event LoanRepaid(address borrower, uint256 amount);
    event LiquidityDeposited(address provider, uint256 amount,uint256 balance);
    event LiquidityWithdrawn(address provider, uint256 amount,uint256 balance);

    struct Borrower {
        uint256 loanAmount;
        uint256 maxLoanAmount;
        uint256 dueDate;
        bool hasActiveLoan;
        uint256 interestDue;  // Interest to be paid
        uint256 baseInterestRate;  // Base interest rate for the borrower
    }

    struct LiquidityProvider {
        uint256 balance;
        bool isProvider;
        uint256 interestRate;
    }

    uint256 public constant initialLoanAmount = 1e15 wei;  
    uint256 public constant initialInterestRate = 10; 
    uint256 public constant interestRateIncrease = 5; 
    uint256 public constant penaltyAmount = 2e14 wei; 
     uint256 public constant loanIncreaseAmount = 1e14 wei;
    uint256 public constant loanDuration = 1 days;

    mapping(address => Borrower) public borrowers;
    mapping(address => LiquidityProvider) public liquidityProviders;

    uint256 public totalLiquidity;

    function applyForLoan(uint256 amount) public {
        Borrower storage borrower = borrowers[msg.sender];
        if(borrower.maxLoanAmount == 0) {
            borrower.maxLoanAmount = initialLoanAmount;
            }
        require(!borrower.hasActiveLoan, "Active loan already exists");
        require(amount<= borrower.maxLoanAmount, "loan amount is less than maxLoan Amount");
        require(totalLiquidity >= initialLoanAmount, "Insufficient liquidity");
        
        borrower.loanAmount = initialLoanAmount;
        borrower.dueDate = block.timestamp + loanDuration;
        borrower.hasActiveLoan = true;
        borrower.baseInterestRate = borrower.baseInterestRate == 0 ? initialInterestRate : borrower.baseInterestRate;
        borrower.interestDue = borrower.loanAmount * borrower.baseInterestRate / 100;

        totalLiquidity -= initialLoanAmount;
        payable(msg.sender).transfer(borrower.loanAmount);

        emit LoanApplied(msg.sender, borrower.loanAmount);
    }

    function repayLoan() public payable {
        Borrower storage borrower = borrowers[msg.sender];
        require(borrower.hasActiveLoan, "No active loan");

        uint256 totalDue = borrower.loanAmount + borrower.interestDue;
        if (block.timestamp > borrower.dueDate) {
            totalDue += penaltyAmount;
            borrower.baseInterestRate += interestRateIncrease;
            borrower.maxLoanAmount -= loanIncreaseAmount;
        }
        require(msg.value >= totalDue, "Insufficient amount to repay the loan");

        borrower.hasActiveLoan = false;
        totalLiquidity += msg.value;
        borrower.interestDue = 0;

        emit LoanRepaid(msg.sender, msg.value);
    }

    function depositLiquidity() public payable {
        require(msg.value > 0, "Must deposit a positive amount");

        if (!liquidityProviders[msg.sender].isProvider) {
            liquidityProviders[msg.sender].isProvider = true;
        }

        liquidityProviders[msg.sender].balance += msg.value;
        totalLiquidity += msg.value;

        emit LiquidityDeposited(msg.sender, msg.value,liquidityProviders[msg.sender].balance);
    }

    function withdrawLiquidity(uint256 amount) public {
        require(liquidityProviders[msg.sender].isProvider, "Not a liquidity provider");
        require(amount <= liquidityProviders[msg.sender].balance, "Insufficient balance");

        liquidityProviders[msg.sender].balance -= amount;
        totalLiquidity -= amount;
        payable(msg.sender).transfer(amount);

        emit LiquidityWithdrawn(msg.sender, amount,liquidityProviders[msg.sender].balance);
    }


    receive() external payable {}
}
