// ─── Detail screens: Debt, Settings, Notifications, Friend, Add-txn sheet ───

// 09. DEBT TRACKER
function DebtScreen({ tab, setTab, nav, isPlus, onOpenSheet, onOpenFriend }) {
  const owed = 3400;  // you're owed
  const owe = 1250;   // you owe

  const friends = [
    { id: "rohan",    name: "Rohan K.",      avatar: "#E88B5C", net: +450,  last: "Uber split · Mar 12" },
    { id: "aisha",    name: "Aisha M.",      avatar: "#6A8FD4", net: +1200, last: "Goa trip · Feb 28" },
    { id: "karan",    name: "Karan P.",      avatar: "#C97BB6", net: -850,  last: "Dinner at Indigo · Apr 18" },
    { id: "priyank",  name: "Priyank S.",    avatar: "#7C9B5F", net: +1750, last: "Concert tickets · Apr 2" },
    { id: "neha",     name: "Neha R.",       avatar: "#5CB4A8", net: -400,  last: "Grocery run · Apr 10" },
    { id: "dev",      name: "Dev A.",        avatar: "#B079D9", net: 0,     last: "Settled up · Apr 20" },
  ];

  return (
    <Phone label="09 Debt">
      <StatusBar />
      <ScreenHeader title="Who owes who" onBack={() => nav?.("home")}
        right={<button onClick={() => onOpenSheet?.("add-split")} style={{
          width: 40, height: 40, borderRadius: "var(--r-input)", background: "var(--dhan-navy)", color: "#fff",
          border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <i className="ph ph-plus" style={{ fontSize: 18 }}/>
        </button>} />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: "var(--income-bg)", borderRadius: "var(--r-card)", padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <i className="ph-fill ph-arrow-down-left" style={{ fontSize: 14, color: "var(--income)" }}/>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--income)",
                            letterSpacing: "0.01em" }}>You're owed</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--income)",
                          fontVariantNumeric: "tabular-nums" }}>₹{owed.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>from 3 people</div>
          </div>
          <div style={{ background: "var(--expense-bg)", borderRadius: "var(--r-card)", padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <i className="ph-fill ph-arrow-up-right" style={{ fontSize: 14, color: "var(--expense)" }}/>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--expense)",
                            letterSpacing: "0.01em" }}>You owe</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--expense)",
                          fontVariantNumeric: "tabular-nums" }}>₹{owe.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>to 2 people</div>
          </div>
        </div>

        {/* Plus upsell or friends list */}
        {!isPlus ? (
          <div style={{ position: "relative" }}>
            <div style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none",
                          opacity: 0.7 }}>
              {friends.map(f => (
                <FriendRow key={f.id} f={f} />
              ))}
            </div>
            {/* Upsell overlay */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "flex-start", justifyContent: "center",
              paddingTop: 24,
            }}>
              <div style={{
                background: "#fff", borderRadius: "var(--r-card-lg)", padding: 22,
                boxShadow: "0 20px 50px rgba(20,28,65,.16)",
                textAlign: "center", maxWidth: 300,
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "var(--r-card-sm)", margin: "0 auto 10px",
                  background: "linear-gradient(135deg, var(--dhan-navy), var(--dhan-navy-80))",
                  display: "grid", placeItems: "center",
                }}>
                  <i className="ph-fill ph-star" style={{ fontSize: 24, color: "var(--dhan-gold)" }}/>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  Unlock debt tracker
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 14, lineHeight: 1.4 }}>
                  Split bills with friends, track what you're owed, and settle up — a Dhan Plus feature.
                </div>
                <Button variant="primary" full size="md" onClick={() => nav?.("settings")}>
                  Upgrade to Plus
                </Button>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 8 }}>
                  ₹199/month · cancel anytime
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em",
                          margin: "4px 4px 8px" }}>Friends</div>
            {friends.map(f => <FriendRow key={f.id} f={f} onClick={() => onOpenFriend?.(f)} />)}
          </>
        )}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </Phone>
  );
}

