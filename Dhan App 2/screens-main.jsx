// ─── Main app screens: Home, Transactions, Budget, Bills ────

// Shared sample data
const SAMPLE_TXNS = [
  { id: 1, date: "Today", day: "Today · Apr 23", m: "Swiggy",           s: "Dinner · UPI · 3:42 PM",     a: -420,   c: "food" },
  { id: 2, date: "Today", day: "Today · Apr 23", m: "Salary · Acme Co", s: "Income · HDFC · 9:00 AM",    a: 82500,  c: "income" },
  { id: 3, date: "Today", day: "Today · Apr 23", m: "Blue Tokai",       s: "Coffee · UPI · 10:12 AM",    a: -240,   c: "food" },
  { id: 10, date: "Today", day: "Today · Apr 23", m: "Figma Inc",      s: "USD 45 · international",     a: -3842, c: "shopping",
    isForeignTransaction: true, originalCurrency: "USD", originalAmount: 45, inrAmount: 3842 },
  { id: 11, date: "Today", day: "Today · Apr 23", m: "Forex markup fee", s: "Forex Fee · auto-detected", a: -76, c: "forex-fee", categoryLocked: true },
  { id: 4, date: "Yesterday", day: "Yesterday", m: "Uber",              s: "BKC → Bandra · UPI",         a: -186,   c: "transport" },
  { id: 5, date: "Yesterday", day: "Yesterday", m: "Myntra",            s: "Apparel · UPI",              a: -2499,  c: "shopping" },
  { id: 6, date: "Yesterday", day: "Yesterday", m: "BigBasket",         s: "Groceries · UPI",            a: -1840,  c: "groceries" },
  { id: 7, date: "Mon", day: "Mon · Apr 21",    m: "Airtel",            s: "Fiber · auto-debit",         a: -999,   c: "bills" },
  { id: 8, date: "Mon", day: "Mon · Apr 21",    m: "BookMyShow",        s: "Ent. · UPI",                 a: -350,   c: "ent" },
  { id: 9, date: "Mon", day: "Mon · Apr 21",    m: "Apollo Pharmacy",   s: "Health · UPI",               a: -615,   c: "health" },
];

const UPCOMING_BILLS = [
  { id: "rent",    name: "Rent",          amt: 24000, due: "May 1",  dueIn: 8, icon: "house",            status: "upcoming" },
  { id: "airtel",  name: "Airtel Fiber",  amt: 1199,  due: "Apr 26", dueIn: 3, icon: "wifi-high",        status: "due-soon" },
  { id: "spotify", name: "Spotify",       amt: 119,   due: "Apr 28", dueIn: 5, icon: "spotify-logo",     status: "due-soon" },
  { id: "netflix", name: "Netflix",       amt: 649,   due: "May 4",  dueIn: 11,icon: "television-simple",status: "upcoming" },
  { id: "elec",    name: "Electricity",   amt: 2340,  due: "Apr 18", dueIn: -5,icon: "lightning",        status: "paid" },
  { id: "gas",     name: "Piped Gas",     amt: 480,   due: "May 6",  dueIn: 13,icon: "flame",            status: "upcoming" },
  { id: "gym",     name: "Cult.fit",      amt: 899,   due: "Apr 30", dueIn: 7, icon: "barbell",          status: "due-soon" },
];

// Supported budgeting frameworks
const FRAMEWORKS = [
  { id: "50-30-20", name: "50 / 30 / 20",        desc: "50% Needs · 30% Wants · 20% Savings" },
  { id: "70-20-10", name: "70 / 20 / 10",        desc: "70% Spending · 20% Savings · 10% Debt" },
  { id: "80-20",    name: "80 / 20",             desc: "80% Spending · 20% Savings" },
  { id: "pyf",      name: "Pay Yourself First",  desc: "Save 20% first · spend the rest freely" },
  { id: "zero",     name: "Zero-Based",          desc: "Every rupee assigned · nothing left over" },
  { id: "60-20-20", name: "60 / 20 / 20",        desc: "60% Needs · 20% Wants · 20% Savings" },
];

// Bucket shape per framework — label, share, and the DEFAULT sub-categories that
// pre-populate it. No standard framework ever starts with an empty bucket; only
// the Custom path is deliberately blank. All of this stays fully editable.
const EVERYDAY = ["rent", "bills", "groceries", "transport", "health",
                  "food", "shopping", "ent", "travel"];
const NEEDS = ["rent", "bills", "groceries", "transport", "health"];
const WANTS = ["food", "shopping", "ent", "travel"];
const SAVINGS = ["income", "edu"];
const DEBT = ["cc", "emi", "ploan"];
const SAVE_FIRST = ["income", "invest", "edu"];

const FRAMEWORK_BUCKETS = {
  "50-30-20": [
    ["needs",   "Needs",   50, NEEDS],
    ["wants",   "Wants",   30, WANTS],
    ["savings", "Savings", 20, SAVINGS],
  ],
  "60-20-20": [
    ["needs",   "Needs",   60, NEEDS],
    ["wants",   "Wants",   20, WANTS],
    ["savings", "Savings", 20, SAVINGS],
  ],
  "70-20-10": [
    ["needs",   "Spending", 70, EVERYDAY],
    ["savings", "Savings",  20, SAVINGS],
    ["debt",    "Debt",     10, DEBT],
  ],
  "80-20": [
    ["needs",   "Spending", 80, EVERYDAY],
    ["savings", "Savings",  20, SAVINGS],
  ],
  "pyf": [
    ["savings", "Save first",   20, SAVE_FIRST],
    ["needs",   "Spend freely", 80, EVERYDAY],
  ],
  // Zero-based is about assigning every rupee, so it starts from the 50/30/20
  // shape and expects the user to reassign it.
  "zero": [
    ["needs",   "Needs",   50, NEEDS],
    ["wants",   "Wants",   30, WANTS],
    ["savings", "Savings", 20, SAVINGS],
  ],
};

// Bucket metadata for buckets that aren't part of Personal's three.
const EXTRA_BUCKETS = {
  debt: { icon: "credit-card", color: "#C4696B", tint: "var(--expense-bg)" },
};

// Buckets for a framework, merged with the shared category/colour metadata.
function frameworkBuckets(fwId) {
  const shape = FRAMEWORK_BUCKETS[fwId] || FRAMEWORK_BUCKETS["50-30-20"];
  const used = new Set();
  return shape.map(([id, label, pct, cats]) => {
    const base = BUCKETS[id] || EXTRA_BUCKETS[id] || BUCKETS.needs;
    const list = (cats || base.cats || []).filter(cat => {
      if (used.has(cat) || !CATEGORIES[cat]) return false;
      used.add(cat); return true;
    });
    return { id, label, pct, icon: base.icon, color: base.color, tint: base.tint,
             spent: base.spent || 0, cats: list };
  });
}

