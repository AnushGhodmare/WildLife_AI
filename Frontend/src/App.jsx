import { useState, useRef, useCallback, useEffect } from "react";

const API = "http://localhost:5000";

const CLASS_COLORS = {
  bear:      "#ef4444",
  bison:     "#d97706",
  deer:      "#84cc16",
  elephant:  "#f59e0b",
  fox:       "#f97316",
  giraffe:   "#10b981",
  hyena:     "#06b6d4",
  leopard:   "#14b8a6",
  person:    "#e2e8f0",
  tiger:     "#ff6b35",
  wild_boar: "#a78bfa",
  wolf:      "#38bdf8",
  zebra:     "#8b5cf6",
};
const defaultColor = "#e2e8f0";

const GlobalStyle = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root {
      width: 100%; min-height: 100vh;
      background: #020817;
      overflow-x: hidden;
    }
    @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  `}</style>
);

function Badge({ label, confidence, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#060e1c", border: `1px solid ${color}30`,
      borderLeft: `3px solid ${color}`,
      padding: "9px 14px", marginBottom: 6,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ color: "#f1f5f9", fontSize: 13, flex: 1, textTransform: "capitalize", letterSpacing: "0.3px" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 80, height: 4, background: "#1e293b", overflow: "hidden" }}>
          <div style={{ width: `${confidence * 100}%`, height: "100%", background: `linear-gradient(90deg, ${color}60, ${color})`, transition: "width 0.6s ease" }} />
        </div>
        <span style={{ color, fontSize: 12, fontFamily: "monospace", minWidth: 40, textAlign: "right" }}>
          {(confidence * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  const pct = Math.round(value * 100);
  const circumference = 2 * Math.PI * 28;
  return (
    <div style={{
      flex: 1, background: "#060e1c",
      borderTop: `2px solid ${color}`,
      padding: "24px 20px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    }}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="28" fill="none" stroke="#1e293b" strokeWidth="5" />
        <circle cx="35" cy="35" r="28" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - circumference * value}
          strokeLinecap="round" transform="rotate(-90 35 35)"
          style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <text x="35" y="40" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="700">{pct}%</text>
      </svg>
      <span style={{ color: "#64748b", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

export default function App() {
  const [image, setImage]           = useState(null);
  const [detections, setDetections] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [metrics, setMetrics]       = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [tab, setTab]               = useState("detect");
  const fileRef   = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    fetch(`${API}/metrics`).then(r => r.json()).then(setMetrics).catch(() => {});
  }, []);

  useEffect(() => {
    if (!detections || !image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image.url;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      detections.detections.forEach(det => {
        const [cx, cy, w, h] = det.bbox;
        const x = (cx - w / 2) * canvas.width;
        const y = (cy - h / 2) * canvas.height;
        const bw = w * canvas.width;
        const bh = h * canvas.height;
        const color = CLASS_COLORS[det.class] || defaultColor;
        ctx.strokeStyle = color; ctx.lineWidth = 3;
        ctx.shadowColor = color; ctx.shadowBlur = 10;
        ctx.strokeRect(x, y, bw, bh);
        ctx.shadowBlur = 0;
        ctx.fillStyle = color + "cc";
        ctx.fillRect(x, y - 24, bw, 24);
        ctx.fillStyle = "#000";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText(`${det.class} ${(det.confidence * 100).toFixed(0)}%`, x + 5, y - 6);
      });
    };
  }, [detections, image]);

  const handleFile = useCallback((file) => {
    if (!file?.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    setError(null); setDetections(null);
    setImage({ url: URL.createObjectURL(file), file });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handlePredict = async () => {
    if (!image) return;
    setLoading(true); setError(null); setDetections(null);
    try {
      const form = new FormData();
      form.append("image", image.file);
      const res = await fetch(`${API}/predict`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setDetections(await res.json());
    } catch (err) {
      setError(err.message || "Failed to connect to the backend.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <GlobalStyle />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap" rel="stylesheet" />

      <div style={{
        width: "100vw", minHeight: "100vh",
        background: "radial-gradient(ellipse 100% 50% at 50% -5%, #0f4c2a22 0%, #020817 55%)",
        color: "#f1f5f9", fontFamily: "'Sora', sans-serif",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header ── */}
        <header style={{
          width: "100%",
          borderBottom: "1px solid #0f172a",
          background: "#020817f5",
          backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 100,
          padding: "0 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 58,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🦁</span>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.5px" }}>
              Wildlife<span style={{ color: "#10b981" }}>AI</span>
            </span>
          </div>

          <nav style={{ display: "flex" }}>
            {["detect", "metrics"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "transparent",
                border: "none",
                borderBottom: tab === t ? "2px solid #10b981" : "2px solid transparent",
                borderTop: "2px solid transparent",
                color: tab === t ? "#10b981" : "#475569",
                padding: "0 22px", height: 58, cursor: "pointer",
                fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600,
                textTransform: "capitalize", transition: "all 0.15s",
              }}>
                {t === "detect" ? "🔍 Detect" : "📊 Metrics"}
              </button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "#1e3a2f", fontWeight: 700, letterSpacing: "1px" }}>LIVE</span>
          </div>
        </header>

        {/* ── Detect Tab ── */}
        {tab === "detect" && (
          <main style={{
            flex: 1,
            width: "100%",
            padding: "28px 40px 28px",
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gridTemplateRows: "auto 1fr auto",
            columnGap: 28,
          }}>
            {/* Title */}
            <div style={{ gridColumn: 1, gridRow: 1, paddingBottom: 16 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", margin: 0 }}>
                Wildlife Detection
              </h1>
              <p style={{ color: "#475569", marginTop: 4, fontSize: 13 }}>
                Powered by YOLOv8 · mAP@0.5: 91.4%
              </p>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                gridColumn: 1, gridRow: 2,
                border: `1px solid ${dragging ? "#10b981" : "#0f172a"}`,
                background: dragging ? "#10b98108" : "#060e1c",
                cursor: "pointer", transition: "all 0.2s",
                position: "relative", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 380,
              }}
            >
              {/* corner brackets */}
              {[{top:6,left:6},{top:6,right:6},{bottom:6,left:6},{bottom:6,right:6}].map((pos, i) => (
                <div key={i} style={{
                  position: "absolute", width: 14, height: 14, ...pos,
                  borderTop:    i < 2  ? "1px solid #10b98160" : undefined,
                  borderBottom: i >= 2 ? "1px solid #10b98160" : undefined,
                  borderLeft:   i % 2 === 0 ? "1px solid #10b98160" : undefined,
                  borderRight:  i % 2 === 1 ? "1px solid #10b98160" : undefined,
                }} />
              ))}

              {image ? (
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                  {detections
                    ? <canvas ref={canvasRef} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    : <img src={image.url} alt="uploaded" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                  }
                  <div style={{ position: "absolute", bottom: 8, right: 8, background: "#020817cc", padding: "3px 10px", fontSize: 11, color: "#475569" }}>
                    click to change
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease" }}>
                  <div style={{ fontSize: 38, marginBottom: 12 }}>🌿</div>
                  <div style={{ color: "#64748b", fontSize: 15, fontWeight: 600 }}>Drop an image here</div>
                  <div style={{ color: "#334155", fontSize: 13, marginTop: 6 }}>or click to browse · JPG, PNG, WEBP</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />

            {/* Run button */}
            <div style={{ gridColumn: 1, gridRow: 3, paddingTop: 12 }}>
              <button
                onClick={handlePredict}
                disabled={!image || loading}
                style={{
                  width: "100%",
                  background: image && !loading ? "linear-gradient(135deg, #10b981, #059669)" : "#060e1c",
                  color: image && !loading ? "#fff" : "#1e293b",
                  border: `1px solid ${image && !loading ? "#10b98150" : "#0f172a"}`,
                  padding: "13px 0", fontSize: 14, fontWeight: 700,
                  cursor: image && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: image && !loading ? "0 0 20px #10b98125" : "none",
                  letterSpacing: "0.5px",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ width: 15, height: 15, border: "2px solid #ffffff30", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Running Inference…
                  </span>
                ) : "🔍 Run Detection"}
              </button>
              {error && (
                <div style={{ marginTop: 10, background: "#1a0505", border: "1px solid #7f1d1d", padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ gridColumn: 2, gridRow: "1 / 4", display: "flex", flexDirection: "column", gap: 14 }}>
              {detections ? (
                <div style={{ animation: "fadeUp 0.4s ease", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "#060e1c", border: "1px solid #0f172a", borderTop: "2px solid #10b981", padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "#475569" }}>Detections</span>
                      <span style={{ background: "#10b98112", border: "1px solid #10b98135", color: "#10b981", padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                        {detections.count} found
                      </span>
                    </div>
                    {detections.detections.length === 0
                      ? <p style={{ color: "#334155", fontSize: 13 }}>No wildlife detected above threshold.</p>
                      : detections.detections.map((d, i) => (
                          <Badge key={i} label={d.class} confidence={d.confidence} color={CLASS_COLORS[d.class] || defaultColor} />
                        ))
                    }
                  </div>
                  <div style={{ background: "#060e1c", border: "1px solid #0f172a", padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 10, letterSpacing: "1px", textTransform: "uppercase" }}>Class Legend</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {Object.entries(CLASS_COLORS).map(([cls, col]) => (
                        <div key={cls} style={{ display: "flex", alignItems: "center", gap: 4, background: `${col}10`, border: `1px solid ${col}30`, padding: "3px 9px", fontSize: 11, color: col, textTransform: "capitalize", fontWeight: 600 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: col }} />{cls}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#060e1c", border: "1px solid #0f172a", padding: 48, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🦓</div>
                  <div style={{ fontSize: 13, color: "#1e293b" }}>Results appear here after detection</div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ── Metrics Tab ── */}
        {tab === "metrics" && (
          <main style={{ flex: 1, width: "100%", padding: "28px 40px", animation: "fadeUp 0.4s ease" }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 4 }}>Model Performance</h1>
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 28 }}>
              YOLOv8n trained for 20 epochs · Image size 416 · wildlife_dataset
            </p>

            {metrics ? (
              <>
                <div style={{ display: "flex", gap: 0, marginBottom: 28, border: "1px solid #0f172a" }}>
                  <MetricCard label="mAP@0.5"  value={metrics.map50}      color="#10b981" />
                  <MetricCard label="Precision" value={metrics.precision}  color="#6366f1" />
                  <MetricCard label="Recall"    value={metrics.recall}     color="#f59e0b" />
                </div>

                <div style={{ background: "#060e1c", border: "1px solid #0f172a", borderTop: "2px solid #10b981", padding: "22px 28px", marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, marginBottom: 18, fontSize: 11, color: "#475569", letterSpacing: "1px", textTransform: "uppercase" }}>Score Comparison</div>
                  {[
                    { label: "mAP@0.5", val: metrics.map50, color: "#10b981" },
                    { label: "Precision", val: metrics.precision, color: "#6366f1" },
                    { label: "Recall", val: metrics.recall, color: "#f59e0b" },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13 }}>
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <span style={{ color, fontWeight: 700 }}>{(val * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 6, background: "#0a1120", overflow: "hidden" }}>
                        <div style={{ width: `${val * 100}%`, height: "100%", background: `linear-gradient(90deg, ${color}50, ${color})`, boxShadow: `0 0 8px ${color}`, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid #0f172a" }}>
                  {[
                    { icon: "🔁", label: "Epochs", val: metrics.epochs },
                    { icon: "📐", label: "Image size", val: metrics.image_size },
                    { icon: "🐾", label: "Classes", val: metrics.classes.length },
                  ].map(({ icon, label, val }, i) => (
                    <div key={label} style={{ flex: 1, background: "#060e1c", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderRight: i < 2 ? "1px solid #0f172a" : "none" }}>
                      <span style={{ fontSize: 20 }}>{icon}</span>
                      <div>
                        <div style={{ color: "#1e293b", fontSize: 11, letterSpacing: "0.5px" }}>{label}</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9" }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#060e1c", border: "1px solid #0f172a", padding: "18px 22px" }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 11, color: "#475569", letterSpacing: "1px", textTransform: "uppercase" }}>Detectable Species</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {metrics.classes.map(cls => (
                      <div key={cls} style={{
                        background: `${CLASS_COLORS[cls] || "#94a3b8"}10`,
                        border: `1px solid ${CLASS_COLORS[cls] || "#94a3b8"}30`,
                        color: CLASS_COLORS[cls] || "#94a3b8",
                        padding: "5px 14px", fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                      }}>{cls}</div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "#334155", fontSize: 14 }}>Loading metrics from backend…</div>
            )}
          </main>
        )}

        <footer style={{ width: "100%", textAlign: "center", padding: "14px 40px", color: "#0f172a", fontSize: 11, borderTop: "1px solid #060e1c", letterSpacing: "0.5px" }}>
          Wildlife AI · YOLOv8 Detection System · Minor Project
        </footer>
      </div>
    </>
  );
}
