// ─── Settings sub-screens ───────────────────────────────
const { useState: uSS } = React;
const NAVY_S = "#141C41";
const GOLD_S = "#C9A84C";

// Shared row primitives
function RadioRow({ icon, label, sub, on, onClick, last }) {
  return (
    <div onClick={onClick} style={{
      display: "grid", gridTemplateColumns: icon ? "40px 1fr 22px" : "1fr 22px",
      gap: 16, alignItems: "center", padding: "16px 0", cursor: "pointer",
      borderBottom: last ? "none" : "1px solid var(--border-subtle)",
    }}>
      {icon && <IconChip icon={icon} />}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg-2)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{ justifySelf: "end", display: "grid" }}><SelectIndicator on={on}/></span>
    </div>
  );
}

function ToggleRow({ icon, label, sub, on, onToggle, last, disabled }) {
  return (
    <div onClick={disabled ? undefined : onToggle} style={{
      display: "grid", gridTemplateColumns: icon ? "40px 1fr auto" : "1fr auto",
      gap: 16, alignItems: "center", padding: "16px 0",
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
      borderBottom: last ? "none" : "1px solid var(--border-subtle)",
    }}>
      {icon && <IconChip icon={icon} />}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg-2)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <div className={"tgl " + (on ? "on" : "")}/>
    </div>
  );
}

function SubScreen({ label, title, onBack, children, note }) {
  return (
    <Phone label={label}>
      <StatusBar />
      <ScreenHeader title={title} onBack={onBack}/>
      <div className="phone-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {children}
        {note && (
          <div style={{ fontSize: 12, color: "var(--fg-3)", lineHeight: 1.5,
                        padding: "16px 4px 0" }}>{note}</div>
        )}
      </div>
    </Phone>
  );
}

// 28. LANGUAGE
function LanguageScreen({ onBack, value = "en", onChange }) {
  const [v, setV] = uSS(value);
  const langs = [
    { id: "en", l: "English",  s: "Default" },
    { id: "hi", l: "हिंदी",     s: "Hindi" },
    { id: "mr", l: "मराठी",     s: "Marathi · coming soon" },
    { id: "ta", l: "தமிழ்",      s: "Tamil · coming soon" },
  ];
  return (
    <SubScreen label="28 Language" title="Language" onBack={onBack}
               note="More Indian languages are on the way. Your data stays on-device either way.">
      <Card style={{ padding: "0 16px" }}>
        {langs.map((x, i) => (
          <RadioRow key={x.id} icon="translate" label={x.l} sub={x.s} on={v === x.id}
                    last={i === langs.length - 1}
                    onClick={() => { setV(x.id); onChange?.(x.id); }} />
        ))}
      </Card>
    </SubScreen>
  );
}

