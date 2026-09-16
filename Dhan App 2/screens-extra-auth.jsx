// ─── Extra auth / onboarding screens ─────────────────────
// 12 Login · 13 Permissions · 14 Link bank · 15 Income setup

// 12. LOGIN — returning user
function LoginScreen({ onDone, onForgot, userName = "Priya" }) {
  const [pin, setPin] = useState([]);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= 3;
  const onKey = (k) => {
    if (locked) return;
    setError(false);
    if (k === "x") return setPin(p => p.slice(0, -1));
    if (k === "face") {
      // Simulated biometric — auto-success
      onDone?.();
      return;
    }
    if (pin.length < 4) setPin(p => [...p, k]);
  };
  useEffect(() => {
    if (pin.length === 4) {
      const t = setTimeout(() => {
        if (pin.join("") === "1234" || pin.join("") === "0000") onDone?.();
        else { setError(true); setAttempts(a => a + 1); setPin([]); }
      }, 280);
      return () => clearTimeout(t);
    }
  }, [pin]);
  const keys = [["1","2","3"],["4","5","6"],["7","8","9"],["face","0","x"]];
  return (
    <Phone bg="#fff" label="12 Login">
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
                    padding: "20px 24px 16px", alignItems: "center" }}>
        <img src="assets/dhan-logo.svg" alt="Dhan" style={{ height: 48, marginTop: 12, marginBottom: 28 }}/>

        <div style={{ width: 72, height: 72, borderRadius: 999,
                      background: "linear-gradient(135deg, var(--dhan-gold), var(--dhan-gold-soft))",
                      display: "grid", placeItems: "center",
                      color: "var(--dhan-navy)", fontWeight: 700, fontSize: 26,
                      marginBottom: 14 }}>
          {userName[0]}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          Welcome back, {userName}
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-3)", marginBottom: 24 }}>
          Enter your 4-digit PIN
        </div>

        {/* PIN dots */}
        <div className={error ? "shake" : ""}
             style={{ display: "flex", gap: 16, marginBottom: 18 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: 999,
              background: pin.length > i ? "var(--dhan-navy)" : "transparent",
              border: `2px solid ${error ? "var(--expense)" : "var(--border-strong)"}`,
              transition: "background .15s",
            }}/>
          ))}
        </div>
        {error && !locked && (
          <div style={{ fontSize: 12, color: "var(--expense)", fontWeight: 600, marginBottom: 6 }}>
            Wrong PIN. {3 - attempts} {3 - attempts === 1 ? "try" : "tries"} left.
          </div>
        )}
        {locked && (
          <div style={{ fontSize: 12, color: "var(--expense)", fontWeight: 600, marginBottom: 6,
                         textAlign: "center", lineHeight: 1.4 }}>
            Too many attempts. Reset your PIN to continue.
          </div>
        )}
        <button onClick={() => onForgot?.()}
                style={{ background: "none", border: "none", color: "var(--dhan-navy)",
                          fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>
          Forgot PIN?
        </button>

        <div style={{ flex: 1 }}/>

        {/* Numeric pad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 10, width: "100%", maxWidth: 280 }}>
          {keys.flat().map((k, i) => {
            const isAction = k === "face" || k === "x";
            return (
              <button key={i} onClick={() => onKey(k)} style={{
                height: 56, borderRadius: "var(--r-card-sm)",
                background: isAction ? "transparent" : "var(--bg-surface)",
                border: "none", fontSize: 22, fontWeight: 600,
                cursor: "pointer", color: "var(--fg-1)",
                display: "grid", placeItems: "center",
              }}>
                {k === "face" ? <i className="ph ph-scan" style={{ fontSize: 24, color: "var(--dhan-navy)" }}/>
                  : k === "x" ? <i className="ph ph-backspace" style={{ fontSize: 22, color: "var(--fg-2)" }}/>
                  : k}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 14 }}>
          Hint: try 1234
        </div>
      </div>
      <style>{`.shake { animation: shakeX .35s var(--ease-out); }
        @keyframes shakeX { 0%,100% { transform: translateX(0); }
          25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }`}</style>
    </Phone>
  );
}

// 13. PERMISSIONS
function PermissionsScreen({ onDone }) {
  const [perms, setPerms] = useState({ sms: true, notif: true, contacts: false });
  const items = [
    { id: "sms",      icon: "chat-centered-text", t: "Read SMS",
      b: "We auto-detect bank & UPI txns. Stays on-device — never uploaded.",
      required: true, color: "var(--dhan-navy)" },
    { id: "notif",    icon: "bell",
      t: "Notifications",
      b: "Bill reminders, overspend nudges, weekly summaries.",
      color: "var(--dhan-gold)" },
    { id: "contacts", icon: "address-book",
      t: "Contacts",
      b: "Optional — only if you split bills with friends on Dhan Plus.",
      color: "#7C9B5F" },
  ];
  return (
    <Phone bg="#fff" label="13 Permissions">
      <StatusBar />
      <ScreenHeader title="Permissions" onBack={() => onDone?.("back")} />
      <div style={{ padding: "0 24px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>
          A few permissions
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 20, lineHeight: 1.5 }}>
          Dhan works best with these. You can change any of them later in Settings.
        </div>

        {items.map(it => {
          const on = perms[it.id];
          return (
            <div key={it.id} style={{
              background: "#fff", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--r-card)", padding: 14, marginBottom: 10,
              display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 12,
              alignItems: "center",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--r-control)",
                            background: it.color + "15", color: it.color,
                            display: "grid", placeItems: "center" }}>
                <i className={`ph-fill ph-${it.icon}`} style={{ fontSize: 22 }}/>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.t}</div>
                  {it.required && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "var(--dhan-navy)",
                                    background: "var(--dhan-gold-bg)", padding: "2px 6px",
                                    borderRadius: 999, letterSpacing: ".04em" }}>RECOMMENDED</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 3, lineHeight: 1.4 }}>
                  {it.b}
                </div>
              </div>
              <div className={`tgl ${on ? "on" : ""}`}
                   onClick={() => setPerms(p => ({ ...p, [it.id]: !on }))}/>
            </div>
          );
        })}

        <div style={{ flex: 1 }}/>

        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--r-control)", padding: "10px 12px",
                       fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.4,
                       display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 14 }}>
          <i className="ph-fill ph-shield-check" style={{ fontSize: 18, color: "var(--income)", flexShrink: 0 }}/>
          <div>
            <b style={{ color: "var(--fg-1)" }}>Bank-grade security.</b> Your data stays on this device.
            We never store SMS content on our servers.
          </div>
        </div>

        <Button variant="primary" full size="lg" onClick={() => onDone?.("next")}
                iconRight="arrow-right">
          Continue
        </Button>
      </div>
    </Phone>
  );
}

// 14. LINK BANK
function LinkBankScreen({ onDone }) {
  const [linked, setLinked] = useState(["hdfc"]);
  const [scanning, setScanning] = useState(false);
  const banks = [
    { id: "hdfc",   name: "HDFC Bank",      color: "#004C8F", short: "HD" },
    { id: "icici",  name: "ICICI Bank",     color: "#F37920", short: "IC" },
    { id: "axis",   name: "Axis Bank",      color: "#97144D", short: "AX" },
    { id: "sbi",    name: "State Bank",     color: "#22409A", short: "SB" },
    { id: "kotak",  name: "Kotak Mahindra", color: "#ED1A3B", short: "KM" },
    { id: "yes",    name: "Yes Bank",       color: "#00518F", short: "YS" },
  ];
  const toggle = (id) => {
    if (linked.includes(id)) return setLinked(l => l.filter(x => x !== id));
    setScanning(true);
    setTimeout(() => {
      setLinked(l => [...l, id]);
      setScanning(false);
    }, 700);
  };
  return (
    <Phone bg="#fff" label="14 Link bank">
      <StatusBar />
      <ScreenHeader title="Link your accounts" onBack={() => onDone?.("back")}
        right={<button onClick={() => onDone?.("next")} style={{
          background: "none", border: "none", color: "var(--fg-3)",
          fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Skip</button>}/>
      <div style={{ padding: "0 24px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>
          Pick your banks
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 18, lineHeight: 1.5 }}>
          Dhan reads SMS only — no logins, no OTPs. Add the ones you use.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1, alignContent: "start" }}>
          {banks.map(b => {
            const isLinked = linked.includes(b.id);
            return (
              <button key={b.id} onClick={() => toggle(b.id)} style={{
                background: "#fff",
                border: `2px solid ${isLinked ? "var(--dhan-navy)" : "var(--border-subtle)"}`,
                borderRadius: "var(--r-card-sm)", padding: 14, cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 8, position: "relative",
                transition: "border-color .15s, box-shadow .2s",
                boxShadow: isLinked ? "0 4px 14px rgba(20,28,65,.08)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--r-control)",
                                background: b.color, color: "#fff",
                                display: "grid", placeItems: "center",
                                fontWeight: 600, fontSize: 13 }}>{b.short}</div>
                  {isLinked && (
                    <div style={{ width: 22, height: 22, borderRadius: 999,
                                  background: "var(--income)", color: "#fff",
                                  display: "grid", placeItems: "center" }}>
                      <i className="ph-fill ph-check" style={{ fontSize: 12 }}/>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 10.5, color: isLinked ? "var(--income)" : "var(--fg-3)",
                                fontWeight: 600 }}>
                  {isLinked ? "Linked · SMS detected" : "Tap to link"}
                </div>
              </button>
            );
          })}
        </div>

        {scanning && (
          <div style={{ display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", background: "var(--bg-surface)",
                          borderRadius: "var(--r-control)", marginTop: 12, fontSize: 13, color: "var(--fg-2)" }}>
            <div className="spinner" style={{
              width: 18, height: 18, borderRadius: 999,
              border: "2.5px solid var(--border-subtle)",
              borderTopColor: "var(--dhan-navy)",
              animation: "spin .7s linear infinite",
            }}/>
            Scanning recent SMS…
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 13, color: "var(--fg-2)", lineHeight: 1.4,
                       padding: "10px 12px", background: "var(--dhan-gold-bg)", borderRadius: "var(--r-control)" }}>
          <b style={{ color: "var(--fg-1)" }}>{linked.length} linked.</b> Add more anytime in Settings.
        </div>

        <div style={{ height: 12 }}/>
        <Button variant="primary" full size="lg" onClick={() => onDone?.("next")}
                disabled={linked.length === 0} iconRight="arrow-right">
          Continue
        </Button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Phone>
  );
}

// 15. INCOME SETUP
function IncomeSetupScreen({ onDone }) {
  const [income, setIncome] = useState(82500);
  const presets = [50000, 75000, 100000, 150000];
  return (
    <Phone bg="#fff" label="15 Income">
      <StatusBar />
      <ScreenHeader title="Monthly income" onBack={() => onDone?.("back")} />
      <div style={{ padding: "0 24px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>
          What's coming in?
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 28, lineHeight: 1.5 }}>
          Roughly your take-home each month. We'll use this to suggest budgets.
        </div>

        {/* Big amount */}
        <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em" }}>
            Per month
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline",
                          gap: 4, marginTop: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "var(--dhan-navy)" }}>₹</span>
            <input value={income.toLocaleString("en-IN")}
                   onChange={(e) => setIncome(parseInt(e.target.value.replace(/\D/g, "") || "0", 10))}
                   inputMode="numeric"
                   style={{ border: "none", outline: "none", background: "transparent",
                             fontSize: 46, fontWeight: 700, color: "var(--dhan-navy)",
                             fontVariantNumeric: "tabular-nums",
                             textAlign: "center", width: 240, fontFamily: "Poppins" }}/>
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 6 }}>
            That's ₹{(income * 12).toLocaleString("en-IN")} a year
          </div>
        </div>

        {/* Presets */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
                       marginTop: 14, marginBottom: 18 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setIncome(p)} style={{
              background: income === p ? "var(--dhan-navy)" : "#fff",
              color: income === p ? "#fff" : "var(--fg-2)",
              border: `1px solid ${income === p ? "var(--dhan-navy)" : "var(--border-subtle)"}`,
              borderRadius: 999, padding: "8px 4px",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontVariantNumeric: "tabular-nums",
            }}>
              ₹{p >= 100000 ? `${p/100000}L` : `${p/1000}k`}
            </button>
          ))}
        </div>

        {/* Suggested split preview */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--r-card)", padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em", marginBottom: 10 }}>
            Suggested 50/30/20 split
          </div>
          {[
            { l: "Needs", v: 0.5,  c: "var(--dhan-navy)" },
            { l: "Wants", v: 0.3,  c: "var(--dhan-gold)" },
            { l: "Save",  v: 0.2,  c: "#2E7D5B" },
          ].map(s => (
            <div key={s.l} style={{ display: "flex", justifyContent: "space-between",
                                       alignItems: "center", padding: "6px 0",
                                       fontSize: 13, fontWeight: 600 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: s.c }}/>
                {s.l} <span style={{ color: "var(--fg-3)", fontWeight: 500 }}>· {Math.round(s.v*100)}%</span>
              </div>
              <div style={{ fontVariantNumeric: "tabular-nums" }}>
                ₹{Math.round(income * s.v).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "center", marginBottom: 12,
                       lineHeight: 1.4 }}>
          You can adjust this any time. Variable income? Set an average.
        </div>

        <Button variant="primary" full size="lg" onClick={() => onDone?.("next")}
                disabled={!income} iconRight="arrow-right">
          Continue
        </Button>
      </div>
    </Phone>
  );
}

