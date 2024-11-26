import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [status, setStatus] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance);
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        setStatus("Processing deposit...");
        let amount = ethers.utils.parseEther(depositAmount.toString());
        let tx = await atm.deposit(amount);
        await tx.wait();
        setStatus("Deposit successful!");
        getBalance();
      } catch (error) {
        setStatus("Deposit failed. Please try again.");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        setStatus("Processing withdrawal...");
        let amount = ethers.utils.parseEther(withdrawAmount.toString());
        let tx = await atm.withdraw(amount);
        await tx.wait();
        setStatus("Withdrawal successful!");
        getBalance();
      } catch (error) {
        setStatus("Withdrawal failed. Please try again.");
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button className="btn connect-btn" onClick={connectAccount}>
          Connect Wallet
        </button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div className="atm-interface">
        <div className="header">
          <h2>Welcome, {account}</h2>
          <p>Balance: {balance && ethers.utils.formatEther(balance)} ETH</p>
        </div>
        <div className="actions">
          <div className="form">
            <label>Deposit Amount:</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter deposit amount"
            />
            <button className="action-button" onClick={deposit}>
              Deposit
            </button>
          </div>
          <div className="form">
            <label>Withdraw Amount:</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter withdraw amount"
            />
            <button className="action-button" onClick={withdraw}>
              Withdraw
            </button>
          </div>
        </div>
        {status && <p className="status">{status}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>MetaCrafter ATM</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: Arial, sans-serif;
          background: #1e2859;
          color: #fff;
        }
        header h1 {
          color: #4caf50;
          margin-bottom: 20px;
        }
        .atm-interface {
          background: #0a2e66;
          padding: 30px;
          border-radius: 10px;
          max-width: 600px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          color: white;
        }
        .header h2 {
          color: #e0e0e0;
        }
        .header p {
          font-size: 1.2em;
          margin-top: 5px;
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .action-button {
          background: #0077ff;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
        }
        .action-button:hover {
          background: #005ecc;
        }
        .form {
          margin: 15px 0;
          text-align: left;
        }
        label {
          font-size: 1.1em;
          margin-bottom: 5px;
        }
        input {
          width: 100%;
          padding: 10px;
          border-radius: 5px;
          border: none;
          margin-bottom: 10px;
        }
        .status {
          margin-top: 15px;
          background: #f4b400;
          color: black;
          padding: 10px;
          border-radius: 5px;
        }
      `}</style>
    </main>
  );
}
