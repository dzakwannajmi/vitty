import React, { useState } from "react";
import { useContract } from "./hooks/useContract";

function App() {
  const [amount, setAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [userInfo, setUserInfo] = useState({
    address: "",
    balance: "0",
  });

  const { donate, getAccountInfo } = useContract();

  // 🔥 Helper: timeout biar ga nge-freeze
  const withTimeout = (promise, ms = 10000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Freighter tidak merespon (timeout)"));
      }, ms);

      promise
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  // 🔌 CONNECT WALLET
  const handleConnect = async () => {
    setErrorMsg("");

    try {
      setLoading(true);

      // ❗ cek extension
      if (!window.freighterApi) {
        throw new Error("Freighter belum terinstall");
      }

      console.log("➡️ Requesting access...");

      const data = await withTimeout(getAccountInfo());

      console.log("✅ Response:", data);

      if (!data) throw new Error("Gagal ambil data wallet");

      setUserInfo(data);
      setIsConnected(true);
    } catch (e) {
      console.error("❌ CONNECT ERROR:", e);

      if (e.message.includes("timeout")) {
        setErrorMsg("Popup Freighter kemungkinan terblokir browser");
      } else {
        setErrorMsg(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 💸 DONATE
  const handleDonate = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!amount || amount <= 0) {
      setErrorMsg("Masukkan jumlah yang valid");
      return;
    }

    try {
      setLoading(true);

      await withTimeout(donate(parseFloat(amount) * 10000000));

      setAmount("");

      // refresh saldo
      const data = await getAccountInfo();
      if (data) setUserInfo(data);
    } catch (e) {
      console.error("❌ DONATE ERROR:", e);
      setErrorMsg(e.message);
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
        <div style={styles.card}>
          <h1>🚀 Stellar Donate</h1>
          <p style={{ color: "#94a3b8" }}>
            Connect your wallet to start
          </p>

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          <button
            onClick={handleConnect}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Connecting..." : "Connect Freighter"}
          </button>
        </div>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Dashboard</h2>

        <div style={styles.box}>
          <p style={styles.label}>Address</p>
          <code>{shortAddress(userInfo.address)}</code>

          <p style={styles.label}>Balance</p>
          <h2>{userInfo.balance} XLM</h2>
        </div>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        <form onSubmit={handleDonate} style={{ marginTop: "15px" }}>
          <input
            type="number"
            placeholder="Amount XLM"
            value={amount}
            min="0"
            step="0.1"
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
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
    background: "#020617",
    color: "white",
  },

  card: {
    background: "#0f172a",
    padding: "30px",
    borderRadius: "15px",
    width: "360px",
    textAlign: "center",
  },

  box: {
    background: "#020617",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "15px",
  },

  label: {
    fontSize: "12px",
    color: "#94a3b8",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    border: "none",
  },

  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    background: "#3b82f6",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  disconnect: {
    marginTop: "10px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
  },

  error: {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "10px",
  },
};

export default App;