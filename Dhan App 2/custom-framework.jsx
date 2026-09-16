// ─── Custom framework builder (per-budget) ──────────────────
const { useState: uCf, useEffect: uCfE } = React;
const NAVY_CF = "#141C41";

const CF_ICONS = ["house-line", "confetti", "piggy-bank", "fork-knife", "car-simple",
                  "briefcase", "gift", "heartbeat", "graduation-cap", "airplane-takeoff"];
// Existing category-coding palette — no arbitrary hues.
const CF_COLORS = ["var(--dhan-navy)", "var(--dhan-gold)", "var(--income)", "#6A8FD4",
                   "#C97BB6", "#E88B5C", "#5CB4A8", "#B079D9"];

const newBucket = (i) => ({
  key: "bk" + Date.now().toString(36) + i,
  name: "", icon: CF_ICONS[i % CF_ICONS.length], color: CF_COLORS[i % CF_COLORS.length],
  alloc: "", subs: [],
});

// Full-screen overlay inside the phone frame, so it works from the create and
// edit sheets alike without app-level routing.
function CustomFrameworkBuilder({ open, onClose, onSave, budgetTotal, initial }) {
  // Mounted inside a BottomSheet, so inset:0 would resolve against the sheet.
  // Portal into the phone frame instead — the overlay then covers the app chrome.
  // The sheets render outside the <Phone> subtree, so closest() can't find the
  // frame — query the live phone frame directly (same geometry as .screen-in).
  const [host, setHost] = uCf(null);
  uCfE(() => {
    if (!open) { setHost(null); return; }
    setHost(document.querySelector(".screen-in [data-screen-label]")
         || document.querySelector("[data-screen-label]"));
  }, [open]);
  const [mode, setMode] = uCf("percent");   // percent | amount
  const [buckets, setBuckets] = uCf([]);
  const [edit, setEdit] = uCf(null);        // bucket key whose icon/colour tray is open
  const [subDraft, setSubDraft] = uCf({});  // bucket key -> in-progress sub-category name

  uCfE(() => {
    if (!open) return;
    setEdit(null); setSubDraft({});
    if (initial && initial.buckets && initial.buckets.length) {
      setMode(initial.mode || "percent");
      setBuckets(initial.buckets.map((b, i) => ({ ...newBucket(i), ...b })));
    } else {
      setMode("percent");
      setBuckets([newBucket(0), newBucket(1)]);
    }
  }, [open]);

  if (!open) return null;

  const patch = (key, fields) => setBuckets(bs => bs.map(b => b.key === key ? { ...b, ...fields } : b));
  const total = buckets.reduce((s, b) => s + (parseFloat(b.alloc) || 0), 0);
  const named = buckets.filter(b => b.name.trim());
  const isPct = mode === "percent";
  const capped = !isPct && !!budgetTotal;
  const balanced = isPct ? Math.abs(total - 100) < 0.01
                         : (capped ? Math.abs(total - budgetTotal) < 0.01 : total > 0);
  const valid = named.length >= 2 && named.length === buckets.length && balanced;

  const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

  const addSub = (b) => {
    const v = (subDraft[b.key] || "").trim();
    if (!v || b.subs.some(s => s.name.toLowerCase() === v.toLowerCase())) return;
    patch(b.key, { subs: [...b.subs, { name: v, icon: CF_ICONS[b.subs.length % CF_ICONS.length] }] });
    setSubDraft(d => ({ ...d, [b.key]: "" }));
  };

  const save = () => onSave?.({
    mode,
    buckets: buckets.map(b => ({ name: b.name.trim(), icon: b.icon, color: b.color,
                                 alloc: parseFloat(b.alloc) || 0,
                                 subs: b.subs.map(s => ({ ...s })) })),
  });

  const textLink = {
    border: "none", background: "none", cursor: "pointer", padding: "8px 4px", margin: "-8px -4px",
    display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "Poppins, sans-serif",
    fontSize: 12, fontWeight: 600, color: "var(--dhan-gold)",
  };
  const nameInput = {
    width: "100%", minWidth: 0, boxSizing: "border-box", height: 40,
    borderRadius: "var(--r-input)", border: "1px solid var(--border-default)",
    background: "var(--bg-elevated)", padding: "0 12px", outline: "none",
    fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 500, color: NAVY_CF,
  };
  const allocInput = {
    ...nameInput, width: 92, textAlign: "right", fontVariantNumeric: "tabular-nums",
  };

  const overlay = (
    <div style={{ position: "absolute", inset: 0, background: "var(--bg-surface)", zIndex: 120,
                  display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <ScreenHeader title="Custom framework" onBack={onClose} />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        <div style={{ fontSize: 12.5, color: "var(--fg-3)", lineHeight: 1.5, margin: "0 4px 16px" }}>
          Build your own buckets and sub-categories. This structure belongs to this budget only.
        </div>

        {/* Allocation mode */}
        <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 4px 8px" }}>Allocate by</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[{ id: "percent", l: "Percentage" }, { id: "amount", l: "Fixed amount" }].map(o => (
            <Chip key={o.id} active={mode === o.id} onClick={() => setMode(o.id)}
                  style={{ flex: 1, justifyContent: "center" }}>{o.l}</Chip>
          ))}
        </div>

        {buckets.map((b, bi) => (
          <Card key={b.key} style={{ padding: 14, marginBottom: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr) auto",
                          gap: 10, alignItems: "center" }}>
              <button onClick={() => setEdit(e => e === b.key ? null : b.key)}
                      aria-label="Change icon and colour" style={{
                        width: 40, height: 40, borderRadius: "var(--r-input)", cursor: "pointer",
                        border: "1px solid var(--border-subtle)", background: "var(--bg-surface)",
                        color: b.color, display: "grid", placeItems: "center", padding: 0 }}>
                <Glyph icon={b.icon} size={18} />
              </button>
              <input value={b.name} placeholder={`Bucket ${bi + 1} name`}
                     aria-label={`Bucket ${bi + 1} name`} style={nameInput}
                     onChange={(e) => patch(b.key, { name: e.target.value })}/>
              <input value={b.alloc} inputMode="decimal" placeholder={isPct ? "0%" : "₹0"}
                     aria-label={`Allocation for bucket ${bi + 1}`} style={allocInput}
                     onChange={(e) => patch(b.key, { alloc: e.target.value.replace(/[^\d.]/g, "") })}/>
            </div>

            {edit === b.key && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 8 }}>Icon</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {CF_ICONS.map(ic => (
                    <button key={ic} onClick={() => patch(b.key, { icon: ic })} aria-label={ic} style={{
                      width: 38, height: 38, borderRadius: "var(--r-input)", cursor: "pointer",
                      border: "1px solid " + (b.icon === ic ? NAVY_CF : "var(--border-subtle)"),
                      background: b.icon === ic ? NAVY_CF : "transparent",
                      color: b.icon === ic ? "#fff" : "var(--fg-2)",
                      display: "grid", placeItems: "center" }}>
                      <Glyph icon={ic} size={16} />
                    </button>
                  ))}
                  <EmojiTile value={b.icon} onChange={(em) => patch(b.key, { icon: em })}
                             size={38} iconSize={16} activeBg={NAVY_CF} />
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 8 }}>Colour</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CF_COLORS.map(c => (
                    <button key={c} onClick={() => patch(b.key, { color: c })} aria-label="Bucket colour"
                            style={{ width: 30, height: 30, borderRadius: 999, cursor: "pointer",
                                     background: c, padding: 0,
                                     border: b.color === c ? "2px solid " + NAVY_CF : "1px solid var(--border-subtle)",
                                     boxShadow: b.color === c ? "inset 0 0 0 2px #fff" : "none" }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-categories */}
            {!!b.subs.length && (
              <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                {b.subs.map(s => (
                  <div key={s.name} style={{ display: "grid", gridTemplateColumns: "18px minmax(0,1fr) 24px",
                                             gap: 8, alignItems: "center" }}>
                    <i className={`ph ph-${s.icon}`} style={{ fontSize: 14, color: b.color }}/>
                    <div style={{ fontSize: 13, color: "var(--fg-2)", whiteSpace: "nowrap",
                                  overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    <button onClick={() => patch(b.key, { subs: b.subs.filter(x => x.name !== s.name) })}
                            aria-label={`Remove ${s.name}`} style={{
                              border: "none", background: "none", cursor: "pointer", padding: 0,
                              color: "var(--fg-4)", display: "grid", placeItems: "center" }}>
                      <i className="ph ph-x" style={{ fontSize: 13 }}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 8,
                          marginTop: 12 }}>
              <input value={subDraft[b.key] || ""} placeholder="Sub-category name"
                     aria-label={`Sub-category for ${b.name || "bucket " + (bi + 1)}`}
                     onChange={(e) => setSubDraft(d => ({ ...d, [b.key]: e.target.value }))}
                     onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSub(b); } }}
                     style={{ ...nameInput, height: 36, fontSize: 13, fontWeight: 400 }}/>
              <button style={textLink} onClick={() => addSub(b)}>+ Add sub-category</button>
            </div>

            {buckets.length > 2 && (
              <button onClick={() => setBuckets(bs => bs.filter(x => x.key !== b.key))}
                      style={{ ...textLink, color: "var(--expense)", marginTop: 10 }}>
                Remove bucket
              </button>
            )}
          </Card>
        ))}

        <button style={{ ...textLink, marginTop: 4 }}
                onClick={() => setBuckets(bs => [...bs, newBucket(bs.length)])}>
          + Add bucket
        </button>

        {/* Running total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                      gap: 12, padding: "16px 4px 0" }}>
          <div style={{ fontSize: 12.5, color: "var(--fg-2)", fontVariantNumeric: "tabular-nums" }}>
            {isPct ? `${Math.round(total)}% of 100%`
                   : capped ? `${money(total)} of ${money(budgetTotal)}`
                            : `${money(total)} allocated`}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600,
                        color: balanced ? "var(--income)" : "var(--expense)" }}>
            {balanced ? "Balanced"
              : isPct ? (total < 100 ? `${Math.round(100 - total)}% left` : `${Math.round(total - 100)}% over`)
              : capped ? (total < budgetTotal ? `${money(budgetTotal - total)} left` : `${money(total - budgetTotal)} over`)
              : "Add an allocation"}
          </div>
        </div>
        {!isPct && !capped && (
          <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.4, padding: "6px 4px 0" }}>
            No overall total set for this budget, so allocations aren't capped.
          </div>
        )}
      </div>

      <div style={{ padding: 16, borderTop: "1px solid var(--border-subtle)",
                    background: "var(--bg-elevated)" }}>
        <Button variant="primary" full size="lg" disabled={!valid} onClick={save}>Continue</Button>
      </div>
    </div>
  );

  return host ? ReactDOM.createPortal(overlay, host) : null;
}

// Seed the builder from a standard framework so converting to Custom isn't a blank slate.
function frameworkToCustom(fwId) {
  const buckets = (window.frameworkBuckets ? frameworkBuckets(fwId) : []).map(b => ({
    name: b.label, icon: b.icon,
    color: CF_COLORS.includes(b.color) ? b.color : CF_COLORS[0],
    alloc: b.pct,
    subs: b.cats.map(c => ({ name: CATEGORIES[c].name, icon: CATEGORIES[c].icon })),
  }));
  return buckets.length ? { mode: "percent", buckets } : null;
}

// Flatten a custom structure into the flat { name, cap, spent } lines a budget card renders.
function customToLines(custom, budgetTotal) {
  if (!custom || !custom.buckets) return [];
  const pct = custom.mode === "percent";
  return custom.buckets.flatMap(b => {
    const bucketCap = pct ? Math.round(((b.alloc || 0) / 100) * (budgetTotal || 0)) : (b.alloc || 0);
    if (!b.subs.length) {
      return [{ name: b.name, bucket: b.name, bucketColor: b.color, icon: b.icon,
                spent: 0, cap: bucketCap }];
    }
    const each = Math.round(bucketCap / b.subs.length);
    return b.subs.map(s => ({ name: s.name, bucket: b.name, bucketColor: b.color,
                              icon: s.icon, spent: 0, cap: each }));
  });
}

Object.assign(window, { CustomFrameworkBuilder, customToLines, frameworkToCustom, CF_ICONS, CF_COLORS });
