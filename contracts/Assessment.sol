// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner; // Owner of the contract
    uint256 public balance;       // Contract balance
    bool public paused;           // Contract pause state

    // Events for logging actions
    event Deposit(address indexed depositor, uint256 amount);
    event Withdraw(address indexed withdrawer, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(bool isPaused);

    // Constructor: Initialize owner, balance, and set unpaused state
    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        paused = false; // Unpaused by default
    }

    // Modifiers for access control and contract state
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    // Custom error for insufficient balance
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    // View function to get the contract balance
    function getBalance() public view returns (uint256) {
        return balance;
    }

    // Deposit function for owner to add funds
    function deposit(uint256 _amount) public payable onlyOwner whenNotPaused {
        require(_amount > 0, "Deposit amount must be greater than zero");

        uint256 previousBalance = balance;
        balance += _amount;

        assert(balance == previousBalance + _amount);
        emit Deposit(msg.sender, _amount);
    }

    // Withdraw a specific amount
    function withdraw(uint256 _withdrawAmount) public onlyOwner whenNotPaused {
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({balance: balance, withdrawAmount: _withdrawAmount});
        }

        uint256 previousBalance = balance;
        balance -= _withdrawAmount;

        assert(balance == previousBalance - _withdrawAmount);
        emit Withdraw(msg.sender, _withdrawAmount);
    }

    // Withdraw all funds in the contract
    function withdrawAll() public onlyOwner whenNotPaused {
        uint256 withdrawAmount = balance;
        if (withdrawAmount == 0) {
            revert InsufficientBalance({balance: balance, withdrawAmount: 0});
        }

        balance = 0;
        emit Withdraw(msg.sender, withdrawAmount);
    }

    // Public deposit function to allow external users to contribute funds
    function publicDeposit() public payable whenNotPaused {
        require(msg.value > 0, "Deposit amount must be greater than zero");

        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Function to toggle the paused state
    function togglePause() public onlyOwner {
        paused = !paused;
        emit Paused(paused);
    }

    // Transfer ownership to a new address
    function transferOwnership(address payable newOwner) public onlyOwner whenNotPaused {
        require(newOwner != address(0), "New owner address cannot be zero address");

        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
