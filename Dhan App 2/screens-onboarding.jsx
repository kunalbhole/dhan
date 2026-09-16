// ─── Onboarding, Splash, Sign Up, Budget Framework ─────────

// 01. SPLASH
function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <Phone bg="#fff" label="01 Splash">
      <StatusBar />
      <div style={{
        flex: 1, display: "grid", placeItems: "center",
        padding: 40,
      }}>
        <img src="assets/dhan-logo.svg" alt="Dhan"
             style={{
               height: 160, width: "auto",
               animation: "fadeSlideIn 600ms var(--ease-spring) both",
             }} />
      </div>
    </Phone>
  );
}

// 02. ONBOARDING
function OnboardingScreen({ onDone }) {
  const [idx, setIdx] = useState(0);
  const slides = [
    {
      title: "Track effortlessly",
      body: "Dhan reads your UPI & bank SMS to log every transaction — no manual entry, no fuss.",
      illo: <OnboardIllo1/>,
    },
    {
      title: "Budget your way",
      body: "Pick a framework — 50/30/20, zero-based, or roll your own — and stick to it calmly.",
      illo: <OnboardIllo2/>,
    },
    {
      title: "Stay on top",
      body: "Bill reminders, overspend alerts, weekly summaries. We nudge; you decide.",
      illo: <OnboardIllo3/>,
    },
  ];
  const s = slides[idx];
  const next = () => idx < 2 ? setIdx(idx + 1) : onDone?.();
  return (
    <Phone bg="#fff" label="02 Onboarding">
      <StatusBar />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 20px" }}>
        <button onClick={onDone} style={{
          border: "none", background: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 600, color: "var(--fg-3)",
        }}>Skip</button>
      </div>
      <div key={idx} className="screen-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ height: "55%", padding: "8px 24px",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
          {s.illo}
        </div>
        <div style={{ padding: "8px 28px 0" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--dhan-navy)",
                        letterSpacing: "-0.01em", marginBottom: 10 }}>
            {s.title}
          </div>
          <div style={{ fontSize: 15, color: "var(--fg-2)", lineHeight: 1.5, textWrap: "pretty" }}>
            {s.body}
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 20px 28px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              height: 6, borderRadius: 999,
              width: i === idx ? 22 : 6,
              background: i === idx ? "var(--dhan-navy)" : "var(--border-strong)",
              transition: "width .3s var(--ease-out), background .2s",
            }}/>
          ))}
        </div>
        <Button variant="primary" full size="lg" onClick={next} iconRight="arrow-right">
          {idx < 2 ? "Next" : "Get started"}
        </Button>
      </div>
    </Phone>
  );
}

