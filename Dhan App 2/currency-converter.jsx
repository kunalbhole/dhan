// ─── 40. CURRENCY CONVERTER (free tier) ─────────────────────
const { useState: uCC, useEffect: uCE, useRef: uCR } = React;
const FX_KEY = "dhan.fx.rates.v1";
const FX_API = "https://open.er-api.com/v6/latest/USD";

const FX_NAMES = {
  INR: "Indian Rupee", USD: "US Dollar", EUR: "Euro", GBP: "British Pound",
  AED: "UAE Dirham", SGD: "Singapore Dollar", AUD: "Australian Dollar",
  CAD: "Canadian Dollar", CHF: "Swiss Franc", JPY: "Japanese Yen",
  CNY: "Chinese Yuan", HKD: "Hong Kong Dollar", THB: "Thai Baht",
  MYR: "Malaysian Ringgit", NZD: "New Zealand Dollar", SAR: "Saudi Riyal",
  QAR: "Qatari Riyal", KWD: "Kuwaiti Dinar", OMR: "Omani Rial",
  BHD: "Bahraini Dinar", LKR: "Sri Lankan Rupee", NPR: "Nepalese Rupee",
  IDR: "Indonesian Rupiah", PHP: "Philippine Peso", KRW: "South Korean Won",
  SEK: "Swedish Krona", NOK: "Norwegian Krone", DKK: "Danish Krone",
  ZAR: "South African Rand", TRY: "Turkish Lira", RUB: "Russian Ruble",
  BRL: "Brazilian Real", MXN: "Mexican Peso", ILS: "Israeli Shekel",
  VND: "Vietnamese Dong", TWD: "Taiwan Dollar", BDT: "Bangladeshi Taka",
  MVR: "Maldivian Rufiyaa", EGP: "Egyptian Pound", PKR: "Pakistani Rupee",
};

