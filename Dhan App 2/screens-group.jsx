// ─── 09c. GROUP DETAIL ──────────────────────────────────────
const { useState: uG, useEffect: uGE } = React;
const NAVY_G = "#141C41";

// Per-member ledger derived FROM the group's expenses, so the summary, the
// per-member balances and the history always reconcile.
// + = they owe you, − = you owe them.
function groupLedger(group, expenses) {
  const members = group.members.map(id => FRIENDS.find(f => f.id === id)).filter(Boolean);
  if (!members.length) return [];
  const rows = expenses || groupExpenses(group);
  const nets = {};
  members.forEach(m => { nets[m.id] = 0; });
  rows.forEach(x => {
    if (x.breakdown) {
      // Saved from the add-expense flow: exact per-person shares.
      if (x.paidBy.id === "you") {
        Object.keys(x.breakdown).forEach(id => {
          if (id !== "you" && nets[id] !== undefined) nets[id] += x.breakdown[id];
        });
      } else if (nets[x.paidBy.id] !== undefined) {
        nets[x.paidBy.id] -= (x.breakdown.you || 0);
      }
      return;
    }
    if (x.share > 0) {
      // You fronted it — the others owe your outlay, split evenly.
      const each = x.share / members.length;
      members.forEach(m => { nets[m.id] += each; });
    } else if (x.share < 0) {
      // Someone else fronted it — you owe your share to whoever paid.
      const payer = nets[x.paidBy.id] !== undefined ? x.paidBy.id : members[0].id;
      nets[payer] += x.share;
    }
  });
  const out = members.map(m => ({ ...m, net: Math.round(nets[m.id]) }));
  // Push rounding drift onto the first member so the parts equal the whole.
  const exact = Math.round(rows.reduce((s, x) => s + x.share, 0));
  const drift = exact - out.reduce((s, m) => s + m.net, 0);
  if (drift && out.length) out[0].net += drift;
  return out;
}

function groupExpenses(group) {
  const m = group.members.map(id => FRIENDS.find(f => f.id === id)).filter(Boolean);
  const payer = (i) => (i % 3 === 0 ? { id: "you", name: "You" } : m[i % m.length] || { name: "You" });
  const rows = [
    { key: 1, m: "Beach shack dinner", day: "Sat · Apr 18", d: "Apr 18", total: 4800, share: -1200, c: "food",   s: "Dinner · UPI · 9:20 PM" },
    { key: 2, m: "Scooter rental",     day: "Fri · Apr 17", d: "Apr 17", total: 2400, share: -600,  c: "transport", s: "Rental · UPI · 11:05 AM" },
    { key: 3, m: "Villa booking",      day: "Thu · Apr 16", d: "Apr 16", total: 12000, share: 3000, c: "travel",  s: "Stay · HDFC ••4521" },
    { key: 4, m: "Groceries run",      day: "Thu · Apr 16", d: "Apr 16", total: 1800, share: -450,  c: "groceries", s: "Groceries · UPI · 6:40 PM" },
  ];
  return rows.map((r, i) => {
    const by = payer(i);
    // You paid → the others owe you your outlay minus your share; someone else
    // paid → your share is money you owe them.
    const share = by.name === "You" ? Math.abs(r.share) : -Math.abs(r.share);
    r = { ...r, share };
    return {
      ...r,
      id: `gx-${group.id}-${r.key}`,
      a: -r.total,
      paidBy: by,
      split: `${by.name === "You" ? "You" : by.name.split(" ")[0]} paid ₹${r.total.toLocaleString("en-IN")}`,
      groupWith: { id: group.id, name: group.name, icon: group.icon, share: r.share },
    };
  });
}

