
# Smart Contract Management

A simple Solidity contract that allows the owner to manage their balance by depositing and withdrawing funds. The contract ensures that only the owner can perform these operations, and it emits events upon successful transactions. It also includes custom error handling for insufficient balance when attempting to withdraw more than the available balance.

## Description
This Solidity smart contract allows the owner to manage their account balance with the following features:

- **Deposit Funds:** The owner can deposit funds into the contract. The contract ensures that only the owner can perform the deposit operation.
- **Withdraw Funds:** The owner can withdraw funds from the contract. A custom error is triggered if the balance is insufficient to cover the withdrawal.
- **Balance Tracking:** The contract allows the owner to check the current balance at any time.
- **Events:** The contract emits `Deposit` and `Withdraw` events when funds are deposited or withdrawn, respectively.

The contract provides basic functionality to manage an account balance, enforcing the rule that only the owner can deposit or withdraw funds. It also includes error handling for insufficient funds during withdrawal.

## Getting Started

### Executing Program in Gitpod

To run this program in Gitpod, follow these steps:

1. **Open Gitpod:**
   - Go to [Gitpod](https://www.gitpod.io/) and sign in.
   - Create a new workspace or open an existing workspace where you want to develop.

2. **Install Dependencies:**
   - If you're starting a new project, run the following commands in the terminal to install dependencies:
     ```bash
     npm init -y
     npm install --save-dev hardhat
     ```

3. **Set Up Hardhat Project:**
   - After installing Hardhat, run the following command to create a basic Hardhat project:
     ```bash
     npx hardhat
     ```
   - Choose the option to create a sample project.

4. **Create a New Solidity File:**
   - In the `contracts` directory, create a new file called `Assessment.sol`.
   - Copy and paste the following Solidity code into the new file:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }
}
```

5. **Compile the Contract:**
   - In the terminal, run the following command to compile the contract:
     ```bash
     npx hardhat compile
     ```

6. **Deploy the Contract:**
   - Create a deployment script in the `scripts` folder (e.g., `deploy.js`) with the following content:
     ```javascript
     async function main() {
       const [deployer] = await ethers.getSigners();
       console.log("Deploying contracts with the account:", deployer.address);

       const Assessment = await ethers.getContractFactory("Assessment");
       const assessment = await Assessment.deploy(100);
       console.log("Assessment contract deployed to:", assessment.address);
     }

     main()
       .then(() => process.exit(0))
       .catch((error) => {
         console.error(error);
         process.exit(1);
       });
     ```

   - Run the deployment script:
     ```bash
     npx hardhat run scripts/deploy.js --network localhost
     ```

7. **Interact with the Contract:**
   - Once deployed, you can interact with the contract via Hardhat scripts or a frontend connected to the Ethereum network.

## Authors
- **Metacrafter**
- **Charles_shiro**

## License
This project is licensed under the UNLICENSED License.