// 29. CURRENCY
function CurrencyScreen({ onBack, value = "INR", onChange, isPlus = false, onUpgrade }) {
  // Free tier: INR only, radio-style. Plus: multi-currency, several can be active.
  const [active, setActive] = uSS(() => new Set([value || "INR"]));
  const list = [
    { id: "INR", l: "₹ Indian Rupee",   s: "INR", i: "currency-inr" },
    { id: "USD", l: "$ US Dollar",      s: "USD", i: "currency-dollar",        plus: true },
    { id: "AED", l: "د.إ UAE Dirham",   s: "AED", i: "currency-circle-dollar", plus: true },
    { id: "GBP", l: "£ Pound Sterling", s: "GBP", i: "currency-gbp",           plus: true },
  ];

  const toggle = (id) => {
    setActive(prev => {
      const nextSet = new Set(prev);
      if (id === "INR" && nextSet.has("INR") && nextSet.size === 1) return nextSet; // never zero currencies
      nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id);
      if (!nextSet.size) nextSet.add("INR");
      return nextSet;
    });
    onChange?.(id);
  };

  return (
    <SubScreen label="29 Currency" title="Currency" onBack={onBack}
               note={isPlus ? "Active currencies appear across budgets and transactions."
                            : "Unlock multi-currency accounts with Dhan Plus."}>
      <Card style={{ padding: "0 16px" }}>
        {list.map((x, i) => {
          const last = i === list.length - 1;
          const locked = x.plus && !isPlus;
          if (!locked) {
            return (
              <RadioRow key={x.id} icon={x.i} label={x.l} sub={x.s}
                        on={isPlus ? active.has(x.id) : x.id === "INR"}
                        last={last}
                        onClick={() => (isPlus ? toggle(x.id) : (setActive(new Set(["INR"])), onChange?.("INR")))} />
            );
          }
          return (
            <div key={x.id} role="button" tabIndex={0} onClick={() => onUpgrade?.()}
                 aria-label={x.l + " — Dhan Plus feature, upgrade to unlock"}
                 style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16,
                          alignItems: "center", padding: "16px 0", cursor: "pointer",
                          borderBottom: last ? "none" : "1px solid var(--border-subtle)" }}>
              <span style={{ position: "relative", display: "inline-flex", opacity: 0.5 }}>
                <IconChip icon={x.i} />
                <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18,
                               borderRadius: 999, background: NAVY_S, display: "grid",
                               placeItems: "center", boxShadow: "0 0 0 2px var(--bg-elevated)" }}>
                  <i className="ph-fill ph-lock-simple" style={{ fontSize: 10, color: "#fff" }}/>
                </span>
              </span>
              <div style={{ minWidth: 0, opacity: 0.5 }}>
                <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg-2)" }}>{x.l}</div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{x.s}</div>
              </div>
              <PlusTag />
            </div>
          );
        })}
      </Card>
    </SubScreen>
  );
}

// 30. APPEARANCE
function AppearanceScreen({ onBack, value = "System", onChange }) {
  const [v, setV] = uSS(value);
  const modes = [
    { id: "System", i: "circle-half", s: "Follows your phone setting" },
    { id: "Light",  i: "sun",         s: "Always the light theme" },
    { id: "Dark",   i: "moon",        s: "Always the dark theme" },
  ];
  return (
    <SubScreen label="30 Appearance" title="Appearance" onBack={onBack}>
      <Card style={{ padding: "0 16px" }}>
        {modes.map((m, i) => (
          <RadioRow key={m.id} icon={m.i} label={m.id} sub={m.s} on={v === m.id}
                    last={i === modes.length - 1}
                    onClick={() => { setV(m.id); onChange?.(m.id); }} />
        ))}
      </Card>
    </SubScreen>
  );
}

// 31. NOTIFICATION SETTINGS
const NOTIF_DEFAULTS = [
  { id: "bills",   i: "receipt",       l: "Bill reminders",  s: "Three days before a bill is due", on: true },
  { id: "budget",  i: "warning",       l: "Budget warnings", s: "When a bucket passes 80%",        on: true },
  { id: "weekly",  i: "chart-line-up", l: "Weekly summary",  s: "Every Monday morning",            on: true },
  { id: "ai",      i: "sparkle",       l: "AI insights",     s: "Included with Dhan Plus",         on: false },
  { id: "splits",  i: "users-three",   l: "Split activity",  s: "When someone settles up",         on: false },
  { id: "promos",  i: "megaphone",     l: "Product news",    s: "New features and tips",           on: false },
];

function NotifSettingsScreen({ onBack, state, onChange }) {
  const [rows, setRows] = uSS(state || NOTIF_DEFAULTS);
  const count = rows.filter(r => r.on).length;
  const toggle = (id) => {
    const next = rows.map(r => r.id === id ? { ...r, on: !r.on } : r);
    setRows(next); onChange?.(next);
  };
  return (
    <SubScreen label="31 Notif settings" title="Notifications" onBack={onBack}>
      <div style={{ fontSize: 12, color: "var(--fg-3)", margin: "0 4px 8px" }}>
        {count} of {rows.length} on
      </div>
      <Card style={{ padding: "0 16px" }}>
        {rows.map((r, i) => (
          <ToggleRow key={r.id} icon={r.i} label={r.l} sub={r.s} on={r.on}
                     last={i === rows.length - 1} onToggle={() => toggle(r.id)} />
        ))}
      </Card>
    </SubScreen>
  );
}

