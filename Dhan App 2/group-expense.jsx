// ─── Add group expense ──────────────────────────────────────
const { useState: uAx, useEffect: uAxE } = React;
const NAVY_AX = "#141C41";

function AddGroupExpenseSheet({ open, onClose, onSave, group }) {
  const members = (group?.members || []).map(id => FRIENDS.find(f => f.id === id)).filter(Boolean);
  const people = [{ id: "you", name: "You" }, ...members];

  const [desc, setDesc] = uAx("");
  const [amt, setAmt] = uAx("");
  const [date, setDate] = uAx("Today");
  const [cat, setCat] = uAx("food");
  const [paidBy, setPaidBy] = uAx("you");
  const [method, setMethod] = uAx("equal");
  const [incl, setIncl] = uAx([]);
  const [custom, setCustom] = uAx({});
  const [pct, setPct] = uAx({});

  uAxE(() => {
    if (!open || !group) return;
    setDesc(""); setAmt(""); setDate("Today"); setCat("food");
    setPaidBy("you"); setMethod("equal");
    setIncl(people.map(p => p.id));
    setCustom({}); setPct({});
  }, [open, group && group.id]);

  if (!group) return null;

  const total = parseFloat(String(amt).replace(/,/g, "")) || 0;
  const active = people.filter(p => incl.includes(p.id));
  const money = (n) => "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN",
    { maximumFractionDigits: 2 });

  // Live share per person for the chosen method.
  const shareOf = (id) => {
    if (!active.some(p => p.id === id)) return 0;
    if (method === "equal") return active.length ? total / active.length : 0;
    if (method === "custom") return parseFloat(custom[id]) || 0;
    return total * ((parseFloat(pct[id]) || 0) / 100);
  };
  const sumCustom = active.reduce((s, p) => s + (parseFloat(custom[p.id]) || 0), 0);
  const sumPct = active.reduce((s, p) => s + (parseFloat(pct[p.id]) || 0), 0);

  const near = (a, b) => Math.abs(a - b) < 0.01;
  const valid = desc.trim() && total > 0 && active.length > 1 &&
    (method === "equal" ||
     (method === "custom" && near(sumCustom, total)) ||
     (method === "percentage" && near(sumPct, 100)));

  const toggle = (id) => setIncl(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);

  const save = () => {
    const breakdown = {};
    active.forEach(p => { breakdown[p.id] = Math.round(shareOf(p.id)); });
    const yours = breakdown.you || 0;
    const payer = people.find(p => p.id === paidBy) || people[0];
    // You fronted it → you're owed everyone else's share; someone else fronted
    // it → your share is what you owe them.
    const share = paidBy === "you" ? Math.round(total) - yours : -yours;
    onSave?.({
      id: `gx-${group.id}-${Date.now().toString(36)}`,
      m: desc.trim(), d: date, day: date, c: cat,
      s: `${CATEGORIES[cat]?.name || "Other"} · group expense`,
      total: Math.round(total), a: -Math.round(total), share,
      paidBy: { id: payer.id, name: payer.name },
      split: `${payer.name === "You" ? "You" : payer.name.split(" ")[0]} paid ₹${Math.round(total).toLocaleString("en-IN")}`,
      breakdown,
      groupWith: { id: group.id, name: group.name, icon: group.icon, share },
    });
  };

  const cats = Object.keys(CATEGORIES).filter(c => !["income", "forex-fee"].includes(c));
  const methods = [
    { id: "equal", l: "Equal" },
    { id: "custom", l: "Custom amounts" },
    { id: "percentage", l: "Percentage" },
  ];
  const inputCell = {
    width: 76, height: 36, borderRadius: "var(--r-input)", textAlign: "right",
    border: "1px solid var(--border-default)", background: "var(--bg-elevated)",
    fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 500, color: NAVY_AX,
    padding: "0 10px", outline: "none", fontVariantNumeric: "tabular-nums",
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={`Add expense · ${group.name}`}>
      <Field label="Description" value={desc} placeholder="Beach shack dinner" autoFocus
             onChange={(e) => setDesc(e.target.value)} />
      <Field label="Amount" value={amt} prefix="₹" placeholder="0"
             onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} />
      <Field label="Date" value={date} placeholder="Today"
             onChange={(e) => setDate(e.target.value)} />

      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Category</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {cats.map(id => {
          const c = CATEGORIES[id], on = cat === id;
          return (
            <button key={id} onClick={() => setCat(id)} style={{
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              padding: "8px 12px", borderRadius: 999,
              border: "1px solid " + (on ? NAVY_AX : "var(--border-subtle)"),
              background: on ? NAVY_AX : "transparent", color: on ? "#fff" : "var(--fg-2)",
              fontFamily: "Poppins, sans-serif", fontSize: 12.5, fontWeight: 500,
            }}>
              <i className={`ph ph-${c.icon}`} style={{ fontSize: 14 }}/>{c.name}
            </button>
          );
        })}
      </div>

      {/* Paid by */}
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Paid by</div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4,
                    marginBottom: 16, scrollbarWidth: "none" }}>
        {people.map(p => {
          const on = paidBy === p.id;
          return (
            <button key={p.id} onClick={() => setPaidBy(p.id)} style={{
              background: "none", border: "none", padding: 0, cursor: "pointer", width: 52,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0,
            }}>
              <span style={{ borderRadius: 999, display: "flex",
                             boxShadow: on ? "0 0 0 2px var(--dhan-gold)" : "none" }}>
                {p.id === "you"
                  ? <span style={{ width: 40, height: 40, borderRadius: 999, background: NAVY_AX,
                                   color: "#fff", display: "grid", placeItems: "center",
                                   fontSize: 12, fontWeight: 600 }}>You</span>
                  : <ContactAvatar f={p} size={40} fontSize={13} />}
              </span>
              <span style={{ fontSize: 11, color: on ? NAVY_AX : "var(--fg-3)", maxWidth: 52,
                             fontWeight: on ? 600 : 400, overflow: "hidden",
                             textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Split method */}
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Split</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {methods.map(m => (
          <Chip key={m.id} active={method === m.id} onClick={() => setMethod(m.id)}
                style={{ flex: 1, justifyContent: "center" }}>{m.l}</Chip>
        ))}
      </div>

      <Card style={{ padding: "0 16px", marginBottom: 8 }}>
        {people.map((p, i) => {
          const on = incl.includes(p.id);
          return (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "22px 36px minmax(0,1fr) auto", gap: 12,
              alignItems: "center", padding: "12px 0",
              borderBottom: i === people.length - 1 ? "none" : "1px solid var(--border-subtle)",
              opacity: on ? 1 : 0.5,
            }}>
              <span onClick={() => toggle(p.id)} style={{ cursor: "pointer", display: "grid" }}>
                <SelectIndicator on={on} />
              </span>
              {p.id === "you"
                ? <span style={{ width: 36, height: 36, borderRadius: 999, background: NAVY_AX,
                                 color: "#fff", display: "grid", placeItems: "center",
                                 fontSize: 11, fontWeight: 600 }}>You</span>
                : <ContactAvatar f={p} size={36} fontSize={12} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "var(--fg-2)", whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2,
                              fontVariantNumeric: "tabular-nums" }}>
                  {on ? money(shareOf(p.id)) : "Not included"}
                </div>
              </div>
              {method === "custom" && (
                <input value={custom[p.id] ?? ""} inputMode="decimal" disabled={!on}
                       placeholder="0" aria-label={`Amount for ${p.name}`} style={inputCell}
                       onChange={(e) => setCustom(c => ({ ...c, [p.id]: e.target.value.replace(/[^\d.]/g, "") }))}/>
              )}
              {method === "percentage" && (
                <input value={pct[p.id] ?? ""} inputMode="decimal" disabled={!on}
                       placeholder="0%" aria-label={`Percentage for ${p.name}`} style={inputCell}
                       onChange={(e) => setPct(c => ({ ...c, [p.id]: e.target.value.replace(/[^\d.]/g, "") }))}/>
              )}
            </div>
          );
        })}
      </Card>

      {/* Running total + validation */}
      {method !== "equal" && (() => {
        const isPct = method === "percentage";
        const sum = isPct ? sumPct : sumCustom;
        const target = isPct ? 100 : total;
        const ok = near(sum, target);
        const diff = target - sum;
        return (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                        gap: 12, padding: "0 4px 12px" }}>
            <div style={{ fontSize: 12.5, color: "var(--fg-2)", fontVariantNumeric: "tabular-nums" }}>
              {isPct ? `${sum.toFixed(0)}% of 100%` : `${money(sum)} of ${money(target)}`}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600,
                          color: ok ? "var(--income)" : "var(--expense)" }}>
              {ok ? "Balanced" : (diff > 0 ? `${isPct ? diff.toFixed(0) + "%" : money(diff)} left`
                                           : `${isPct ? Math.abs(diff).toFixed(0) + "%" : money(diff)} over`)}
            </div>
          </div>
        );
      })()}

      <div style={{ display: "grid", gap: 8 }}>
        <Button variant="primary" full size="lg" disabled={!valid} onClick={save}>Save expense</Button>
        <Button variant="ghost" full onClick={onClose}>Cancel</Button>
      </div>
    </BottomSheet>
  );
}

Object.assign(window, { AddGroupExpenseSheet });
