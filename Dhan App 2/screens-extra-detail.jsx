// ─── Extra detail screens ─────────────────────
// 16 Txn detail · 17 Edit budget · 18 Bill detail · 19 Insights
// 20 Goals · 21 Profile · 22 Linked · 23 Help · 24 Paywall · 25 Empty

// 16. TXN DETAIL
function TxnDetailScreen({ txn, onBack, onSplit, onDelete, isSettled = false, onMarkSettled,
                           budgetId = "personal", budgetName = "Personal", budgets = [],
                           suggestedBudgetId, suggestedBudgetName, onAssignBudget }) {
  const [menu, setMenu] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [budgetPick, setBudgetPick] = useState(false);
  const [dismissedHint, setDismissedHint] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState("Late night order with the team after launch.");
  const [tags, setTags] = useState(["work", "team", "delivery"]);
  const [newTag, setNewTag] = useState(null);
  const t = txn || { id: 1, m: "Swiggy", s: "Dinner · UPI · 3:42 PM", a: -420, c: "food", day: "Today · Apr 23" };
  const isIncome = t.a > 0;
  const c = CATEGORIES[t.c] || CATEGORIES.other;
  return (
    <Phone label="16 Txn detail">
      <StatusBar />
      <ScreenHeader title="Transaction" onBack={onBack}
        right={<button onClick={() => setMenu(true)} aria-label="More actions"
          style={{ width: 40, height: 40, borderRadius: "var(--r-input)", background: "#fff",
          border: "1px solid var(--border-subtle)", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <i className="ph ph-dots-three" style={{ fontSize: 20 }}/>
        </button>}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "12px 0 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "var(--r-card-lg)",
                          background: c.color + "1A", color: c.color,
                          margin: "0 auto 14px", display: "grid", placeItems: "center" }}>
            <i className={`ph-fill ph-${c.icon}`} style={{ fontSize: 30 }}/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{t.m}</div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{t.day || "Today"}</div>
          <div style={{
            fontSize: 38, fontWeight: 700, marginTop: 14,
            color: isIncome ? "var(--income)" : "var(--fg-1)",
            fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
          }}>
            {isIncome ? "+" : "−"}₹{Math.abs(t.a).toLocaleString("en-IN")}
          </div>
        </div>

        {/* Learned-pattern suggestion — always confirmed, never silent */}
        {suggestedBudgetId && !dismissedHint && (
          <Card style={{ padding: 14, marginBottom: 12, background: "var(--dhan-gold-bg)",
                         boxShadow: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10,
                          alignItems: "center" }}>
              <div style={{ fontSize: 12.5, color: "#141C41", lineHeight: 1.4, minWidth: 0 }}>
                Looks like a {suggestedBudgetName} expense — reassign?
              </div>
              <button onClick={() => setDismissedHint(true)} style={{
                border: "none", background: "none", cursor: "pointer", padding: "6px 4px",
                fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500,
                color: "var(--fg-3)" }}>Not now</button>
              <button className="gold-btn" style={{ fontSize: 12 }}
                      onClick={() => { onAssignBudget?.(t, suggestedBudgetId); setDismissedHint(true); }}>
                Reassign
              </button>
            </div>
          </Card>
        )}

        {/* Group context — group-linked transactions */}
        {t.groupWith && (
          <Card style={{ padding: "0 16px", marginBottom: 12 }}>
            <DetailRow icon={t.groupWith.icon || "users-three"}
                       label={`Split in ${t.groupWith.name}`}
                       sub={t.split || "Group expense"} last>
              <span style={{ color: t.groupWith.share > 0 ? "var(--income)" : "#141C41" }}>
                {t.groupWith.share > 0 ? "+" : "−"}₹{Math.abs(t.groupWith.share || 0).toLocaleString("en-IN")}
              </span>
            </DetailRow>
          </Card>
        )}

        {/* Split context — only for split-linked transactions */}
        {t.splitWith && (
          <Card style={{ padding: "0 16px", marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
                          alignItems: "center", padding: "16px 0" }}>
              <span style={{ width: 40, height: 40, borderRadius: 999,
                             background: t.splitWith.avatar || "var(--dhan-navy)",
                             display: "grid", placeItems: "center", color: "#fff",
                             fontWeight: 600, fontSize: 14 }}>
                {t.splitWith.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg-2)" }}>
                  Split with {t.splitWith.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                  {t.split || "Shared expense"}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                            fontVariantNumeric: "tabular-nums",
                            color: t.splitWith.share > 0 ? "var(--income)" : "#141C41" }}>
                {t.splitWith.share > 0 ? "+" : "−"}₹{Math.abs(t.splitWith.share || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </Card>
        )}

        {/* Currency details — foreign transactions only */}
        {t.isForeignTransaction && t.originalAmount ? (() => {
          const inr = t.inrAmount || Math.abs(t.a);
          const rate = inr / t.originalAmount;
          const fmt = (n, d = 2) => n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 500, margin: "0 4px 8px" }}>Currency details</div>
              <Card style={{ padding: "0 16px" }}>
                <DetailRow icon="currency-circle-dollar" label="Original amount">
                  {fmt(t.originalAmount)} {t.originalCurrency}
                </DetailRow>
                <DetailRow icon="arrows-left-right" label="Converted to INR">
                  ₹{fmt(inr, 0)}
                </DetailRow>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
                              alignItems: "start", padding: "16px 0" }}>
                  <IconChip icon="trend-up" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: "var(--fg-2)" }}>Approx. rate used by your bank</div>
                    <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4, lineHeight: 1.5 }}>
                      Your bank sets this rate at the time of the transaction — it may differ slightly from the market rate.
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41", whiteSpace: "nowrap",
                                fontVariantNumeric: "tabular-nums" }}>
                    ₹{fmt(rate)}
                  </div>
                </div>
              </Card>
              <div style={{ display: "flex", gap: 8, padding: "8px 4px 0" }}>
                <i className="ph ph-info" style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 2 }}/>
                <div style={{ fontSize: 12, color: "var(--fg-3)", lineHeight: 1.5 }}>
                  Your bank may charge a separate forex fee for this transaction. Check your Forex Fee entries in Transactions.
                </div>
              </div>
            </div>
          );
        })() : null}

        {/* Detail rows */}
        <Card style={{ padding: "0 16px", marginBottom: 12 }}>
          {[
            { l: "Date & time", v: t.day || "Today", icon: "calendar-blank" },
            { l: "Category",    v: c.name, icon: c.icon, iconColor: c.color, iconBg: c.color + "1A" },
            { l: "Budget", v: budgetName || "Personal", icon: "wallet",
              onClick: () => setBudgetPick(true), chevron: true },
            { l: "Payment method", v: "UPI · HDFC ••4521", icon: "credit-card" },
            { l: "Reference",   v: "UPI/411923847211", icon: "hash" },
            { l: "Status",      v: "Posted", icon: "check-circle", pill: "income" },
          ].map((r, i, arr) => (
            <DetailRow key={r.l} icon={r.icon} iconColor={r.iconColor} iconBg={r.iconBg}
                       label={r.l} last={i === arr.length - 1}
                       onClick={r.onClick} chevron={r.chevron}>
              {r.pill ? <StatusPill tone={r.pill}>{r.v}</StatusPill> : r.v}
            </DetailRow>
          ))}
        </Card>

        {/* Notes · tags — the only editable fields */}
        <Card style={{ padding: "0 16px", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 16,
                        alignItems: "start", padding: "16px 0" }}>
            <IconChip icon="note-pencil" color={editing ? "#C9A84C" : "#141C41"}
                      bg={editing ? "var(--dhan-gold-bg)" : "var(--bg-surface)"} />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "var(--fg-2)" }}>Notes</div>
                {editing && (
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => { setEditing(false); setNewTag(null); }} style={{
                      border: "none", background: "none", cursor: "pointer",
                      fontFamily: "Poppins, sans-serif", fontSize: 12.5, fontWeight: 500,
                      color: "var(--fg-3)", padding: 0 }}>Cancel</button>
                    <button onClick={() => { setEditing(false); setNewTag(null); }} style={{
                      fontSize: 12.5 }} className="gold-btn">Done</button>
                  </div>
                )}
              </div>

              {editing ? (
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} autoFocus rows={3}
                          placeholder="Add a note…"
                          style={{ width: "100%", marginTop: 8, padding: 12,
                                   border: "1px solid var(--border-default)",
                                   borderRadius: "var(--r-input)", resize: "none",
                                   fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 400,
                                   color: "#141C41", lineHeight: 1.5, outline: "none",
                                   background: "var(--bg-elevated)", boxSizing: "border-box" }}/>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 500, color: "#141C41",
                              marginTop: 4, lineHeight: 1.5 }}>
                  {notes || <span style={{ color: "var(--fg-3)", fontWeight: 400 }}>No note yet</span>}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {tags.map(tag => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 6,
                                           fontSize: 12, fontWeight: 400,
                                           background: "var(--bg-surface)", color: "var(--fg-2)",
                                           padding: "4px 12px", borderRadius: 999 }}>
                    #{tag}
                    {editing && (
                      <button onClick={() => setTags(ts => ts.filter(x => x !== tag))}
                              aria-label={"Remove " + tag} style={{
                                border: "none", background: "none", cursor: "pointer",
                                display: "grid", placeItems: "center", padding: 0,
                                color: "var(--fg-3)" }}>
                        <i className="ph ph-x" style={{ fontSize: 11 }}/>
                      </button>
                    )}
                  </span>
                ))}
                {newTag !== null ? (
                  <input value={newTag} autoFocus
                         onChange={(e) => setNewTag(e.target.value.replace(/[^\w-]/g, ""))}
                         onKeyDown={(e) => {
                           if (e.key === "Enter" && newTag.trim()) {
                             setTags(ts => ts.concat([newTag.trim()])); setNewTag("");
                           }
                           if (e.key === "Escape") setNewTag(null);
                         }}
                         onBlur={() => { if (newTag.trim()) setTags(ts => ts.concat([newTag.trim()])); setNewTag(null); }}
                         placeholder="tag name"
                         style={{ width: 96, height: 26, borderRadius: 999,
                                  border: "1px solid #C9A84C", padding: "0 12px",
                                  fontFamily: "Poppins, sans-serif", fontSize: 12,
                                  color: "#141C41", outline: "none",
                                  background: "var(--bg-elevated)" }}/>
                ) : (
                  <button onClick={() => { setEditing(true); setNewTag(""); }} style={{
                    fontSize: 12, fontWeight: 400, fontFamily: "Poppins, sans-serif",
                    background: "transparent", border: "1px solid var(--border-default)",
                    color: "var(--fg-3)", padding: "3px 12px", borderRadius: 999,
                    cursor: "pointer" }}>+ Add tag</button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Split action — opens the split entry flow */}
        <Card onClick={() => onSplit?.(t)} style={{ padding: "0 16px", marginBottom: 12, cursor: "pointer" }}>
          <DetailRow icon="users-three" label="Split with friends"
                     sub="Share this expense · equal or custom" last chevron
                     onClick={() => onSplit?.(t)}>
            {""}
          </DetailRow>
        </Card>

        {/* Mini budget impact */}
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "8px 4px 8px" }}>Impact on {c.name} budget</div>
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between",
                          marginBottom: 8, fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: "var(--fg-2)" }}>₹3,200 of ₹5,000</span>
            <span style={{ color: "var(--fg-3)" }}>64%</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-surface)",
                          borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: "64%", height: "100%", background: c.color,
                            borderRadius: 999 }}/>
          </div>
        </Card>

      </div>

      {/* 3-dot actions */}
      <BottomSheet open={menu} onClose={() => setMenu(false)} title="Transaction actions">
        <div style={{ padding: "0 0 4px" }}>
          {[
            { i: "share-network", l: "Share screenshot", s: "Send a PNG of this receipt",
              go: () => setMenu(false) },
            // Lender-side override: only the person owed money can close a line out.
            ...(t.splitWith && t.splitWith.share > 0 && !isSettled ? [{
              i: "handshake", l: "Mark as settled", s: "Updates your records only — no payment is moved",
              go: () => { setMenu(false); onMarkSettled?.(t); },
            }] : []),
            { i: "note-pencil", l: "Edit", s: "Notes and tags only",
              go: () => { setMenu(false); setEditing(true); } },
            { i: "trash", l: "Delete transaction", s: "This can't be undone", danger: true,
              go: () => { setMenu(false); setConfirmDel(true); } },
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

      <BottomSheet open={budgetPick} onClose={() => setBudgetPick(false)} title="Assign to budget">
        <div style={{ padding: "0 0 4px" }}>
          {(budgets.length ? budgets : [{ id: "personal", name: "Personal", icon: "user" }]).map((b, i, arr) => (
            <div key={b.id} onClick={() => { onAssignBudget?.(t, b.id); setBudgetPick(false); }} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 22px", gap: 16, alignItems: "center",
              padding: "16px 0", cursor: "pointer",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <IconChip icon={b.icon || "wallet"} />
              <div style={{ fontSize: 14, color: "var(--fg-2)" }}>{b.name}</div>
              <SelectIndicator on={b.id === budgetId} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.4, padding: "8px 4px 0" }}>
          Dhan remembers this choice and suggests it for similar transactions later.
        </div>
      </BottomSheet>

      <BottomSheet open={confirmDel} onClose={() => setConfirmDel(false)} title="Delete transaction?">
        <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
          {t.m} · ₹{Math.abs(t.a).toLocaleString("en-IN")} will be removed from your transactions
          {t.splitWith ? ` and from your split history with ${t.splitWith.name}` : ""}. This can't be undone.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" full onClick={() => setConfirmDel(false)}>Cancel</Button>
          <button onClick={() => { setConfirmDel(false); onDelete?.(t); }} style={{
            height: 48, borderRadius: "var(--r-control)", cursor: "pointer", border: "none",
            background: "var(--expense)", color: "#fff", fontFamily: "Poppins, sans-serif",
            fontSize: 14, fontWeight: 600,
          }}>Delete</button>
        </div>
      </BottomSheet>
    </Phone>
  );
}

// 17. EDIT BUDGET
function EditBudgetScreen({ onBack }) {
  const [caps, setCaps] = useState({
    food: 5000, transport: 3000, shopping: 5000, bills: 6000,
    ent: 2000, health: 1500, groceries: 4000,
  });
  const total = Object.values(caps).reduce((s, v) => s + v, 0);
  const income = 82500;
  const setCap = (k, v) => setCaps(c => ({ ...c, [k]: Math.max(0, v) }));
  const cats = Object.keys(caps);

  return (
    <Phone label="17 Edit budget">
      <StatusBar />
      <ScreenHeader title="Edit budget" onBack={onBack}
        right={<button onClick={onBack} style={{
          background: "var(--dhan-navy)", color: "#fff", border: "none",
          borderRadius: "var(--r-control)", padding: "8px 14px",
          fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>}/>

      <div style={{ padding: "0 16px 4px" }}>
        <div style={{ background: "var(--dhan-navy)", borderRadius: "var(--r-card)", padding: 14,
                        color: "#fff", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.7,
                          letterSpacing: "0.01em" }}>
            Total monthly cap
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2,
                          fontVariantNumeric: "tabular-nums" }}>
            ₹{total.toLocaleString("en-IN")}
            <span style={{ fontSize: 13, opacity: 0.6, fontWeight: 500 }}>
              {" "}of ₹{income.toLocaleString("en-IN")} income
            </span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,.18)",
                          borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (total/income)*100)}%`, height: "100%",
                            background: "var(--dhan-gold)", borderRadius: 999 }}/>
          </div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6 }}>
            {total < income
              ? `₹${(income-total).toLocaleString("en-IN")} unallocated · keep saving`
              : `Over by ₹${(total-income).toLocaleString("en-IN")}`}
          </div>
        </div>
      </div>

      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px" }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "0 4px 8px" }}>Caps by category</div>

        {cats.map(k => {
          const c = CATEGORIES[k];
          const v = caps[k];
          return (
            <Card key={k} style={{ marginBottom: 8, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <CategoryIcon cat={k} size={36} tint />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-3)", fontVariantNumeric: "tabular-nums" }}>
                    {((v/income)*100).toFixed(0)}% of income
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "var(--bg-surface)", borderRadius: "var(--r-control)", padding: "2px 6px",
                }}>
                  <button onClick={() => setCap(k, v - 500)} style={{
                    width: 26, height: 26, borderRadius: "var(--r-input)", border: "none",
                    background: "#fff", cursor: "pointer", fontSize: 16, color: "var(--fg-2)" }}>−</button>
                  <div style={{ minWidth: 64, textAlign: "center", fontSize: 13, fontWeight: 600,
                                  fontVariantNumeric: "tabular-nums" }}>
                    ₹{v.toLocaleString("en-IN")}
                  </div>
                  <button onClick={() => setCap(k, v + 500)} style={{
                    width: 26, height: 26, borderRadius: "var(--r-input)", border: "none",
                    background: "#fff", cursor: "pointer", fontSize: 16, color: "var(--fg-2)" }}>+</button>
                </div>
              </div>
              <input type="range" min="0" max="20000" step="250"
                     value={v} onChange={(e) => setCap(k, parseInt(e.target.value, 10))}
                     style={{ width: "100%", accentColor: c.color }}/>
            </Card>
          );
        })}

        <button style={{
          width: "100%", marginTop: 6, padding: "12px",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--r-control)",
          background: "transparent", color: "var(--fg-2)",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          <i className="ph ph-plus" style={{ marginRight: 6 }}/>Add custom category
        </button>
      </div>
    </Phone>
  );
}

// 18. BILL DETAIL
function BillDetailScreen({ bill, onBack, onTogglePaid }) {
  const b = bill || { id: "rent", name: "Rent", amt: 24000, due: "May 1", dueIn: 8, icon: "house", status: "upcoming" };
  const isPaid = b.status === "paid";
  return (
    <Phone label="18 Bill detail">
      <StatusBar />
      <ScreenHeader title="Bill" onBack={onBack}
        right={<button style={{ width: 40, height: 40, borderRadius: "var(--r-input)", background: "#fff",
          border: "1px solid var(--border-subtle)", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <i className="ph ph-pencil-simple" style={{ fontSize: 18 }}/>
        </button>}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        <div style={{
          background: "var(--dhan-navy)", borderRadius: "var(--r-card-lg)", padding: 22,
          color: "#fff", marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140,
                          borderRadius: "50%",
                          background: "radial-gradient(circle, rgba(201,168,76,.2), transparent 70%)" }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative" }}>
            <div style={{ width: 48, height: 48, borderRadius: "var(--r-card-sm)",
                            background: "rgba(255,255,255,.12)",
                            display: "grid", placeItems: "center" }}>
              <i className={`ph-fill ph-${b.icon}`} style={{ fontSize: 24, color: "var(--dhan-gold-soft)" }}/>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{b.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Monthly · auto-detected</div>
            </div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700,
                          letterSpacing: "0.01em", position: "relative" }}>
            Amount due
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, marginTop: 4,
                          fontVariantNumeric: "tabular-nums", position: "relative" }}>
            ₹{b.amt.toLocaleString("en-IN")}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, position: "relative" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 999,
                            fontSize: 11, fontWeight: 600,
                            background: isPaid ? "rgba(46,125,91,.25)"
                              : b.dueIn <= 5 ? "rgba(216,152,56,.2)" : "rgba(255,255,255,.12)",
                            color: isPaid ? "#9CDFB6" : b.dueIn <= 5 ? "#FFD977" : "#fff" }}>
              <i className={`ph-fill ph-${isPaid ? "check-circle" : "calendar"}`} style={{ fontSize: 12 }}/>
              {isPaid ? "Paid" : `Due ${b.due} · in ${b.dueIn}d`}
            </span>
          </div>
        </div>

        {!isPaid && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Button variant="primary" full size="md" icon="check-circle"
                    onClick={() => onTogglePaid?.(b.id)}>Mark paid</Button>
            <Button variant="outline" full size="md" icon="bell">Snooze</Button>
          </div>
        )}

        {/* Reminder */}
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "4px 4px 8px" }}>Reminders</div>
        <Card style={{ padding: 14, marginBottom: 12 }}>
          {[
            { l: "3 days before", on: true },
            { l: "1 day before",  on: true },
            { l: "On due date",   on: false },
          ].map((r, i, arr) => (
            <div key={r.l} style={{
              display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
              alignItems: "center", padding: "16px 0",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <IconChip icon="bell" />
              <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg-2)" }}>{r.l}</div>
              <div className={`tgl ${r.on ? "on" : ""}`}/>
            </div>
          ))}
        </Card>

        {/* Payment history */}
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "8px 4px 8px" }}>Last 6 payments</div>
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, marginBottom: 8 }}>
            {[24000, 24000, 23500, 24000, 24000, 24000, 24000].map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
                                       alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%",
                                height: `${(v / 24500) * 80}px`,
                                background: i === 6 ? "var(--dhan-gold)" : "var(--dhan-navy)",
                                borderRadius: 4, opacity: i === 6 ? 1 : 0.7 }}/>
                <div style={{ fontSize: 9, color: "var(--fg-3)", fontWeight: 600 }}>
                  {["Nov","Dec","Jan","Feb","Mar","Apr","May"][i]}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-2)", textAlign: "center" }}>
            Avg ₹23,929/mo · steady for 6 months
          </div>
        </Card>

        <Button variant="outline" full size="md" icon="trash"
                style={{ marginTop: 10, color: "var(--expense)", borderColor: "var(--expense-bg)" }}>
          Delete bill
        </Button>
      </div>
    </Phone>
  );
}

// 20. GOALS
const GOAL_ICONS = ["shield-check", "airplane-tilt", "laptop", "gift", "house-line", "graduation-cap", "car", "target"];
const GOAL_COLORS = ["#2E7D5B", "#6A8FD4", "#C97BB6", "#E88B5C", "#141C41", "#C9A84C"];

function EditGoalSheet({ open, goal, onClose, onSave, onDelete }) {
  const [d, setD] = useState(goal || {});
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (open) { setD(goal || {}); setConfirm(false); } }, [open, goal]);
  if (!goal) return null;
  const set = (k, v) => setD(x => ({ ...x, [k]: v }));
  const num = (v) => v.replace(/[^\d]/g, "");

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit goal">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-control)",
                      background: (d.color || "#141C41") + "1A", color: d.color,
                      display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Glyph icon={d.icon} size={22} fill />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>Goal name</div>
          <input value={d.t || ""} onChange={(e) => set("t", e.target.value)}
                 style={{ width: "100%", border: "none", borderBottom: "1px dashed var(--border-strong)",
                          background: "transparent", outline: "none", padding: "2px 0",
                          fontFamily: "Poppins, sans-serif", fontSize: 16, fontWeight: 600,
                          color: "#141C41" }}/>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 8 }}>Icon</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {GOAL_ICONS.map(ic => (
          <button key={ic} onClick={() => set("icon", ic)} aria-label={ic} style={{
            width: 40, height: 40, borderRadius: "var(--r-input)", cursor: "pointer",
            background: d.icon === ic ? (d.color || "#141C41") + "1A" : "var(--bg-surface)",
            border: "1px solid " + (d.icon === ic ? (d.color || "#141C41") : "transparent"),
            color: d.icon === ic ? d.color : "var(--fg-3)",
            display: "grid", placeItems: "center" }}>
            <Glyph icon={ic} size={18} fill />
          </button>
        ))}
        <EmojiTile value={d.icon} onChange={(em) => set("icon", em)} size={40}
                   activeBg={(d.color || "#141C41") + "1A"} activeColor={d.color || "#141C41"} />
      </div>

      <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 8 }}>Colour</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {GOAL_COLORS.map(c => (
          <button key={c} onClick={() => set("color", c)} aria-label={"Colour " + c} style={{
            width: 32, height: 32, borderRadius: 999, background: c, cursor: "pointer",
            border: "2px solid " + (d.color === c ? "#141C41" : "transparent"),
            boxShadow: d.color === c ? "0 0 0 2px #fff inset" : "none" }}/>
        ))}
      </div>

      <Field label="Target amount" prefix="₹" value={String(d.target ?? "")}
             onChange={(e) => set("target", parseInt(num(e.target.value) || "0", 10))} />
      <Field label="Monthly contribution" prefix="₹" suffix="/mo" value={String(d.contrib ?? "")}
             onChange={(e) => set("contrib", parseInt(num(e.target.value) || "0", 10))} />
      <Field label="Target date (ETA)" value={d.eta || ""}
             onChange={(e) => set("eta", e.target.value)} />

      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        <Button variant="primary" full size="lg" onClick={() => onSave?.(d)}>Save changes</Button>
        {confirm ? (
          <div style={{ background: "var(--expense-bg)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, color: "#141C41", marginBottom: 12 }}>
              Delete “{d.t}”? Saved progress stays in your account, but the goal is removed.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => setConfirm(false)} style={{
                height: 44, borderRadius: "var(--r-control)", cursor: "pointer",
                background: "transparent", border: "1px solid var(--border-default)",
                fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 500,
                color: "var(--fg-2)" }}>Keep goal</button>
              <button onClick={() => onDelete?.(d)} style={{
                height: 44, borderRadius: "var(--r-control)", cursor: "pointer",
                background: "var(--expense)", border: "none",
                fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600,
                color: "#fff" }}>Delete goal</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} style={{
            height: 48, borderRadius: "var(--r-control)", cursor: "pointer",
            background: "transparent", border: "1px solid var(--expense-bg)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 500,
            color: "var(--expense)" }}>
            <i className="ph ph-trash" style={{ fontSize: 16 }}/> Delete goal
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

function GoalsScreen({ onBack, tab, setTab, onToast }) {
  const [goals, setGoals] = useState([
    { id: "emergency", t: "Emergency fund",     icon: "shield-check",  saved: 240000, target: 600000,
      eta: "Sep 2026", contrib: 15000, color: "#2E7D5B" },
    { id: "trip",      t: "Japan trip",         icon: "airplane-tilt", saved: 85000,  target: 300000,
      eta: "Mar 2027", contrib: 8000,  color: "#6A8FD4" },
    { id: "macbook",   t: "New MacBook",        icon: "laptop",        saved: 92000,  target: 180000,
      eta: "Jul 2026", contrib: 12000, color: "#C97BB6" },
    { id: "wedding",   t: "Anniversary gift",   icon: "gift",          saved: 30000,  target: 50000,
      eta: "Jun 2026", contrib: 5000,  color: "#E88B5C" },
  ]);
  const [editing, setEditing] = useState(null);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  return (
    <Phone label="20 Goals">
      <StatusBar />
      <ScreenHeader title="Savings goals" onBack={onBack}
        right={<button style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
          background: "var(--dhan-navy)", color: "#fff", border: "none",
          display: "grid", placeItems: "center", cursor: "pointer" }}>
          <i className="ph ph-plus" style={{ fontSize: 18 }}/>
        </button>}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {/* Hero summary */}
        <div style={{ background: "var(--dhan-navy)", borderRadius: "var(--r-card-lg)", padding: 20,
                        color: "#fff", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160,
                          borderRadius: "50%",
                          background: "radial-gradient(circle, rgba(201,168,76,.25), transparent 70%)" }}/>
          <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700,
                          letterSpacing: "0.01em", position: "relative" }}>
            Saved across all goals
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4,
                          fontVariantNumeric: "tabular-nums", position: "relative", letterSpacing: "-0.02em" }}>
            ₹{totalSaved.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, position: "relative" }}>
            of ₹{totalTarget.toLocaleString("en-IN")} target · {Math.round((totalSaved/totalTarget)*100)}% there
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,.18)",
                          borderRadius: 999, marginTop: 14, overflow: "hidden", position: "relative" }}>
            <div style={{ width: `${(totalSaved/totalTarget)*100}%`, height: "100%",
                            background: "var(--dhan-gold)", borderRadius: 999 }}/>
          </div>
        </div>

        {/* Active goals */}
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "0 4px 8px" }}>Active · {goals.length}</div>

        {goals.map(g => {
          const pct = (g.saved / g.target) * 100;
          return (
            <Card key={g.id} style={{ padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "var(--r-control)",
                                background: g.color + "1A", color: g.color,
                                display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Glyph icon={g.icon} size={22} fill />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{g.t}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
                    ETA {g.eta} · ₹{g.contrib.toLocaleString("en-IN")}/mo
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(pct)}%
                  </div>
                  <button onClick={() => setEditing(g)} aria-label={"Edit " + g.t} style={{
                    width: 28, height: 28, borderRadius: "var(--r-input)",
                    background: "var(--bg-surface)", border: "none", cursor: "pointer",
                    display: "grid", placeItems: "center", color: "#141C41" }}>
                    <i className="ph ph-pencil-simple" style={{ fontSize: 14 }}/>
                  </button>
                </div>
              </div>
              <div style={{ height: 8, background: "var(--bg-surface)",
                              borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${pct}%`, height: "100%",
                                background: g.color, borderRadius: 999,
                                transition: "width .6s var(--ease-out)" }}/>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between",
                              fontSize: 11, color: "var(--fg-2)", fontWeight: 600,
                              fontVariantNumeric: "tabular-nums" }}>
                <span>₹{g.saved.toLocaleString("en-IN")}</span>
                <span style={{ color: "var(--fg-3)" }}>of ₹{g.target.toLocaleString("en-IN")}</span>
              </div>
            </Card>
          );
        })}

        <button style={{
          width: "100%", marginTop: 8, padding: "16px",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--r-card-sm)",
          background: "transparent", color: "var(--fg-2)",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <i className="ph ph-plus-circle" style={{ fontSize: 18 }}/>
          New savings goal
        </button>
      </div>
      {tab && setTab && <TabBar active={tab} onChange={setTab} />}
      <EditGoalSheet open={!!editing} goal={editing} onClose={() => setEditing(null)}
                     onSave={(d) => { setGoals(gs => gs.map(g => g.id === d.id ? { ...g, ...d } : g));
                                      setEditing(null); onToast?.("Goal updated"); }}
                     onDelete={(d) => { setGoals(gs => gs.filter(g => g.id !== d.id));
                                        setEditing(null); onToast?.("Goal deleted"); }} />
    </Phone>
  );
}