// 32. SMS SOURCES
function SmsSourcesScreen({ onBack, onToast }) {
  const [rows, setRows] = uSS([
    { id: "hdfc", l: "HDFC Bank",  s: "HDFCBK · 412 messages read", on: true },
    { id: "axis", l: "Axis Bank",  s: "AxisBk · 208 messages read", on: true },
    { id: "icici",l: "ICICI Bank", s: "ICICIB · 96 messages read",  on: true },
    { id: "sbi",  l: "SBI",        s: "SBIUPI · detected, not enabled", on: false },
  ]);
  const toggle = (id) => setRows(rs => rs.map(r => r.id === id ? { ...r, on: !r.on } : r));
  return (
    <SubScreen label="32 SMS sources" title="SMS sources" onBack={onBack}
               note="Dhan reads transaction SMS on your device only. Nothing is uploaded.">
      <Card style={{ padding: "0 16px", marginBottom: 12 }}>
        {rows.map((r, i) => (
          <ToggleRow key={r.id} icon="bank" label={r.l} sub={r.s} on={r.on}
                     last={i === rows.length - 1} onToggle={() => toggle(r.id)} />
        ))}
      </Card>
      <button onClick={() => onToast?.("Scanning for new bank senders…")} style={{
        width: "100%", padding: 16, borderRadius: "var(--r-card-sm)", cursor: "pointer",
        border: "1px dashed var(--border-strong)", background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 600, color: NAVY_S,
      }}>
        <i className="ph ph-plus-circle" style={{ fontSize: 17 }}/> Add source
      </button>
    </SubScreen>
  );
}

// 33. EXPORT DATA
function ExportDataScreen({ onBack, onToast }) {
  const [fmt, setFmt] = uSS("csv");
  const [range, setRange] = uSS("month");
  const [from, setFrom] = uSS("01 Sep 2026");
  const [to, setTo] = uSS("03 Sep 2026");
  const ranges = [["month", "This month"], ["quarter", "Last 3 months"], ["year", "This year"], ["custom", "Custom"]];
  return (
    <SubScreen label="33 Export" title="Export data" onBack={onBack}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)", margin: "0 4px 8px" }}>Format</div>
      <Card style={{ padding: "0 16px", marginBottom: 16 }}>
        <RadioRow icon="file-csv" label="CSV" sub="Spreadsheet-ready rows" on={fmt === "csv"}
                  onClick={() => setFmt("csv")} />
        <RadioRow icon="file-pdf" label="PDF" sub="Formatted statement with charts" on={fmt === "pdf"}
                  last onClick={() => setFmt("pdf")} />
      </Card>

      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)", margin: "0 4px 8px" }}>Date range</div>
      <Card style={{ padding: "0 16px", marginBottom: 16 }}>
        {ranges.map(([id, l], i) => (
          <RadioRow key={id} label={l} on={range === id} last={i === ranges.length - 1}
                    onClick={() => setRange(id)} />
        ))}
      </Card>

      {range === "custom" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, marginBottom: 16 }}>
          <Field label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Field label="To" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      )}

      <Button variant="primary" full size="lg" icon="download-simple"
              onClick={() => onToast?.(`Exporting ${fmt.toUpperCase()}…`)}>Export</Button>
    </SubScreen>
  );
}

