// ─── Entry & utility sheets: add txn, add bill, filters, sign out ───
const { useState: uSh, useEffect: uShE } = React;

// Add transaction
function AddTxnSheet({ open, onClose, onSave, initial = {} }) {
  const [kind, setKind] = uSh("expense");
  const [amt, setAmt] = uSh("");
  const [merchant, setMerchant] = uSh("");
  const [cat, setCat] = uSh("food");
  const [note, setNote] = uSh("");
  uShE(() => {
    if (!open) return;
    setKind(initial.kind || "expense");
    setAmt(""); setMerchant(""); setNote("");
    setCat(initial.cat || (initial.kind === "income" ? "income" : "food"));
  }, [open]);

  const catIds = Object.keys(CATEGORIES).filter(c => !["income", "forex-fee"].includes(c));
  const valid = parseFloat(amt) > 0 && merchant.trim();

  return (
    <BottomSheet open={open} onClose={onClose} title="Add transaction">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{ id: "expense", l: "Expense" }, { id: "income", l: "Income" }].map(k => (
          <Chip key={k.id} active={kind === k.id}
                onClick={() => { setKind(k.id); setCat(k.id === "income" ? "income" : "food"); }}
                style={{ flex: 1, justifyContent: "center" }}>{k.l}</Chip>
        ))}
      </div>

      <Field label="Amount" value={amt} type="text" prefix="₹" autoFocus
             placeholder="0"
             onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} />
      <Field label={kind === "income" ? "Source" : "Merchant"} value={merchant}
             placeholder={kind === "income" ? "Acme Co" : "Swiggy"}
             onChange={(e) => setMerchant(e.target.value)} />

      {kind === "expense" && (
        <>
          <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Category</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {catIds.map(id => {
              const c = CATEGORIES[id];
              const on = cat === id;
              return (
                <button key={id} onClick={() => setCat(id)} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "8px 12px", borderRadius: 999,
                  border: "1px solid " + (on ? "#141C41" : "var(--border-subtle)"),
                  background: on ? "#141C41" : "transparent",
                  color: on ? "#fff" : "var(--fg-2)",
                  fontFamily: "Poppins, sans-serif", fontSize: 12.5, fontWeight: 500,
                }}>
                  <i className={`ph ph-${c.icon}`} style={{ fontSize: 14 }}/>
                  {c.name}
                </button>
              );
            })}
          </div>
        </>
      )}

      <Field label="Note (optional)" value={note} placeholder="What was this for?"
             onChange={(e) => setNote(e.target.value)} />

      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        <Button variant="primary" full size="lg" disabled={!valid}
                onClick={() => onSave?.({ kind, amt: parseFloat(amt), merchant, cat, note })}>
          {kind === "income" ? "Add income" : "Add expense"}
        </Button>
        <Button variant="ghost" full onClick={onClose}>Cancel</Button>
      </div>
    </BottomSheet>
  );
}

// Add bill / subscription
function AddBillSheet({ open, onClose, onSave }) {
  const [name, setName] = uSh("");
  const [amt, setAmt] = uSh("");
  const [due, setDue] = uSh("");
  const [repeat, setRepeat] = uSh("Monthly");
  const [remind, setRemind] = uSh(true);
  uShE(() => {
    if (!open) return;
    setName(""); setAmt(""); setDue(""); setRepeat("Monthly"); setRemind(true);
  }, [open]);
  const valid = name.trim() && parseFloat(amt) > 0 && due.trim();

  return (
    <BottomSheet open={open} onClose={onClose} title="Add bill or subscription">
      <Field label="Name" value={name} placeholder="Airtel Fiber" autoFocus
             onChange={(e) => setName(e.target.value)} />
      <Field label="Amount" value={amt} prefix="₹" placeholder="0"
             onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} />
      <Field label="Next due date" value={due} placeholder="26 Apr 2026"
             onChange={(e) => setDue(e.target.value)} />

      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Repeats</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["Monthly", "Quarterly", "Yearly", "One-off"].map(r => (
          <Chip key={r} active={repeat === r} onClick={() => setRepeat(r)}>{r}</Chip>
        ))}
      </div>

      <div onClick={() => setRemind(v => !v)} style={{
        display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16, alignItems: "center",
        padding: "16px 0", cursor: "pointer", borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)", marginBottom: 16,
      }}>
        <IconChip icon="bell" />
        <div>
          <div style={{ fontSize: 14, color: "var(--fg-2)" }}>Remind me</div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>3 days before it's due</div>
        </div>
        <div className={"tgl " + (remind ? "on" : "")}/>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <Button variant="primary" full size="lg" disabled={!valid}
                onClick={() => onSave?.({ name, amt: parseFloat(amt), due, repeat, remind })}>Add bill</Button>
        <Button variant="ghost" full onClick={onClose}>Cancel</Button>
      </div>
    </BottomSheet>
  );
}

