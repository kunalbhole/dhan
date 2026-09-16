// ─── Budget · category edit mode (rename · reorder · nickname) ───
const { useState: uBE } = React;

const NAVY_BE = "#141C41";
const GOLD_BE = "#C9A84C";

// Savings sub-categories are goals rather than spend categories
const SAVINGS_SUBS = [
  { id: "invest",    name: "Investing",    spent: 2600, cap: 5000, icon: "chart-line-up", color: "#2E7D5B" },
  { id: "insurance", name: "Insurance",    spent: 1200, cap: 1500, icon: "shield-check",  color: "#4F8FAF" },
  { id: "debt",      name: "Debt pay-off", spent: 1300, cap: 2000, icon: "hand-coins",    color: "#B08D57" },
];

const moveItem = (arr, from, to) => {
  const a = arr.slice();
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
};

function DragHandle({ active }) {
  return (
    <span style={{ display: "grid", placeItems: "center", cursor: "grab",
                   color: active ? NAVY_BE : "var(--fg-4)", transition: "color .15s" }}>
      <i className="ph ph-dots-six-vertical" style={{ fontSize: 16 }}/>
    </span>
  );
}

function BudgetEditor({ budgets, txns = [], onDone , isPlus = false, onUpgrade }) {
  const bucketSubs = (id) => id === "savings"
    ? SAVINGS_SUBS.map(s => ({ ...s }))
    : budgets.filter(b => BUCKETS[id].cats.includes(b.cat))
             .map(b => ({ id: b.cat, cat: b.cat, name: CATEGORIES[b.cat].name,
                          spent: b.spent, cap: b.cap, color: CATEGORIES[b.cat].color,
                          icon: CATEGORIES[b.cat].icon }));

  const [order, setOrder] = uBE(["needs", "wants", "savings"]);
  const [items, setItems] = uBE(() => ({
    needs: bucketSubs("needs"), wants: bucketSubs("wants"), savings: bucketSubs("savings"),
  }));
  const [openSub, setOpenSub] = uBE(null);
  const [drag, setDrag] = uBE(null);          // {kind, bucket, sub, index}
  const [rows, setRows] = uBE({});            // per-sub transaction lists
  const [addTo, setAddTo] = uBE(null);        // bucket currently adding into
  const [draftName, setDraftName] = uBE("");
  const [pendingDel, setPendingDel] = uBE(null); // {bucket, index, name}

  const txnsFor = (sub) => {
    if (rows[sub.id]) return rows[sub.id];
    const seed = txns.filter(t => t.c === sub.cat).map(t => ({ ...t, nick: "" }));
    const list = seed.length ? seed : [
      { id: sub.id + "-a", m: "Auto-debit · " + sub.name, s: "HDFC · Apr 12", a: -Math.round(sub.spent * 0.6), c: sub.cat || "other", nick: "" },
      { id: sub.id + "-b", m: "Transfer · " + sub.name,   s: "UPI · Apr 4",   a: -Math.round(sub.spent * 0.4), c: sub.cat || "other", nick: "" },
    ];
    setRows(r => ({ ...r, [sub.id]: list }));
    return list;
  };
  const setTxns = (subId, fn) => setRows(r => ({ ...r, [subId]: fn(r[subId] || []) }));

  const rename = (bucket, idx, value) => setItems(it => ({
    ...it, [bucket]: it[bucket].map((s, i) => i === idx ? { ...s, name: value } : s),
  }));

  const addSub = (bucket) => {
    const name = draftName.trim();
    if (!name) { setAddTo(null); setDraftName(""); return; }
    const savings = bucket === "savings";
    setItems(it => ({ ...it, [bucket]: it[bucket].concat([{
      id: (savings ? "goal-" : "cat-") + Date.now(), name, spent: 0, cap: 0,
      icon: savings ? "target" : "circles-four",
      color: savings ? "#2E7D5B" : (bucket === "needs" ? NAVY_BE : GOLD_BE),
    }]) }));
    setDraftName(""); setAddTo(null);
  };

  const removeSub = () => {
    if (!pendingDel) return;
    const { bucket, index } = pendingDel;
    setItems(it => ({ ...it, [bucket]: it[bucket].filter((_, i) => i !== index) }));
    setPendingDel(null);
  };

  const dropOnBucket = (toIdx) => {
    if (drag?.kind === "bucket" && drag.index !== toIdx) setOrder(o => moveItem(o, drag.index, toIdx));
    setDrag(null);
  };
  const dropOnSub = (bucket, toIdx) => {
    if (drag?.kind === "sub" && drag.bucket === bucket && drag.index !== toIdx) {
      setItems(it => ({ ...it, [bucket]: moveItem(it[bucket], drag.index, toIdx) }));
    }
    setDrag(null);
  };
  const dropOnTxn = (subId, toIdx) => {
    if (drag?.kind === "txn" && drag.sub === subId && drag.index !== toIdx) {
      setTxns(subId, list => moveItem(list, drag.index, toIdx));
    }
    setDrag(null);
  };

  const nameInput = {
    border: "none", borderBottom: "1px dashed var(--border-strong)",
    background: "transparent", outline: "none", padding: "1px 0",
    fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 500, color: NAVY_BE,
    width: "100%", minWidth: 0,
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "var(--dhan-gold-bg)", borderRadius: 12, padding: "12px 16px",
                    marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.4 }}>
          Rename, reorder and re-file. Drag <i className="ph ph-dots-six-vertical" style={{ fontSize: 12 }}/> to move.
        </div>
        <button onClick={onDone} className="gold-btn" style={{ fontSize: 13 }}>Done</button>
      </div>

      {order.map((bid, bi) => {
        const bk = BUCKETS[bid];
        const list = items[bid];
        const spent = list.reduce((s, x) => s + x.spent, 0);
        const cap = list.reduce((s, x) => s + x.cap, 0) || 1;
        const dragging = drag?.kind === "bucket" && drag.index === bi;
        return (
          <Card key={bid} style={{ marginBottom: 16, padding: 14,
                                   opacity: dragging ? 0.6 : 1,
                                   outline: dragging ? "1px solid " + NAVY_BE : "none" }}>
            {/* Bucket header — draggable */}
            <div draggable
                 onDragStart={() => setDrag({ kind: "bucket", index: bi })}
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={() => dropOnBucket(bi)}
                 style={{ display: "grid", gridTemplateColumns: "20px 36px 1fr auto",
                          gap: 10, alignItems: "center", marginBottom: 12 }}>
              <DragHandle active={dragging} />
              <IconChip icon={bk.icon} size={36} color={bk.color} bg={bk.tint} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY_BE }}>{bk.label}</div>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 1,
                              fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  ₹{spent.toLocaleString("en-IN")} of ₹{cap.toLocaleString("en-IN")}
                </div>
              </div>
              <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{list.length} items</span>
            </div>

            {/* Sub-categories */}
            <div style={{ paddingLeft: 12, borderLeft: "1px solid var(--border-subtle)" }}>
              {list.map((s, si) => {
                const subDragging = drag?.kind === "sub" && drag.bucket === bid && drag.index === si;
                const open = openSub === s.id;
                return (
                  <div key={s.id} style={{ marginTop: si === 0 ? 0 : 10 }}>
                    <div draggable
                         onDragStart={() => setDrag({ kind: "sub", bucket: bid, index: si })}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={() => dropOnSub(bid, si)}
                         style={{ display: "grid", gridTemplateColumns: "20px 26px minmax(0,1fr) auto 18px 18px",
                                  gap: 8, alignItems: "center", paddingLeft: 4,
                                  opacity: subDragging ? 0.6 : 1 }}>
                      <DragHandle active={subDragging} />
                      {s.cat ? <CategoryIcon cat={s.cat} size={26} tint /> : (
                        <IconChip icon={s.icon} size={26} color={s.color} bg={s.color + "1F"} />
                      )}
                      <input value={s.name} onChange={(e) => rename(bid, si, e.target.value)}
                             aria-label="Category name" style={nameInput}/>
                      <span style={{ fontSize: 11.5, color: "var(--fg-3)", whiteSpace: "nowrap",
                                     fontVariantNumeric: "tabular-nums" }}>
                        ₹{s.spent.toLocaleString("en-IN")}
                      </span>
                      <button onClick={() => setOpenSub(o => o === s.id ? null : s.id)}
                              aria-label="Transactions" style={{
                                border: "none", background: "none", cursor: "pointer", padding: 0,
                                display: "grid", placeItems: "center", color: "var(--fg-3)" }}>
                        <i className="ph ph-caret-down" style={{ fontSize: 13,
                          transform: open ? "rotate(180deg)" : "none",
                          transition: "transform .2s var(--ease-out)" }}/>
                      </button>
                      <button onClick={() => setPendingDel({ bucket: bid, index: si, name: s.name })}
                              aria-label={"Delete " + s.name} style={{
                                border: "none", background: "none", cursor: "pointer", padding: 0,
                                display: "grid", placeItems: "center", color: "var(--expense)" }}>
                        <i className="ph ph-minus-circle" style={{ fontSize: 15 }}/>
                      </button>
                    </div>

                    {/* Delete confirmation */}
                    {pendingDel && pendingDel.bucket === bid && pendingDel.index === si && (
                      <div style={{ marginTop: 8, marginLeft: 24, background: "var(--expense-bg)",
                                    borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 12.5, color: NAVY_BE, lineHeight: 1.45, marginBottom: 10 }}>
                          Delete {s.name}? Transactions inside will need to be reassigned.
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <button onClick={() => setPendingDel(null)} style={{
                            height: 36, borderRadius: 8, cursor: "pointer", background: "transparent",
                            border: "1px solid var(--border-default)",
                            fontFamily: "Poppins, sans-serif", fontSize: 12.5, fontWeight: 500,
                            color: "var(--fg-2)" }}>Cancel</button>
                          <button onClick={removeSub} style={{
                            height: 36, borderRadius: 8, cursor: "pointer", border: "none",
                            background: "var(--expense)",
                            fontFamily: "Poppins, sans-serif", fontSize: 12.5, fontWeight: 600,
                            color: "#fff" }}>Delete</button>
                        </div>
                      </div>
                    )}

                    {/* Transactions inside this sub-category */}
                    {open && (
                      <div style={{ marginTop: 8, marginLeft: 24, display: "grid", gap: 8 }}>
                        {txnsFor(s).map((t, ti) => {
                          const tDragging = drag?.kind === "txn" && drag.sub === s.id && drag.index === ti;
                          return (
                            <div key={t.id} draggable
                                 onDragStart={() => setDrag({ kind: "txn", sub: s.id, index: ti })}
                                 onDragOver={(e) => e.preventDefault()}
                                 onDrop={() => dropOnTxn(s.id, ti)}
                                 style={{ display: "grid", gridTemplateColumns: "20px 1fr",
                                          gap: 8, alignItems: "start",
                                          background: "var(--bg-surface)", borderRadius: 10,
                                          padding: 10, opacity: tDragging ? 0.6 : 1 }}>
                              <DragHandle active={tDragging} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between",
                                              gap: 8, alignItems: "baseline" }}>
                                  <div style={{ fontSize: 12.5, fontWeight: 500, color: NAVY_BE,
                                                whiteSpace: "nowrap", overflow: "hidden",
                                                textOverflow: "ellipsis" }}>
                                    {t.nick ? t.nick : t.m}
                                  </div>
                                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                                                fontVariantNumeric: "tabular-nums", color: NAVY_BE }}>
                                    ₹{Math.abs(t.a).toLocaleString("en-IN")}
                                  </div>
                                </div>
                                {t.nick && (
                                  <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 1 }}>{t.m}</div>
                                )}
                                <input value={t.nick} placeholder="Add a nickname"
                                       onChange={(e) => setTxns(s.id, l => l.map((x, i) =>
                                         i === ti ? { ...x, nick: e.target.value } : x))}
                                       style={{ ...nameInput, fontSize: 12, marginTop: 6 }}/>
                                <select value={t.c}
                                        onChange={(e) => setTxns(s.id, l => l.map((x, i) =>
                                          i === ti ? { ...x, c: e.target.value } : x))}
                                        style={{ marginTop: 8, width: "100%", height: 32,
                                                 borderRadius: 8, padding: "0 8px",
                                                 border: "1px solid var(--border-default)",
                                                 background: "var(--bg-elevated)",
                                                 fontFamily: "Poppins, sans-serif", fontSize: 12,
                                                 fontWeight: 500, color: NAVY_BE, outline: "none" }}>
                                  {Object.keys(CATEGORIES).map(id => (
                                    <option key={id} value={id}>{CATEGORIES[id].name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add a sub-category / savings goal */}
              {addTo === bid ? (
                <input value={draftName} autoFocus
                       placeholder={bid === "savings" ? "Goal name" : bid === "needs" ? "Needs category name" : "Wants category name"}
                       onChange={(e) => setDraftName(e.target.value)}
                       onKeyDown={(e) => { if (e.key === "Enter") addSub(bid);
                                           if (e.key === "Escape") { setAddTo(null); setDraftName(""); } }}
                       onBlur={() => addSub(bid)}
                       style={{ marginTop: 12, marginLeft: 4, width: "calc(100% - 8px)", height: 34,
                                border: "1px solid " + GOLD_BE, borderRadius: 8, padding: "0 10px",
                                fontFamily: "Poppins, sans-serif", fontSize: 13, color: NAVY_BE,
                                outline: "none", background: "var(--bg-elevated)", boxSizing: "border-box" }}/>
              ) : (
                <div style={{ marginTop: 12, marginLeft: 4 }}>
                  <PlusLock locked={bid === "savings" && !isPlus} tag="below" onUpgrade={onUpgrade}>
                    <button onClick={() => { setAddTo(bid); setDraftName(""); }}
                            style={{ fontSize: 12.5 }} className="gold-btn">
                      <i className="ph ph-plus" style={{ fontSize: 13 }}/>
                      {bid === "savings" ? "Add goal" : bid === "needs" ? "Add needs" : "Add wants"}
                    </button>
                  </PlusLock>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </>
  );
}

Object.assign(window, { BudgetEditor, SAVINGS_SUBS });