// 21. PROFILE EDIT
function ProfileEditScreen({ onBack, userName = "Priya", onToast }) {
  const [name, setName] = useState(userName + " Sharma");
  const [email, setEmail] = useState("priya.s@gmail.com");
  const [phone] = useState("+91 98210 45678");
  const [dob, setDob] = useState("12 Aug 1996");
  const [city, setCity] = useState("Bengaluru, KA");
  const [photo, setPhoto] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [preview, setPreview] = useState(null); // { src, source }
  const fileRef = React.useRef(null);
  const saved = React.useRef({});

  // auto-save on blur when the value actually changed
  const commit = (key, value) => {
    if (saved.current[key] === value) return;
    saved.current[key] = value;
    onToast?.("Changes saved");
  };

  const onPick = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setSheet(false); setPreview({ src: r.result, source: "Photo library" }); };
    r.readAsDataURL(f);
  };

  const avatar = (size, fs) => photo ? (
    <img src={photo} alt="" style={{ width: size, height: size, borderRadius: 999, objectFit: "cover", display: "block" }}/>
  ) : (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: "linear-gradient(135deg, var(--dhan-gold), var(--dhan-gold-soft))",
      display: "grid", placeItems: "center",
      color: "var(--dhan-navy)", fontWeight: 700, fontSize: fs,
    }}>{name[0]}</div>
  );

  return (
    <Phone bg="#fff" label="21 Profile">
      <StatusBar />
      <ScreenHeader title="Profile" onBack={onBack} />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {/* Avatar */}
        <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
          <div style={{ position: "relative", width: 92, height: 92, margin: "0 auto" }}>
            {avatar(92, 36)}
            <button aria-label="Change photo" onClick={() => setSheet(true)} style={{
              position: "absolute", bottom: -2, right: -2,
              width: 32, height: 32, borderRadius: 999,
              background: "var(--dhan-navy)", color: "#fff",
              border: "3px solid #fff", cursor: "pointer",
              display: "grid", placeItems: "center",
            }}>
              <i className="ph ph-camera" style={{ fontSize: 14 }}/>
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 10 }}>
            Tap to change photo
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }}/>
        </div>

        <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)}
               onBlur={() => commit("name", name)} />
        <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email"
               onBlur={() => commit("email", email)} />
        <Field label="Mobile" value={phone} onChange={() => {}} disabled
               right={<i className="ph-fill ph-check-circle" style={{ fontSize: 16, color: "var(--income)" }}/>} />
        <Field label="Date of birth" value={dob} onChange={(e) => setDob(e.target.value)}
               onBlur={() => commit("dob", dob)} />
        <Field label="City" value={city} onChange={(e) => setCity(e.target.value)}
               onBlur={() => commit("city", city)} />

        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "12px 4px 8px" }}>Account</div>
        <Card style={{ padding: "4px 16px" }}>
          {[
            { l: "Change PIN",  i: "key" },
            { l: "Two-factor auth",  i: "shield-check", v: "On" },
            { l: "Delete account", i: "trash", danger: true },
          ].map((it, i, arr) => (
            <div key={it.l} style={{
              display: "grid", gridTemplateColumns: "40px 1fr auto 16px", gap: 16,
              alignItems: "center", padding: "16px 0",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}>
              <IconChip icon={it.i} color={it.danger ? "var(--expense)" : "#141C41"}
                        bg={it.danger ? "var(--expense-bg)" : "var(--bg-surface)"} />
              <div style={{ fontSize: 14, fontWeight: 400,
                              color: it.danger ? "var(--expense)" : "var(--fg-2)" }}>{it.l}</div>
              <div style={{ fontSize: 13, color: "#141C41", fontWeight: 600 }}>{it.v || ""}</div>
              <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
            </div>
          ))}
        </Card>
      </div>

      {/* Photo source picker */}
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Profile photo">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { l: "Upload photo", s: "Choose from your photo library", i: "image",
              go: () => fileRef.current?.click() },
            { l: "Use Google account photo", s: email, i: "google-logo", brand: "assets/google-icon.svg",
              go: () => { setSheet(false); setPreview({ src: "assets/google-avatar.png", source: "Google account" }); } },
          ].map((o, i) => (
            <button key={o.l} onClick={o.go} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 16px", gap: 16, alignItems: "center",
              padding: "16px 0", background: "none", cursor: "pointer", textAlign: "left",
              border: "none", borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
            }}>
              {o.brand ? (
                <span style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
                               background: "var(--bg-surface)", display: "grid",
                               placeItems: "center" }}>
                  <img src={o.brand} alt="" style={{ width: 20, height: 20, display: "block" }}/>
                </span>
              ) : (
                <IconChip icon={o.i} color="#141C41" bg="var(--bg-surface)" />
              )}
              <div>
                <div style={{ fontSize: 14, color: "var(--fg-1)" }}>{o.l}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{o.s}</div>
              </div>
              <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
            </button>
          ))}
          {photo && (
            <button onClick={() => { setSheet(false); setPhoto(null); onToast?.("Changes saved"); }}
                    style={{ marginTop: 8, padding: "14px 0", background: "none",
                             border: "1px solid var(--border-subtle)", borderRadius: "var(--r-control)",
                             color: "var(--expense)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Remove current photo
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Preview / confirm */}
      <BottomSheet open={!!preview} onClose={() => setPreview(null)} title="Use this photo?">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {preview?.src && (
            <img src={preview.src} alt="" style={{ width: 120, height: 120, borderRadius: 999,
                                                   objectFit: "cover", display: "block" }}/>
          )}
          <div style={{ fontSize: 12, color: "var(--fg-3)" }}>From {preview?.source}</div>
          <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 4 }}>
            <Button variant="secondary" full onClick={() => setPreview(null)}>Cancel</Button>
            <Button variant="primary" full onClick={() => {
              if (!preview?.src) { setPreview(null); return; }
              setPhoto(preview.src); setPreview(null); onToast?.("Changes saved");
            }}>Use photo</Button>
          </div>
        </div>
      </BottomSheet>
    </Phone>
  );
}

