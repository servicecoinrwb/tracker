<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HONEYTRAP — Scammer Tracker</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #050a05; --panel: #0a110a; --border: #1a3a1a;
    --green: #00ff41; --green-dim: #00c032; --green-dark: #003010;
    --red: #ff2244; --red-dim: #cc1133;
    --amber: #ffaa00; --amber-dim: #cc7700;
    --text: #b0d8b0; --text-dim: #507050;
    --scan: rgba(0,255,65,0.03);
  }
  body { background: var(--bg); font-family: 'Share Tech Mono', monospace; color: var(--text); }
  .app {
    min-height: 100vh;
    background: var(--bg);
    background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, var(--scan) 2px, var(--scan) 4px);
    padding: 20px;
    position: relative;
  }
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.04) 0%, transparent 60%);
    pointer-events: none;
  }
  .header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 16px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 900; color: var(--green); text-shadow: 0 0 20px rgba(0,255,65,0.5); letter-spacing: 2px; }
  .logo span { color: var(--red); text-shadow: 0 0 20px rgba(255,34,68,0.5); }
  .status-bar { display: flex; gap: 16px; align-items: center; font-size: 11px; color: var(--text-dim); }
  .pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--red); box-shadow: 0 0 8px var(--red); animation: pulse 1.2s infinite; }
  .pulse.active { background: var(--green); box-shadow: 0 0 8px var(--green); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .grid { display: grid; grid-template-columns: 340px 1fr; gap: 16px; }
  @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
  .panel { background: var(--panel); border: 1px solid var(--border); padding: 20px; position: relative; }
  .panel::before { content: attr(data-label); position: absolute; top: -9px; left: 12px; background: var(--panel); padding: 0 6px; font-size: 10px; color: var(--green-dim); letter-spacing: 2px; text-transform: uppercase; }
  .panel-title { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; color: var(--green-dim); letter-spacing: 3px; margin-bottom: 16px; text-transform: uppercase; }
  label { display: block; font-size: 10px; color: var(--text-dim); letter-spacing: 2px; margin-bottom: 6px; text-transform: uppercase; }
  input, select { width: 100%; background: var(--bg); border: 1px solid var(--border); color: var(--green); padding: 10px 12px; font-family: 'Share Tech Mono', monospace; font-size: 12px; margin-bottom: 14px; outline: none; transition: border-color 0.2s; }
  input:focus, select:focus { border-color: var(--green-dim); }
  input::placeholder { color: var(--text-dim); }
  .btn { width: 100%; padding: 12px; font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; cursor: pointer; border: none; text-transform: uppercase; transition: all 0.2s; }
  .btn-arm { background: var(--green-dark); color: var(--green); border: 1px solid var(--green-dim); }
  .btn-arm:hover { background: #004a20; box-shadow: 0 0 20px rgba(0,255,65,0.2); }
  .btn-disarm { background: #200010; color: var(--red); border: 1px solid var(--red-dim); }
  .btn-disarm:hover { background: #330020; }
  .btn-sm { width: auto; padding: 6px 14px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1px; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--text-dim); text-transform: uppercase; transition: all 0.2s; }
  .btn-sm:hover { border-color: var(--green-dim); color: var(--green); }
  .btn-sm.amber { border-color: var(--amber-dim); color: var(--amber); }
  .honeypot-status { margin: 16px 0; padding: 12px; border: 1px dashed var(--border); text-align: center; font-size: 11px; }
  .honeypot-status.armed { border-color: var(--green-dim); background: rgba(0,255,65,0.04); animation: flicker 4s infinite; }
  @keyframes flicker { 0%,98%,100%{opacity:1} 99%{opacity:0.8} }
  .armed-label { font-family: 'Orbitron', monospace; font-size: 13px; color: var(--green); text-shadow: 0 0 10px rgba(0,255,65,0.5); margin-bottom: 6px; }
  .addr-display { font-size: 10px; color: var(--text-dim); word-break: break-all; margin-top: 4px; }
  .addr-display span { color: var(--green); }
  .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
  .stat-box { background: var(--bg); border: 1px solid var(--border); padding: 10px; text-align: center; }
  .stat-num { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 900; color: var(--green); text-shadow: 0 0 10px rgba(0,255,65,0.4); }
  .stat-num.red { color: var(--red); text-shadow: 0 0 10px rgba(255,34,68,0.4); }
  .stat-label { font-size: 9px; color: var(--text-dim); margin-top: 2px; letter-spacing: 1px; }
  .feed { height: 220px; overflow-y: auto; background: var(--bg); border: 1px solid var(--border); padding: 8px; margin-bottom: 8px; font-size: 11px; scroll-behavior: smooth; }
  .feed::-webkit-scrollbar { width: 4px; }
  .feed::-webkit-scrollbar-track { background: var(--bg); }
  .feed::-webkit-scrollbar-thumb { background: var(--border); }
  .feed-line { padding: 2px 0; border-bottom: 1px solid #0d1a0d; line-height: 1.6; }
  .feed-line .ts { color: var(--text-dim); margin-right: 8px; }
  .feed-line .ok { color: var(--green); }
  .feed-line .warn { color: var(--amber); }
  .feed-line .alert { color: var(--red); }
  .scammer-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .scammer-table th { text-align: left; padding: 8px 10px; font-size: 9px; letter-spacing: 2px; color: var(--text-dim); border-bottom: 1px solid var(--border); text-transform: uppercase; }
  .scammer-table td { padding: 10px 10px; border-bottom: 1px solid #0d1a0d; vertical-align: top; }
  .scammer-row:hover { background: rgba(0,255,65,0.02); }
  .threat-badge { display: inline-block; padding: 2px 8px; font-size: 9px; font-family: 'Orbitron', monospace; font-weight: 700; letter-spacing: 1px; }
  .threat-HIGH { background: rgba(255,34,68,0.15); color: var(--red); border: 1px solid var(--red-dim); }
  .threat-MED { background: rgba(255,170,0,0.1); color: var(--amber); border: 1px solid var(--amber-dim); }
  .threat-LOW { background: rgba(0,192,50,0.1); color: var(--green-dim); border: 1px solid #005520; }
  .addr-cell { font-size: 10px; color: var(--green); cursor: pointer; }
  .addr-cell:hover { text-decoration: underline; }
  .scammer-empty { text-align: center; padding: 60px 20px; color: var(--text-dim); font-size: 12px; }
  .empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.3; }
  .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .tab-bar { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
  .tab { padding: 8px 16px; font-size: 10px; letter-spacing: 2px; cursor: pointer; color: var(--text-dim); border-bottom: 2px solid transparent; transition: all 0.15s; text-transform: uppercase; }
  .tab.active { color: var(--green); border-bottom-color: var(--green); }
  .section-note { font-size: 10px; color: var(--text-dim); margin-bottom: 12px; padding: 8px; border-left: 2px solid var(--border); }
  .manual-add { display: flex; gap: 8px; margin-bottom: 12px; }
  .manual-add input { margin-bottom: 0; flex: 1; }
  .copy-flash { position: fixed; bottom: 30px; right: 30px; background: var(--green-dark); border: 1px solid var(--green); color: var(--green); padding: 10px 20px; font-size: 12px; font-family: 'Orbitron', monospace; letter-spacing: 1px; animation: fadeUp 1.8s forwards; z-index: 999; }
  @keyframes fadeUp { 0%{opacity:0;transform:translateY(10px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-10px)} }
  .interval-row { display: flex; gap: 8px; align-items: flex-end; }
  .interval-row input { margin-bottom: 0; width: 80px; }
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const { useState, useEffect, useRef, useCallback } = React;

const CHAINS = {
  eth: { name: "Ethereum", api: "https://api.etherscan.io/api", explorer: "https://etherscan.io/address/" },
  bsc: { name: "BSC", api: "https://api.bscscan.com/api", explorer: "https://bscscan.com/address/" },
  polygon: { name: "Polygon", api: "https://api.polygonscan.com/api", explorer: "https://polygonscan.com/address/" },
};

const fmt = (addr) => addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : "";
const ts = () => new Date().toTimeString().slice(0,8);

function classifyThreat(tx, honeypotAddr) {
  const val = parseFloat(tx.value) / 1e18;
  const isDust = val < 0.001;
  const scamAddr = tx.from.toLowerCase();
  const honeyAddr = honeypotAddr.toLowerCase();
  const prefixMatch = scamAddr.slice(2,6) === honeyAddr.slice(2,6);
  const suffixMatch = scamAddr.slice(-4) === honeyAddr.slice(-4);
  if (prefixMatch || suffixMatch) return "HIGH";
  if (isDust) return "MED";
  return "LOW";
}

function App() {
  const [honeypotAddr, setHoneypotAddr] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [chain, setChain] = useState("eth");
  const [interval, setIntervalSec] = useState(30);
  const [armed, setArmed] = useState(false);
  const [scammers, setScammers] = useState([]);
  const [feed, setFeed] = useState([{ ts: ts(), type: "ok", msg: "System online. Configure honeypot to begin." }]);
  const [tab, setTab] = useState("log");
  const [manualAddr, setManualAddr] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [seenTxs, setSeenTxs] = useState(new Set());
  const [copyFlash, setCopyFlash] = useState("");
  const feedRef = useRef(null);
  const timerRef = useRef(null);

  const log = useCallback((type, msg) => {
    setFeed(f => [...f.slice(-200), { ts: ts(), type, msg }]);
  }, []);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [feed]);

  const fetchTxs = useCallback(async () => {
    if (!honeypotAddr || !apiKey) return;
    const c = CHAINS[chain];
    const url = `${c.api}?module=account&action=txlist&address=${honeypotAddr}&sort=desc&apikey=${apiKey}&page=1&offset=20`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== "1") {
        if (data.message !== "No transactions found") log("warn", `API: ${data.message || "No data"}`);
        return;
      }
      const newTxs = data.result.filter(tx => !seenTxs.has(tx.hash) && tx.to?.toLowerCase() === honeypotAddr.toLowerCase());
      if (newTxs.length > 0) {
        log("alert", `🎣 ${newTxs.length} new inbound tx(s) detected!`);
        setSeenTxs(prev => { const s = new Set(prev); newTxs.forEach(t => s.add(t.hash)); return s; });
        setScammers(prev => {
          const existing = new Set(prev.map(s => s.address.toLowerCase()));
          const toAdd = newTxs.filter(tx => !existing.has(tx.from.toLowerCase())).map(tx => ({
            id: tx.hash,
            address: tx.from,
            threat: classifyThreat(tx, honeypotAddr),
            value: (parseFloat(tx.value) / 1e18).toFixed(6),
            txHash: tx.hash,
            chain,
            detectedAt: new Date().toISOString(),
            note: "Auto-detected: inbound to honeypot",
          }));
          toAdd.forEach(s => log("alert", `FLAGGED ${s.address} [${s.threat}] — ${s.value} ETH`));
          return [...toAdd, ...prev];
        });
      } else {
        log("ok", `Scan complete. No new contacts.`);
      }
    } catch (e) {
      log("warn", `Fetch error: ${e.message}`);
    }
  }, [honeypotAddr, apiKey, chain, seenTxs, log]);

  const arm = () => {
    if (!honeypotAddr.match(/^0x[0-9a-fA-F]{40}$/)) { log("warn", "Invalid wallet address format."); return; }
    if (!apiKey) { log("warn", "API key required."); return; }
    setArmed(true);
    log("ok", `Honeypot ARMED at ${fmt(honeypotAddr)} on ${CHAINS[chain].name}`);
    log("ok", `Polling every ${interval}s. Waiting for contact…`);
  };

  const disarm = () => {
    setArmed(false);
    clearInterval(timerRef.current);
    log("warn", "Honeypot disarmed.");
  };

  useEffect(() => {
    if (armed) {
      fetchTxs();
      timerRef.current = setInterval(fetchTxs, interval * 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [armed]);

  const addManual = () => {
    if (!manualAddr.match(/^0x[0-9a-fA-F]{40}$/)) { log("warn", "Invalid address."); return; }
    setScammers(prev => [{
      id: `manual-${Date.now()}`,
      address: manualAddr,
      threat: "MED",
      value: "0",
      txHash: null,
      chain,
      detectedAt: new Date().toISOString(),
      note: manualNote || "Manually reported",
    }, ...prev]);
    log("alert", `MANUALLY LOGGED: ${manualAddr}`);
    setManualAddr(""); setManualNote("");
  };

  const copyReport = () => {
    const lines = ["SCAMMER ADDRESS REPORT", "=".repeat(40),
      `Generated: ${new Date().toISOString()}`,
      `Honeypot: ${honeypotAddr}`, `Chain: ${CHAINS[chain].name}`, "",
      ...scammers.map((s, i) =>
        `[${i+1}] ${s.address}\n    Threat: ${s.threat} | Value: ${s.value}\n    Detected: ${s.detectedAt}\n    Note: ${s.note}`
      )
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopyFlash("REPORT COPIED");
    setTimeout(() => setCopyFlash(""), 2000);
  };

  const removeScammer = (id) => setScammers(p => p.filter(s => s.id !== id));
  const openExplorer = (addr) => window.open(CHAINS[chain].explorer + addr, "_blank");
  const highCount = scammers.filter(s => s.threat === "HIGH").length;

  return (
    <div className="app">
      <div className="header">
        <div className="logo">HONEY<span>TRAP</span>.IO</div>
        <div className="status-bar">
          <div className={`pulse ${armed ? "active" : ""}`}></div>
          <span>{armed ? `MONITORING — ${CHAINS[chain].name}` : "STANDBY"}</span>
          <span style={{color:"var(--text-dim)"}}>|</span>
          <span>{scammers.length} FLAGGED</span>
        </div>
      </div>

      <div className="grid">
        <div>
          <div className="panel" data-label="CONFIG">
            <div className="panel-title">Trap Configuration</div>

            <label>Chain</label>
            <select value={chain} onChange={e => setChain(e.target.value)} disabled={armed} style={{marginBottom:14}}>
              {Object.entries(CHAINS).map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>

            <label>Honeypot Wallet Address</label>
            <input value={honeypotAddr} onChange={e => setHoneypotAddr(e.target.value)} placeholder="0x..." disabled={armed} />

            <label>API Key (Etherscan / BscScan / PolygonScan)</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Your free API key" disabled={armed} />

            <label>Poll Interval (seconds)</label>
            <input type="number" value={interval} onChange={e => setIntervalSec(Math.max(10, parseInt(e.target.value)||30))} disabled={armed} min={10} />

            {!armed
              ? <button className="btn btn-arm" onClick={arm}>⚡ ARM HONEYPOT</button>
              : <button className="btn btn-disarm" onClick={disarm}>⛔ DISARM</button>
            }

            <div className={`honeypot-status ${armed ? "armed" : ""}`}>
              {armed ? (
                <>
                  <div className="armed-label">▶ TRAP ACTIVE</div>
                  <div className="addr-display"><span>{fmt(honeypotAddr)}</span> bait deployed</div>
                </>
              ) : <span style={{color:"var(--text-dim)"}}>Trap not armed</span>}
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <div className={`stat-num ${highCount > 0 ? "red" : ""}`}>{highCount}</div>
                <div className="stat-label">HIGH THREAT</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{scammers.length}</div>
                <div className="stat-label">TOTAL FLAGGED</div>
              </div>
            </div>
          </div>

          <div className="panel" data-label="ACTIVITY LOG" style={{marginTop:16}}>
            <div className="panel-title">Live Feed</div>
            <div className="feed" ref={feedRef}>
              {feed.map((l, i) => (
                <div key={i} className="feed-line">
                  <span className="ts">[{l.ts}]</span>
                  <span className={l.type}>{l.msg}</span>
                </div>
              ))}
            </div>
            <button className="btn-sm" onClick={() => setFeed([{ts:ts(),type:"ok",msg:"Log cleared."}])}>Clear Log</button>
          </div>
        </div>

        <div className="panel" data-label="SCAMMER DATABASE">
          <div className="tab-bar">
            <div className={`tab ${tab==="log"?"active":""}`} onClick={() => setTab("log")}>Flagged Addresses</div>
            <div className={`tab ${tab==="manual"?"active":""}`} onClick={() => setTab("manual")}>Manual Report</div>
          </div>

          {tab === "log" && (
            <>
              <div className="table-header">
                <div className="panel-title" style={{marginBottom:0}}>{scammers.length} Address{scammers.length!==1?"es":""} Captured</div>
                {scammers.length > 0 && <button className="btn-sm amber" onClick={copyReport}>Export Report</button>}
              </div>
              {scammers.length === 0 ? (
                <div className="scammer-empty">
                  <div className="empty-icon">🎣</div>
                  <div>No scammers captured yet.</div>
                  <div style={{marginTop:8,fontSize:10}}>Arm the honeypot and wait for contact.</div>
                </div>
              ) : (
                <div style={{overflowY:"auto",maxHeight:"calc(100vh - 220px)"}}>
                  <table className="scammer-table">
                    <thead>
                      <tr>
                        <th>Threat</th><th>Address</th><th>Value</th><th>Detected</th><th>Note</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {scammers.map(s => (
                        <tr key={s.id} className="scammer-row">
                          <td><span className={`threat-badge threat-${s.threat}`}>{s.threat}</span></td>
                          <td>
                            <div className="addr-cell" onClick={() => openExplorer(s.address)} title={s.address}>{fmt(s.address)}</div>
                            {s.txHash && <div style={{fontSize:9,color:"var(--text-dim)",marginTop:2}}>tx: {fmt(s.txHash)}</div>}
                          </td>
                          <td style={{fontSize:10,color:"var(--amber)"}}>{s.value}</td>
                          <td style={{fontSize:9,color:"var(--text-dim)"}}>{new Date(s.detectedAt).toLocaleTimeString()}</td>
                          <td style={{fontSize:10,color:"var(--text-dim)",maxWidth:160}}>{s.note}</td>
                          <td><button className="btn-sm" onClick={() => removeScammer(s.id)} style={{color:"var(--red)",borderColor:"var(--red-dim)"}}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {tab === "manual" && (
            <>
              <div className="section-note">Manually log a known scammer address — seen in the wild, sent to you, or found in transaction history.</div>
              <label>Scammer Wallet Address</label>
              <div className="manual-add">
                <input value={manualAddr} onChange={e => setManualAddr(e.target.value)} placeholder="0x..." />
              </div>
              <label>Note / Context</label>
              <input value={manualNote} onChange={e => setManualNote(e.target.value)} placeholder="e.g. Sent dust tx from airdrop scam" />
              <button className="btn btn-arm" onClick={addManual}>+ Log Scammer Address</button>

              <div style={{marginTop:24,borderTop:"1px solid var(--border)",paddingTop:16}}>
                <div className="panel-title">Threat Classification Guide</div>
                <div style={{fontSize:11,lineHeight:2,color:"var(--text-dim)"}}>
                  <div><span className="threat-badge threat-HIGH">HIGH</span> — Lookalike address (prefix/suffix match)</div>
                  <div><span className="threat-badge threat-MED">MED</span> — Dust transaction (&lt;0.001 ETH)</div>
                  <div><span className="threat-badge threat-LOW">LOW</span> — Suspicious inbound, unknown intent</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {copyFlash && <div className="copy-flash">{copyFlash}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
</body>
</html>
