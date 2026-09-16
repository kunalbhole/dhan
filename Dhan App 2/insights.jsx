// ─── 19. Insights — summary recap + insight feed ───
const { useState: uIn } = React;
const NAVY_IN = "#141C41";
const GOLD_IN = "#C9A84C";

const INSIGHT_PERIODS = {
  week: {
    label: "This week", range: "Mon 31 Aug – today",
    spent: 8210, delta: -12, prev: "last week",
    topCat: "shopping", topAmt: 3120, rate: 24,
  },
  month: {
    label: "This month", range: "1 – 3 Sep",
    spent: 17114, delta: 8, prev: "August",
    topCat: "bills", topAmt: 4299, rate: 19,
  },
};

const INSIGHT_FEED = [
  { id: "shop", tone: "warn", icon: "trend-up",
    t: "Shopping overspent 3 weeks running",
    b: "₹6,200 against a ₹5,000 cap. Myntra is most of it.",
    go: { view: "txn", cat: "shopping" } },
  { id: "streak", tone: "good", icon: "flame",
    t: "12 days under budget",
    b: "Your longest streak yet — ₹2,400 below pace.",
    go: { view: "budget" } },
  { id: "food", tone: "warn", icon: "fork-knife",
    t: "Food creeping up 15% this month",
    b: "₹3,200 so far, mostly weekday delivery orders.",
    go: { view: "txn", cat: "food" } },
  { id: "bills", tone: "info", icon: "receipt",
    t: "Bills are your steadiest cost",
    b: "₹4,299 every month for the last six months.",
    go: { view: "txn", cat: "bills" } },
  { id: "tue", tone: "info", icon: "calendar-check",
    t: "Tuesdays are your cheapest day",
    b: "You spend 45% less than on weekends.",
    go: { view: "txn" } },
];

const INSIGHT_TONES = {
  warn: { c: "var(--warning)", bg: "var(--warning-bg)" },
  good: { c: "var(--income)",  bg: "var(--income-bg)" },
  info: { c: "#4F8FAF",        bg: "rgba(79,143,175,.14)" },
};