// Simple geometric illustrations
function OnboardIllo1() {
  return (
    <svg viewBox="0 0 300 260" width="100%" style={{ maxHeight: 360 }}>
      <rect x="30" y="30" width="240" height="200" rx="20" fill="var(--bg-surface)"/>
      {/* "phone" w/ list rows */}
      <rect x="58" y="58" width="184" height="40" rx="10" fill="#fff" stroke="var(--border-default)"/>
      <circle cx="78" cy="78" r="12" fill="var(--cat-food)"/>
      <rect x="98" y="70" width="70" height="6" rx="3" fill="var(--dhan-navy)"/>
      <rect x="98" y="82" width="40" height="5" rx="2.5" fill="var(--fg-4)"/>
      <rect x="208" y="72" width="26" height="12" rx="3" fill="var(--dhan-navy)"/>
      <rect x="58" y="108" width="184" height="40" rx="10" fill="#fff" stroke="var(--border-default)"/>
      <circle cx="78" cy="128" r="12" fill="var(--cat-transport)"/>
      <rect x="98" y="120" width="50" height="6" rx="3" fill="var(--dhan-navy)"/>
      <rect x="98" y="132" width="55" height="5" rx="2.5" fill="var(--fg-4)"/>
      <rect x="210" y="122" width="24" height="12" rx="3" fill="var(--dhan-navy)"/>
      <rect x="58" y="158" width="184" height="40" rx="10" fill="#fff" stroke="var(--border-default)"/>
      <circle cx="78" cy="178" r="12" fill="var(--income)"/>
      <rect x="98" y="170" width="60" height="6" rx="3" fill="var(--dhan-navy)"/>
      <rect x="98" y="182" width="45" height="5" rx="2.5" fill="var(--fg-4)"/>
      <rect x="204" y="172" width="30" height="12" rx="3" fill="var(--income)"/>
      {/* message bubble */}
      <circle cx="240" cy="40" r="26" fill="var(--dhan-gold)"/>
      <path d="M230 38 h20 M230 44 h14" stroke="var(--dhan-navy)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function OnboardIllo2() {
  // 50/30/20 donut — r=70, centre (150,130). Start at top, sweep clockwise.
  // 50% = 180deg → (150, 200)   · large-arc = 1
  // 30% = 108deg → (83.42, 108.37)
  // 20% =  72deg → (150, 60)
  const SOFT_NAVY = "var(--dhan-navy-80)";   // softer blue for 50% (needs)
  const SOFT_GOLD = "var(--dhan-gold-soft)";   // softer gold for 30% (wants)
  const SAGE      = "var(--income)";   // muted sage — pairs with navy+gold, for 20% (savings)
  return (
    <svg viewBox="0 0 300 260" width="100%" style={{ maxHeight: 360 }}>
      <circle cx="150" cy="130" r="90" fill="var(--bg-surface)"/>
      <circle cx="150" cy="130" r="70" fill="none" stroke="var(--border-subtle)" strokeWidth="18"/>
      {/* 50% — soft navy */}
      <path d="M150 60 A70 70 0 1 1 150 200" fill="none"
            stroke={SOFT_NAVY} strokeWidth="18" strokeLinecap="butt"/>
      {/* 30% — soft gold */}
      <path d="M150 200 A70 70 0 0 1 83.42 108.37" fill="none"
            stroke={SOFT_GOLD} strokeWidth="18" strokeLinecap="butt"/>
      {/* 20% — sage */}
      <path d="M83.42 108.37 A70 70 0 0 1 150 60" fill="none"
            stroke={SAGE} strokeWidth="18" strokeLinecap="butt"/>

      {/* Centre label */}
      <text x="150" y="128" textAnchor="middle" fontFamily="Poppins"
            fontWeight="600" fontSize="20" fill="var(--dhan-navy)" letterSpacing="-0.02em">
        50/30/20
      </text>
      <text x="150" y="148" textAnchor="middle" fontFamily="Poppins"
            fontWeight="600" fontSize="11" fill="var(--fg-3)" letterSpacing="0.08em">
        BUDGET
      </text>

      {/* Legend chips */}
      <g fontFamily="Poppins" fontSize="11" fontWeight="600">
        <circle cx="52"  cy="240" r="5" fill={SOFT_NAVY}/>
        <text   x="62"  y="244" fill="var(--dhan-navy)">Needs 50%</text>
        <circle cx="140" cy="240" r="5" fill={SOFT_GOLD}/>
        <text   x="150" y="244" fill="var(--dhan-navy)">Wants 30%</text>
        <circle cx="222" cy="240" r="5" fill={SAGE}/>
        <text   x="232" y="244" fill="var(--dhan-navy)">Save 20%</text>
      </g>
    </svg>
  );
}
function OnboardIllo3() {
  return (
    <svg viewBox="0 0 300 260" width="100%" style={{ maxHeight: 360 }}>
      <rect x="60" y="40" width="180" height="180" rx="22" fill="var(--bg-surface)"/>
      <rect x="80" y="62" width="140" height="36" rx="10" fill="#fff" stroke="var(--border-default)"/>
      <circle cx="96" cy="80" r="8" fill="var(--warning)"/>
      <rect x="112" y="74" width="68" height="5" rx="2.5" fill="var(--dhan-navy)"/>
      <rect x="112" y="84" width="48" height="4" rx="2" fill="var(--fg-4)"/>
      <rect x="80" y="106" width="140" height="36" rx="10" fill="#fff" stroke="var(--border-default)"/>
      <circle cx="96" cy="124" r="8" fill="var(--expense)"/>
      <rect x="112" y="118" width="80" height="5" rx="2.5" fill="var(--dhan-navy)"/>
      <rect x="112" y="128" width="56" height="4" rx="2" fill="var(--fg-4)"/>
      <rect x="80" y="150" width="140" height="36" rx="10" fill="#fff" stroke="var(--border-default)"/>
      <circle cx="96" cy="168" r="8" fill="var(--income)"/>
      <rect x="112" y="162" width="60" height="5" rx="2.5" fill="var(--dhan-navy)"/>
      <rect x="112" y="172" width="74" height="4" rx="2" fill="var(--fg-4)"/>
      {/* bell */}
      <circle cx="232" cy="56" r="20" fill="var(--dhan-gold)"/>
      <path d="M225 52 q7 -10 14 0 v8 h-14 z M229 64 q3 4 6 0" fill="var(--dhan-navy)"/>
    </svg>
  );
}

// 03. SIGN UP
function SignUpScreen({ onDone }) {
  const [step, setStep] = useState(0); // 0 form, 1 otp
  const [name, setName] = useState("Priya Sharma");
  const [phone, setPhone] = useState("98210 45678");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = useRef([]);
  const full = otp.every(d => d !== "");

  const onOtp = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 3) otpRefs.current[i+1]?.focus();
  };

  // Backspace on an empty box steps back and clears the previous digit.
  const onOtpKey = (i, e) => {
    if (e.key !== "Backspace" || otp[i]) return;
    if (i === 0) return;
    e.preventDefault();
    const next = [...otp]; next[i-1] = ""; setOtp(next);
    otpRefs.current[i-1]?.focus();
  };

  return (
    <Phone bg="#fff" label="03 Sign up">
      <StatusBar />
      <ScreenHeader title={step === 0 ? "Create account" : "Verify number"}
                    onBack={() => step === 0 ? onDone?.("back") : setStep(0)} />
      <div className="screen-in" key={step} style={{ flex: 1, padding: "0 20px 20px",
                    display: "flex", flexDirection: "column" }}>
        {step === 0 ? (
          <>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>
              Let's get you set up.
            </div>
            <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 20 }}>
              We'll send a 4-digit code to verify your number.
            </div>
            <Field label="Your name" value={name}
                   onChange={(e) => setName(e.target.value)} placeholder="First + last" />
            <Field label="Mobile number" value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   placeholder="98xxx xxxxx" prefix="+91" type="tel" />
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>
              By continuing, you agree to Dhan's Terms of Service and Privacy Policy.
            </div>
            <Button variant="primary" full size="lg" onClick={() => setStep(1)}
                    disabled={!name || !phone}>
              Continue
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }}/>
              <span style={{ fontSize: 11, color: "var(--fg-3)", fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }}/>
            </div>
            <Button variant="outline" full size="lg" icon="assets/google-icon.svg"
                    onClick={() => onDone?.("next")}>
              Continue with Google
            </Button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>
              Enter the 4-digit code
            </div>
            <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 24 }}>
              Sent to <span style={{ color: "var(--fg-1)", fontWeight: 600 }}>+91 {phone}</span>
              <button onClick={() => setStep(0)} style={{ marginLeft: 6, background: "none", border: "none",
                      color: "var(--dhan-navy)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Edit</button>
            </div>
            {/* minmax(0,1fr) + border-box: an input's intrinsic width can't widen the track,
                so the four boxes always fit the page margins at any device width. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: 10, marginBottom: 16 }}>
              {otp.map((d, i) => (
                <input key={i}
                  ref={(el) => otpRefs.current[i] = el}
                  value={d}
                  onChange={(e) => onOtp(i, e.target.value)}
                  onKeyDown={(e) => onOtpKey(i, e)}
                  maxLength={1}
                  inputMode="numeric"
                  aria-label={`Digit ${i + 1} of 4`}
                  style={{
                    width: "100%", minWidth: 0, boxSizing: "border-box",
                    aspectRatio: "1 / 1", maxHeight: 64, padding: 0,
                    borderRadius: "var(--r-control)",
                    border: `1.5px solid ${d ? "var(--dhan-navy)" : "var(--border-default)"}`,
                    textAlign: "center", fontFamily: "Poppins, sans-serif",
                    fontSize: 26, fontWeight: 700,
                    outline: "none", background: "#fff", color: "var(--dhan-navy)",
                  }}/>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-3)", textAlign: "center" }}>
              Didn't get it? <button style={{ background: "none", border: "none",
                color: "var(--dhan-navy)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Resend in 24s</button>
            </div>
            <div style={{ flex: 1 }}/>
            <Button variant="primary" full size="lg" onClick={() => onDone?.("next")} disabled={!full}>
              Create account
            </Button>
          </>
        )}
      </div>
    </Phone>
  );
}

// 04. BUDGET FRAMEWORK
// Driven by the canonical FRAMEWORKS / frameworkBuckets data so onboarding shows
// the same buckets and default sub-categories the budget will actually be built with.
function FrameworkScreen({ onDone }) {
  const [sel, setSel] = useState(() => localStorage.getItem("dhan-framework") || "50-30-20");
  const blurbs = {
    "50-30-20": "The classic. Good starting point.",
    "70-20-10": "If you're paying off loans or EMIs.",
    "80-20":    "Simplest split — spend, then save.",
    "pyf":      "Savings comes off the top, guilt-free after.",
    "zero":     "Assign income down to zero each month.",
    "60-20-20": "Balanced, flexible mid-ground.",
  };
  const options = [...FRAMEWORKS, { id: "custom", name: "Custom", desc: "Build your own mix" }];

  const choose = () => {
    if (sel !== "custom") localStorage.setItem("dhan-framework", sel);
    onDone?.("next");
  };

  return (
    <Phone bg="var(--bg-surface)" label="04 Framework">
      <StatusBar />
      <ScreenHeader title="Budget framework" onBack={() => onDone?.("back")} />
      <div style={{ padding: "0 20px 8px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>
          How do you want to budget?
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)", marginBottom: 16 }}>
          Pick a framework. Categories are pre-filled and fully editable later.
        </div>
      </div>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
        {options.map(o => {
          const active = sel === o.id;
          const isCustom = o.id === "custom";
          const buckets = isCustom ? [] : frameworkBuckets(o.id);
          return (
            <div key={o.id} onClick={() => setSel(o.id)} style={{
              background: "#fff", borderRadius: "var(--r-card)", padding: 16, marginBottom: 10,
              border: `2px solid ${active ? "var(--dhan-navy)" : "transparent"}`,
              boxShadow: active ? "0 8px 20px rgba(20,28,65,.08)" : "var(--shadow-card)",
              cursor: "pointer",
              transition: "border-color .15s, box-shadow .2s",
              position: "relative",
            }}>
              {o.id === "50-30-20" && (
                <div style={{
                  position: "absolute", top: 14, right: 16,
                  background: "var(--dhan-gold-bg)", color: "var(--dhan-navy)",
                  fontSize: 10, fontWeight: 500, padding: "3px 8px",
                  borderRadius: 999, letterSpacing: ".04em",
                }}>POPULAR</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6,
                            paddingRight: o.id === "50-30-20" ? 76 : 0 }}>
                <SelectIndicator on={active}/>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{o.name}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: buckets.length ? 12 : 0,
                            marginLeft: 34 }}>
                {blurbs[o.id] || o.desc}
              </div>
              {!!buckets.length && (
                <>
                  <div style={{ marginLeft: 34, display: "flex", gap: 4, height: 8,
                                borderRadius: 999, overflow: "hidden", background: "var(--bg-surface)" }}>
                    {buckets.map(b => (
                      <div key={b.id} style={{ flex: b.pct, background: b.color }}/>
                    ))}
                  </div>
                  <div style={{ marginLeft: 34, display: "grid", gap: 4, marginTop: 8 }}>
                    {buckets.map(b => (
                      <div key={b.id} style={{ display: "grid",
                                               gridTemplateColumns: "8px minmax(0,1fr)",
                                               gap: 6, alignItems: "baseline" }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color }}/>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)" }}>
                            {b.pct}% {b.label}
                          </span>
                          <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.45,
                                        textWrap: "pretty" }}>
                            {b.cats.map(c => CATEGORIES[c].name).join(" · ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 16px 24px", background: "var(--bg-surface)",
                    borderTop: "1px solid var(--border-subtle)" }}>
        <Button variant="primary" full size="lg" onClick={choose} iconRight="arrow-right">
          {sel === "custom" ? "Build my categories" : "Let's go"}
        </Button>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  SplashScreen, OnboardingScreen, SignUpScreen, FrameworkScreen,
});