// Transaction filters
function TxnFilterSheet({ open, onClose, onApply, initial = {} }) {
  const [kind, setKind] = uSh("all");
  const [cats, setCats] = uSh([]);
  const [range, setRange] = uSh("This month");
  uShE(() => {
    if (!open) return;
    setKind(initial.kind || "all");
    setCats(initial.cats || []);
    setRange(initial.range || "This month");
  }, [open]);

  const catIds = Object.keys(CATEGORIES).filter(c => c !== "forex-fee");
  const toggle = (id) => setCats(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  const reset = () => { setKind("all"); setCats([]); setRange("This month"); };

  return (
    <BottomSheet open={open} onClose={onClose} title="Filter transactions">
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 4px 8px" }}>Type</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{ id: "all", l: "All" }, { id: "expense", l: "Expenses" }, { id: "income", l: "Income" }].map(k => (
          <Chip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)}
                style={{ flex: 1, justifyContent: "center" }}>{k.l}</Chip>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 4px 8px" }}>Period</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["This month", "Last month", "Last 3 months", "This year"].map(r => (
          <Chip key={r} active={range === r} onClick={() => setRange(r)}>{r}</Chip>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 4px 8px" }}>
        Categories {cats.length ? `· ${cats.length} selected` : ""}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {catIds.map(id => {
          const c = CATEGORIES[id];
          const on = cats.includes(id);
          return (
            <button key={id} onClick={() => toggle(id)} style={{
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              padding: "8px 12px", borderRadius: 999,
              border: "1px solid " + (on ? "#141C41" : "var(--border-subtle)"),
              background: on ? "#141C41" : "transparent",
              color: on ? "#fff" : "var(--fg-2)",
              fontFamily: "Poppins, sans-serif", fontSize: 12.5, fontWeight: 500,
            }}>
              <i className={`ph ph-${c.icon}`} style={{ fontSize: 14 }}/>
              {c.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Button variant="secondary" full onClick={reset}>Reset</Button>
        <Button variant="primary" full onClick={() => onApply?.({ kind, cats, range })}>Apply</Button>
      </div>
    </BottomSheet>
  );
}

// Create a project budget (Marriage, Startup, …)
// Personal's active framework is only a SUGGESTED starting point — the user can
// change it here, or pick Custom and build their own buckets.
const BUDGET_ICONS = ["confetti", "rocket-launch", "house", "graduation-cap", "airplane-takeoff", "target"];
const CUSTOM_ICONS = ["house-line", "confetti", "piggy-bank", "car-simple", "gift", "briefcase"];

function CreateBudgetSheet({ open, onClose, onCreate }) {
  const personalFw = (typeof localStorage !== "undefined" && localStorage.getItem("dhan-framework")) || "50-30-20";
  const [name, setName] = uSh("");
  const [icon, setIcon] = uSh(BUDGET_ICONS[0]);
  const [fwId, setFwId] = uSh(personalFw);
  const [fwOpen, setFwOpen] = uSh(false);
  const [custom, setCustom] = uSh(null);      // built custom structure
  const [builder, setBuilder] = uSh(false);
  const [total, setTotal] = uSh("");          // optional overall target
  uShE(() => {
    if (!open) return;
    setName(""); setIcon(BUDGET_ICONS[0]); setFwId(personalFw);
    setFwOpen(false); setCustom(null); setBuilder(false); setTotal("");
  }, [open]);

  const isCustom = fwId === "custom";
  const fw = FRAMEWORKS.find(f => f.id === fwId);
  const buckets = isCustom ? [] : frameworkBuckets(fwId);
  const catCount = buckets.reduce((s, b) => s + b.cats.length, 0);
  const budgetTotal = parseFloat(total) || 0;
  const customLines = isCustom ? customToLines(custom, budgetTotal) : [];
  const valid = name.trim() && (isCustom ? customLines.length >= 2 : !!fw);

  const create = () => onCreate?.({
    id: "b" + Date.now().toString(36),
    name: name.trim(), icon,
    subtitle: isCustom ? "Custom categories" : fw.name + " framework",
    framework: fwId,
    total: Math.round(parseFloat(total) || 0) || undefined,
    custom: isCustom ? custom : null,
    lines: isCustom
      ? customLines
      : buckets.flatMap(b => b.cats.map(c => ({
          name: CATEGORIES[c].name, cat: c, bucket: b.id, spent: 0, cap: 0,
        }))),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Create new budget">
      <Field label="Budget name" value={name} placeholder="Marriage" autoFocus
             onChange={(e) => setName(e.target.value)} />

      <Field label="Total budget (optional)" value={total} prefix="₹" placeholder="0"
             onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, ""))} />

      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Icon</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {BUDGET_ICONS.map(ic => (
          <button key={ic} onClick={() => setIcon(ic)} aria-label={ic} style={{
            width: 44, height: 44, borderRadius: "var(--r-input)", cursor: "pointer",
            border: "1px solid " + (icon === ic ? "#141C41" : "var(--border-subtle)"),
            background: icon === ic ? "#141C41" : "transparent",
            color: icon === ic ? "#fff" : "var(--fg-2)", display: "grid", placeItems: "center",
          }}>
            <Glyph icon={ic} size={18} />
          </button>
        ))}
        <EmojiTile value={icon} onChange={setIcon} />
      </div>

      {/* Framework selector — suggestion, not inheritance */}
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Framework</div>
      <Card style={{ padding: 14, marginBottom: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px minmax(0,1fr) auto", gap: 12,
                      alignItems: "center" }}>
          <IconChip icon={isCustom ? "sliders-horizontal" : "chart-pie-slice"} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41" }}>
              {isCustom ? "Custom" : fw.name}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 1 }}>
              {isCustom
                ? (custom ? `${custom.buckets.length} buckets · ${customLines.length} sub-categories`
                          : "Not built yet")
                : `${buckets.length} buckets · ${catCount} sub-categories`}
              {fwId === personalFw && !isCustom ? " · same as Personal" : ""}
            </div>
          </div>
          <button className="gold-btn" style={{ fontSize: 12 }}
                  onClick={() => setFwOpen(true)}>Change</button>
        </div>
      </Card>

      {isCustom ? (
        custom ? (
          <Card style={{ padding: "0 16px", marginBottom: 16 }}>
            {custom.buckets.map((b, i) => (
              <div key={b.name} style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12,
                                         alignItems: "center", padding: "14px 0",
                                         borderBottom: i === custom.buckets.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                <IconChip icon={b.icon} size={36} color={b.color} bg="var(--bg-surface)" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#141C41" }}>
                    {b.name} <span style={{ color: "var(--fg-3)", fontWeight: 400, fontSize: 12 }}>
                      {custom.mode === "percent" ? `${Math.round(b.alloc)}%` : `₹${Math.round(b.alloc).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap",
                                overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.subs.length ? b.subs.map(s => s.name).join(" · ") : "No sub-categories"}
                  </div>
                </div>
                <button className="gold-btn" style={{ fontSize: 11, padding: "5px 10px" }}
                        onClick={() => setBuilder(true)}>Edit</button>
              </div>
            ))}
          </Card>
        ) : (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 12 }}>
              Build your own buckets and sub-categories for this budget.
            </div>
            <button className="gold-btn" style={{ fontSize: 12 }}
                    onClick={() => setBuilder(true)}>Build your categories</button>
          </Card>
        )
      ) : (
        <Card style={{ padding: "0 16px", marginBottom: 16 }}>
          {buckets.map((b, i) => (
            <div key={b.id} style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12,
                                     alignItems: "center", padding: "14px 0",
                                     borderBottom: i === buckets.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
              <IconChip icon={b.icon} size={36} color={b.color} bg={b.tint} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#141C41" }}>
                  {b.label} <span style={{ color: "var(--fg-3)", fontWeight: 400, fontSize: 12 }}>{b.pct}%</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis" }}>
                  {b.cats.map(c => CATEGORIES[c].name).join(" · ")}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-3)",
                            fontVariantNumeric: "tabular-nums" }}>₹0</div>
            </div>
          ))}
        </Card>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        <Button variant="primary" full size="lg" disabled={!valid} onClick={create}>Create budget</Button>
        <Button variant="ghost" full onClick={onClose}>Cancel</Button>
      </div>

      <FrameworkSheet open={fwOpen} onClose={() => setFwOpen(false)} current={fwId} allowCustom
                      onApply={(id) => { setFwId(id); setFwOpen(false);
                                         if (id === "custom") setBuilder(true); }} />
      <CustomFrameworkBuilder open={builder} onClose={() => setBuilder(false)}
                              budgetTotal={budgetTotal} initial={custom}
                              onSave={(c) => { setCustom(c); setBuilder(false); }} />
    </BottomSheet>
  );
}

// Edit a project budget — name, icon, per-category allocations
function EditBudgetSheet({ open, onClose, onSave, budget }) {
  const [name, setName] = uSh("");
  const [icon, setIcon] = uSh(BUDGET_ICONS[0]);
  const [caps, setCaps] = uSh({});
  const [goal, setGoal] = uSh("");   // overall total budget, editable after creation
  const [fwId, setFwId] = uSh("50-30-20");
  const [fwOpen, setFwOpen] = uSh(false);
  const [custom, setCustom] = uSh(null);
  const [builder, setBuilder] = uSh(false);
  const [pendingFw, setPendingFw] = uSh(null); // framework awaiting confirmation
  uShE(() => {
    if (!open || !budget) return;
    setName(budget.name || "");
    setIcon(budget.icon || BUDGET_ICONS[0]);
    setFwId(budget.framework || (budget.custom ? "custom" : "50-30-20"));
    setCustom(budget.custom || null);
    setFwOpen(false); setBuilder(false); setPendingFw(null);
    const c = {};
    (budget.lines || []).forEach(l => { c[l.name] = String(l.cap || 0); });
    setCaps(c);
    // Prefer the total set at creation; fall back to the sum of allocations.
    const sum = (budget.lines || []).reduce((s, l) => s + (l.cap || 0), 0);
    setGoal(String(Math.round(budget.total || sum || 0) || ""));
  }, [open, budget && budget.id]);

  // The confirmation promises allocations reset — clear caps when the framework
  // moves away from the budget's own, restore them on switching back. Must sit
  // above the early return so the hook count is constant across renders.
  uShE(() => {
    if (!open || !budget) return;
    const orig = budget.framework || (budget.custom ? "custom" : "50-30-20");
    if (fwId === orig) {
      const c = {};
      (budget.lines || []).forEach(l => { c[l.name] = String(l.cap || 0); });
      setCaps(c);
    } else {
      setCaps({});
    }
  }, [fwId, open, budget && budget.id]);

  if (!budget) return null;

  const isCustom = fwId === "custom";
  const fw = FRAMEWORKS.find(f => f.id === fwId);
  const originalFw = budget.framework || (budget.custom ? "custom" : "50-30-20");
  // Switching framework replaces the line structure; staying keeps the caps being edited.
  const changed = fwId !== originalFw;
  // Spent amounts carry over by category/name; caps reset with the new structure.
  const spentOf = (l) => {
    const prev = (budget.lines || []).find(p => (l.cat && p.cat === l.cat) || p.name === l.name);
    return prev ? prev.spent || 0 : 0;
  };
  const lines = changed
    ? (isCustom ? customToLines(custom, 0)
                : frameworkBuckets(fwId).flatMap(b => b.cats.map(c => ({
                    name: CATEGORIES[c].name, cat: c, bucket: b.id, cap: 0 }))))
      .map(l => ({ ...l, spent: spentOf(l) }))
    : (budget.lines || []);
  const total = lines.reduce((s, l) => s + (parseFloat(caps[l.name]) || 0), 0);
  const goalNum = parseFloat(goal) || 0;
  // Mismatch only matters once something is allocated; a freshly reset structure is fine.
  const mismatch = goalNum > 0 && total > 0 && Math.abs(goalNum - total) >= 1;

  // Scale every allocation proportionally so they add up to the new total.
  const autoScale = () => {
    const k = goalNum / total;
    setCaps(c => {
      const n = { ...c };
      lines.forEach(l => { n[l.name] = String(Math.round((parseFloat(c[l.name]) || 0) * k)); });
      return n;
    });
  };

  const save = () => onSave?.({
    ...budget, name: name.trim() || budget.name, icon,
    framework: fwId, custom: isCustom ? custom : null,
    total: Math.round(goalNum) || undefined,
    subtitle: isCustom ? "Custom categories" : (fw ? fw.name + " framework" : budget.subtitle),
    lines: lines.map(l => ({ ...l, cap: Math.round(parseFloat(caps[l.name]) || 0) })),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title={`Edit ${budget.name}`}>
      <Field label="Budget name" value={name} onChange={(e) => setName(e.target.value)} />
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Icon</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {BUDGET_ICONS.map(ic => (
          <button key={ic} onClick={() => setIcon(ic)} aria-label={ic} style={{
            width: 44, height: 44, borderRadius: "var(--r-input)", cursor: "pointer",
            border: "1px solid " + (icon === ic ? "#141C41" : "var(--border-subtle)"),
            background: icon === ic ? "#141C41" : "transparent",
            color: icon === ic ? "#fff" : "var(--fg-2)", display: "grid", placeItems: "center",
          }}>
            <Glyph icon={ic} size={18} />
          </button>
        ))}
        <EmojiTile value={icon} onChange={setIcon} />
      </div>

      {/* Framework — switching here rebuilds this budget's category structure */}
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Framework</div>
      <Card style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px minmax(0,1fr) auto", gap: 12,
                      alignItems: "center" }}>
          <IconChip icon={isCustom ? "sliders-horizontal" : "chart-pie-slice"} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41" }}>
              {isCustom ? "Custom" : (fw ? fw.name : "Custom")}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 1 }}>
              {lines.length} {lines.length === 1 ? "category" : "categories"}
              {changed ? " · allocations reset" : ""}
            </div>
          </div>
          <button className="gold-btn" style={{ fontSize: 12 }}
                  onClick={() => setFwOpen(true)}>Change</button>
        </div>
      </Card>

      {/* Overall total — same field as Create New Budget */}
      <Field label="Total budget" value={goal} prefix="₹" placeholder="0"
             onChange={(e) => setGoal(e.target.value.replace(/[^\d.]/g, ""))} />
      {mismatch && (
        <div style={{ margin: "-8px 4px 16px", display: "flex", flexWrap: "wrap",
                      alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11.5, color: "var(--fg-3)", lineHeight: 1.45, flex: "1 1 180px" }}>
            Allocations sum to ₹{Math.round(total).toLocaleString("en-IN")} — adjust categories to
            match, or auto-scale them proportionally.
          </div>
          <button className="gold-btn" style={{ fontSize: 11.5 }} onClick={autoScale}>Auto-scale</button>
          <button className="gold-btn" style={{ fontSize: 11.5 }}
                  onClick={() => setGoal(String(Math.round(total)))}>Use sum</button>
        </div>
      )}

      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Allocations</div>
      <Card style={{ padding: "0 16px", marginBottom: 8 }}>
        {lines.map((l, i) => (
          <div key={l.name} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 104px",
                                     gap: 12, alignItems: "center", padding: "12px 0",
                                     borderBottom: i === lines.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: "var(--fg-2)", whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2,
                            fontVariantNumeric: "tabular-nums" }}>
                Spent ₹{(l.spent || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <input value={caps[l.name] ?? ""} inputMode="decimal" placeholder="0"
                   aria-label={`Allocation for ${l.name}`}
                   onChange={(e) => setCaps(c => ({ ...c, [l.name]: e.target.value.replace(/[^\d.]/g, "") }))}
                   style={{ width: "100%", height: 40, borderRadius: "var(--r-input)",
                            border: "1px solid var(--border-default)", background: "var(--bg-elevated)",
                            fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 500,
                            color: "#141C41", padding: "0 10px", textAlign: "right", outline: "none",
                            fontVariantNumeric: "tabular-nums", boxSizing: "border-box" }}/>
          </div>
        ))}
      </Card>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5,
                    padding: "0 4px 12px" }}>
        <span style={{ color: "var(--fg-3)" }}>Total allocated</span>
        <span style={{ fontWeight: 600, color: mismatch ? "var(--expense)" : "#141C41",
                       fontVariantNumeric: "tabular-nums" }}>
          ₹{Math.round(total).toLocaleString("en-IN")}
          {goalNum > 0 ? <span style={{ color: "var(--fg-3)", fontWeight: 500 }}>
            {" "}of ₹{Math.round(goalNum).toLocaleString("en-IN")}</span> : null}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Button variant="secondary" full onClick={onClose}>Cancel</Button>
        <Button variant="primary" full disabled={(isCustom && !custom) || mismatch}
                onClick={save}>Save</Button>
      </div>

      <FrameworkSheet open={fwOpen} onClose={() => setFwOpen(false)} current={fwId} allowCustom
                      onApply={(id) => {
                        setFwOpen(false);
                        if (id === fwId) return;
                        setPendingFw(id);   // confirm before the structure is replaced
                      }} />

      <BottomSheet open={!!pendingFw} onClose={() => setPendingFw(null)} title="Switch framework?">
        <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
          Switching frameworks will replace your current categories and allocations. Amounts already
          spent will be preserved, but budget structure will reset.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" full onClick={() => setPendingFw(null)}>Cancel</Button>
          <Button variant="primary" full onClick={() => {
            const id = pendingFw;
            setFwId(id); setPendingFw(null);
            if (id === "custom") {
              // Pre-fill from the structure being replaced rather than a blank slate.
              setCustom(c => c || frameworkToCustom(fwId) || null);
              setBuilder(true);
            }
          }}>Switch</Button>
        </div>
      </BottomSheet>

      <CustomFrameworkBuilder open={builder} onClose={() => setBuilder(false)}
                              budgetTotal={Math.round(goalNum) || 0} initial={custom}
                              onSave={(c) => { setCustom(c); setBuilder(false); }} />
    </BottomSheet>
  );
}

// Sign out confirmation
function SignOutSheet({ open, onClose, onConfirm }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Sign out of Dhan?">
      <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
        Your data stays encrypted on this device. You'll need your PIN or Face ID to sign back in.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Button variant="secondary" full onClick={onClose}>Stay</Button>
        <button onClick={onConfirm} style={{
          height: 48, borderRadius: "var(--r-control)", cursor: "pointer", border: "none",
          background: "var(--expense)", color: "#fff", fontFamily: "Poppins, sans-serif",
          fontSize: 14, fontWeight: 600,
        }}>Sign out</button>
      </div>
    </BottomSheet>
  );
}

Object.assign(window, { AddTxnSheet, AddBillSheet, TxnFilterSheet, SignOutSheet,
                        CreateBudgetSheet, BUDGET_ICONS, EditBudgetSheet });