function InsightsScreen({ onBack, isPlus, tab, setTab, nav, onFilterCat }) {
  const [period, setPeriod] = uIn("week");
  const p = INSIGHT_PERIODS[period];
  const down = p.delta < 0;
  const cat = CATEGORIES[p.topCat];

  return (
    <Phone label="19 Insights">
      <StatusBar />
      <ScreenHeader title="Insights" onBack={onBack}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>

        {/* SECTION 1 — Summary */}
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                      letterSpacing: "0.01em", margin: "0 4px 8px" }}>Summary</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                      background: "var(--bg-surface)", borderRadius: "var(--r-control)",
                      padding: 4, marginBottom: 8 }}>
          {Object.keys(INSIGHT_PERIODS).map(id => (
            <button key={id} onClick={() => setPeriod(id)} style={{
              height: 36, borderRadius: "var(--r-input)", border: "none", cursor: "pointer",
              background: period === id ? "var(--bg-elevated)" : "transparent",
              color: period === id ? NAVY_IN : "var(--fg-3)",
              fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 600,
              boxShadow: period === id ? "var(--shadow-card)" : "none",
            }}>{INSIGHT_PERIODS[id].label}</button>
          ))}
        </div>

        <Card style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>Total spent · {p.range}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: NAVY_IN,
                          letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              ₹{p.spent.toLocaleString("en-IN")}
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2,
                           fontSize: 12.5, fontWeight: 600,
                           color: down ? "var(--income)" : "var(--expense)" }}>
              <i className={"ph-fill ph-trend-" + (down ? "down" : "up")} style={{ fontSize: 13 }}/>
              {Math.abs(p.delta)}% vs {p.prev}
            </span>
          </div>

          <div style={{ marginTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
                          alignItems: "center", padding: "16px 0",
                          borderBottom: "1px solid var(--border-subtle)" }}>
              <IconChip icon={cat.icon} color={cat.color} bg={cat.color + "1F"} />
              <div style={{ fontSize: 14, color: "var(--fg-2)" }}>Biggest category</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: NAVY_IN, textAlign: "right",
                            fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {cat.name} · ₹{p.topAmt.toLocaleString("en-IN")}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
                          alignItems: "center", padding: "16px 0 0" }}>
              <IconChip icon="piggy-bank" color="var(--income)" bg="var(--income-bg)" />
              <div style={{ fontSize: 14, color: "var(--fg-2)" }}>Savings rate</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: NAVY_IN,
                            fontVariantNumeric: "tabular-nums" }}>{p.rate}%</div>
            </div>
          </div>
        </Card>

        {/* SECTION 2 — Insights */}
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                      letterSpacing: "0.01em", margin: "0 4px 8px" }}>Insights</div>

        {INSIGHT_FEED.map(n => {
          const tone = INSIGHT_TONES[n.tone];
          return (
            <Card key={n.id} onClick={() => { onFilterCat?.(n.go.cat); nav?.(n.go.view); }}
                  style={{ padding: 14, marginBottom: 8, cursor: "pointer",
                           display: "grid", gridTemplateColumns: "40px 1fr 16px",
                           gap: 16, alignItems: "center" }}>
              <IconChip icon={n.icon} color={tone.c} bg={tone.bg} fill />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY_IN,
                              lineHeight: 1.3, textWrap: "pretty" }}>{n.t}</div>
                <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2,
                              lineHeight: 1.4 }}>{n.b}</div>
              </div>
              <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
            </Card>
          );
        })}

        {/* Plus teaser — visual only in V1 */}
        <Card style={{ padding: 14, marginTop: 8,
                       display: "grid", gridTemplateColumns: "40px 1fr auto",
                       gap: 16, alignItems: "center" }}>
          <div style={{ position: "relative", width: 40, height: 40 }}>
            <span style={{ display: "block", opacity: 0.5 }}>
              <IconChip icon="sparkle" color={GOLD_IN} bg="var(--dhan-gold-bg)" fill />
            </span>
            <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18,
                           borderRadius: 999, background: "var(--dhan-navy)", color: "#fff",
                           boxShadow: "0 0 0 2px var(--bg-elevated)", zIndex: 2,
                           display: "grid", placeItems: "center" }}>
              <i className="ph-fill ph-lock-simple" style={{ fontSize: 9 }}/>
            </span>
          </div>
          <div style={{ minWidth: 0, opacity: 0.5 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: NAVY_IN }}>AI-powered insights</div>
            <div style={{ fontSize: 12.5, color: "var(--fg-3)", marginTop: 2, lineHeight: 1.4 }}>
              Deeper trend breakdowns and personalized tips — included with Dhan Plus
            </div>
          </div>
          <span style={{ background: "var(--dhan-gold)", color: "#141C41",
                         fontSize: 11.5, fontWeight: 700, padding: "7px 14px",
                         borderRadius: 999, whiteSpace: "nowrap" }}>Upgrade</span>
        </Card>
      </div>
      {tab && setTab && <TabBar active={tab} onChange={setTab} />}
    </Phone>
  );
}

// Home teaser — jumps straight to the Insights summary
function InsightsTeaser({ nav }) {
  const p = INSIGHT_PERIODS.week;
  return (
    <Card onClick={() => nav?.("insights")}
          style={{ padding: 14, marginBottom: 16, cursor: "pointer",
                   display: "grid", gridTemplateColumns: "40px 1fr 16px",
                   gap: 16, alignItems: "center" }}>
      <IconChip icon="trend-down" color="var(--income)" bg="var(--income-bg)" fill />
      <div style={{ minWidth: 0, fontSize: 13.5, color: NAVY_IN, lineHeight: 1.4 }}>
        You spent <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          ₹{p.spent.toLocaleString("en-IN")}</span> this week —
        <span style={{ color: "var(--income)", fontWeight: 600 }}> down {Math.abs(p.delta)}%</span>
      </div>
      <i className="ph ph-arrow-right" style={{ fontSize: 15, color: GOLD_IN }}/>
    </Card>
  );
}

Object.assign(window, { InsightsScreen, InsightsTeaser, INSIGHT_PERIODS, INSIGHT_FEED });
