// ─── More / Settings + Notifications ────────────────────────
const { useState: uSt } = React;

// 10. SETTINGS / MORE
function SettingsScreen({ tab, setTab, nav, isPlus, setPlus, userName = "Priya", onSignOut, onClose, prefs = {} }) {
  const sections = [
    {
      t: "Explore",
      items: [
        { i: "chart-line-up",  l: "Insights",              go: "insights" },
        { i: "target",         l: "Savings goals",         go: "goals" },
        { i: "currency-circle-dollar", l: "Currency converter", go: "converter" },
      ],
    },
    {
      t: "Preferences",
      items: [
        { i: "translate",      l: "Language",              v: prefs.language || "English", go: "language" },
        { i: "globe",          l: "Currency",              v: prefs.currency || "₹ INR", go: "currency" },
        { i: "moon",           l: "Appearance",            v: prefs.appearance || "System", go: "appearance" },
        { i: "bell",           l: "Notifications",         v: (prefs.notifCount ?? 3) + " on", go: "notif-settings" },
      ],
    },
    {
      t: "Data & privacy",
      items: [
        { i: "chat-centered-text", l: "SMS sources",       v: "3 banks", go: "sms-sources" },
        { i: "download-simple",    l: "Export data",       go: "export" },
        { i: "lock-key",           l: "Privacy settings",  go: "privacy-settings" },
        { i: "shield-check",       l: "App lock",          v: prefs.appLock || "Face ID", go: "app-lock" },
      ],
    },
    {
      t: "Account",
      items: [
        { i: "user-circle",    l: "Profile",            go: "profile" },
        { i: "credit-card",    l: "Linked accounts",    v: "3 linked", go: "linked" },
        { i: "lifebuoy",       l: "Help & support",     go: "help" },
        { i: "sign-out",       l: "Sign out",           danger: true, action: "signout" },
      ],
    },
    {
      t: "App info",
      items: [
        { i: "info",           l: "About Dhan",            go: "about" },
        { i: "file-text",      l: "Terms of service",      go: "terms" },
        { i: "scroll",         l: "Privacy policy",        go: "privacy-policy" },
        { i: "tag",            l: "Version",               v: "2.4.1", static: true },
      ],
    },
  ];

  return (
    <Phone label="10 More">
      <StatusBar />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      margin: "4px 0 16px" }}>
          <img src="assets/dhan-mark.svg" alt="Dhan" style={{ width: 32, height: 32, display: "block" }}/>
          <button onClick={() => (onClose ? onClose() : nav?.("home"))} aria-label="Close" style={{
            width: 40, height: 40, borderRadius: "var(--r-control)", background: "#fff",
            border: "1px solid var(--border-subtle)", display: "grid", placeItems: "center",
            cursor: "pointer", color: "var(--fg-1)",
          }}>
            <i className="ph ph-x" style={{ fontSize: 20 }}></i>
          </button>
        </div>

        {/* Identity */}
        <Card onClick={() => nav?.("profile")} style={{ padding: 16, marginBottom: 16, cursor: "pointer" }}>
          <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 16px", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 999,
                          background: "linear-gradient(135deg, var(--dhan-gold), var(--dhan-gold-soft))",
                          display: "grid", placeItems: "center", color: "var(--dhan-navy)",
                          fontWeight: 700, fontSize: 18 }}>{userName[0]}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#141C41" }}>{userName} Sharma</div>
              <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                {isPlus ? "Dhan Plus member" : "Free plan"}
              </div>
            </div>
            <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>
          </div>
        </Card>

        {/* Plus */}
        <div onClick={() => (isPlus ? setPlus?.(false) : nav?.("paywall"))} style={{
          background: "var(--dhan-navy)", borderRadius: "var(--r-card)", padding: 16,
          marginBottom: 16, cursor: "pointer",
          display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 14, alignItems: "center",
        }}>
          <span style={{ width: 40, height: 40, borderRadius: "var(--r-input)",
                         background: "rgba(201,168,76,.18)", display: "grid", placeItems: "center" }}>
            <i className="ph-fill ph-sparkle" style={{ fontSize: 18, color: "var(--dhan-gold)" }}/>
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
              {isPlus ? "Dhan Plus is active" : "Upgrade to Dhan Plus"}
            </div>
            <div style={{ fontSize: 12, color: "var(--dhan-gold-soft)", marginTop: 2 }}>
              {isPlus ? "Tap to switch back to Free" : "Splits, AI insights, multi-currency"}
            </div>
          </div>
          <i className="ph ph-caret-right" style={{ fontSize: 14, color: "rgba(255,255,255,.6)" }}/>
        </div>

        {sections.map(sec => (
          <div key={sec.t} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em", margin: "0 4px 8px" }}>{sec.t}</div>
            <Card style={{ padding: "0 16px" }}>
              {sec.items.map((it, i, arr) => (
                <DetailRow key={it.l} icon={it.i}
                           iconColor={it.danger ? "var(--expense)" : "#141C41"}
                           iconBg={it.danger ? "var(--expense-bg)" : "var(--bg-surface)"}
                           label={<span style={{ color: it.danger ? "var(--expense)" : "var(--fg-2)" }}>{it.l}</span>}
                           last={i === arr.length - 1}
                           chevron={!it.static}
                           onClick={it.static ? undefined : () => {
                             if (it.action === "signout") onSignOut?.();
                             else nav?.(it.go);
                           }}>
                  {it.v || ""}
                </DetailRow>
              ))}
            </Card>
          </div>
        ))}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </Phone>
  );
}