function FrameworkSheet({ open, onClose, current = "50-30-20", onApply, allowCustom = false }) {
  const [pick, setPick] = useState(current);
  useEffect(() => { if (open) setPick(current); }, [open, current]);
  const options = allowCustom
    ? [...FRAMEWORKS, { id: "custom", name: "Custom", desc: "Build your own buckets and categories" }]
    : FRAMEWORKS;
  return (
    <BottomSheet open={open} onClose={onClose} title="Choose your framework">
      <div style={{ background: "var(--bg-elevated)", borderRadius: 12,
                    border: "1px solid var(--border-subtle)", padding: "0 16px", marginBottom: 16 }}>
        {options.map((f, i) => {
          const on = pick === f.id;
          return (
            <div key={f.id} onClick={() => setPick(f.id)} style={{
              display: "grid", gridTemplateColumns: "22px 1fr", gap: 16, alignItems: "center",
              padding: "16px 0", cursor: "pointer",
              borderBottom: i === options.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <SelectIndicator on={on}/>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#141C41" }}>
                  {f.name}{f.id === "50-30-20" && (
                    <span style={{ color: "var(--fg-3)", fontWeight: 400, fontSize: 12 }}> · default</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => onApply?.(pick)} style={{
        width: "100%", height: 56, borderRadius: "var(--r-control)",
        background: "#141C41", border: "none", cursor: "pointer",
        fontFamily: "Poppins, sans-serif", fontSize: 16, fontWeight: 600, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        Apply
        <i className="ph ph-arrow-right" style={{ fontSize: 18, color: "#C9A84C" }}/>
      </button>
    </BottomSheet>
  );
}

// 50/30/20 framework — the three buckets every category rolls up into
const BUCKETS = {
  needs:   { label: "Needs",   pct: 50, spent: 16180, color: "var(--dhan-navy)",
             icon: "house-line", tint: "var(--bg-surface)",
             cats: ["rent", "bills", "groceries", "transport", "health"] },
  wants:   { label: "Wants",   pct: 30, spent: 10900, color: "var(--dhan-gold)",
             icon: "confetti", tint: "var(--dhan-gold-bg)",
             cats: ["food", "shopping", "ent", "travel"] },
  savings: { label: "Savings", pct: 20, spent:  5100, color: "var(--income)",
             icon: "piggy-bank", tint: "var(--income-bg)",
             cats: ["income", "edu"] },
};

// Parked transactions — no category assigned yet
const UNCAT_TXNS = [
  { id: "u1",  m: "Unknown UPI",       s: "UPI/9284XX · Apr 22",   a: -340 },
  { id: "u2",  m: "Amazon Pay",        s: "Wallet · Apr 22",       a: -120 },
  { id: "u3",  m: "ATM withdrawal",    s: "Cash · HDFC · Apr 21",   a: -860 },
  { id: "u4",  m: "Spotify",           s: "Card · Apr 21",         a: -199 },
  { id: "u5",  m: "Razorpay merchant", s: "UPI · Apr 20",          a: -450 },
  { id: "u6",  m: "Auto rickshaw",     s: "UPI · Apr 20",          a: -75  },
  { id: "u7",  m: "NEFT · S. Joshi",   s: "Credit · Apr 19",       a: 640  },
  { id: "u8",  m: "Zepto",             s: "UPI · Apr 19",          a: -210 },
  { id: "u9",  m: "Cash transfer",     s: "Self · Apr 18",         a: -386 },
  { id: "u10", m: "Paytm wallet",      s: "Top-up · Apr 18",       a: -300 },
  { id: "u11", m: "PhonePe merchant",  s: "UPI · Apr 17",          a: -400 },
  { id: "u12", m: "Card swipe · POS",  s: "HDFC ••4521 · Apr 17",   a: -250 },
];

const uncatTotal = (list) => list.reduce((s, t) => s + Math.abs(t.a), 0);

// Shared card — Home dashboard + Budget page
function UncatCard({ nav, list = UNCAT_TXNS }) {
  if (!list.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 16,
                  border: "1px solid var(--card-border-color)",
                  boxShadow: "var(--shadow-card)", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <IconChip icon="tray" color="#C9A84C" bg="var(--dhan-gold-bg)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41" }}>Uncategorised</div>
          <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2,
                        fontVariantNumeric: "tabular-nums" }}>
            {list.length} transactions · Rs {uncatTotal(list).toLocaleString("en-IN")} uncategorised
          </div>
        </div>
      </div>
      <button onClick={() => nav?.("uncat")} style={{
        marginTop: 16, width: "100%", fontSize: 13,
      }} className="gold-btn">
        Categorise now
        <i className="ph ph-arrow-right" style={{ fontSize: 15 }}/>
      </button>
    </div>
  );
}

// 27. UNCATEGORISED — filtered list of parked transactions
function UncategorisedScreen({ onBack, onFiled }) {
  const [items, setItems] = useState(UNCAT_TXNS);
  const [open, setOpen] = useState(null);
  const catIds = ["food", "transport", "shopping", "bills", "ent", "health", "groceries", "income"];
  const file = (t, cat) => {
    setItems(list => list.filter(x => x.id !== t.id));
    setOpen(null);
    onFiled?.(CATEGORIES[cat].name);
  };
  return (
    <Phone label="27 Uncategorised">
      <StatusBar />
      <ScreenHeader title="Uncategorised" onBack={onBack} />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        <div style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 16,
                      border: "1px solid var(--card-border-color)",
                      boxShadow: "var(--shadow-card)", marginBottom: 16,
                      display: "flex", alignItems: "center", gap: 16 }}>
          <IconChip icon="tray" color="#C9A84C" bg="var(--dhan-gold-bg)" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#141C41",
                          fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
              Rs {uncatTotal(items).toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2 }}>
              {items.length} transaction{items.length === 1 ? "" : "s"} waiting for a category
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--fg-3)" }}>
            <IconChip icon="check-circle" size={56} color="var(--income)" bg="var(--income-bg)" />
            <div style={{ fontSize: 16, fontWeight: 600, color: "#141C41", marginTop: 16 }}>All sorted</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Every transaction has a category.</div>
          </div>
        ) : items.map(t => (
          <div key={t.id} style={{ background: "var(--bg-elevated)", borderRadius: 12,
                                   border: "1px solid var(--card-border-color)",
                                   boxShadow: "var(--shadow-card)", marginBottom: 8,
                                   padding: "0 16px" }}>
            <div onClick={() => setOpen(o => o === t.id ? null : t.id)}
                 style={{ display: "grid", gridTemplateColumns: "40px 1fr auto 16px", gap: 16,
                          alignItems: "center", padding: "16px 0", cursor: "pointer" }}>
              <IconChip icon="question" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-1)",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.m}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{t.s}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                            fontVariantNumeric: "tabular-nums",
                            color: t.a > 0 ? "var(--income)" : "#141C41" }}>
                {t.a > 0 ? "+" : "−"}Rs {Math.abs(t.a).toLocaleString("en-IN")}
              </div>
              <i className={"ph ph-caret-" + (open === t.id ? "up" : "down")}
                 style={{ fontSize: 14, color: "var(--fg-4)" }}/>
            </div>
            {open === t.id && (
              <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 0" }}>
                <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginBottom: 8 }}>Assign a category</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(t.a > 0 ? ["income"] : catIds.filter(c => c !== "income")).map(id => {
                    const c = CATEGORIES[id];
                    return (
                      <button key={id} onClick={() => file(t, id)} style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "6px 12px 6px 8px", borderRadius: 999,
                        border: "1px solid var(--border-default)", background: "var(--bg-elevated)",
                        color: "var(--fg-2)", fontFamily: "Poppins, sans-serif",
                        fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                      }}>
                        <span style={{ width: 20, height: 20, borderRadius: "var(--r-input)",
                                       background: c.color + "1F", color: c.color,
                                       display: "grid", placeItems: "center" }}>
                          <i className={"ph ph-" + c.icon} style={{ fontSize: 11 }}/>
                        </span>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Phone>
  );
}