// 22. LINKED ACCOUNTS
function LinkedAccountsScreen({ onBack }) {
  const accounts = [
    { id: "hdfc",  name: "HDFC Bank", short: "HD", color: "#004C8F",
      mask: "••4521", type: "Savings", last: "2 min ago", balance: 124500, primary: true },
    { id: "icici", name: "ICICI Bank", short: "IC", color: "#F37920",
      mask: "••8843", type: "Salary",  last: "10 min ago", balance: 8920 },
    { id: "axis",  name: "Axis Bank",  short: "AX", color: "#97144D",
      mask: "••2117", type: "Credit card", last: "1 hr ago", balance: -32180 },
  ];
  return (
    <Phone label="22 Linked accounts">
      <StatusBar />
      <ScreenHeader title="Linked accounts" onBack={onBack}
        right={<button style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
          background: "var(--dhan-navy)", color: "#fff", border: "none",
          display: "grid", placeItems: "center", cursor: "pointer" }}>
          <i className="ph ph-plus" style={{ fontSize: 18 }}/>
        </button>}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        <div style={{ background: "var(--income-bg)", borderRadius: "var(--r-control)", padding: "10px 12px",
                        marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <i className="ph-fill ph-check-circle" style={{ fontSize: 18, color: "var(--income)", flexShrink: 0 }}/>
          <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4 }}>
            <b style={{ color: "var(--fg-1)" }}>SMS sync working.</b> Last update 2 minutes ago across {accounts.length} accounts.
          </div>
        </div>

        {accounts.map(a => (
          <Card key={a.id} style={{ padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--r-control)",
                              background: a.color, color: "#fff",
                              display: "grid", placeItems: "center",
                              fontWeight: 600, fontSize: 14 }}>{a.short}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                  {a.primary && (
                    <span style={{ fontSize: 9, fontWeight: 700,
                                    background: "var(--dhan-gold-bg)", color: "#8E7420",
                                    padding: "2px 6px", borderRadius: 999, letterSpacing: ".04em" }}>
                      PRIMARY
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
                  {a.type} · {a.mask}
                </div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer",
                                color: "var(--fg-3)" }}>
                <i className="ph ph-dots-three" style={{ fontSize: 20 }}/>
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--fg-3)",
                                letterSpacing: "0.01em" }}>
                  {a.balance < 0 ? "Outstanding" : "Available"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700,
                                fontVariantNumeric: "tabular-nums",
                                color: a.balance < 0 ? "var(--expense)" : "var(--fg-1)" }}>
                  ₹{Math.abs(a.balance).toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6,
                              fontSize: 11, color: "var(--income)", fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999,
                                background: "var(--income)" }}/>
                Synced {a.last}
              </div>
            </div>
          </Card>
        ))}

        <button style={{
          width: "100%", marginTop: 6, padding: "14px",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--r-control)",
          background: "transparent", color: "var(--fg-2)",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <i className="ph ph-plus" style={{ fontSize: 16 }}/>
          Link another account
        </button>

        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "20px 4px 8px" }}>Privacy</div>
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
            Dhan reads only SMS from these banks. We never store login credentials, never connect to your bank's servers.
            <button style={{ background: "none", border: "none", color: "var(--dhan-navy)",
                              fontWeight: 500, fontSize: 12, cursor: "pointer", padding: 0,
                              marginLeft: 4 }}>
              Learn more →
            </button>
          </div>
        </Card>
      </div>
    </Phone>
  );
}