// 26. FORGOT PIN — recovery flow
function ForgotPinScreen({ onBack, onDone }) {
  const [step, setStep] = useState("verify"); // verify → newpin → confirm
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState([]);
  const [confirm, setConfirm] = useState([]);
  const [error, setError] = useState("");

  const onKey = (k) => {
    setError("");
    const target = step === "newpin" ? pin : confirm;
    const setT  = step === "newpin" ? setPin : setConfirm;
    if (k === "x") return setT(target.slice(0, -1));
    if (target.length < 4) setT([...target, k]);
  };

  useEffect(() => {
    if (step === "confirm" && confirm.length === 4) {
      const t = setTimeout(() => {
        if (confirm.join("") === pin.join("")) onDone?.();
        else { setError("PINs don't match"); setConfirm([]); }
      }, 250);
      return () => clearTimeout(t);
    }
  }, [confirm, step, pin, onDone]);

  const keys = [["1","2","3"],["4","5","6"],["7","8","9"],["",  "0","x"]];
  const dotsFor = (arr) => (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 18 }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          width: 16, height: 16, borderRadius: 999,
          background: arr.length > i ? "var(--dhan-navy)" : "transparent",
          border: `2px solid ${error ? "var(--expense)" : "var(--border-strong)"}`,
        }}/>
      ))}
    </div>
  );

  return (
    <Phone bg="#fff" label="26 Forgot PIN">
      <StatusBar />
      <ScreenHeader title="Reset PIN" onBack={() => step === "verify" ? onBack?.() : setStep("verify")} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
                    padding: "12px 24px 16px" }}>
        {step === "verify" && (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Verify it's you
            </div>
            <div style={{ fontSize: 13.5, color: "var(--fg-2)", marginTop: 6, lineHeight: 1.5 }}>
              We sent a 6-digit code to your registered number ending in <b style={{ color: "var(--fg-1)" }}>•• 4421</b>.
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                            letterSpacing: "0.01em", marginBottom: 8 }}>
                One-time code
              </div>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0,6))}
                     inputMode="numeric" placeholder="• • • • • •"
                     style={{ width: "100%", padding: "14px 16px", fontSize: 22,
                               letterSpacing: ".25em", textAlign: "center",
                               border: "1px solid var(--border-subtle)", borderRadius: "var(--r-card-sm)",
                               outline: "none", fontVariantNumeric: "tabular-nums" }}/>
              <button style={{ background: "none", border: "none", color: "var(--dhan-navy)",
                                fontSize: 13, fontWeight: 600, cursor: "pointer",
                                padding: "16px 0", marginLeft: -4 }}>
                Resend code
              </button>
            </div>
            <div style={{ flex: 1 }}/>
            <Button variant="primary" full size="lg" disabled={otp.length < 6}
                    onClick={() => setStep("newpin")} iconRight="arrow-right">
              Verify
            </Button>
          </>
        )}

        {(step === "newpin" || step === "confirm") && (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
                          textAlign: "center", marginTop: 8 }}>
              {step === "newpin" ? "Set a new PIN" : "Confirm your PIN"}
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-3)", textAlign: "center",
                          marginTop: 4, marginBottom: 24 }}>
              {step === "newpin" ? "Pick 4 digits you'll remember." : "Enter it again to confirm."}
            </div>
            {dotsFor(step === "newpin" ? pin : confirm)}
            {error && (
              <div style={{ fontSize: 12, color: "var(--expense)", fontWeight: 600,
                            textAlign: "center", marginBottom: 6 }}>
                {error}
              </div>
            )}
            <div style={{ flex: 1 }}/>
            {step === "newpin" && pin.length === 4 && (
              <Button variant="primary" full size="lg"
                      onClick={() => setStep("confirm")} iconRight="arrow-right">
                Continue
              </Button>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 10, width: "100%", maxWidth: 280, margin: "16px auto 0" }}>
              {keys.flat().map((k, i) => (
                <button key={i} onClick={() => k && onKey(k)} disabled={!k} style={{
                  height: 56, borderRadius: "var(--r-card-sm)",
                  background: k === "x" || !k ? "transparent" : "var(--bg-surface)",
                  border: "none", fontSize: 22, fontWeight: 600,
                  cursor: k ? "pointer" : "default", color: "var(--fg-1)",
                  display: "grid", placeItems: "center",
                }}>
                  {k === "x" ? <i className="ph ph-backspace" style={{ fontSize: 22, color: "var(--fg-2)" }}/> : k}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Phone>
  );
}

Object.assign(window, {
  LoginScreen, ForgotPinScreen, PermissionsScreen, LinkBankScreen, IncomeSetupScreen,
});
