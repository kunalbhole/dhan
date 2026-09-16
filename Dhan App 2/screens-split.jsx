// ─── Splits & Dues — peer-to-peer money ─────────────────────
const { useState: uSp, useEffect: uEp } = React;

const NAVY = "#141C41";

// hasPhoto = this contact has a photo saved in the device address book;
// the rest fall back to the initials circle.
const FRIENDS = [
  { id: "rahul", name: "Rahul Sharma", net:  2000, last: "Goa trip · Apr 12",       phone: "+91 98765 43210", hasPhoto: true },
  { id: "priya", name: "Priya Kapoor", net:  1450, last: "Dinner at Indigo · Apr 18", phone: "+91 99870 12245", hasPhoto: true },
  { id: "akash", name: "Akash Mehta",  net: -1200, last: "Concert tickets · Apr 2",  phone: "+91 98200 77431" },
  { id: "sneha", name: "Sneha Joshi",  net:  -850, last: "Grocery run · Apr 10",     phone: "+91 90045 66120", hasPhoto: true },
  { id: "dev",   name: "Dev Anand",    net:     0, last: "Settled up · Apr 20",      phone: "+91 98111 20934" },
];

const initials = (n) => n.split(" ").map(s => s[0]).join("").slice(0, 2);

const DEFAULT_GROUPS = [
  { id: "goa", name: "Goa trip", icon: "airplane-takeoff", members: ["rahul", "priya", "akash", "sneha"], net: 850 },
];

