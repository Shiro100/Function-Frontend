import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    } else {
      setStatusMessage("MetaMask is not installed. Please install it to use this application.");
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      getATMContract();
    } else {
      setStatusMessage("No connected account found. Please connect your MetaMask wallet.");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect.");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
    } catch (error) {
      setStatusMessage("Failed to connect MetaMask. Please try again.");
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(balance);
      } catch (error) {
        setStatusMessage("Error fetching balance. Please try again.");
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        setIsProcessing(true);
        setStatusMessage("Processing deposit...");
        const amount = ethers.utils.parseEther(depositAmount.toString());
        const tx = await atm.deposit(amount);
        await tx.wait();
        setDepositAmount("");
        getBalance();
        setStatusMessage("Deposit successful!");
      } catch (error) {
        setStatusMessage("Deposit failed. Please ensure you have sufficient funds and try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        setIsProcessing(true);
        setStatusMessage("Processing withdrawal...");
        const amount = ethers.utils.parseEther(withdrawAmount.toString());
        const tx = await atm.withdraw(amount);
        await tx.wait();
        setWithdrawAmount("");
        getBalance();
        setStatusMessage("Withdrawal successful!");
      } catch (error) {
        setStatusMessage("Withdrawal failed. Please ensure you have sufficient balance and try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button className="button" onClick={connectAccount}>
          Connect Wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="dashboard">
        <p>Connected Account: {account}</p>
        <p>Balance: {balance && ethers.utils.formatEther(balance)} ETH</p>

        <div className="transaction">
          <div className="input-group">
            <input
              type="number"
              placeholder="Enter deposit amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={isProcessing}
            />
            <button onClick={deposit} disabled={isProcessing}>
              Deposit
            </button>
          </div>

          <div className="input-group">
            <input
              type="number"
              placeholder="Enter withdraw amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isProcessing}
            />
            <button onClick={withdraw} disabled={isProcessing}>
              Withdraw
            </button>
          </div>
        </div>

        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Ethereum ATM</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: auto;
          padding: 20px;
          background: #1e2859;
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        h1 {
          color: #4caf50;
        }
        .dashboard {
          margin-top: 20px;
        }
        .input-group {
          margin: 10px 0;
        }
        input {
          padding: 10px;
          width: 70%;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        button {
          padding: 10px 20px;
          margin-left: 10px;
          background-color: #0077ff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .status-message {
          margin-top: 20px;
          font-size: 1.2em;
          color: #ffd700;
        }
      `}</style>
    </main>
  );
}