// 34. PRIVACY SETTINGS
function PrivacySettingsScreen({ onBack, onToast }) {
  const [rows, setRows] = uSS([
    { id: "analytics", i: "chart-bar",   l: "Anonymous usage analytics", s: "Crash reports and feature counts only", on: false },
    { id: "personal",  i: "sparkle",     l: "Personalised tips",         s: "Uses on-device spending patterns",      on: true },
    { id: "backup",    i: "cloud-arrow-up", l: "Encrypted cloud backup", s: "Off keeps everything local-only",       on: false },
    { id: "biometric", i: "fingerprint", l: "Require unlock for exports", s: "Ask for Face ID before sharing data",  on: true },
  ]);
  const [confirm, setConfirm] = uSS(false);
  const toggle = (id) => setRows(rs => rs.map(r => r.id === id ? { ...r, on: !r.on } : r));
  return (
    <SubScreen label="34 Privacy" title="Privacy settings" onBack={onBack}>
      <div style={{ background: "var(--income-bg)", borderRadius: 12, padding: 16, marginBottom: 16,
                    display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, alignItems: "center" }}>
        <IconChip icon="device-mobile" color="var(--income)" bg="rgba(46,125,91,.14)" />
        <div style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.5 }}>
          Your transactions live on this device. Dhan works fully offline — no server sees your money.
        </div>
      </div>

      <Card style={{ padding: "0 16px", marginBottom: 16 }}>
        {rows.map((r, i) => (
          <ToggleRow key={r.id} icon={r.i} label={r.l} sub={r.s} on={r.on}
                     last={i === rows.length - 1} onToggle={() => toggle(r.id)} />
        ))}
      </Card>

      {confirm ? (
        <div style={{ background: "var(--expense-bg)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, color: NAVY_S, marginBottom: 12, lineHeight: 1.5 }}>
            Request account deletion? We erase your Dhan account and all synced data within 30 days.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => setConfirm(false)} style={{
              height: 44, borderRadius: "var(--r-control)", cursor: "pointer",
              background: "transparent", border: "1px solid var(--border-default)",
              fontFamily: "Poppins, sans-serif", fontSize: 14, color: "var(--fg-2)" }}>Cancel</button>
            <button onClick={() => { setConfirm(false); onToast?.("Deletion request sent"); }} style={{
              height: 44, borderRadius: "var(--r-control)", cursor: "pointer",
              background: "var(--expense)", border: "none",
              fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600, color: "#fff" }}>Request</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)} style={{
          width: "100%", height: 48, borderRadius: "var(--r-control)", cursor: "pointer",
          background: "transparent", border: "1px solid var(--expense-bg)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontFamily: "Poppins, sans-serif", fontSize: 14, color: "var(--expense)",
        }}>
          <i className="ph ph-trash" style={{ fontSize: 16 }}/> Request account deletion
        </button>
      )}
    </SubScreen>
  );
}

// 35. APP LOCK
function AppLockScreen({ onBack, value = "Face ID", onChange }) {
  const [on, setOn] = uSS(value !== "None");
  const [method, setMethod] = uSS(value === "None" ? "Face ID" : value);
  const apply = (m, isOn) => onChange?.(isOn ? m : "None");
  const methods = [
    { id: "Face ID", i: "scan-smiley",  s: "Fastest — uses your phone's biometrics" },
    { id: "PIN",     i: "password",     s: "Six-digit code you set" },
  ];
  return (
    <SubScreen label="35 App lock" title="App lock" onBack={onBack}
               note="App lock protects Dhan itself. Your phone passcode still guards the device.">
      <Card style={{ padding: "0 16px", marginBottom: 16 }}>
        <ToggleRow icon="lock-key" label="App lock" sub={on ? "Unlock required on open" : "Anyone with your phone can open Dhan"}
                   on={on} last onToggle={() => { const n = !on; setOn(n); apply(method, n); }} />
      </Card>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--fg-3)", margin: "0 4px 8px" }}>Method</div>
      <Card style={{ padding: "0 16px", opacity: on ? 1 : 0.5 }}>
        {methods.map((m, i) => (
          <RadioRow key={m.id} icon={m.i} label={m.id} sub={m.s} on={on && method === m.id}
                    last={i === methods.length - 1}
                    onClick={() => { if (on) { setMethod(m.id); apply(m.id, true); } }} />
        ))}
      </Card>
    </SubScreen>
  );
}

