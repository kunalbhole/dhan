// ─── 41. UNIFIED SEARCH (local-first, no server round-trip) ──
const { useState: uSe, useEffect: uSeE, useMemo: uSeM } = React;
const NAVY_SE = "#141C41";
const RECENTS_KEY = "dhan.search.recents.v1";

const readRecents = () => {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]").slice(0, 5); }
  catch { return []; }
};

// Everything the app holds on-device, flattened into one searchable index.
function buildIndex({ txns = [], bills = [], budgets = [], people = [] }) {
  const items = [];
  txns.forEach(t => items.push({
    kind: "txn", id: "t" + t.id, ref: t,
    title: t.m, sub: t.s,
    hay: [t.m, t.s, CATEGORIES[t.c]?.name, Math.abs(t.a), (t.tags || []).join(" "), t.note]
      .filter(Boolean).join(" ").toLowerCase(),
  }));
  budgets.forEach(b => items.push({
    kind: "budget", id: "b" + b.id, ref: b,
    title: b.name, sub: b.subtitle || "Budget",
    hay: [b.name, b.subtitle, ...(b.lines || []).map(l => l.name)].filter(Boolean).join(" ").toLowerCase(),
  }));
  bills.forEach(b => items.push({
    kind: "bill", id: "l" + b.id, ref: b,
    title: b.name, sub: `Due ${b.due} · ₹${b.amt.toLocaleString("en-IN")}`,
    hay: [b.name, b.due, b.amt].join(" ").toLowerCase(),
  }));
  people.forEach(f => items.push({
    kind: "person", id: "p" + f.id, ref: f,
    title: f.name, sub: f.last || f.phone,
    hay: [f.name, f.phone, f.last].filter(Boolean).join(" ").toLowerCase(),
  }));
  return items;
}

const GROUPS = [
  { kind: "txn",    label: "Transactions", to: "txn" },
  { kind: "budget", label: "Budgets",      to: "budget" },
  { kind: "bill",   label: "Bills",        to: "bills" },
  { kind: "person", label: "People",       to: "splits" },
];

