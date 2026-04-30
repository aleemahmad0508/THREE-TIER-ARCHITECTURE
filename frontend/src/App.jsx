import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/data`);
      const sorted = [...res.data].sort((a, b) => a.id - b.id);
      setData(sorted);
      setError("");
    } catch (err) {
      setError("Backend not reachable");
    }
  };

  const handleSubmit = async () => {
    if (!url || !frequency || !duration) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(`${API}/start`, {
        url,
        frequency: Number(frequency),
        duration: Number(duration),
      });

      fetchData();

      if (intervalRef.current) clearInterval(intervalRef.current);

      const totalPolls = Number(duration) * 60;
      let count = 0;

      intervalRef.current = setInterval(() => {
        fetchData();
        count++;

        if (count >= totalPolls) {
          clearInterval(intervalRef.current);
          setLoading(false);
        }
      }, 1000);

    } catch (err) {
      setError("Failed to start API calls");
      setLoading(false);
    }
  };

  const clearData = async () => {
    try {
      await axios.delete(`${API}/clear`);
      setData([]);
      setError("");
    } catch {
      setError("Failed to clear data");
    }
  };

  useEffect(() => {
    fetchData();
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* TITLE */}
        <h1 style={styles.title}>🚀 API Monitoring Dashboard</h1>

        {/* INPUT CARD */}
        <div style={styles.card}>
          <input
            style={styles.input}
            placeholder="API URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Frequency (per min)"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.row}>
            <button style={styles.startBtn} onClick={handleSubmit} disabled={loading}>
              {loading ? "Running..." : "Start Monitoring"}
            </button>

            <button style={styles.clearBtn} onClick={clearData}>
              Clear Data
            </button>
          </div>
        </div>

        {/* TABLE CARD */}
        <div style={styles.tableCard}>
          <h2 style={styles.subTitle}>Live Results</h2>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Response</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td>{item.id}</td>

                    <td>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            item.status_code === 200
                              ? "rgba(34,197,94,0.2)"
                              : "rgba(239,68,68,0.2)",
                          color:
                            item.status_code === 200 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {item.status_code}
                      </span>
                    </td>

                    <td>{item.created_at}</td>

                    <td>
                      <pre style={styles.pre}>
                        {JSON.stringify(item.response, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

/* 🌌 MODERN STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    padding: 25,
    fontFamily: "Arial",
    color: "#fff",
    background:
      "radial-gradient(circle at top, #1e3a8a, #0f172a 60%, #020617)",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
  },

  title: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 25,
    color: "#ffffff",
    letterSpacing: "1px",
    textShadow: "0 0 25px rgba(59,130,246,0.8)",
  },

  subTitle: {
    marginBottom: 10,
    color: "#e2e8f0",
  },

  card: {
    background: "rgba(30, 41, 59, 0.75)",
    backdropFilter: "blur(14px)",
    padding: 22,
    borderRadius: 18,
    marginBottom: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(15, 23, 42, 0.8)",
    color: "#fff",
    outline: "none",
  },

  row: {
    display: "flex",
    gap: 12,
  },

  startBtn: {
    flex: 1,
    padding: 12,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    border: "none",
    color: "#fff",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  clearBtn: {
    flex: 1,
    padding: 12,
    background: "linear-gradient(135deg, #ef4444, #b91c1c)",
    border: "none",
    color: "#fff",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    background: "rgba(239,68,68,0.15)",
    color: "#fecaca",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    border: "1px solid rgba(239,68,68,0.4)",
  },

  tableCard: {
    background: "rgba(30, 41, 59, 0.75)",
    backdropFilter: "blur(14px)",
    padding: 22,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 750,
  },

  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  badge: {
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
    display: "inline-block",
  },

  pre: {
    background: "rgba(15, 23, 42, 0.9)",
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    maxWidth: 320,
    overflowX: "auto",
    color: "#e2e8f0",
  },
};

export default App;