// 36–38. TEXT SCREENS (About · Terms · Privacy policy)
const LEGAL_TEXT = {
  about: {
    label: "36 About", title: "About Dhan",
    blocks: [
      ["What Dhan is", "Dhan is a local-first money app for India. It reads your bank SMS on your device, sorts spending into Needs, Wants and Savings, and keeps every rupee accounted for without shipping your data anywhere."],
      ["Why we built it", "Most money apps sell insight back to you or sell you to someone else. Dhan is built to be boring about privacy and opinionated about budgeting frameworks — 50/30/20 by default, five more if that doesn't fit."],
      ["Company", "Dhan Technologies Pvt. Ltd.\n4th Floor, Koramangala 5th Block\nBengaluru 560095, Karnataka, India\nCIN U62099KA2024PTC112233"],
      ["Version", "2.4.1 (build 2410) · September 2026\nMade with ♥ in Bengaluru"],
    ],
  },
  terms: {
    label: "37 Terms", title: "Terms of service",
    blocks: [
      ["1. Acceptance", "By creating a Dhan account you agree to these terms. If you do not agree, do not use the app. We may update these terms; material changes are announced in-app at least 14 days before they take effect."],
      ["2. Your account", "You are responsible for keeping your device, PIN and biometrics secure. Dhan cannot recover data from a device you lose if cloud backup is switched off."],
      ["3. Permitted use", "Dhan is for personal money management. You may not resell access, scrape the app, reverse-engineer its SMS parsers, or use it to process funds on behalf of others."],
      ["4. Financial information", "Dhan is not a bank, broker, adviser or lender. Budgets, insights and projections are informational only and are not financial advice. Always confirm balances with your bank."],
      ["5. Subscriptions", "Dhan Plus bills ₹199 per month or ₹1,908 per year through your app store account. Cancel any time; access continues to the end of the paid period. Refunds follow your app store's policy."],
      ["6. Availability", "We aim for continuous availability but do not guarantee it. Features may change, and the app may be unavailable during maintenance or for reasons outside our control."],
      ["7. Liability", "To the extent permitted by law, Dhan's liability is limited to the amount you paid us in the twelve months before a claim. We are not liable for indirect or consequential loss."],
      ["8. Governing law", "These terms are governed by the laws of India. Disputes fall under the exclusive jurisdiction of the courts of Bengaluru, Karnataka."],
    ],
  },
  privacy: {
    label: "38 Privacy", title: "Privacy policy",
    blocks: [
      ["Local-first by default", "Transaction data parsed from your SMS is stored in an encrypted database on your device. With cloud backup off, it never leaves your phone — not to us, not to anyone else."],
      ["What we collect", "Account basics you give us: name, phone number, email. If you opt in to anonymous analytics, we also receive crash reports and aggregate feature counts that contain no transaction detail."],
      ["What we never collect", "We do not collect your bank credentials, card numbers, SMS text, merchant names, or the amounts of individual transactions. We do not sell or rent data, ever, to anyone."],
      ["Permissions", "SMS read access is used solely to detect transaction alerts from the bank senders you enable. Notification access is used to schedule reminders you turn on."],
      ["Backups", "If you enable encrypted cloud backup, your database is encrypted on-device with a key derived from your credentials before upload. We cannot read it."],
      ["Your rights", "You can export everything you have in Dhan at any time, and you can request account deletion from Privacy settings. Deletion completes within 30 days."],
      ["Contact", "Questions or a data request: privacy@dhan.app · Grievance Officer, Dhan Technologies Pvt. Ltd., Bengaluru 560095."],
    ],
  },
};

function LegalScreen({ kind, onBack }) {
  const d = LEGAL_TEXT[kind];
  return (
    <SubScreen label={d.label} title={d.title} onBack={onBack}>
      <Card style={{ padding: 16 }}>
        {d.blocks.map((b, i) => (
          <div key={b[0]} style={{ marginTop: i === 0 ? 0 : 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: NAVY_S }}>{b[0]}</div>
            <div style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.6, marginTop: 6,
                          whiteSpace: "pre-line", textWrap: "pretty" }}>{b[1]}</div>
          </div>
        ))}
      </Card>
      <div style={{ textAlign: "center", fontSize: 11, color: "var(--fg-4)", padding: "16px 0 0" }}>
        Last updated 1 September 2026
      </div>
    </SubScreen>
  );
}

Object.assign(window, {
  RadioRow, ToggleRow, SubScreen,
  LanguageScreen, CurrencyScreen, AppearanceScreen, NotifSettingsScreen,
  SmsSourcesScreen, ExportDataScreen, PrivacySettingsScreen, AppLockScreen,
  LegalScreen, NOTIF_DEFAULTS,
});