function SearchScreen({ onBack, nav, onOpenTxn, onOpenFriend, onOpenBill,
                        txns, bills, budgets, people }) {
  const [q, setQ] = uSe("");
  const [recents, setRecents] = uSe(readRecents);
  const index = uSeM(() => buildIndex({ txns, bills, budgets, people }),
                     [txns, bills, budgets, people]);

  const term = q.trim().toLowerCase();
  const hits = uSeM(() => {
    if (!term) return [];
    return index.filter(x => x.hay.includes(term));
  }, [term, index]);

  const remember = (value) => {
    const v = value.trim();
    if (!v) return;
    const next = [v, ...recents.filter(r => r.toLowerCase() !== v.toLowerCase())].slice(0, 5);
    setRecents(next);
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch {}
  };

  const open = (item) => {
    remember(q);
    if (item.kind === "txn") onOpenTxn?.(item.ref);
    else if (item.kind === "person") onOpenFriend?.(item.ref);
    else if (item.kind === "bill") onOpenBill?.(item.ref);
    else nav?.("budget");
  };

  const rowIcon = (item) => {
    if (item.kind === "txn") return <CategoryIcon cat={item.ref.c} tint />;
    if (item.kind === "person") return <ContactAvatar f={item.ref} size={40} fontSize={13} />;
    return <IconChip icon={item.kind === "bill" ? (item.ref.icon || "receipt") : (item.ref.icon || "wallet")} />;
  };

  const amountOf = (item) => {
    if (item.kind === "txn") {
      const inc = item.ref.a > 0;
      return <span style={{ color: inc ? "var(--income)" : "var(--fg-1)" }}>
        {inc ? "+" : "−"}₹{Math.abs(item.ref.a).toLocaleString("en-IN")}
      </span>;
    }
    if (item.kind === "bill") return `₹${item.ref.amt.toLocaleString("en-IN")}`;
    if (item.kind === "person") {
      const n = item.ref.net || 0;
      if (!n) return <span style={{ color: "var(--fg-3)" }}>Settled</span>;
      return <span style={{ color: n > 0 ? "var(--income)" : "var(--expense)" }}>
        ₹{Math.abs(n).toLocaleString("en-IN")}
      </span>;
    }
    const cap = (item.ref.lines || []).reduce((s, l) => s + (l.cap || 0), 0);
    return cap ? `₹${cap.toLocaleString("en-IN")}` : "";
  };

  return (
    <Phone bg="#fff" label="41 Search">
      <StatusBar />
      {/* Search field lives in the header slot — the icon opens a real input */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 12px" }}>
        <button onClick={onBack} aria-label="Back" style={{
          width: 40, height: 40, borderRadius: "var(--r-control)", background: "#fff",
          border: "1px solid var(--border-subtle)", display: "grid", placeItems: "center",
          cursor: "pointer", color: "var(--fg-1)", flexShrink: 0,
        }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 20 }}/>
        </button>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8,
                      height: 44, padding: "0 12px", borderRadius: "var(--r-input)",
                      background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 16, color: "var(--fg-3)" }}/>
          <input value={q} autoFocus onChange={(e) => setQ(e.target.value)}
                 onBlur={() => remember(q)} placeholder="Search Dhan"
                 aria-label="Search transactions, budgets, bills and people"
                 style={{ flex: 1, minWidth: 0, border: "none", outline: "none",
                          background: "transparent", fontFamily: "Poppins, sans-serif",
                          fontSize: 14, color: NAVY_SE }}/>
          {!!q && (
            <button onClick={() => setQ("")} aria-label="Clear search" style={{
              border: "none", background: "none", cursor: "pointer", padding: 4,
              color: "var(--fg-3)", display: "grid", placeItems: "center" }}>
              <i className="ph ph-x-circle" style={{ fontSize: 16 }}/>
            </button>
          )}
        </div>
      </div>

      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {!term ? (
          recents.length ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                            margin: "4px 4px 8px", gap: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                              letterSpacing: "0.01em" }}>Recent searches</div>
                <button onClick={() => { setRecents([]);
                          try { localStorage.removeItem(RECENTS_KEY); } catch {} }}
                        style={{ border: "none", background: "none", cursor: "pointer",
                                 padding: "6px 4px", margin: "-6px -4px",
                                 fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500,
                                 color: NAVY_SE }}>Clear</button>
              </div>
              <Card style={{ padding: "0 16px" }}>
                {recents.map((r, i) => (
                  <div key={r} onClick={() => setQ(r)} style={{
                    display: "grid", gridTemplateColumns: "40px 1fr 16px", gap: 16,
                    alignItems: "center", padding: "16px 0", cursor: "pointer",
                    borderBottom: i === recents.length - 1 ? "none" : "1px solid var(--border-subtle)",
                  }}>
                    <IconChip icon="clock-counter-clockwise" />
                    <div style={{ fontSize: 14, color: "var(--fg-2)" }}>{r}</div>
                    <i className="ph ph-arrow-up-left" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
                  </div>
                ))}
              </Card>
            </>
          ) : (
            <div style={{ padding: "48px 8px", textAlign: "center" }}>
              <IconChip icon="magnifying-glass" size={48} />
              <div style={{ fontSize: 13, color: "var(--fg-3)", lineHeight: 1.5,
                            margin: "16px auto 0", maxWidth: 240 }}>
                Search transactions, budgets, bills, and people.
              </div>
            </div>
          )
        ) : !hits.length ? (
          <div style={{ padding: "48px 8px", textAlign: "center" }}>
            <IconChip icon="magnifying-glass-minus" size={48} />
            <div style={{ fontSize: 15, fontWeight: 500, color: NAVY_SE, marginTop: 16 }}>
              No results for “{q.trim()}”
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-3)", lineHeight: 1.5,
                          margin: "8px auto 0", maxWidth: 250 }}>
              Check the spelling or try a different term.
            </div>
          </div>
        ) : (
          GROUPS.map(g => {
            const found = hits.filter(h => h.kind === g.kind);
            if (!found.length) return null;
            const shown = found.slice(0, 3);
            return (
              <div key={g.kind} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                              letterSpacing: "0.01em", margin: "0 4px 8px" }}>
                  {g.label} · {found.length}
                </div>
                <Card style={{ padding: "0 16px" }}>
                  {shown.map((item, i) => (
                    <div key={item.id} onClick={() => open(item)} style={{
                      display: "grid", gridTemplateColumns: "40px minmax(0,1fr) auto 16px", gap: 16,
                      alignItems: "center", padding: "16px 0", cursor: "pointer",
                      borderBottom: i === shown.length - 1 ? "none" : "1px solid var(--border-subtle)",
                    }}>
                      {rowIcon(item)}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-2)",
                                      whiteSpace: "nowrap", overflow: "hidden",
                                      textOverflow: "ellipsis" }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2,
                                      whiteSpace: "nowrap", overflow: "hidden",
                                      textOverflow: "ellipsis" }}>{item.sub}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                                    fontVariantNumeric: "tabular-nums" }}>{amountOf(item)}</div>
                      <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
                    </div>
                  ))}
                </Card>
                {found.length > shown.length && (
                  <button onClick={() => { remember(q); nav?.(g.to); }} style={{
                    border: "none", background: "none", cursor: "pointer", padding: "10px 4px 0",
                    display: "flex", alignItems: "center", gap: 4,
                    fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500, color: NAVY_SE,
                  }}>
                    See all in {g.label}
                    <i className="ph ph-caret-right" style={{ fontSize: 12 }}/>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Phone>
  );
}

Object.assign(window, { SearchScreen, buildIndex });