// 05. HOME DASHBOARD — matches the Dhan Design System UI kit Home screen
function HomeScreen({ tab, setTab, nav, onOpenSheet, budgetTag, userName = "Priya", greeting = "Morning" }) {
  const recent = SAMPLE_TXNS.slice(0, 4);
  return (
    <Phone label="05 Home">
      <StatusBar />
      <AppHeader onMenu={() => nav?.("more")} onSearch={() => nav?.("search")}
                 onNotify={() => nav?.("notifications")} />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 16px 24px" }}>
        {/* Greeting + Add + Bell (exactly per DS) */}
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "8px 4px 16px" }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--fg-3)" }}>{greeting},</div>
            <div style={{ fontSize: 20, fontWeight: 700, whiteSpace: "nowrap" }}>{userName} 👋</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button aria-label="Add"
                    onClick={() => onOpenSheet?.("add-txn", { kind: "expense" })}
                    style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
                             background: "#fff", border: "1px solid var(--border-subtle)",
                             display: "grid", placeItems: "center", cursor: "pointer" }}>
              <i className="ph ph-plus" style={{ fontSize: 20, color: "var(--dhan-navy)" }}/>
            </button>
          </div>
        </div>

        {/* Balance hero (DS spec: 20px radius, 20px padding, 34px amount, two pills) */}
        <div style={{
          background: "var(--dhan-navy)", borderRadius: "var(--r-card-lg)", padding: 20,
          color: "#fff", boxShadow: "var(--shadow-md)", marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.01em", fontWeight: 600, opacity: 0.7 }}>
            Balance · April
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em",
                        fontVariantNumeric: "tabular-nums", margin: "6px 0 14px" }}>
            ₹1,24,500<span style={{ fontSize: 18, opacity: 0.6 }}>.00</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                           padding: "4px 10px", borderRadius: 999,
                           fontSize: 12, fontWeight: 600,
                           background: "rgba(255,217,119,0.15)",
                           color: "var(--dhan-gold-soft)" }}>
              <i className="ph ph-arrow-down-left" style={{ fontSize: 14 }}/>
              + ₹82,500
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                           padding: "4px 10px", borderRadius: 999,
                           fontSize: 12, fontWeight: 600,
                           background: "rgba(255,255,255,0.1)", color: "#fff" }}>
              <i className="ph ph-arrow-up-right" style={{ fontSize: 14 }}/>
              − ₹32,180
            </span>
          </div>
        </div>

        {/* Quick actions row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { id: "add-exp", label: "Add expense", icon: "minus-circle", color: "var(--expense)",  action: () => onOpenSheet?.("add-txn", { kind: "expense" }) },
            { id: "add-inc", label: "Add income",  icon: "plus-circle",  color: "var(--income)",   action: () => onOpenSheet?.("add-txn", { kind: "income" }) },
            { id: "insights",label: "Insights",    icon: "chart-line-up",color: "var(--info)",      action: () => nav?.("insights") },
          ].map(q => (
            <button key={q.id} onClick={q.action} style={{
              background: "#fff", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--r-card-sm)", padding: "12px 6px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              cursor: "pointer",
            }}>
              <div style={{ width: 38, height: 38, borderRadius: "var(--r-control)",
                            background: q.color + "15", color: q.color,
                            display: "grid", placeItems: "center" }}>
                <i className={`ph ph-${q.icon}`} style={{ fontSize: 20 }}/>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-2)",
                            textAlign: "center", lineHeight: 1.2 }}>{q.label}</div>
            </button>
          ))}
        </div>

        {/* Uncategorised — parked transactions waiting to be sorted */}
        <UncatCard nav={nav} />

        {/* This month's budget — DS uses a single navy progress bar inside a 16-padding card */}
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "baseline", margin: "0 4px 10px" }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>This month's budget</div>
          <button onClick={() => nav?.("budget")} style={{
            border: "none", background: "none", cursor: "pointer", padding: "8px 4px",
            margin: "-8px -4px", display: "flex", alignItems: "center", gap: 4,
            fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500, color: "#141C41",
          }}>
            See all
            <i className="ph ph-caret-right" style={{ fontSize: 12 }}/>
          </button>
        </div>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                ₹32,180 <span style={{ color: "var(--fg-3)", fontWeight: 400, fontSize: 14 }}>of ₹50,000</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                ₹17,820 left · 11 days to go
              </div>
            </div>
          </div>
          <div style={{ height: 8, background: "var(--bg-surface)",
                        borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ width: "64%", height: "100%",
                          background: "var(--dhan-navy)", borderRadius: 999 }}/>
          </div>
          {/* Framework buckets — follows the active framework */}
          {frameworkBuckets(localStorage.getItem("dhan-framework") || "50-30-20").map(b => {
            const id = b.id;
            const cap = Math.round(50000 * b.pct / 100);
            const spent = b.spent || 0;
            const over = spent > cap;
            const pct = Math.min(100, Math.round((spent / cap) * 100));
            return (
              <div key={id} style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: b.color }}/>
                    {b.label} <span style={{ color: "var(--fg-3)", fontSize: 11.5 }}>{b.pct}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    <span style={{ color: over ? "var(--expense)" : "#141C41" }}>
                      ₹{spent.toLocaleString("en-IN")}
                    </span> <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>/ ₹{cap.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div style={{ height: 6, background: "var(--bg-surface)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%",
                                background: over ? "var(--expense)" : b.color, borderRadius: 999 }}/>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Recent transactions — DS card with TxnRow list */}
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "baseline", margin: "0 4px 10px" }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Recent transactions</div>
          <button onClick={() => nav?.("txn")} style={{
            border: "none", background: "none", cursor: "pointer", padding: "8px 4px",
            margin: "-8px -4px", display: "flex", alignItems: "center", gap: 4,
            fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500, color: "#141C41",
          }}>
            See all
            <i className="ph ph-caret-right" style={{ fontSize: 12 }}/>
          </button>
        </div>
        <Card style={{ padding: "4px 16px", marginBottom: 16 }}>
          {recent.map((t, i) => (
            <TxnRow key={t.id} merchant={t.m} meta={t.s} amount={t.a} cat={t.c}
                    isForeign={t.isForeignTransaction} currency={t.originalCurrency}
                    budgetTag={budgetTag?.(t)}
                    originalAmount={t.originalAmount}
                    onClick={() => nav?.("txn-detail", t)}
                    last={i === recent.length - 1} />
          ))}
        </Card>

        {/* Goals teaser */}
        {/* Weekly recap teaser → Insights */}
        <InsightsTeaser nav={nav} />

        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "baseline", margin: "0 4px 10px" }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Savings goals</div>
          <button onClick={() => nav?.("goals")} style={{
            border: "none", background: "none", cursor: "pointer", padding: "8px 4px",
            margin: "-8px -4px", display: "flex", alignItems: "center", gap: 4,
            fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500, color: "#141C41",
          }}>
            See all
            <i className="ph ph-caret-right" style={{ fontSize: 12 }}/>
          </button>
        </div>
        <Card onClick={() => nav?.("goals")} style={{ padding: 14, marginBottom: 16, cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--r-control)",
                        background: "var(--dhan-gold-bg)", color: "var(--dhan-gold)",
                        display: "grid", placeItems: "center" }}>
            <i className="ph-fill ph-target" style={{ fontSize: 22 }}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>4 active goals</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
              ₹4,47,000 saved · 37% to ₹12L target
            </div>
          </div>
          <i className="ph ph-caret-right" style={{ fontSize: 16, color: "var(--fg-3)" }}/>
        </Card>

        {/* Upcoming bills horizontal scroll (brief requirement) */}
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "baseline", margin: "0 4px 10px" }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Upcoming bills</div>
          <button onClick={() => nav?.("bills")} style={{
            border: "none", background: "none", cursor: "pointer", padding: "8px 4px",
            margin: "-8px -4px", display: "flex", alignItems: "center", gap: 4,
            fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500, color: "#141C41",
          }}>
            See all
            <i className="ph ph-caret-right" style={{ fontSize: 12 }}/>
          </button>
        </div>
        <div style={{
          display: "flex", gap: 10, overflowX: "auto",
          margin: "0 -16px", padding: "4px 16px 8px",
          scrollbarWidth: "none",
        }}>
          {UPCOMING_BILLS.filter(b => b.status !== "paid").slice(0,4).map(b => (
            <div key={b.id} style={{
              background: "#fff", borderRadius: "var(--r-card-sm)", padding: 14,
              minWidth: 160, boxShadow: "var(--shadow-card)",
              display: "flex", flexDirection: "column", gap: 6, flexShrink: 0,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "var(--r-input)",
                              background: "var(--bg-surface)",
                              display: "grid", placeItems: "center", color: "var(--dhan-navy)" }}>
                  <i className={`ph ph-${b.icon}`} style={{ fontSize: 16 }}/>
                </div>
                <StatusPill tone={b.status === "due-soon" ? "warning" : "info"}>
                  {b.dueIn <= 0 ? "Today" : `${b.dueIn}d`}
                </StatusPill>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }}>Due {b.due}</div>
              <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                ₹{b.amt.toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active={tab} onChange={setTab} />
    </Phone>
  );
}

