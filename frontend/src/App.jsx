import React, { useState } from "react";
import { useContract } from "./hooks/useContract";

function App() {
  const [amount, setAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    address: "",
    balance: "0",
  });

  const { donate, getAccountInfo } = useContract();

  const handleConnect = async () => {
    try {
      setLoading(true);
      const data = await getAccountInfo();

      if (data) {
        setUserInfo(data);
        setIsConnected(true);
      } else {
        alert("Gagal konek wallet");
      }
    } catch (e) {
      alert("Freighter tidak merespon");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      alert("Masukkan jumlah yang valid");
      return;
    }

    try {
      setLoading(true);

      await donate(parseFloat(amount) * 10000000);

      setAmount("");

      // refresh saldo
      const data = await getAccountInfo();
      if (data) setUserInfo(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : "";

  // ================= LOGIN =================
  if (!isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.cardGlass}>
          <h1 style={styles.title}>🚀 Stellar Donate</h1>
          <p style={styles.subtitle}>
            Simple DApp using Freighter Wallet
          </p>

          <button
            onClick={handleConnect}
            style={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div style={styles.container}>
      <div style={styles.cardGlass}>
        <div style={styles.header}>
          <span style={styles.badge}>Connected</span>
        </div>

        <h2 style={{ marginBottom: "10px" }}>Dashboard</h2>

        <div style={styles.walletBox}>
          <p style={styles.label}>Address</p>
          <code style={styles.address}>
            {shortAddress(userInfo.address)}
          </code>

          <p style={styles.label}>Balance</p>
          <h2 style={styles.balance}>
            {userInfo.balance} <span style={{ fontSize: 14 }}>XLM</span>
          </h2>
        </div>

        <form onSubmit={handleDonate} style={styles.form}>
          <input
            type="number"
            placeholder="Amount (XLM)"
            value={amount}
            min="0"
            step="0.1"
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Processing..." : "Send Donation"}
          </button>
        </form>

        <button
          onClick={() => setIsConnected(false)}
          style={styles.disconnect}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

// ================= STYLE =================
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background:
      "linear-gradient(135deg, #0f172a, #1e293b, #020617)",
    fontFamily: "sans-serif",
  },

  cardGlass: {
    width: "380px",
    padding: "30px",
    borderRadius: "20px",
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    color: "white",
  },

  title: {
    marginBottom: "10px",
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "25px",
  },

  header: {
    display: "flex",
    justifyContent: "flex-end",
  },

  badge: {
    background: "#22c55e",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
  },

  walletBox: {
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  label: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
  },

  address: {
    fontSize: "13px",
    display: "block",
    marginBottom: "10px",
  },

  balance: {
    margin: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "#020617",
    color: "white",
  },

  primaryButton: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  disconnect: {
    marginTop: "15px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default App;