function GroupDetailScreen({ group, onBack, onOpenSheet, onOpenTxn, onToast,
                             onUpdateGroup, onLeaveGroup, deleted = [], added = [] }) {
  const [menu, setMenu] = uG(false);
  const [openMember, setOpenMember] = uG(null);
  const [settle, setSettle] = uG(false);
  const [edit, setEdit] = uG(false);
  const [members, setMembers] = uG(false);
  const [name, setName] = uG("");
  const [pick, setPick] = uG([]);
  uGE(() => { setMenu(false); setOpenMember(null); }, [group && group.id]);
  if (!group) return null;

  const expenses = [...added, ...groupExpenses(group)].filter(x => !deleted.includes(x.id));
  const ledger = groupLedger(group, expenses);
  // Simplified net position across the whole group, not raw pairwise debts.
  const net = ledger.reduce((s, m) => s + m.net, 0);
  const label = net > 0 ? "You're owed" : net < 0 ? "You owe" : "All settled";
  const netColor = net > 0 ? "var(--income)" : net < 0 ? "var(--expense)" : "var(--fg-1)";
  const owedTo = ledger.filter(m => m.net < 0);      // you owe them
  const owedBy = ledger.filter(m => m.net > 0);      // they owe you
  const canDelete = net === 0;

  const openEdit = () => { setName(group.name); setEdit(true); setMenu(false); };
  const openMembers = () => { setPick(group.members); setMembers(true); setMenu(false); };
  const money = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");

  return (
    <Phone label="09c Group">
      <StatusBar />
      <ScreenHeader title={group.name} onBack={onBack}
        right={<button onClick={() => setMenu(true)} aria-label="Group actions" style={{
          width: 40, height: 40, borderRadius: "var(--r-input)", background: "#fff",
          border: "1px solid var(--border-subtle)", display: "grid", placeItems: "center",
          cursor: "pointer" }}>
          <i className="ph ph-dots-three" style={{ fontSize: 20 }}/>
        </button>} />

      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 96px" }}>
        {/* Members — tap an avatar for that person's position in this group */}
        <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 0 4px",
                      margin: "0 -16px", paddingLeft: 16, paddingRight: 16, scrollbarWidth: "none" }}>
          {ledger.map(m => {
            const on = openMember === m.id;
            return (
              <button key={m.id} onClick={() => setOpenMember(on ? null : m.id)}
                      aria-label={`${m.name} balance`}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer",
                               display: "flex", flexDirection: "column", alignItems: "center",
                               gap: 6, width: 56, flexShrink: 0 }}>
                <span style={{ borderRadius: 999, display: "flex",
                               boxShadow: on ? "0 0 0 2px var(--dhan-gold)" : "none" }}>
                  <ContactAvatar f={m} size={44} fontSize={15} />
                </span>
                <span style={{ fontSize: 11, color: "var(--fg-3)", maxWidth: 56,
                               overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {openMember && (() => {
          const m = ledger.find(x => x.id === openMember);
          if (!m) return null;
          return (
            <Card style={{ padding: "0 16px", marginTop: 8 }}>
              <DetailRow icon={m.net > 0 ? "arrow-down-left" : m.net < 0 ? "arrow-up-right" : "check-circle"}
                         label={m.net > 0 ? `${m.name.split(" ")[0]} owes you`
                              : m.net < 0 ? `You owe ${m.name.split(" ")[0]}` : `Settled with ${m.name.split(" ")[0]}`}
                         sub={`In ${group.name}`} last>
                <span style={{ color: m.net > 0 ? "var(--income)" : m.net < 0 ? "var(--expense)" : "var(--fg-3)" }}>
                  {m.net === 0 ? "—" : money(m.net)}
                </span>
              </DetailRow>
            </Card>
          );
        })()}

        {/* Net position */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 600 }}>{label}</div>
          {net !== 0 && (
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: netColor,
                          fontVariantNumeric: "tabular-nums" }}>{money(net)}</div>
          )}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <Button variant="primary" full size="lg" icon="handshake"
                  disabled={net === 0} onClick={() => setSettle(true)}>
            {net === 0 ? "All settled" : "Settle up"}
          </Button>
          <Button variant="outline" full size="md" icon="plus"
                  onClick={() => onOpenSheet?.("group-expense", { group })}>Add expense</Button>
        </div>

        <div style={{ height: 20 }}/>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                      letterSpacing: "0.01em", margin: "0 4px 8px" }}>History</div>
        <Card style={{ padding: "0 16px" }}>
          {expenses.map((x, i) => (
            <div key={x.id} onClick={() => onOpenTxn?.(x)} style={{
              display: "grid", gridTemplateColumns: "40px 1fr auto 16px", gap: 16,
              alignItems: "center", padding: "16px 0", cursor: "pointer",
              borderBottom: i === expenses.length - 1 ? "none" : "1px solid var(--border-subtle)",
            }}>
              <CategoryIcon cat={x.c} tint />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: "var(--fg-2)",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.m}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {x.d} · {x.split}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: "tabular-nums",
                              color: x.share > 0 ? "var(--income)" : "var(--fg-1)" }}>
                  {x.share > 0 ? "+" : "−"}{money(x.share)}
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap" }}>
                  of {money(x.total)}
                </div>
              </div>
              <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
            </div>
          ))}
          {!expenses.length && (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--fg-3)" }}>
              No group expenses yet.
            </div>
          )}
        </Card>
      </div>

      <FAB onClick={() => onOpenSheet?.("group-expense", { group })} />

      {/* Group actions */}
      <BottomSheet open={menu} onClose={() => setMenu(false)} title={group.name}>
        <div style={{ padding: "0 0 4px" }}>
          {[
            { i: "pencil-simple", l: "Edit group", s: "Rename or change the icon", go: openEdit },
            { i: "user-plus", l: "Add or remove members", s: `${group.members.length} members`, go: openMembers },
            canDelete
              ? { i: "trash", l: "Delete group", s: "All balances are settled", danger: true,
                  go: () => { setMenu(false); onLeaveGroup?.(group, "delete"); } }
              : { i: "trash", l: "Delete group", s: "Settle all balances before deleting",
                  disabled: true },
            { i: "sign-out", l: "Leave group", s: "You'll stop seeing new expenses", danger: true,
              go: () => { setMenu(false); onLeaveGroup?.(group, "leave"); } },
          ].map((a, i, arr) => (
            <div key={a.l} onClick={a.disabled ? undefined : a.go}
                 title={a.disabled ? "Settle all balances before deleting" : undefined}
                 style={{
                   display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, alignItems: "center",
                   padding: "16px 0", cursor: a.disabled ? "not-allowed" : "pointer",
                   opacity: a.disabled ? 0.45 : 1,
                   borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)",
                 }}>
              <IconChip icon={a.i} color={a.danger ? "var(--expense)" : NAVY_G}
                        bg={a.danger ? "var(--expense-bg)" : "var(--bg-surface)"} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500,
                              color: a.danger ? "var(--expense)" : NAVY_G }}>{a.l}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{a.s}</div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Settle-up breakdown — group settlement can involve several people */}
      <BottomSheet open={settle} onClose={() => setSettle(false)} title="Settle up">
        <div style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 12 }}>
          Simplified so everyone makes the fewest payments possible.
        </div>
        {!!owedTo.length && (
          <>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)", margin: "0 4px 8px" }}>You pay</div>
            <Card style={{ padding: "0 16px", marginBottom: 12 }}>
              {owedTo.map((m, i) => (
                <div key={m.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
                                         alignItems: "center", padding: "14px 0",
                                         borderBottom: i === owedTo.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                  <ContactAvatar f={m} size={40} fontSize={13} />
                  <div style={{ fontSize: 14, color: "var(--fg-2)" }}>{m.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--expense)",
                                fontVariantNumeric: "tabular-nums" }}>{money(m.net)}</div>
                </div>
              ))}
            </Card>
          </>
        )}
        {!!owedBy.length && (
          <>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)", margin: "0 4px 8px" }}>You collect</div>
            <Card style={{ padding: "0 16px", marginBottom: 12 }}>
              {owedBy.map((m, i) => (
                <div key={m.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
                                         alignItems: "center", padding: "14px 0",
                                         borderBottom: i === owedBy.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                  <ContactAvatar f={m} size={40} fontSize={13} />
                  <div style={{ fontSize: 14, color: "var(--fg-2)" }}>{m.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--income)",
                                fontVariantNumeric: "tabular-nums" }}>{money(m.net)}</div>
                </div>
              ))}
            </Card>
          </>
        )}
        <Button variant="primary" full size="lg" onClick={() => {
          setSettle(false); onToast?.("Settlement recorded");
        }}>Record settlement</Button>
        <div style={{ fontSize: 11, color: "var(--fg-3)", textAlign: "center", marginTop: 10,
                      lineHeight: 1.4 }}>
          Dhan records the settlement — it never moves money itself.
        </div>
      </BottomSheet>

      {/* Edit group */}
      <BottomSheet open={edit} onClose={() => setEdit(false)} title="Edit group">
        <Field label="Group name" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Icon</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {GROUP_ICONS.map(ic => (
            <button key={ic} onClick={() => onUpdateGroup?.({ ...group, icon: ic })} aria-label={ic} style={{
              width: 44, height: 44, borderRadius: "var(--r-input)", cursor: "pointer",
              border: "1px solid " + (group.icon === ic ? NAVY_G : "var(--border-subtle)"),
              background: group.icon === ic ? NAVY_G : "transparent",
              color: group.icon === ic ? "#fff" : "var(--fg-2)",
              display: "grid", placeItems: "center",
            }}>
              <Glyph icon={ic} size={18} />
            </button>
          ))}
          <EmojiTile value={group.icon} onChange={(em) => onUpdateGroup?.({ ...group, icon: em })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" full onClick={() => setEdit(false)}>Cancel</Button>
          <Button variant="primary" full disabled={!name.trim()} onClick={() => {
            onUpdateGroup?.({ ...group, name: name.trim() }); setEdit(false); onToast?.("Group updated");
          }}>Save</Button>
        </div>
      </BottomSheet>

      {/* Members */}
      <BottomSheet open={members} onClose={() => setMembers(false)} title="Group members">
        <div className="phone-scroll" style={{ maxHeight: 260, overflowY: "auto", marginBottom: 16 }}>
          {FRIENDS.map((f, i) => (
            <div key={f.id} onClick={() => setPick(p => p.includes(f.id) ? p.filter(x => x !== f.id) : [...p, f.id])}
                 style={{ display: "grid", gridTemplateColumns: "22px 32px 1fr", gap: 12,
                          alignItems: "center", padding: "12px 0", cursor: "pointer",
                          borderBottom: i === FRIENDS.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
              <SelectIndicator on={pick.includes(f.id)} />
              <ContactAvatar f={f} size={32} fontSize={12} />
              <div style={{ fontSize: 14, color: "var(--fg-2)" }}>{f.name}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" full onClick={() => setMembers(false)}>Cancel</Button>
          <Button variant="primary" full disabled={!pick.length} onClick={() => {
            onUpdateGroup?.({ ...group, members: pick }); setMembers(false); onToast?.("Members updated");
          }}>Save members</Button>
        </div>
      </BottomSheet>
    </Phone>
  );
}

Object.assign(window, { GroupDetailScreen, groupLedger, groupExpenses });