// 11. NOTIFICATIONS
function NotificationsScreen({ onBack, nav, onMarkAll }) {
  const [read, setRead] = uSt([]);
  const groups = [
    {
      t: "Today",
      items: [
        { id: "n1", i: "receipt", l: "Airtel Fiber due in 3 days",
          s: "₹1,199 · auto-debit on Apr 26", go: "bills" },
        { id: "n2", i: "chart-pie-slice", l: "Wants budget 82% used",
          s: "₹2,700 left of ₹15,000 this month", go: "budget" },
        { id: "n3", i: "arrow-down-left", l: "Salary credited",
          s: "₹82,500 from Acme Co · HDFC ••4521", go: "txn" },
      ],
    },
    {
      t: "Earlier",
      items: [
        { id: "n4", i: "users-three", l: "Rahul Sharma settled ₹450",
          s: "Dinner at Indigo · via UPI", go: "splits" },
        { id: "n5", i: "target", l: "Emergency fund on track",
          s: "₹1,20,000 of ₹3,00,000 saved", go: "goals" },
        { id: "n6", i: "chat-centered-text", l: "3 transactions need a category",
          s: "Tap to categorise them", go: "txn" },
      ],
    },
  ];
  const markAll = () => { setRead(groups.flatMap(g => g.items.map(x => x.id))); onMarkAll?.(); };

  return (
    <Phone label="11 Notifications">
      <StatusBar />
      <ScreenHeader title="Notifications" onBack={onBack}
        right={<button onClick={markAll} className="gold-btn"
                       style={{ fontSize: 11.5, padding: "6px 10px", whiteSpace: "nowrap" }}>Mark all</button>} />
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {groups.map(g => (
          <div key={g.t} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)",
                          letterSpacing: "0.01em", margin: "0 4px 8px" }}>{g.t}</div>
            <Card style={{ padding: "0 16px" }}>
              {g.items.map((n, i, arr) => {
                const unread = !read.includes(n.id);
                return (
                  <div key={n.id} onClick={() => { setRead(r => [...new Set([...r, n.id])]); nav?.(n.go); }}
                       style={{ display: "grid", gridTemplateColumns: "40px 1fr 8px", gap: 16,
                                alignItems: "center", padding: "16px 0", cursor: "pointer",
                                borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border-subtle)" }}>
                    <IconChip icon={n.i} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: unread ? 500 : 400, color: "var(--fg-2)" }}>{n.l}</div>
                      <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{n.s}</div>
                    </div>
                    {unread
                      ? <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--dhan-gold)" }}/>
                      : <span/>}
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>
    </Phone>
  );
}

Object.assign(window, { SettingsScreen, NotificationsScreen });