// Stacked avatar cluster — max 3 photos/initials, then a +N chip.
function AvatarStack({ ids, size = 28 }) {
  const people = ids.map(id => FRIENDS.find(f => f.id === id)).filter(Boolean);
  const shown = people.slice(0, 3);
  const extra = people.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((f, i) => (
        <div key={f.id} style={{ marginLeft: i ? -8 : 0, borderRadius: 999,
                                 boxShadow: "0 0 0 2px var(--bg-elevated)", display: "flex" }}>
          <ContactAvatar f={f} size={size} fontSize={Math.round(size * 0.36)} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{ marginLeft: -8, width: size, height: size, borderRadius: 999,
                      background: "var(--bg-surface)", boxShadow: "0 0 0 2px var(--bg-elevated)",
                      display: "grid", placeItems: "center", color: "var(--fg-2)",
                      fontSize: Math.round(size * 0.36), fontWeight: 600 }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

function GroupRow({ g, onClick }) {
  // Same simplified ledger the group detail page shows, so the two agree.
  const net = window.groupLedger ? window.groupLedger(g).reduce((s, m) => s + m.net, 0) : g.net;
  const settled = net === 0, owed = net > 0;
  return (
    <div onClick={onClick} style={{
      background: "var(--bg-elevated)", borderRadius: "var(--r-card-sm)",
      padding: 16, marginBottom: 8, cursor: "pointer",
      border: "1px solid var(--card-border-color)", boxShadow: "var(--shadow-card)",
      display: "grid", gridTemplateColumns: "40px minmax(0,1fr) auto", columnGap: 16,
      alignItems: "center",
    }}>
      <IconChip icon={g.icon || "users-three"} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
        <div style={{ marginTop: 6 }}><AvatarStack ids={g.members} /></div>
      </div>
      <div style={{ textAlign: "right", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                    color: settled ? "var(--fg-3)" : owed ? "var(--income)" : NAVY }}>
        {settled ? "Settled"
          : (owed ? "You're owed " : "You owe ") + "₹" + Math.abs(net).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

// Create a group — name, icon, members (multi-select)
const GROUP_ICONS = ["airplane-takeoff", "house", "confetti", "fork-knife", "car-simple", "gift"];
function CreateGroupSheet({ open, onClose, onCreate }) {
  const [name, setName] = uSp("");
  const [icon, setIcon] = uSp(GROUP_ICONS[0]);
  const [members, setMembers] = uSp([]);
  uEp(() => { if (open) { setName(""); setIcon(GROUP_ICONS[0]); setMembers([]); } }, [open]);
  const toggle = (id) => setMembers(m => m.includes(id) ? m.filter(x => x !== id) : [...m, id]);
  return (
    <BottomSheet open={open} onClose={onClose} title="New group">
      <Field label="Group name" value={name} placeholder="Goa trip" autoFocus
             onChange={(e) => setName(e.target.value)} />
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>Icon</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {GROUP_ICONS.map(ic => (
          <button key={ic} onClick={() => setIcon(ic)} aria-label={ic} style={{
            width: 44, height: 44, borderRadius: "var(--r-input)", cursor: "pointer",
            border: "1px solid " + (icon === ic ? NAVY : "var(--border-subtle)"),
            background: icon === ic ? NAVY : "transparent",
            color: icon === ic ? "#fff" : "var(--fg-2)",
            display: "grid", placeItems: "center",
          }}>
            <Glyph icon={ic} size={18} />
          </button>
        ))}
        <EmojiTile value={icon} onChange={setIcon} />
      </div>
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 4px 8px" }}>
        Add members {members.length ? `· ${members.length} selected` : ""}
      </div>
      <div className="phone-scroll" style={{ maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
        {FRIENDS.map((f, i) => (
          <div key={f.id} onClick={() => toggle(f.id)} style={{
            display: "grid", gridTemplateColumns: "22px 32px 1fr", gap: 12, alignItems: "center",
            padding: "12px 0", cursor: "pointer",
            borderBottom: i === FRIENDS.length - 1 ? "none" : "1px solid var(--border-subtle)",
          }}>
            <SelectIndicator on={members.includes(f.id)} />
            <ContactAvatar f={f} size={32} fontSize={12} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: "var(--fg-2)", whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <Button variant="primary" full size="lg" disabled={!name.trim() || !members.length}
                onClick={() => onCreate?.({ id: "g" + Date.now().toString(36), name: name.trim(),
                                            icon, members, net: 0 })}>
          Create group
        </Button>
        <Button variant="ghost" full onClick={onClose}>Cancel</Button>
      </div>
    </BottomSheet>
  );
}

// Contact avatar — real Contacts photo when the contact has one, initials otherwise.
function ContactAvatar({ f, size = 48, fontSize }) {
  // Contacts photo when the address book has one; initials circle otherwise.
  // A photo that fails to load falls back to initials rather than showing a broken tile.
  const base = (
    <div style={{ width: size, height: size, borderRadius: 999, background: NAVY,
                  display: "grid", placeItems: "center", color: "#fff", flexShrink: 0,
                  fontWeight: 600, fontSize: fontSize || Math.round(size * 0.31),
                  letterSpacing: ".02em" }}>
      {initials(f.name)}
    </div>
  );
  if (!f.hasPhoto) return base;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
         title={`${f.name} · contact photo`}>
      {base}
      <image-slot class="contact-slot" id={`contact-${f.id}`} shape="circle" fit="cover"
                  placeholder=""></image-slot>
    </div>
  );
}

// Right column is a FIXED width so amount + action pill can never collide
// with the name column; the name truncates instead.
function PeerRow({ f, onClick, onAction }) {
  const owesYou = f.net > 0, settled = f.net === 0;
  return (
    <div onClick={onClick} style={{
      background: "var(--bg-elevated)", borderRadius: "var(--r-card-sm)",
      padding: 16, marginBottom: 8,
      display: "grid", gridTemplateColumns: "48px minmax(0,1fr) 96px", columnGap: 16,
      alignItems: "center", boxShadow: "var(--shadow-card)",
      border: "1px solid var(--card-border-color)",
      cursor: onClick ? "pointer" : "default",
    }}>
      <ContactAvatar f={f} size={48} fontSize={15} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {f.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 2,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {settled ? f.last : owesYou ? "Owes you" : "You owe"}
        </div>
      </div>
      <div style={{ justifySelf: "end", textAlign: "right", minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap", letterSpacing: "-0.01em",
                      color: settled ? "var(--fg-3)" : owesYou ? "var(--income)" : NAVY }}>
          {settled ? "—" : "Rs " + Math.abs(f.net).toLocaleString("en-IN")}
        </div>
        {!settled && (
          <button onClick={(e) => { e.stopPropagation(); onAction?.(f); }} style={{
            marginTop: 8, width: "100%", height: 28, padding: "0 8px",
            borderRadius: 999, border: "none", cursor: "pointer",
            fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600,
            background: owesYou ? "var(--income-bg)" : "var(--expense-bg)",
            color: owesYou ? "var(--income)" : NAVY,
            whiteSpace: "nowrap",
          }}>{owesYou ? "Collect" : "Settle"}</button>
        )}
      </div>
    </div>
  );
}

function SplitsScreen({ tab, setTab, nav, isPlus, onOpenSheet, onOpenFriend,
                        groups = DEFAULT_GROUPS, onNewGroup, onOpenGroup }) {
  const get = FRIENDS.filter(f => f.net > 0).reduce((s, f) => s + f.net, 0);
  const pay = FRIENDS.filter(f => f.net < 0).reduce((s, f) => s + Math.abs(f.net), 0);
  const list = isPlus ? FRIENDS : FRIENDS.slice(0, 4);

  return (
    <Phone label="09 Splits">
      <StatusBar />
      <AppHeader onMenu={() => nav?.("more")} onSearch={() => nav?.("txn")}
                 onNotify={() => nav?.("notifications")} />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", margin: "0 0 16px" }}>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em" }}>Splits &amp; Dues</div>
          <button aria-label="New split" onClick={() => onOpenSheet?.("split-new")} style={{
            width: 40, height: 40, borderRadius: "var(--r-control)",
            background: NAVY, color: "#fff", border: "none",
            display: "grid", placeItems: "center", cursor: "pointer" }}>
            <i className="ph ph-plus" style={{ fontSize: 20 }}/>
          </button>
        </div>

        {/* Balance summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "var(--income-bg)", borderRadius: "var(--r-card)", padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--income)" }}>You'll get</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "var(--income)", marginTop: 8,
                          fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              Rs {get.toLocaleString("en-IN")}
            </div>
          </div>
          <div style={{ background: "var(--expense-bg)", borderRadius: "var(--r-card)", padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, opacity: .7 }}>You'll pay</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: NAVY, marginTop: 8,
                          fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              Rs {pay.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 500, margin: "0 0 16px" }}>With your people</div>
        {list.map(f => (
          <PeerRow key={f.id} f={f}
                   onClick={() => onOpenFriend?.(f)}
                   onAction={(fr) => onOpenSheet?.("settle-up", { friend: fr })} />
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      margin: "16px 0 16px" }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Your groups</div>
          <button className="gold-btn" style={{ fontSize: 12 }}
                  onClick={() => onNewGroup?.()}>+ New group</button>
        </div>
        {groups.length ? groups.map(g => (
          <GroupRow key={g.id} g={g} onClick={() => onOpenGroup?.(g)} />
        )) : (
          <Card style={{ padding: 16, marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "var(--fg-3)", lineHeight: 1.5 }}>
              No groups yet. Create one to split a trip or a shared flat.
            </div>
          </Card>
        )}

        {!isPlus && (
          <div onClick={() => nav?.("paywall")} style={{
            background: NAVY, borderRadius: "var(--r-card)", padding: 16,
            marginTop: 16, cursor: "pointer",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
              Upgrade to track unlimited friends
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--dhan-gold-soft)", marginTop: 4 }}>
              Try Dhan Plus free for 3 months
            </div>
          </div>
        )}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </Phone>
  );
}

// Split an expense with people — used from Txn detail and the Splits tab
function SplitSheet({ open, onClose, onSave, txn, isPlus = false, onUpgrade }) {
  const [addMode, setAddMode] = uSp(null); // null | "choose" | "manual"
  const [newName, setNewName] = uSp("");
  const [newPhone, setNewPhone] = uSp("");
  const [extra, setExtra] = uSp([]);
  const [mode, setMode] = uSp("equal");
  const [sel, setSel] = uSp([]);
  const [amt, setAmt] = uSp("");
  const [shares, setShares] = uSp({});
  uEp(() => {
    if (open) {
      setMode("equal"); setSel([]); setShares({});
      setAmt(txn ? String(Math.abs(txn.a)) : "");
    }
  }, [open, txn]);

  const total = parseInt(amt || "0", 10) || 0;
  const heads = sel.length + 1;
  const equalShare = Math.round(total / heads);
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : s.concat([id]));
  const shareOf = (id) => mode === "equal"
    ? equalShare
    : (parseInt(shares[id] || "0", 10) || 0);
  const assigned = sel.reduce((s, id) => s + shareOf(id), 0);
  const yours = Math.max(0, total - assigned);

  return (
    <BottomSheet open={open} onClose={onClose} title={txn ? "Split this expense" : "New split"}>
      {txn ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <CategoryIcon cat={txn.c} size={40} tint />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap",
                          overflow: "hidden", textOverflow: "ellipsis" }}>{txn.m}</div>
            <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 2 }}>{txn.day || "Today"}</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            Rs {total.toLocaleString("en-IN")}
          </div>
        </div>
      ) : (
        <Field label="Total amount" value={amt} prefix="Rs" autoFocus
               onChange={(e) => setAmt(e.target.value.replace(/[^\d]/g, ""))} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                    background: "var(--bg-surface)", borderRadius: "var(--r-control)",
                    padding: 8, marginBottom: 24 }}>
        {[["equal", "Split equally"], ["exact", "Exact amounts"]].map(([id, l]) => (
          <button key={id} onClick={() => setMode(id)} style={{
            height: 36, borderRadius: "var(--r-input)", border: "none",
            background: mode === id ? "var(--bg-elevated)" : "transparent",
            color: mode === id ? NAVY : "var(--fg-3)",
            fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: mode === id ? "var(--shadow-card)" : "none",
          }}>{l}</button>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-3)", marginBottom: 8 }}>
        Who's in
      </div>
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {FRIENDS.map(f => {
          const on = sel.includes(f.id);
          return (
            <div key={f.id} onClick={() => toggle(f.id)} style={{
              display: "grid", gridTemplateColumns: "40px minmax(0,1fr) 96px",
              columnGap: 16, alignItems: "center",
              padding: 8, borderRadius: "var(--r-control)",
              border: "1px solid " + (on ? NAVY : "var(--border-default)"),
              cursor: "pointer", background: "var(--bg-elevated)",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 999,
                            background: on ? NAVY : "var(--bg-surface)",
                            color: on ? "#fff" : "var(--fg-2)",
                            display: "grid", placeItems: "center",
                            fontSize: 13, fontWeight: 600 }}>{initials(f.name)}</div>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
              {on ? (
                mode === "equal" ? (
                  <div style={{ justifySelf: "end", fontSize: 14, fontWeight: 600,
                                fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    Rs {equalShare.toLocaleString("en-IN")}
                  </div>
                ) : (
                  <input value={shares[f.id] || ""} onClick={(e) => e.stopPropagation()}
                         onChange={(e) => setShares(s => ({ ...s, [f.id]: e.target.value.replace(/[^\d]/g, "") }))}
                         placeholder="0" inputMode="numeric"
                         style={{ justifySelf: "end", width: 96, height: 36,
                                  border: "1px solid var(--border-default)",
                                  borderRadius: "var(--r-input)", padding: "0 8px",
                                  fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600,
                                  textAlign: "right", outline: "none", color: NAVY,
                                  background: "var(--bg-elevated)" }}/>
                )
              ) : (
                <div style={{ justifySelf: "end", fontSize: 13, color: "var(--fg-4)" }}>Add</div>
              )}
            </div>
          );
        })}
        {extra.map(f => (
          <div key={f.id} style={{
            display: "grid", gridTemplateColumns: "40px minmax(0,1fr) 96px",
            columnGap: 16, alignItems: "center", padding: 8,
            borderRadius: "var(--r-control)", border: "1px solid " + NAVY,
            background: "var(--bg-elevated)",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: NAVY, color: "#fff",
                          display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600 }}>
              {initials(f.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
              {f.phone && <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{f.phone}</div>}
            </div>
            <div style={{ justifySelf: "end", fontSize: 13, color: "var(--fg-4)" }}>New</div>
          </div>
        ))}
      </div>

      {/* Add contact — Dhan Plus */}
      <div style={{ marginBottom: 16 }}>
        {!isPlus ? (
          <PlusLock locked tag="right" onUpgrade={onUpgrade}>
            <button className="gold-btn" style={{ fontSize: 12.5 }}>
              <i className="ph ph-user-plus" style={{ fontSize: 14 }}/>
              Add contact
            </button>
          </PlusLock>
        ) : addMode === null ? (
          <button onClick={() => setAddMode("choose")} className="gold-btn" style={{ fontSize: 12.5 }}>
            <i className="ph ph-user-plus" style={{ fontSize: 14 }}/>
            Add contact
          </button>
        ) : (
          <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--r-control)",
                        padding: 12, background: "var(--bg-elevated)" }}>
            {addMode === "choose" ? (
              <div style={{ display: "grid", gap: 8 }}>
                {[["contacts", "address-book", "Choose from contacts", "Pick from your phone"],
                  ["manual", "keyboard", "Add manually", "Name and phone number"]].map(([id, icon, label, sub]) => (
                  <button key={id}
                          onClick={() => id === "manual" ? setAddMode("manual") : setAddMode("picker")}
                          style={{ display: "grid", gridTemplateColumns: "36px 1fr 16px", alignItems: "center",
                                   columnGap: 12, padding: "8px 4px", border: "none", background: "transparent",
                                   cursor: "pointer", textAlign: "left", fontFamily: "Poppins, sans-serif" }}>
                    <span style={{ width: 36, height: 36, borderRadius: "var(--r-input)",
                                   background: "var(--bg-surface)", display: "grid", placeItems: "center" }}>
                      <Glyph icon={icon} size={17} style={{ color: NAVY }} />
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 13.5, color: NAVY }}>{label}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "var(--fg-3)" }}>{sub}</span>
                    </span>
                    <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
                  </button>
                ))}
                <button onClick={() => setAddMode(null)} style={{
                  border: "none", background: "transparent", cursor: "pointer", padding: "4px 0",
                  fontFamily: "Poppins, sans-serif", fontSize: 12, color: "var(--fg-3)" }}>Cancel</button>
              </div>
            ) : addMode === "picker" ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 12.5, color: "var(--fg-3)" }}>From your contacts</div>
                {[["Anita Desai", "+91 98200 11223"], ["Vikram Rao", "+91 99101 44556"],
                  ["Neha Iyer", "+91 90040 77889"]].map(([n, p]) => (
                  <button key={n} onClick={() => { setExtra(x => [...x, { id: "x" + x.length, name: n, phone: p }]); setAddMode(null); }}
                          style={{ display: "grid", gridTemplateColumns: "32px 1fr", columnGap: 12,
                                   alignItems: "center", padding: "6px 4px", border: "none",
                                   background: "transparent", cursor: "pointer", textAlign: "left",
                                   fontFamily: "Poppins, sans-serif" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 999, background: "var(--bg-surface)",
                                   display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600,
                                   color: NAVY }}>{initials(n)}</span>
                    <span>
                      <span style={{ display: "block", fontSize: 13.5, color: NAVY }}>{n}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "var(--fg-3)" }}>{p}</span>
                    </span>
                  </button>
                ))}
                <button onClick={() => setAddMode("choose")} style={{
                  border: "none", background: "transparent", cursor: "pointer", padding: "4px 0",
                  fontFamily: "Poppins, sans-serif", fontSize: 12, color: "var(--fg-3)" }}>Back</button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <Field label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Field label="Phone number" value={newPhone} prefix="+91"
                       onChange={(e) => setNewPhone(e.target.value.replace(/[^\d]/g, ""))} />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="gold-btn" style={{ fontSize: 12.5 }}
                          onClick={() => { if (!newName.trim()) return;
                            setExtra(x => [...x, { id: "x" + x.length, name: newName.trim(),
                                                   phone: newPhone ? "+91 " + newPhone : "" }]);
                            setNewName(""); setNewPhone(""); setAddMode(null); }}>Add</button>
                  <button onClick={() => setAddMode("choose")} style={{
                    border: "none", background: "transparent", cursor: "pointer",
                    fontFamily: "Poppins, sans-serif", fontSize: 12, color: "var(--fg-3)" }}>Back</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "var(--bg-surface)", borderRadius: "var(--r-control)",
                    padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--fg-2)" }}>
          {sel.length === 0 ? "Pick who shared this" : `You keep · ${sel.length} owe you`}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          Rs {yours.toLocaleString("en-IN")}
        </div>
      </div>

      <Button variant="primary" full size="lg" disabled={!total || sel.length === 0}
              onClick={() => onSave?.({ total, sel, mode })}>
        Save split
      </Button>
    </BottomSheet>
  );
}

Object.assign(window, { SplitsScreen, SplitSheet, PeerRow, FRIENDS, ContactAvatar, initials,
                        GroupRow, AvatarStack, CreateGroupSheet, DEFAULT_GROUPS, GROUP_ICONS });