function readFxCache() {
  try {
    const raw = localStorage.getItem(FX_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && p.rates && p.fetchedAt ? p : null;
  } catch { return null; }
}

const stampFmt = (ts) => new Date(ts).toLocaleString("en-IN",
  { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function CurrencyConverterScreen({ onBack }) {
  const [cache, setCache] = uCC(readFxCache);
  const [loading, setLoading] = uCC(!readFxCache());
  const [offline, setOffline] = uCC(false);
  const [from, setFrom] = uCC("INR");
  const [to, setTo] = uCC("USD");
  const [amount, setAmount] = uCC("1000");
  const [picking, setPicking] = uCC(null);
  const [q, setQ] = uCC("");
  const [tick, setTick] = uCC(0);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(FX_API, { cache: "no-store" });
      const j = await r.json();
      if (!j || !j.rates) throw new Error("bad payload");
      const next = { rates: j.rates, fetchedAt: Date.now() };
      setCache(next); setOffline(false);
      try { localStorage.setItem(FX_KEY, JSON.stringify(next)); } catch {}
    } catch {
      setOffline(true);
    } finally { setLoading(false); }
  };

  uCE(() => { load(); }, []);
  // keep the relative-time label honest while the screen is open
  uCE(() => { const id = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(id); }, []);

  const rates = cache && cache.rates;
  const codes = React.useMemo(() => {
    if (!rates) return [];
    return Object.keys(FX_NAMES).filter(c => rates[c]).sort();
  }, [rates]);

  const rate = rates && rates[from] && rates[to] ? rates[to] / rates[from] : null;
  const num = parseFloat(String(amount).replace(/,/g, ""));
  const entered = Number.isFinite(num) ? num : 0;
  const converted = rate ? entered * rate : 0;

  const dp = (code) => (["JPY", "KRW", "IDR", "VND"].includes(code) ? 0 : 2);
  const fmt = (n, code) => n.toLocaleString("en-IN",
    { minimumFractionDigits: dp(code), maximumFractionDigits: dp(code) });

  const swap = () => { setFrom(to); setTo(from); };

  const leftCode = from, rightCode = to;

  const amountStyle = {
    width: "100%", border: "none", outline: "none", background: "transparent",
    fontFamily: "Poppins, sans-serif", fontSize: 20, fontWeight: 500, color: "#141C41",
    fontVariantNumeric: "tabular-nums", textAlign: "left", padding: 0,
    minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  };
  const rowStyle = { display: "grid", gridTemplateColumns: "minmax(0,1fr) 1px 116px",
                     alignItems: "stretch", minHeight: 56 };
  const cellPad = { padding: "16px", display: "flex", alignItems: "center", minWidth: 0 };
  const rule = { background: "var(--border-subtle)" };

  const CodeCell = ({ code, onClick }) => (
    <button onClick={onClick} aria-label={`Change currency (${code})`} style={{
      ...cellPad, gap: 8, justifyContent: "space-between", background: "transparent",
      border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif",
      fontSize: 14, fontWeight: 500, color: "#141C41", textAlign: "left", width: "100%",
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{code}</span>
      <i className="ph ph-caret-down" style={{ fontSize: 14, color: "var(--fg-3)", flexShrink: 0 }}/>
    </button>
  );

  const shown = codes.filter(c => {
    const s = q.trim().toLowerCase();
    return !s || c.toLowerCase().includes(s) || FX_NAMES[c].toLowerCase().includes(s);
  });

  return (
    <Phone label="40 Converter">
      <StatusBar />
      <ScreenHeader onBack={onBack}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: "#141C41", margin: "0 4px 16px" }}>
          Currency converter
        </div>
        {cache && (
          <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 4px 8px" }}>
            {stampFmt(cache.fetchedAt)} · {offline ? "Cached rate" : "Live rate"}
          </div>
        )}

        {!rates ? (
          loading ? (
            <div style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "var(--fg-3)" }}>
              Fetching latest rates…
            </div>
          ) : (
            <div style={{ padding: "40px 8px", textAlign: "center" }}>
              <IconChip icon="wifi-slash" size={48} />
              <div style={{ fontSize: 16, fontWeight: 500, color: "#141C41", marginTop: 16 }}>
                No rates yet
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-3)", lineHeight: 1.5,
                            margin: "8px auto 16px", maxWidth: 260 }}>
                Connect to the internet to fetch the latest exchange rates.
              </div>
              <Button variant="primary" onClick={load}>Retry</Button>
            </div>
          )
        ) : (
          <>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--r-card)",
                          background: "var(--bg-elevated)", overflow: "hidden" }}>
              <div style={rowStyle}>
                <div style={cellPad}>
                  <input value={amount} inputMode="decimal" style={amountStyle}
                         onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
                         aria-label={`Amount in ${from}`}/>
                </div>
                <div style={rule}/>
                <CodeCell code={from} onClick={() => { setPicking("from"); setQ(""); }}/>
              </div>

              {/* shared divider row — carries the optional swap control */}
              <div style={{ position: "relative", height: 1, background: "var(--border-subtle)" }}>
                <button onClick={swap} aria-label="Swap currencies" style={{
                  position: "absolute", top: -14, right: 16, width: 28, height: 28,
                  borderRadius: 999, cursor: "pointer", background: "var(--bg-elevated)",
                  border: "1px solid rgba(201,168,76,.5)", color: "#C9A84C",
                  display: "grid", placeItems: "center", padding: 0,
                }}>
                  <i className="ph ph-arrows-down-up" style={{ fontSize: 13 }}/>
                </button>
              </div>

              <div style={rowStyle}>
                <div style={cellPad}>
                  <div style={{ ...amountStyle, color: "#141C41" }}>{fmt(converted, to)}</div>
                </div>
                <div style={rule}/>
                <CodeCell code={to} onClick={() => { setPicking("to"); setQ(""); }}/>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                          gap: 12, padding: "16px 4px 0" }}>
              <div style={{ fontSize: 12.5, color: "var(--fg-2)", fontVariantNumeric: "tabular-nums" }}>
                1 {from} = {rate ? rate.toLocaleString("en-IN",
                  { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "—"} {to}
              </div>
              <button onClick={load} className="gold-btn" style={{ fontSize: 12, padding: "5px 10px" }}>
                {loading ? "Updating…" : "Refresh"}
              </button>
            </div>
          </>
        )}
      </div>

      <BottomSheet open={!!picking} onClose={() => setPicking(null)}
                   title={picking === "from" ? "Convert from" : "Convert to"}>
        <Field label="Search" value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="Currency or code" autoFocus />
        <div className="phone-scroll" style={{ maxHeight: 280, overflowY: "auto", marginTop: 4 }}>
          {shown.map((c, i) => {
            const active = c === (picking === "from" ? from : to);
            return (
              <div key={c} onClick={() => {
                if (picking === "from") { setFrom(c); if (c === to) setTo(from); }
                else { setTo(c); if (c === from) setFrom(to); }
                setPicking(null);
              }} style={{
                display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
                padding: "14px 0", cursor: "pointer",
                borderBottom: i === shown.length - 1 ? "none" : "1px solid var(--border-subtle)",
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: "var(--fg-2)" }}>
                    {c} · {FX_NAMES[c]}
                  </div>
                </div>
                <SelectIndicator on={active}/>
              </div>
            );
          })}
          {!shown.length && (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--fg-3)" }}>
              No currency matches “{q}”.
            </div>
          )}
        </div>
      </BottomSheet>
    </Phone>
  );
}

Object.assign(window, { CurrencyConverterScreen });