// 23. HELP & SUPPORT
function HelpScreen({ onBack }) {
  const [q, setQ] = useState("");
  const topics = [
    { i: "chat-circle-text", t: "How does SMS reading work?", c: "Setup" },
    { i: "credit-card",      t: "Add a new bank account",      c: "Accounts" },
    { i: "receipt",          t: "Set up bill reminders",       c: "Bills" },
    { i: "users-three",      t: "Splitting bills with friends", c: "Plus" },
    { i: "shield-check",     t: "Privacy & data security",     c: "Privacy" },
    { i: "download-simple",  t: "Export your data",            c: "Data" },
  ];
  return (
    <Phone label="23 Help">
      <StatusBar />
      <ScreenHeader title="Help & support" onBack={onBack}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--r-control)", padding: "0 12px", height: 48, marginBottom: 14,
        }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 18, color: "var(--fg-3)" }}/>
          <input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Search for help…"
                 style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                          fontSize: 14, color: "var(--fg-1)" }}/>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { i: "chats", t: "Chat with us", b: "Avg 3 min", color: "var(--dhan-navy)" },
            { i: "envelope", t: "Email support", b: "help@dhan.in", color: "var(--dhan-gold)" },
          ].map(c => (
            <button key={c.t} style={{
              background: "#fff", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--r-card-sm)", padding: 14, cursor: "pointer", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--r-control)",
                              background: c.color + "1A", color: c.color,
                              display: "grid", placeItems: "center" }}>
                <i className={`ph-fill ph-${c.i}`} style={{ fontSize: 18 }}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.t}</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{c.b}</div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                        letterSpacing: "0.01em",
                        margin: "0 4px 8px" }}>Popular topics</div>
        <Card style={{ padding: "4px 16px", marginBottom: 14 }}>
          {topics.map((it, i) => (
            <div key={it.t} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 16px", gap: 16,
              alignItems: "center", padding: "16px 0",
              borderBottom: i === topics.length - 1 ? "none" : "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}>
              <IconChip icon={it.i} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg-2)" }}>{it.t}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{it.c}</div>
              </div>
              <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
            </div>
          ))}
        </Card>

        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--r-card-sm)", padding: 14,
                        textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Still stuck?</div>
          <div style={{ fontSize: 12, color: "var(--fg-2)", marginBottom: 10, lineHeight: 1.4 }}>
            We reply within a few hours, even on weekends.
          </div>
          <Button variant="primary" size="md" icon="paper-plane-tilt">Contact support</Button>
        </div>
      </div>
    </Phone>
  );
}