// 06. TRANSACTIONS
function TransactionsScreen({ tab, setTab, onOpenSheet, onOpenTxn, nav, txns = SAMPLE_TXNS,
                             initialCat, onCatConsumed, budgetTag }) {
  const [filter, setFilter] = useState("all");
  const [sub, setSub] = useState(null);
  const [q, setQ] = useState("");
  const [ovRange, setOvRange] = useState("month");   // Overview time range
  const [listRange, setListRange] = useState("all"); // range applied to the list on card tap
  useEffect(() => {
    if (!initialCat) return;
    const fwb = frameworkBuckets(localStorage.getItem("dhan-framework") || "50-30-20");
    const bucket = (fwb.find(b => b.cats.includes(initialCat)) || {}).id;
    if (bucket) { setFilter(bucket); setSub(initialCat); }
    onCatConsumed?.();
  }, [initialCat]);
  const filters = [
    { id: "all", label: "All" },
    ...frameworkBuckets(localStorage.getItem("dhan-framework") || "50-30-20")
        .map(b => ({ id: b.id, label: b.label, cats: b.cats })),
    { id: "income", label: "Income" },
    { id: "expense", label: "Expense" },
  ];
  const activeBucket = filters.find(f => f.id === filter && f.cats) || null;

  // Savings / debt outflows are identified by category, so the Overview works even
  // when the active framework has no such bucket (then those totals simply read ₹0).
  const SAVE_CATS = ["invest", "edu"];
  const isSaving = (t) => t.a < 0 && SAVE_CATS.includes(t.c);
  const isDebt = (t) => t.a < 0 && DEBT.includes(t.c);

  // Sample transactions carry human day labels, not timestamps — read the month out
  // of the label and compare against the app's current month (Apr 2026).
  const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const monthOf = (t) => {
    const m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.exec(
      (t.day || "") + " " + (t.s || ""));
    return m ? MONTHS.indexOf(m[1].toLowerCase()) : 3;
  };
  const inRange = (t, r) => {
    if (r === "all" || r === "year") return true; // all sample data sits in 2026
    return monthOf(t) === 3;                      // this month — April
  };

  const filt = txns.filter(t => {
    if (filter === "income" && t.a <= 0) return false;
    if (filter === "expense" && t.a >= 0) return false;
    if (filter === "ov-savings" && !isSaving(t)) return false;
    if (filter === "ov-debt" && !isDebt(t)) return false;
    if (activeBucket) {
      if (sub ? t.c !== sub : !activeBucket.cats.includes(t.c)) return false;
    }
    if (!inRange(t, listRange)) return false;
    if (q && !t.m.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const RANGES = [{ id: "month", label: "This month" }, { id: "year", label: "This year" },
                  { id: "all", label: "All time" }];
  const ovTxns = txns.filter(t => inRange(t, ovRange));
  const totals = [
    { id: "income", label: "Total income", icon: "arrow-down-left",
      v: ovTxns.filter(t => t.a > 0).reduce((s, t) => s + t.a, 0),
      color: "var(--income)", bg: "var(--income-bg)" },
    { id: "expense", label: "Total expenses", icon: "arrow-up-right",
      v: ovTxns.filter(t => t.a < 0 && !isSaving(t) && !isDebt(t))
               .reduce((s, t) => s + Math.abs(t.a), 0),
      color: "var(--expense)", bg: "var(--expense-bg)" },
    { id: "ov-savings", label: "Total savings", icon: "piggy-bank",
      v: ovTxns.filter(isSaving).reduce((s, t) => s + Math.abs(t.a), 0),
      color: "var(--dhan-navy)", bg: "var(--bg-surface)" },
    { id: "ov-debt", label: "Total debt paid", icon: "credit-card",
      v: ovTxns.filter(isDebt).reduce((s, t) => s + Math.abs(t.a), 0),
      color: "#C4696B", bg: "var(--expense-bg)" },
  ];
  const openTotal = (id) => {
    setFilter(id); setSub(null); setListRange(ovRange);
  };

  const income = filt.filter(t => t.a > 0).reduce((s, t) => s + t.a, 0);
  const expense = filt.filter(t => t.a < 0).reduce((s, t) => s + Math.abs(t.a), 0);
  const net = income - expense;

  const groups = {};
  filt.forEach(t => { (groups[t.day] ||= []).push(t); });

  return (
    <Phone label="06 Transactions">
      <StatusBar />
      <AppHeader onMenu={() => nav?.("more")} onSearch={() => nav?.("search")}
                 onNotify={() => nav?.("notifications")} />
      <div style={{ padding: "4px 16px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Transactions</div>
          <button onClick={() => onOpenSheet?.("txn-filter", { filter, q })}
                  style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
                           background: "#fff", border: "1px solid var(--border-subtle)",
                           display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
            <i className="ph ph-funnel" style={{ fontSize: 20 }}></i>
            {filter !== "all" && (
              <span style={{ position: "absolute", top: 8, right: 8,
                              width: 8, height: 8, borderRadius: 999,
                              background: "var(--dhan-gold)", border: "2px solid #fff",
                              boxSizing: "content-box" }}/>
            )}
          </button>
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--r-control)", padding: "0 12px", height: 44, marginBottom: 10,
        }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 18, color: "var(--fg-3)" }}/>
          <input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Search merchants, notes…"
                 style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                          fontSize: 14, color: "var(--fg-1)" }}/>
        </div>

        {/* Bucket chips — categories nest under Needs / Wants / Savings */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2,
                      margin: "0 -16px", padding: "0 16px 6px", scrollbarWidth: "none" }}>
          {filters.map(f => (
            <Chip key={f.id} active={filter === f.id}
                  onClick={() => { setFilter(f.id); setSub(null); }}>
              {f.label}
            </Chip>
          ))}
        </div>
        {activeBucket && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto",
                        margin: "0 -16px", padding: "0 16px 6px", scrollbarWidth: "none" }}>
            <button onClick={() => setSub(null)} style={{
              padding: "5px 12px", borderRadius: 999, cursor: "pointer",
              border: "1px solid " + (sub ? "var(--border-default)" : "#141C41"),
              background: "transparent", color: sub ? "var(--fg-3)" : "#141C41",
              fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
            }}>All {activeBucket.label.toLowerCase()}</button>
            {activeBucket.cats.map(id => {
              const c = CATEGORIES[id];
              const on = sub === id;
              return (
                <button key={id} onClick={() => setSub(on ? null : id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 12px 5px 8px", borderRadius: 999, cursor: "pointer",
                  border: "1px solid " + (on ? "#141C41" : "var(--border-default)"),
                  background: "transparent", color: on ? "#141C41" : "var(--fg-2)",
                  fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
                }}>
                  <span style={{ width: 18, height: 18, borderRadius: "var(--r-input)",
                                 background: c.color + "1F", color: c.color,
                                 display: "grid", placeItems: "center" }}>
                    <i className={"ph ph-" + c.icon} style={{ fontSize: 10 }}/>
                  </span>
                  {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Summary strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
          {[
            { l: "Income", v: income, color: "var(--income)", bg: "var(--income-bg)" },
            { l: "Expense", v: expense, color: "var(--expense)", bg: "var(--expense-bg)" },
            { l: "Net", v: net, color: "#141C41", bg: "rgba(201,168,76,.16)" },
          ].map(s => (
            <div key={s.l} style={{
              background: s.bg, borderRadius: "var(--r-control)", padding: "10px 12px",
            }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--fg-2)",
                            letterSpacing: "0.01em" }}>{s.l}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: s.color,
                            fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                {s.v < 0 ? "−" : ""}₹{Math.abs(s.v).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 16px 120px", position: "relative" }}>
        {/* Overview — re-aggregation of the same local transactions by range */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      gap: 12, margin: "0 4px 10px" }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#141C41" }}>Overview</div>
        </div>
        <div style={{ display: "flex", gap: 4, padding: 3, marginBottom: 10,
                      background: "var(--bg-surface)", borderRadius: "var(--r-control)",
                      border: "1px solid var(--border-subtle)" }}>
          {RANGES.map(r => (
            <button key={r.id} onClick={() => setOvRange(r.id)} style={{
              flex: 1, height: 34, borderRadius: "var(--r-input)", cursor: "pointer", border: "none",
              background: ovRange === r.id ? "#141C41" : "transparent",
              color: ovRange === r.id ? "#fff" : "var(--fg-2)",
              fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500,
            }}>{r.label}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
          {totals.map(s => (
            <button key={s.id} onClick={() => openTotal(s.id)} style={{
              background: s.bg, borderRadius: "var(--r-control)", padding: "12px 12px 11px",
              border: filter === s.id ? "1px solid " + s.color : "1px solid transparent",
              textAlign: "left", cursor: "pointer", fontFamily: "Poppins, sans-serif",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <i className={"ph ph-" + s.icon} style={{ fontSize: 13, color: s.color }}/>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: "var(--fg-2)",
                               letterSpacing: "0.01em" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: s.color, marginTop: 3,
                            fontVariantNumeric: "tabular-nums" }}>
                ₹{s.v.toLocaleString("en-IN")}
              </div>
            </button>
          ))}
        </div>
        {listRange !== "all" && (
          <button onClick={() => { setListRange("all"); setFilter("all"); }} style={{
            display: "inline-flex", alignItems: "center", gap: 6, margin: "6px 4px 2px",
            padding: "5px 10px", borderRadius: 999, cursor: "pointer",
            border: "1px solid var(--border-default)", background: "transparent",
            fontFamily: "Poppins, sans-serif", fontSize: 11.5, fontWeight: 500, color: "var(--fg-2)",
          }}>
            {(RANGES.find(r => r.id === listRange) || {}).label}
            {" · "}{((totals.find(t => t.id === filter) || {}).label || "All").replace("Total ", "")}
            <i className="ph ph-x" style={{ fontSize: 11 }}/>
          </button>
        )}
        <div style={{ height: 1, background: "var(--border-subtle)", margin: "12px 0 4px" }}/>

        {Object.keys(groups).length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--fg-3)" }}>
            <i className="ph ph-magnifying-glass" style={{ fontSize: 40 }}/>
            <div style={{ fontSize: 14, marginTop: 8 }}>No transactions match.</div>
          </div>
        ) : Object.entries(groups).map(([day, items]) => (
          <div key={day} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em",
                          margin: "8px 4px 6px" }}>
              {day}
            </div>
            <Card style={{ padding: "4px 16px" }}>
              {items.map((t, i) => (
                <TxnRow key={t.id} merchant={t.m} meta={t.s} amount={t.a} cat={t.c}
                    isForeign={t.isForeignTransaction} currency={t.originalCurrency}
                    budgetTag={budgetTag?.(t)}
                    originalAmount={t.originalAmount}
                        last={i === items.length - 1}
                        onClick={() => onOpenTxn?.(t)} />
              ))}
            </Card>
          </div>
        ))}
      </div>
      <FAB onClick={() => onOpenSheet?.("add-txn", { kind: "expense" })} />
      <TabBar active={tab} onChange={setTab} />
    </Phone>
  );
}

// Palette for custom project sub-categories — existing category tokens only.
const PROJECT_PALETTE = ["var(--dhan-navy)", "var(--dhan-gold)", "var(--income)", "#6A8FD4",
                         "#C97BB6", "#E88B5C", "#5CB4A8", "#B079D9"];
const lineColor = (i) => PROJECT_PALETTE[i % PROJECT_PALETTE.length];

// Ring overview — shared by Personal and every project budget
function BudgetOverview({ spent, cap, note }) {
  const pct = cap ? (spent / cap) * 100 : 0;
  return (
    <Card style={{ marginBottom: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Ring value={spent} max={cap || 1} size={120} stroke={12}
              color={pct > 100 ? "var(--expense)" : "var(--dhan-navy)"}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(pct)}%
            </div>
            <div style={{ fontSize: 10, color: "var(--fg-3)", fontWeight: 600, marginTop: -2 }}>of budget</div>
          </div>
        </Ring>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 600, letterSpacing: "0.01em" }}>Spent</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            ₹{spent.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
            of ₹{cap.toLocaleString("en-IN")} total
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 10, lineHeight: 1.4 }}>{note}</div>
        </div>
      </div>
    </Card>
  );
}

// Segment bar + legend — framework buckets for Personal, real categories for projects
function BudgetBreakdown({ title, items, actionLabel, onAction }) {
  const total = items.reduce((s, x) => s + (x.cap || 0), 0) || 1;
  return (
    <Card style={{ marginBottom: 16, padding: 16, background: "var(--dhan-gold-bg)", boxShadow: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-2)",
                      letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{title}</div>
        {actionLabel && (
          <button onClick={onAction} className="gold-btn" style={{ fontSize: 12 }}>{actionLabel}</button>
        )}
      </div>
      <div style={{ height: 10, background: "rgba(20,28,65,0.08)", borderRadius: 999,
                    overflow: "hidden", display: "flex", marginTop: 10 }}>
        {items.map(x => (
          <div key={x.name} style={{ width: `${Math.round(((x.cap || 0) / total) * 100)}%`,
                                     background: x.color }}/>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 10,
                    fontSize: 11, fontWeight: 600 }}>
        {items.map(x => (
          <div key={x.name} style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: x.color, flexShrink: 0 }}/>
            <span style={{ color: "var(--fg-2)", whiteSpace: "nowrap", overflow: "hidden",
                           textOverflow: "ellipsis" }}>{x.name}</span>
            <span style={{ color: "var(--fg-3)", fontWeight: 500 }}>
              {Math.round(((x.cap || 0) / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 07. BUDGET
function BudgetScreen({ tab, setTab, nav, onEdit, isPlus = false, onUpgrade,
                        projects = [], onNewBudget, onEditBudget, onDeleteBudget }) {
  const [month, setMonth] = useState("Apr 2026");
  const [openBudget, setOpenBudget] = useState("personal");
  const [monthPick, setMonthPick] = useState(false);
  const [cardMenu, setCardMenu] = useState(null);   // budget id whose menu is open
  const [delBudget, setDelBudget] = useState(null); // project budget pending deletion
  const [fw, setFw] = useState(() => localStorage.getItem("dhan-framework") || "50-30-20");
  const [fwOpen, setFwOpen] = useState(false);
  const [expanded, setExpanded] = useState("needs");
  const [editMode, setEditMode] = useState(false);
  const fwMeta = FRAMEWORKS.find(f => f.id === fw) || FRAMEWORKS[0];
  const months = ["Feb 2026", "Mar 2026", "Apr 2026"];
  const mIdx = months.indexOf(month);
  const budgets = [
    { cat: "food",      spent: 3200, cap: 5000 },
    { cat: "transport", spent: 1480, cap: 3000 },
    { cat: "shopping",  spent: 6200, cap: 5000 },
    { cat: "bills",     spent: 4299, cap: 6000 },
    { cat: "ent",       spent: 1120, cap: 2000 },
    { cat: "health",    spent: 615,  cap: 1500 },
    { cat: "groceries", spent: 3840, cap: 4000 },
  ];
  const fwBuckets = frameworkBuckets(fw);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalCap = budgets.reduce((s, b) => s + b.cap, 0);
  const overallPct = (totalSpent / totalCap) * 100;

  return (
    <Phone label="07 Budget">
      <StatusBar />
      <AppHeader onMenu={() => nav?.("more")} onSearch={() => nav?.("search")}
                 onNotify={() => nav?.("notifications")} />
      <div style={{ padding: "4px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Budget</div>
          <button className="gold-btn" style={{ fontSize: 12 }}
                  onClick={() => onNewBudget?.()}>+ Create new budget</button>
        </div>
        {/* Month picker */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fff", borderRadius: "var(--r-control)", padding: "4px 8px",
          border: "1px solid var(--border-subtle)",
        }}>
          <button onClick={() => mIdx > 0 && setMonth(months[mIdx - 1])}
            style={{ width: 36, height: 36, border: "none", background: "transparent",
                     borderRadius: 999, cursor: mIdx > 0 ? "pointer" : "not-allowed", opacity: mIdx > 0 ? 1 : .3 }}>
            <i className="ph ph-caret-left" style={{ fontSize: 16 }}/>
          </button>
          <button onClick={() => setMonthPick(true)} aria-label="Choose month" style={{
            border: "none", background: "transparent", cursor: "pointer", padding: "8px 12px",
            fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600, color: "#141C41",
            display: "flex", alignItems: "center", gap: 6 }}>
            {month}
          </button>
          <button onClick={() => mIdx < months.length - 1 && setMonth(months[mIdx + 1])}
            style={{ width: 36, height: 36, border: "none", background: "transparent",
                     borderRadius: 999, cursor: mIdx < months.length - 1 ? "pointer" : "not-allowed",
                     opacity: mIdx < months.length - 1 ? 1 : .3 }}>
            <i className="ph ph-caret-right" style={{ fontSize: 16 }}/>
          </button>
        </div>
      </div>

      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {/* Uncategorised — clean up before reviewing the budget */}
        <UncatCard nav={nav} />

        {/* Personal budget — card header, expands inline below itself */}
        <Card style={{ marginBottom: 16, padding: 14, cursor: "pointer" }} className="budget-card"
              onClick={() => setOpenBudget(o => o === "personal" ? null : "personal")}>
          <div style={{ display: "grid", gridTemplateColumns: "36px minmax(0,1fr) 40px",
                        gap: 10, alignItems: "center" }}>
            <IconChip icon="user" size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41" }}>Personal</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 1 }}>
                {fwMeta.name} framework
              </div>
            </div>
            <button aria-label="Personal budget actions"
                    onClick={(e) => { e.stopPropagation(); setCardMenu("personal"); }}
                    style={{ width: 40, height: 40, marginLeft: 4, border: "none",
                             background: "transparent", borderRadius: 999, cursor: "pointer",
                             color: "var(--fg-2)", display: "grid", placeItems: "center" }}>
              <i className="ph ph-dots-three-vertical" style={{ fontSize: 18 }}/>
            </button>
          </div>
          <div style={{ height: 6, background: "var(--bg-surface)", borderRadius: 999,
                        overflow: "hidden", marginTop: 10 }}>
            <div style={{ width: `${Math.min(overallPct, 100)}%`, height: "100%", borderRadius: 999,
                          background: overallPct > 100 ? "var(--expense)" : "var(--dhan-navy)",
                          transition: "width .6s var(--ease-out)" }}/>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 8, textAlign: "right",
                        whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: "#141C41" }}>
            ₹{totalSpent.toLocaleString("en-IN")}
            <span style={{ color: "var(--fg-3)", fontWeight: 400 }}> / ₹{totalCap.toLocaleString("en-IN")}</span>
          </div>
        </Card>

        {openBudget === "personal" && (<>
        {/* Overall ring card */}
        <Card style={{ marginBottom: 16, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Ring value={totalSpent} max={totalCap} size={120} stroke={12}
                  color={overallPct > 100 ? "var(--expense)" : "var(--dhan-navy)"}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(overallPct)}%
                </div>
                <div style={{ fontSize: 10, color: "var(--fg-3)", fontWeight: 600, marginTop: -2 }}>of budget</div>
              </div>
            </Ring>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 600, letterSpacing: "0.01em" }}>Spent</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                ₹{totalSpent.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                of ₹{totalCap.toLocaleString("en-IN")} total
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 10, lineHeight: 1.4 }}>
                You've got <b style={{ color: "var(--income)" }}>₹{(totalCap-totalSpent).toLocaleString("en-IN")}</b> left for 11 days.
              </div>
            </div>
          </div>
        </Card>

        {/* 50/30/20 segment bars */}
        <Card style={{ marginBottom: 16, padding: 16, background: "var(--dhan-gold-bg)", boxShadow: "none" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-2)",
                        letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
            {fwMeta.name} framework
          </div>
          <div style={{ height: 10, background: "rgba(20,28,65,0.08)",
                        borderRadius: 999, overflow: "hidden",
                        display: "flex", marginTop: 10 }}>
            {fwBuckets.map(b => (
              <div key={b.id} style={{ width: `${b.pct}%`, background: b.color }}/>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 10,
                        fontSize: 11, fontWeight: 600 }}>
            {fwBuckets.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color,
                               flexShrink: 0 }}/>
                <span style={{ color: "var(--fg-2)", whiteSpace: "nowrap" }}>{b.label} {b.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Buckets — categories nested inside, tap to expand */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      margin: "0 4px 16px", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em" }}>By category</div>
          <PlusLock locked={!isPlus} tag="left" onUpgrade={onUpgrade}>
            <button className="gold-btn" style={{ fontSize: 12 }}
                    onClick={() => setEditMode(e => !e)}>
              {editMode ? "Done editing" : "Edit categories"}
            </button>
          </PlusLock>
        </div>
        {editMode ? (
          <BudgetEditor budgets={budgets} txns={SAMPLE_TXNS} onDone={() => setEditMode(false)}
                        isPlus={isPlus} onUpgrade={onUpgrade} />
        ) : fwBuckets.map(bk => {
          const id = bk.id;
          const subs = id === "savings"
            ? SAVINGS_SUBS.map(s => ({ cat: s.id, name: s.name, icon: s.icon, color: s.color,
                                       spent: s.spent, cap: s.cap }))
            : budgets.filter(b => bk.cats.includes(b.cat))
                     .map(b => ({ cat: b.cat, name: CATEGORIES[b.cat].name,
                                  icon: CATEGORIES[b.cat].icon, color: CATEGORIES[b.cat].color,
                                  spent: b.spent, cap: b.cap }));
          const spent = subs.length ? subs.reduce((s, b) => s + b.spent, 0) : 0;
          const cap = subs.length ? subs.reduce((s, b) => s + b.cap, 0) : Math.round(totalCap * bk.pct / 100);
          const pct = Math.round((spent / cap) * 100);
          const over = spent > cap;
          const warning = pct >= 80 && !over;
          const tone = over ? "expense" : warning ? "warning" : "income";
          const label = over ? "Overspent" : warning ? "Warning" : "On track";
          const open = expanded === id;
          return (
            <Card key={id} style={{ marginBottom: 16, padding: 14 }}>
              <div onClick={() => setExpanded(o => o === id ? null : id)}
                   style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                              alignItems: "center", marginBottom: 10, gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <IconChip icon={bk.icon} size={36} color={bk.color} bg={bk.tint} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41" }}>{bk.label}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 1,
                                    fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        ₹{spent.toLocaleString("en-IN")} of ₹{cap.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusPill tone={tone}>{label}</StatusPill>
                    <i className="ph ph-caret-down" style={{
                      fontSize: 14, color: "var(--fg-3)",
                      transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform .2s var(--ease-out)" }}/>
                  </div>
                </div>
                <div style={{ height: 6, background: "var(--bg-surface)",
                              borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min(pct, 100)}%`, height: "100%",
                    background: over ? "var(--expense)" : warning ? "var(--warning)" : bk.color,
                    borderRadius: 999, transition: "width .6s var(--ease-out)",
                  }}/>
                </div>
              </div>

              {open && (
                <div style={{ marginTop: 14, paddingLeft: 12,
                              borderLeft: "1px solid var(--border-subtle)" }}>
                  {subs.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: "var(--fg-3)", padding: "2px 0 2px 8px" }}>
                      Transfers to savings goals · ₹{(bk.spent || 0).toLocaleString("en-IN")} this month
                    </div>
                  ) : subs.map((b, i) => {
                    const c = { name: b.name, icon: b.icon, color: b.color };
                    const sp = b.cap ? Math.round((b.spent / b.cap) * 100) : 0;
                    const so = b.spent > b.cap;
                    return (
                      <div key={b.cat} onClick={() => nav?.("cat-txns", { cat: b.cat, name: b.name, spent: b.spent, cap: b.cap, month })}
                           style={{ marginTop: i === 0 ? 0 : 12, paddingLeft: 8, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between",
                                      alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            {CATEGORIES[b.cat]
                              ? <CategoryIcon cat={b.cat} size={26} tint />
                              : <IconChip icon={b.icon} size={26} color={b.color} bg={b.color + "1F"} />}
                            <div style={{ fontSize: 13, fontWeight: 400, color: "var(--fg-2)" }}>{c.name}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap",
                                          fontVariantNumeric: "tabular-nums",
                                          color: so ? "var(--expense)" : "#141C41" }}>
                              ₹{b.spent.toLocaleString("en-IN")}
                              <span style={{ color: "var(--fg-3)", fontWeight: 400 }}> / ₹{b.cap.toLocaleString("en-IN")}</span>
                            </div>
                            <i className="ph ph-caret-right" style={{ fontSize: 12, color: "var(--fg-4)" }}/>
                          </div>
                        </div>
                        <div style={{ height: 4, background: "var(--bg-surface)",
                                      borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(sp, 100)}%`, height: "100%",
                                        background: so ? "var(--expense)" : b.color,
                                        borderRadius: 999 }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
        </>)}

        {/* Project budgets — same accordion, one level up */}
        {projects.map(p => {
          const spent = p.lines ? p.lines.reduce((s, l) => s + l.spent, 0) : p.spent || 0;
          const cap = p.lines ? p.lines.reduce((s, l) => s + l.cap, 0) : p.cap || 0;
          const pct = cap ? Math.round((spent / cap) * 100) : 0;
          const over = spent > cap;
          const open = openBudget === p.id;
          return (
            <div key={p.id}>
              <Card style={{ marginBottom: open ? 8 : 16, padding: 14, cursor: "pointer" }}
                    className="budget-card"
                    onClick={() => setOpenBudget(o => o === p.id ? null : p.id)}>
                <div style={{ display: "grid", gridTemplateColumns: "36px minmax(0,1fr) 40px",
                              gap: 10, alignItems: "center" }}>
                  <IconChip icon={p.icon || "target"} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41",
                                  whiteSpace: "nowrap", overflow: "hidden",
                                  textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 1 }}>
                      {p.subtitle || "Project budget"}
                    </div>
                  </div>
                  <button aria-label={`${p.name} budget actions`}
                          onClick={(e) => { e.stopPropagation(); setCardMenu(p.id); }}
                          style={{ width: 40, height: 40, marginLeft: 4, border: "none",
                                   background: "transparent", borderRadius: 999, cursor: "pointer",
                                   color: "var(--fg-2)", display: "grid", placeItems: "center" }}>
                    <i className="ph ph-dots-three-vertical" style={{ fontSize: 18 }}/>
                  </button>
                </div>
                <div style={{ height: 6, background: "var(--bg-surface)", borderRadius: 999,
                              overflow: "hidden", marginTop: 10 }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 999,
                                background: over ? "var(--expense)" : "var(--dhan-gold)",
                                transition: "width .6s var(--ease-out)" }}/>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 8, textAlign: "right",
                              whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
                              color: over ? "var(--expense)" : "#141C41" }}>
                  ₹{spent.toLocaleString("en-IN")}
                  <span style={{ color: "var(--fg-3)", fontWeight: 400 }}> / ₹{cap.toLocaleString("en-IN")}</span>
                </div>
              </Card>
              {open && (<>
                <BudgetOverview spent={spent} cap={cap}
                  note={cap
                    ? (over
                        ? <>You're <b style={{ color: "var(--expense)" }}>₹{(spent - cap).toLocaleString("en-IN")}</b> over this budget.</>
                        : <>You've got <b style={{ color: "var(--income)" }}>₹{(cap - spent).toLocaleString("en-IN")}</b> left on this budget.</>)
                    : "Set allocations to start tracking this budget."} />
                <BudgetBreakdown title={p.subtitle || "Project budget"}
                                 items={(p.lines || []).map((l, i) => ({ name: l.name, cap: l.cap,
                                                                         color: lineColor(i) }))} />
                {/* Category structure editing is Plus-gated on every budget, like Personal */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                              margin: "0 4px 12px", gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                                letterSpacing: "0.01em" }}>By category</div>
                  <PlusLock locked={!isPlus} tag="left" onUpgrade={onUpgrade}>
                    <button className="gold-btn" style={{ fontSize: 12 }}
                            onClick={(e) => { e.stopPropagation(); onEditBudget?.(p); }}>
                      Edit categories
                    </button>
                  </PlusLock>
                </div>
                <Card style={{ marginBottom: 16, padding: "0 16px" }}>
                  {/* Inherited budgets group their lines by framework bucket, like Personal */}
                  {(p.lines || []).some(l => l.bucket) ? frameworkBuckets(p.framework || fw).map(bk => {
                    const bid = bk.id;
                    const lines = (p.lines || []).filter(l => l.bucket === bid);
                    if (!lines.length) return null;
                    const bs = lines.reduce((s, l) => s + l.spent, 0);
                    const bc = lines.reduce((s, l) => s + l.cap, 0);
                    return (
                      <div key={bid} style={{ padding: "14px 0",
                        borderBottom: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between",
                                      alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <IconChip icon={bk.icon} size={26} color={bk.color} bg={bk.tint} />
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#141C41" }}>{bk.label}</div>
                          </div>
                          <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap",
                                        fontVariantNumeric: "tabular-nums", color: "#141C41" }}>
                            ₹{bs.toLocaleString("en-IN")}
                            <span style={{ color: "var(--fg-3)", fontWeight: 400 }}> / ₹{bc.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <div style={{ paddingLeft: 34, display: "grid", gap: 6 }}>
                          {lines.map(l => (
                            <div key={l.name} style={{ display: "flex", justifyContent: "space-between",
                                                       gap: 10, fontSize: 12.5 }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 6,
                                             color: "var(--fg-2)", minWidth: 0 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                                               background: lineColor((p.lines || []).indexOf(l)) }}/>
                                {l.name}
                              </span>
                              <span style={{ color: "var(--fg-3)", fontWeight: 500, whiteSpace: "nowrap",
                                             fontVariantNumeric: "tabular-nums" }}>
                                ₹{l.spent.toLocaleString("en-IN")} / ₹{l.cap.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }) : (p.lines || []).map((l, i, arr) => {
                    const lp = l.cap ? Math.round((l.spent / l.cap) * 100) : 0;
                    const lo = l.spent > l.cap;
                    return (
                      <div key={l.name} style={{ padding: "14px 0",
                        borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between",
                                      alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <div style={{ fontSize: 13, color: "var(--fg-2)" }}>{l.name}</div>
                          <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap",
                                        fontVariantNumeric: "tabular-nums",
                                        color: lo ? "var(--expense)" : "#141C41" }}>
                            ₹{l.spent.toLocaleString("en-IN")}
                            <span style={{ color: "var(--fg-3)", fontWeight: 400 }}> / ₹{l.cap.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: "var(--bg-surface)", borderRadius: 999,
                                      overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(lp, 100)}%`, height: "100%", borderRadius: 999,
                                        background: lo ? "var(--expense)" : lineColor(i) }}/>
                        </div>
                      </div>
                    );
                  })}
                  {!(p.lines || []).length && (
                    <div style={{ padding: "20px 0", fontSize: 12.5, color: "var(--fg-3)" }}>
                      No line items yet.
                    </div>
                  )}
                </Card>
              </>)}
            </div>
          );
        })}
      </div>
      <TabBar active={tab} onChange={setTab} />
      <BottomSheet open={monthPick} onClose={() => setMonthPick(false)} title="Jump to month">
        {[...new Set(months.map(mo => mo.split(" ")[1]))].map(yr => (
          <div key={yr} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em", margin: "0 4px 8px" }}>{yr}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(mo => {
                const key = `${mo} ${yr}`;
                const has = months.includes(key);
                const on = month === key;
                return (
                  <button key={key} disabled={!has}
                          onClick={() => { setMonth(key); setMonthPick(false); }}
                          style={{ height: 40, borderRadius: "var(--r-input)",
                                   cursor: has ? "pointer" : "not-allowed",
                                   border: "1px solid " + (on ? "#141C41" : "var(--border-subtle)"),
                                   background: on ? "#141C41" : "transparent",
                                   color: on ? "#fff" : "var(--fg-2)", opacity: has ? 1 : 0.35,
                                   fontFamily: "Poppins, sans-serif", fontSize: 13,
                                   fontWeight: on ? 600 : 500 }}>{mo}</button>
                );
              })}
            </div>
          </div>
        ))}
      </BottomSheet>

      {/* Per-card actions — same sheet pattern as Transaction Detail */}
      <BottomSheet open={!!cardMenu} onClose={() => setCardMenu(null)}
                   title={cardMenu === "personal" ? "Personal"
                        : (projects.find(p => p.id === cardMenu)?.name || "Budget")}>
        <div style={{ padding: "0 0 4px" }}>
          {[
            { i: "pencil-simple", l: "Edit", s: "Rename, change icon, adjust allocations",
              go: () => {
                const id = cardMenu;
                setCardMenu(null); setOpenBudget(id);
                if (id === "personal") {
                  // Same structural edit flow as project budgets.
                  onEditBudget?.({
                    id: "personal", name: "Personal", icon: "user", framework: fw,
                    subtitle: (FRAMEWORKS.find(f => f.id === fw)?.name || "") + " framework",
                    lines: frameworkBuckets(fw).flatMap(b => b.cats.map(c => ({
                      name: CATEGORIES[c].name, cat: c, bucket: b.id,
                      spent: (budgets.find(x => x.cat === c) || {}).spent || 0,
                      cap: (budgets.find(x => x.cat === c) || {}).cap || 0,
                    }))),
                  });
                } else onEditBudget?.(projects.find(p => p.id === id));
              } },
            ...(cardMenu && cardMenu !== "personal" ? [{
              i: "trash", l: "Delete", s: "Removes this budget and its categories", danger: true,
              go: () => { const p = projects.find(x => x.id === cardMenu);
                          setCardMenu(null); setDelBudget(p); },
            }] : []),
          ].map((a, i, arr) => (
            <div key={a.l} onClick={a.go} style={{
              display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, alignItems: "center",
              padding: "16px 0", cursor: "pointer",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <IconChip icon={a.i} color={a.danger ? "var(--expense)" : "#141C41"}
                        bg={a.danger ? "var(--expense-bg)" : "var(--bg-surface)"} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500,
                              color: a.danger ? "var(--expense)" : "#141C41" }}>{a.l}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{a.s}</div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={!!delBudget} onClose={() => setDelBudget(null)}
                   title={`Delete “${delBudget?.name || ""}”?`}>
        <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
          Transactions tagged to this budget will be untagged and remain visible under their
          original categories.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" full onClick={() => setDelBudget(null)}>Cancel</Button>
          <button onClick={() => { onDeleteBudget?.(delBudget); setDelBudget(null); }} style={{
            height: 48, borderRadius: "var(--r-control)", cursor: "pointer", border: "none",
            background: "var(--expense)", color: "#fff", fontFamily: "Poppins, sans-serif",
            fontSize: 14, fontWeight: 600,
          }}>Delete</button>
        </div>
      </BottomSheet>

      <FrameworkSheet open={fwOpen} onClose={() => setFwOpen(false)} current={fw}
                      onApply={(id) => { setFw(id); localStorage.setItem("dhan-framework", id); setFwOpen(false); }} />
    </Phone>
  );
}

// 39. CATEGORY TRANSACTIONS — one sub-category, scoped to a month
function CategoryTxnsScreen({ catId, name, month = "Apr 2026", spent = 0, cap = 0,
                              onBack, onOpenTxn, onOpenSheet, txns = SAMPLE_TXNS, budgetTag }) {
  const c = CATEGORIES[catId] || { name: name || catId, icon: "target", color: "#2E7D5B" };
  const [q, setQ] = useState("");
  const base = txns.filter(t => t.c === catId);
  const list = q ? base.filter(t => t.m.toLowerCase().includes(q.toLowerCase())) : base;
  const groups = {};
  list.forEach(t => { (groups[t.day] ||= []).push(t); });
  const over = spent > cap;
  const pct = cap ? Math.min(100, Math.round((spent / cap) * 100)) : 0;

  return (
    <Phone label="39 Category txns">
      <StatusBar />
      <ScreenHeader title={c.name} onBack={onBack}
        right={<button onClick={() => onOpenSheet?.("txn-filter")} aria-label="Filter"
          style={{ width: 40, height: 40, borderRadius: "var(--r-input)", background: "#fff",
                   border: "1px solid var(--border-subtle)", display: "grid",
                   placeItems: "center", cursor: "pointer" }}>
          <i className="ph ph-sliders-horizontal" style={{ fontSize: 18 }}/>
        </button>}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {/* Summary */}
        <Card style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr) auto",
                        gap: 16, alignItems: "center" }}>
            <IconChip icon={c.icon} color={c.color} bg={c.color + "1F"} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41" }}>
                {c.name} · {month}
              </div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                {list.length} transaction{list.length === 1 ? "" : "s"}
              </div>
            </div>
            <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                            color: over ? "var(--expense)" : "#141C41" }}>
                ₹{spent.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 1,
                            fontVariantNumeric: "tabular-nums" }}>
                of ₹{cap.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
          <div style={{ height: 6, background: "var(--bg-surface)", borderRadius: 999,
                        overflow: "hidden", marginTop: 14 }}>
            <div style={{ width: pct + "%", height: "100%", borderRadius: 999,
                          background: over ? "var(--expense)" : c.color }}/>
          </div>
        </Card>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--r-control)", padding: "0 12px", height: 44, marginBottom: 12,
        }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 18, color: "var(--fg-3)" }}/>
          <input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder={"Search in " + c.name}
                 style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                          fontFamily: "Poppins, sans-serif", fontSize: 14, color: "var(--fg-1)" }}/>
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--fg-3)" }}>
            <IconChip icon="magnifying-glass" size={56} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#141C41", marginTop: 16 }}>
              Nothing here yet
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              No {c.name.toLowerCase()} transactions in {month}.
            </div>
          </div>
        ) : Object.keys(groups).map(day => (
          <div key={day} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em", margin: "0 4px 8px" }}>{day}</div>
            <Card style={{ padding: "4px 16px" }}>
              {groups[day].map((t, i) => (
                <TxnRow key={t.id} merchant={t.m} meta={t.s} amount={t.a} cat={t.c}
                    isForeign={t.isForeignTransaction} currency={t.originalCurrency}
                    budgetTag={budgetTag?.(t)}
                    originalAmount={t.originalAmount}
                        last={i === groups[day].length - 1}
                        onClick={() => onOpenTxn?.(t)} />
              ))}
            </Card>
          </div>
        ))}
      </div>
    </Phone>
  );
}

// 08. BILLS & SUBSCRIPTIONS
function BillsScreen({ tab, setTab, onOpenSheet, billsState, onTogglePaid, onOpenBill, nav }) {
  const bills = billsState;
  const dueSoon = bills.filter(b => b.status === "due-soon");
  const unpaid = bills.filter(b => b.status !== "paid");
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amt, 0);
  const totalMonthly = bills.reduce((s, b) => s + b.amt, 0);
  const byCat = {
    "Home":   bills.filter(b => ["rent", "elec", "gas"].includes(b.id)),
    "Internet & TV": bills.filter(b => ["airtel", "netflix"].includes(b.id)),
    "Lifestyle":   bills.filter(b => ["spotify", "gym"].includes(b.id)),
  };

  return (
    <Phone label="08 Bills">
      <StatusBar />
      <AppHeader onMenu={() => nav?.("more")} onSearch={() => nav?.("search")}
                 onNotify={() => nav?.("notifications")} />
      <div style={{ padding: "4px 16px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Bills & subs</div>
          <button onClick={() => onOpenSheet?.("add-bill")} style={{
            width: 40, height: 40, borderRadius: "var(--r-input)",
            background: "var(--dhan-navy)", color: "#fff", border: "none",
            display: "grid", placeItems: "center", cursor: "pointer",
          }}>
            <i className="ph ph-plus" style={{ fontSize: 20 }}/>
          </button>
        </div>

        {/* Total monthly */}
        <div style={{ background: "var(--dhan-navy)", borderRadius: "var(--r-card)",
                      padding: 16, color: "#fff", marginBottom: 16,
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.7,
                          letterSpacing: "0.01em" }}>
              Still due this month
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 2,
                          fontVariantNumeric: "tabular-nums" }}>
              ₹{totalUnpaid.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
              {bills.filter(b => b.status === "paid").length} of {bills.length} paid · ₹{totalMonthly.toLocaleString("en-IN")} total
            </div>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 999,
                        background: "rgba(201,168,76,.2)", color: "var(--dhan-gold-soft)",
                        display: "grid", placeItems: "center" }}>
            <i className="ph-fill ph-receipt" style={{ fontSize: 22 }}/>
          </div>
        </div>
      </div>

      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {/* Due soon */}
        {dueSoon.length > 0 && (
          <>
            <SectionHead title="Due soon" />
            {dueSoon.map(b => (
              <Card key={b.id} style={{ marginBottom: 8, padding: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 12,
                              alignItems: "center", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
                                background: "var(--warning-bg)", color: "var(--warning)",
                                display: "grid", placeItems: "center" }}>
                    <i className={`ph ph-${b.icon}`} style={{ fontSize: 20 }}/>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: "var(--warning)", fontWeight: 600, marginTop: 2 }}>
                      Due {b.due} · in {b.dueIn}d
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                    ₹{b.amt.toLocaleString("en-IN")}
                  </div>
                </div>
                <Button variant="primary" full size="sm" icon="check-circle"
                        onClick={() => onTogglePaid?.(b.id)}>
                  Mark as paid
                </Button>
              </Card>
            ))}
          </>
        )}

        {/* Full list by category */}
        <div style={{ marginTop: 18 }}>
          {Object.entries(byCat).map(([cat, items]) => items.length > 0 && (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                            letterSpacing: "0.01em",
                            margin: "0 4px 8px" }}>{cat}</div>
              {items.map(b => {
                const stMeta = {
                  "upcoming": { tone: "info",    label: "Upcoming" },
                  "due-soon": { tone: "warning", label: "Due soon" },
                  "paid":     { tone: "income",  label: "Paid" },
                }[b.status];
                return (
                  <Card key={b.id} onClick={() => onOpenBill?.(b)} style={{ marginBottom: 6, padding: 12,
                                             display: "grid",
                                             gridTemplateColumns: "40px 1fr auto",
                                             gap: 12, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
                                  background: "var(--bg-surface)", display: "grid",
                                  placeItems: "center", color: "var(--dhan-navy)" }}>
                      <i className={`ph ph-${b.icon}`} style={{ fontSize: 20 }}/>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                        Due {b.due}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, fontSize: 14,
                                    fontVariantNumeric: "tabular-nums" }}>
                        ₹{b.amt.toLocaleString("en-IN")}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <StatusPill tone={stMeta.tone}>{stMeta.label}</StatusPill>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <TabBar active={tab} onChange={setTab} />
    </Phone>
  );
}

Object.assign(window, {
  SAMPLE_TXNS, UPCOMING_BILLS, FRAMEWORKS, FRAMEWORK_BUCKETS, frameworkBuckets,
  HomeScreen, TransactionsScreen, BudgetScreen, BillsScreen,
  UncatCard, UncategorisedScreen, CategoryTxnsScreen,
  FrameworkSheet, FRAMEWORKS,
  BUCKETS,
  SAMPLE_TXNS, UPCOMING_BILLS, UNCAT_TXNS,
});
