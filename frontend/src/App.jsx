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

  // ⏱️ Timeout helper
  const withTimeout = (promise, ms = 10000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Freighter tidak merespon (popup ke-block)"));
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

  // 🔌 Connect wallet
  const handleConnect = async () => {
    setErrorMsg("");

    try {
      setLoading(true);

      if (!window.freighterApi) {
        throw new Error("Freighter belum terinstall");
      }

      const data = await withTimeout(getAccountInfo());

      if (!data) throw new Error("Gagal ambil data wallet");

      setUserInfo(data);
      setIsConnected(true);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 💸 Donate
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

      const data = await getAccountInfo();
      if (data) setUserInfo(data);
    } catch (e) {
      console.error(e);
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
            Workshop DApp menggunakan wallet Freighter
          </p>

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}

          <button onClick={handleConnect} disabled={loading} style={styles.button}>
            {loading ? "Connecting..." : "Connect Wallet"}
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

        <form onSubmit={handleDonate}>
          <input
            type="number"
            placeholder="Jumlah XLM"
            value={amount}
            min="0"
            step="0.1"
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Processing..." : "Kirim Donasi"}
          </button>
        </form>

        <button onClick={() => setIsConnected(false)} style={styles.disconnect}>
          Disconnect
        </button>
      </div>
    </div>
  );
}

// 🎨 STYLE
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
    marginTop: "10px",
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