// 24. PLUS PAYWALL
function PlusPaywallScreen({ onBack, onUpgrade, note }) {
  const [plan, setPlan] = useState("annual");
  const features = [
    { i: "users-three",       t: "Split bills with friends",
      b: "Track who owes who, settle up via UPI." },
    { i: "sparkle",           t: "AI-powered insights",
      b: "Anomaly detection, savings tips, monthly reports." },
    { i: "stack",             t: "Custom categories & rules",
      b: "Auto-tag merchants. Build your own categories." },
    { i: "download-simple",   t: "Bank-grade exports",
      b: "PDF, Excel, ITR-ready statements." },
    { i: "shield-check",      t: "Priority support",
      b: "Skip the queue. Reply within 1 hour." },
    { i: "trend-up",          t: "Multi-account analytics",
      b: "Combined dashboard across all linked accounts." },
  ];
  return (
    <Phone bg="var(--dhan-ink)" label="24 Plus paywall">
      <StatusBar dark />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column",
                      color: "#fff", overflow: "hidden" }}>
        {/* Decorative gradient */}
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
                        width: 400, height: 400, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(201,168,76,.3), transparent 60%)",
                        pointerEvents: "none" }}/>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px",
                        position: "relative" }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 999,
            background: "rgba(255,255,255,.08)", border: "none", cursor: "pointer",
            display: "grid", placeItems: "center", color: "#fff" }}>
            <i className="ph ph-x" style={{ fontSize: 20 }}/>
          </button>
        </div>

        <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 24px 16px",
                                                 position: "relative" }}>
          <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "var(--r-card)",
                            background: "linear-gradient(135deg, var(--dhan-gold), var(--dhan-gold-soft))",
                            margin: "0 auto 14px", display: "grid", placeItems: "center",
                            boxShadow: "0 12px 40px rgba(201,168,76,.4)" }}>
              <i className="ph-fill ph-star" style={{ fontSize: 32, color: "var(--dhan-ink)" }}/>
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--dhan-gold)",
                            letterSpacing: "0.01em", marginBottom: 6 }}>
              Dhan Plus
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em",
                            lineHeight: 1.2 }}>
              Money superpowers,<br/>fewer surprises.
            </div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8, lineHeight: 1.4 }}>
              {note || "Unlock everything Dhan can do for you."}
            </div>
          </div>

          {/* Plans */}
          <div style={{ marginBottom: 18 }}>
            {[
              { id: "annual",  l: "Annual",   p: "₹1,799",  sub: "₹150/mo · save ₹600",
                tag: "BEST VALUE" },
              { id: "monthly", l: "Monthly",  p: "₹199",    sub: "Per month · cancel anytime" },
            ].map(o => {
              const active = plan === o.id;
              return (
                <div key={o.id} onClick={() => setPlan(o.id)} style={{
                  background: active ? "rgba(201,168,76,.12)" : "rgba(255,255,255,.04)",
                  border: `1.5px solid ${active ? "var(--dhan-gold)" : "rgba(255,255,255,.1)"}`,
                  borderRadius: "var(--r-card)", padding: 14, marginBottom: 8, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12, position: "relative",
                  transition: "all .2s",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 999,
                    border: `2px solid ${active ? "var(--dhan-gold)" : "rgba(255,255,255,.3)"}`,
                    background: active ? "var(--dhan-gold)" : "transparent",
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    {active && <i className="ph-fill ph-check" style={{ fontSize: 12, color: "var(--dhan-ink)" }}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{o.l}</div>
                      {o.tag && (
                        <span style={{ fontSize: 9, fontWeight: 700,
                                        background: "var(--dhan-gold)", color: "var(--dhan-ink)",
                                        padding: "2px 6px", borderRadius: 999,
                                        letterSpacing: ".04em" }}>{o.tag}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{o.sub}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {o.p}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features */}
          <div style={{ background: "rgba(255,255,255,.04)", borderRadius: "var(--r-card)", padding: 14,
                         marginBottom: 14 }}>
            {features.map((f, i) => (
              <div key={f.t} style={{
                display: "grid", gridTemplateColumns: "32px 1fr", gap: 12,
                padding: "16px 0",
                borderBottom: i === features.length - 1 ? "none" : "1px solid rgba(255,255,255,.06)",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: "var(--r-input)",
                                background: "rgba(201,168,76,.15)", color: "var(--dhan-gold)",
                                display: "grid", placeItems: "center" }}>
                  <i className={`ph-fill ph-${f.i}`} style={{ fontSize: 16 }}/>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.t}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 2, lineHeight: 1.4 }}>{f.b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "12px 24px 24px", background: "linear-gradient(transparent, var(--dhan-ink) 30%)",
                        position: "relative" }}>
          <button onClick={onUpgrade} style={{
            width: "100%", height: 52, borderRadius: "var(--r-card-sm)",
            background: "linear-gradient(135deg, var(--dhan-gold), var(--dhan-gold-soft))",
            color: "var(--dhan-ink)", border: "none",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: "0 12px 40px rgba(201,168,76,.4)",
          }}>
            Start free 7-day trial
            <i className="ph-bold ph-arrow-right" style={{ fontSize: 16 }}/>
          </button>
          <div style={{ fontSize: 10.5, opacity: 0.6, textAlign: "center", marginTop: 10, lineHeight: 1.4 }}>
            Cancel anytime. {plan === "annual" ? "Then ₹1,799/year." : "Then ₹199/month."}
            <br/>Restore purchase · Terms · Privacy
          </div>
        </div>
      </div>
    </Phone>
  );
}

// 25. EMPTY / ERROR STATES — gallery
function EmptyStateScreen({ onBack }) {
  const states = [
    { id: "no-txn",   icon: "receipt-x", color: "var(--dhan-navy)",
      t: "No transactions yet",
      b: "Once your bank sends an SMS, we'll log it here automatically. Add one manually to get started.",
      cta: "Add transaction" },
    { id: "search",   icon: "magnifying-glass", color: "var(--fg-3)",
      t: "Nothing matches",
      b: "Try a different filter or clear your search.",
      cta: "Clear filters" },
    { id: "offline",  icon: "wifi-slash", color: "var(--warning)",
      t: "You're offline",
      b: "Some data may be out of date. We'll sync as soon as you're back online.",
      cta: "Try again" },
    { id: "error",    icon: "warning-octagon", color: "var(--expense)",
      t: "Couldn't load this",
      b: "Something went wrong on our end. We've logged it and you can try again.",
      cta: "Retry" },
  ];
  const [active, setActive] = useState(0);
  const s = states[active];
  return (
    <Phone label="25 Empty states">
      <StatusBar />
      <ScreenHeader title="Empty & error states" onBack={onBack}/>
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4,
                        scrollbarWidth: "none" }}>
          {states.map((st, i) => (
            <Chip key={st.id} active={active === i} onClick={() => setActive(i)}>
              {st.t.split(" ").slice(0, 2).join(" ")}
            </Chip>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", padding: "20px 32px",
                      textAlign: "center" }}>
        <div style={{
          width: 96, height: 96, borderRadius: "var(--r-card-lg)",
          background: s.color + "1A", color: s.color,
          display: "grid", placeItems: "center", marginBottom: 18,
        }}>
          <i className={`ph ph-${s.icon}`} style={{ fontSize: 44 }}/>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>
          {s.t}
        </div>
        <div style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.5,
                        textWrap: "pretty", maxWidth: 280, marginBottom: 24 }}>
          {s.b}
        </div>
        <Button variant="primary" size="md" icon={s.id === "error" || s.id === "offline" ? "arrow-clockwise" : "plus"}>
          {s.cta}
        </Button>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  TxnDetailScreen, EditBudgetScreen, BillDetailScreen,
  GoalsScreen, EditGoalSheet, ProfileEditScreen,
  LinkedAccountsScreen, HelpScreen, PlusPaywallScreen, EmptyStateScreen,
});