function FriendRow({ f, onClick }) {
  const owes = f.net > 0, youOwe = f.net < 0, settled = f.net === 0;
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: "var(--r-card-sm)", padding: 12, marginBottom: 8,
      display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 12,
      alignItems: "center", boxShadow: "var(--shadow-card)",
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 999, background: f.avatar,
                    display: "grid", placeItems: "center", color: "#fff", fontWeight: 600, fontSize: 16 }}>
        {f.name.split(" ").map(s => s[0]).join("").slice(0,2)}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 1 }}>{f.last}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        {settled ? (
          <StatusPill tone="neutral">Settled</StatusPill>
        ) : (
          <>
            <div style={{ fontSize: 10, fontWeight: 500,
                          color: owes ? "var(--income)" : "var(--expense)", letterSpacing: ".04em" }}>
              {owes ? "Owes you" : "You owe"}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                          color: owes ? "var(--income)" : "var(--expense)", marginTop: 1 }}>
              ₹{Math.abs(f.net).toLocaleString("en-IN")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Friend detail
function FriendDetailScreen({ friend, onBack, onSettle, onOpenTxn, onToast,
                              deleted = [], settled = [], onSettleTxns, onDeleteTxns }) {
  const [selMode, setSelMode] = useState(false);
  const [sel, setSel] = useState([]);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(null); // "settle" | "delete"
  const [exportSheet, setExportSheet] = useState(false);
  const [requestSheet, setRequestSheet] = useState(false);
  const press = React.useRef(null);
  useEffect(() => { setSelMode(false); setSel([]); }, [friend && friend.id]);
  if (!friend) return null;

  // Same transaction records the main Transactions list shows — one source of truth.
  const owed = friend.net > 0;
  const txns = [
    { id: `sp-${friend.id}-1`, d: "Apr 18", day: "Sat · Apr 18", m: "Dinner at Indigo", a: owed ? -1200 : -640,
      c: "food", s: "Dinner · UPI · 9:20 PM", split: "You split ₹1,200", share: owed ? 450 : -320 },
    { id: `sp-${friend.id}-2`, d: "Apr 10", day: "Fri · Apr 10", m: "Grocery run", a: owed ? -600 : -400,
      c: "groceries", s: "Groceries · UPI · 6:05 PM", split: "You covered ₹600", share: owed ? 300 : -200 },
    { id: `sp-${friend.id}-3`, d: "Mar 24", day: "Tue · Mar 24", m: "Uber to airport", a: owed ? -900 : -660,
      c: "transport", s: "Airport · UPI · 5:40 AM", split: "Split 50/50", share: owed ? 450 : -330 },
    { id: `sp-${friend.id}-4`, d: "Mar 12", day: "Thu · Mar 12", m: "Cafe catch-up", a: owed ? -400 : -360,
      c: "food", s: "Coffee · UPI · 4:15 PM", split: "You paid", share: owed ? 200 : -180 },
  ].filter(t => !deleted.includes(t.id))
   .map(t => ({ ...t, settled: settled.includes(t.id),
                splitWith: { id: friend.id, name: friend.name, avatar: friend.avatar, share: t.share } }));

  // Outstanding balance is derived from unsettled lines, so bulk/per-line
  // settles and deletes recalculate the total automatically.
  const net = txns.filter(t => !t.settled).reduce((s, t) => s + t.share, 0);
  const label = net > 0 ? "Owes you" : net < 0 ? "You owe" : "Settled";
  const netColor = net > 0 ? "var(--income)" : net < 0 ? "var(--expense)" : "var(--fg-1)";

  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const exitSel = () => { setSelMode(false); setSel([]); };
  const enterSel = (id) => { setSelMode(true); setSel(id ? [id] : []); };
  const holdStart = (id) => { press.current = setTimeout(() => enterSel(id), 450); };
  const holdEnd = () => { if (press.current) { clearTimeout(press.current); press.current = null; } };

  const doSettle = () => {
    onSettleTxns?.(sel);
    onToast?.(`${sel.length} transaction${sel.length === 1 ? "" : "s"} marked settled`);
    setConfirm(null); exitSel();
  };
  const doDelete = () => {
    onDeleteTxns?.(sel);
    onToast?.(`${sel.length} transaction${sel.length === 1 ? "" : "s"} deleted`);
    setConfirm(null); exitSel();
  };

  const reminderText = `Hi ${friend.name.split(" ")[0]}, just a reminder — you owe ₹${Math.abs(net).toLocaleString("en-IN")} on Dhan.`;
  // Dhan hands off to the OS share sheet — it never sends messages itself.
  const shareRequest = async () => {
    setRequestSheet(false);
    try {
      if (navigator.share) await navigator.share({ text: reminderText });
      else { await navigator.clipboard?.writeText(reminderText); onToast?.("Reminder copied to clipboard"); return; }
      onToast?.("Reminder shared");
    } catch { /* user dismissed the share sheet */ }
  };
  const nudgeInApp = () => {
    setRequestSheet(false);
    onToast?.(`Reminder sent to ${friend.name.split(" ")[0]} on Dhan`);
  };

  const iconBtn = { width: 40, height: 40, borderRadius: "var(--r-input)", background: "#fff",
                    border: "1px solid var(--border-subtle)", display: "grid",
                    placeItems: "center", cursor: "pointer" };

  return (
    <Phone label="09b Friend detail">
      <StatusBar />
      {selMode ? (
        <ScreenHeader title={`${sel.length} selected`} onBack={exitSel}
          right={<button onClick={exitSel} className="gold-btn"
                         style={{ fontSize: 12, padding: "6px 12px", whiteSpace: "nowrap" }}>Cancel</button>} />
      ) : (
        <ScreenHeader title={friend.name} onBack={onBack}
          right={<button onClick={() => setMenu(true)} aria-label="More actions" style={iconBtn}>
            <i className="ph ph-dots-three" style={{ fontSize: 20 }}/>
          </button>} />
      )}
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto",
                                             padding: selMode ? "0 16px 96px" : "0 16px 24px" }}>
        <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <ContactAvatar f={friend} size={72} fontSize={26} />
          </div>
          {friend.phone && (
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{friend.phone}</div>
          )}
          <div style={{ height: 10 }}/>
          <div style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 600,
                        letterSpacing: "0.01em" }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4,
                        fontVariantNumeric: "tabular-nums", color: netColor }}>
            ₹{Math.abs(net).toLocaleString("en-IN")}
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <Button variant="primary" full size="lg" icon="handshake"
                  onClick={() => onSettle?.({ ...friend, net })}
                  disabled={net === 0}>
            {net === 0 ? "All settled" : "Settle up"}
          </Button>
          {net > 0 && (
            <Button variant="outline" full size="md" icon="paper-plane-tilt"
                    onClick={() => setRequestSheet(true)}>Request settlement</Button>
          )}
        </div>
        <div style={{ height: 20 }}/>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                      letterSpacing: "0.01em",
                      margin: "0 4px 8px" }}>History</div>
        <Card style={{ padding: "0 16px" }}>
          {txns.map((t, i) => {
            const checked = sel.includes(t.id);
            return (
              <div key={t.id}
                   onClick={() => (selMode ? toggle(t.id) : onOpenTxn?.(t))}
                   onPointerDown={() => !selMode && holdStart(t.id)}
                   onPointerUp={holdEnd} onPointerLeave={holdEnd} onPointerCancel={holdEnd}
                   style={{
                     display: "grid",
                     gridTemplateColumns: selMode ? "22px 40px 1fr auto" : "40px 1fr auto 16px",
                     gap: 16, padding: "16px 0", alignItems: "center", cursor: "pointer",
                     borderBottom: i === txns.length - 1 ? "none" : "1px solid var(--border-subtle)",
                   }}>
                {selMode && <SelectIndicator on={checked}/>}
                <IconChip icon="receipt" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "var(--fg-2)" }}>{t.m}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{t.d} · {t.split}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 14, fontVariantNumeric: "tabular-nums",
                    color: t.settled ? "var(--fg-3)" : t.share > 0 ? "var(--income)" : "var(--fg-1)",
                    textDecoration: t.settled ? "line-through" : "none",
                  }}>
                    {t.share > 0 ? "+" : "−"}₹{Math.abs(t.share).toLocaleString("en-IN")}
                  </div>
                  {t.settled && (
                    <span style={{ fontSize: 10.5, fontWeight: 500, borderRadius: 4, padding: "2px 6px",
                                   background: "var(--bg-surface)", color: "var(--fg-2)",
                                   border: "1px solid var(--border-subtle)", whiteSpace: "nowrap" }}>
                      Settled
                    </span>
                  )}
                </div>
                {!selMode && <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>}
              </div>
            );
          })}
          {!txns.length && (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--fg-3)" }}>
              No shared transactions yet.
            </div>
          )}
        </Card>
      </div>

      {/* Bulk action bar */}
      {selMode && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16,
                      background: "var(--bg-elevated)", borderTop: "1px solid var(--border-subtle)",
                      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, zIndex: 5 }}>
          <Button variant="primary" full disabled={!sel.length}
                  onClick={() => setConfirm("settle")}>Mark as settled</Button>
          <button disabled={!sel.length} onClick={() => setConfirm("delete")} style={{
            height: 48, borderRadius: "var(--r-control)", cursor: sel.length ? "pointer" : "default",
            background: "transparent", border: "1px solid var(--expense)", color: "var(--expense)",
            fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600,
            opacity: sel.length ? 1 : 0.5,
          }}>Delete</button>
        </div>
      )}

      {/* Person-level actions */}
      <BottomSheet open={menu} onClose={() => setMenu(false)} title={friend.name}>
        <div style={{ padding: "0 0 4px" }}>
          {[
            { i: "check-square-offset", l: "Select transactions", s: "Settle or delete several at once",
              go: () => { setMenu(false); enterSel(null); } },
            { i: "handshake", l: "Settle all", s: `Close out ₹${Math.abs(net).toLocaleString("en-IN")} outstanding`,
              go: () => { setMenu(false); onSettle?.({ ...friend, net }); } },
            ...(net > 0 ? [{ i: "paper-plane-tilt", l: "Request settlement",
              s: "Send a reminder by message or in-app",
              go: () => { setMenu(false); setRequestSheet(true); } }] : []),
            { i: "export", l: "Export history", s: "Share a summary of these transactions",
              go: () => { setMenu(false); setExportSheet(true); } },
          ].map((a, i, arr) => (
            <div key={a.l} onClick={a.go} style={{
              display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, alignItems: "center",
              padding: "16px 0", cursor: "pointer",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <IconChip icon={a.i} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#141C41" }}>{a.l}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{a.s}</div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Export history */}
      <BottomSheet open={exportSheet} onClose={() => setExportSheet(false)} title="Export history">
        <div style={{ padding: "0 0 4px" }}>
          {[
            { i: "share-network", l: "Share summary", s: `${txns.length} transactions with ${friend.name}` },
            { i: "file-csv", l: "Save as CSV", s: "Opens your device share sheet" },
          ].map((a, i, arr) => (
            <div key={a.l} onClick={() => { setExportSheet(false); onToast?.("History exported"); }} style={{
              display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, alignItems: "center",
              padding: "16px 0", cursor: "pointer",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <IconChip icon={a.i} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#141C41" }}>{a.l}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{a.s}</div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Settle request — external share or in-app nudge */}
      <BottomSheet open={requestSheet} onClose={() => setRequestSheet(false)} title="Request settlement">
        <div style={{ fontSize: 12.5, color: "var(--fg-2)", background: "var(--bg-surface)",
                      borderRadius: "var(--r-input)", padding: "12px 14px", lineHeight: 1.5,
                      marginBottom: 16 }}>
          “{reminderText}”
        </div>
        <div style={{ padding: "0 0 4px" }}>
          {[
            { i: "share-network", l: "Send via message", s: "WhatsApp, SMS, email — your choice", go: shareRequest },
            { i: "bell-ringing", l: "Nudge on Dhan", s: `${friend.name.split(" ")[0]} gets an in-app reminder`, go: nudgeInApp },
          ].map((a, i, arr) => (
            <div key={a.l} onClick={a.go} style={{
              display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, alignItems: "center",
              padding: "16px 0", cursor: "pointer",
              borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <IconChip icon={a.i} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#141C41" }}>{a.l}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{a.s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-3)", lineHeight: 1.4, padding: "8px 4px 0" }}>
          Dhan hands the message to your phone's share sheet — it never sends anything on your behalf.
        </div>
      </BottomSheet>

      {/* Bulk confirmations */}
      <BottomSheet open={confirm === "settle"} onClose={() => setConfirm(null)}
                   title={`Mark ${sel.length} transaction${sel.length === 1 ? "" : "s"} as settled?`}>
        <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
          This won't request or transfer any payment — it only updates your records.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" full onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="primary" full onClick={doSettle}>Mark settled</Button>
        </div>
      </BottomSheet>

      <BottomSheet open={confirm === "delete"} onClose={() => setConfirm(null)}
                   title={`Delete ${sel.length} transaction${sel.length === 1 ? "" : "s"}?`}>
        <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 16 }}>
          They'll be removed from your split history with {friend.name} and from your transactions. This can't be undone.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" full onClick={() => setConfirm(null)}>Cancel</Button>
          <button onClick={doDelete} style={{
            height: 48, borderRadius: "var(--r-control)", cursor: "pointer", border: "none",
            background: "var(--expense)", color: "#fff", fontFamily: "Poppins, sans-serif",
            fontSize: 14, fontWeight: 600,
          }}>Delete</button>
        </div>
      </BottomSheet>
    </Phone>
  );
}

// Settle-up sheet
function SettleUpSheet({ open, onClose, onConfirm, friend }) {
  const [method, setMethod] = useState("upi");
  useEffect(() => { if (open) setMethod("upi"); }, [open]);
  if (!friend) return null;
  const owesYou = friend.net > 0;
  const amt = Math.abs(friend.net);
  const methods = [
    { id: "upi",  icon: "qr-code",   t: "UPI",  b: "Instant" },
    { id: "cash", icon: "money",     t: "Cash", b: "Mark manually" },
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title={owesYou ? "Request settlement" : "Settle up"}>
      <div style={{ textAlign: "center", padding: "6px 0 18px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: friend.avatar || "var(--dhan-navy)",
                      display: "grid", placeItems: "center", color: "#fff",
                      fontWeight: 700, fontSize: 20, margin: "0 auto 12px" }}>
          {friend.name.split(" ").map(s => s[0]).join("").slice(0,2)}
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 600, letterSpacing: "0.01em" }}>
          {owesYou ? friend.name + " owes you" : "You owe " + friend.name}
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, marginTop: 4, letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
                      color: owesYou ? "var(--income)" : "var(--expense)" }}>
          ₹{amt.toLocaleString("en-IN")}
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                    letterSpacing: "0.01em", marginBottom: 8 }}>
        How
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
        {methods.map(m => {
          const on = method === m.id;
          return (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              background: "#fff", textAlign: "left", cursor: "pointer",
              border: "1.5px solid " + (on ? "var(--dhan-navy)" : "var(--border-default)"),
              borderRadius: "var(--r-card-sm)", padding: 12,
              display: "flex", flexDirection: "column", gap: 6, fontFamily: "Poppins",
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--r-input)",
                            background: on ? "var(--dhan-navy)" : "var(--bg-surface)",
                            color: on ? "#fff" : "var(--dhan-navy)",
                            display: "grid", placeItems: "center" }}>
                <i className={"ph ph-" + m.icon} style={{ fontSize: 16 }}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.t}</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{m.b}</div>
            </button>
          );
        })}
      </div>

      <Button variant="primary" full size="lg"
              icon={owesYou ? "paper-plane-tilt" : "handshake"} onClick={onConfirm}>
        {owesYou ? "Send request" : "Mark as settled"}
      </Button>
      <div style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "center",
                    marginTop: 10, lineHeight: 1.4 }}>
        Dhan records the settlement — it never moves money itself.
      </div>
    </BottomSheet>
  );
}

Object.assign(window, { DebtScreen, FriendDetailScreen, SettleUpSheet });
