// ─── Dhan shared components ─────────────────────────────────
const { useState, useEffect, useRef, useMemo } = React;

// Phone frame
function Phone({ children, bg = "var(--bg-surface)", label, dark = false }) {
  return (
    <div style={{
      width: 390, height: 844, background: bg,
      borderRadius: 48,
      border: "10px solid #0B1230",
      boxShadow: "0 40px 100px rgba(20,28,65,0.28), 0 2px 0 rgba(255,255,255,0.08) inset",
      overflow: "hidden", position: "relative",
      fontFamily: "Poppins, sans-serif", color: "var(--fg-1)",
      display: "flex", flexDirection: "column",
    }} data-screen-label={label}>
      {/* dynamic island */}
      <div style={{
        position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
        width: 110, height: 30, borderRadius: 999, background: "#000",
        zIndex: 99, pointerEvents: "none",
      }}/>
      {children}
    </div>
  );
}

function StatusBar({ dark = false }) {
  const color = dark ? "#fff" : "var(--fg-1)";
  return (
    <div style={{
      height: 44, padding: "0 28px", display: "flex",
      alignItems: "center", justifyContent: "space-between",
      fontSize: 15, fontWeight: 600, color, flexShrink: 0,
      position: "relative", zIndex: 2,
    }}>
      <span>9:41</span>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <i className="ph-fill ph-cell-signal-high" style={{ fontSize: 14 }}></i>
        <i className="ph-fill ph-wifi-high" style={{ fontSize: 14 }}></i>
        <i className="ph-fill ph-battery-full" style={{ fontSize: 18 }}></i>
      </span>
    </div>
  );
}

// Primary bottom-tab nav
function TabBar({ active, onChange }) {
  const tabs = [
    { id: "home",  iconR: "house",           iconF: "house",           label: "Home" },
    { id: "txn",   iconR: "list-bullets",    iconF: "receipt",         label: "Txns" },
    { id: "budget",iconR: "chart-pie-slice", iconF: "chart-pie-slice", label: "Budget" },
    { id: "bills", iconR: "calendar-check",  iconF: "calendar-check",  label: "Bills" },
    { id: "split", iconR: "users-three",     iconF: "users-three",     label: "Split" },
  ];
  return (
    <div style={{
      height: 76, background: "#fff",
      borderTop: "1px solid var(--border-subtle)",
      display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
      padding: "8px 4px 18px", flexShrink: 0,
      position: "relative", zIndex: 2,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange?.(t.id)} style={{
            border: "none", background: "transparent", padding: 0,
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 4, cursor: "pointer",
            color: isActive ? "var(--dhan-navy)" : "var(--fg-3)",
            transition: "color .2s var(--ease-out)",
          }}>
            <i className={`${isActive ? "ph-fill" : "ph"} ph-${isActive ? t.iconF : t.iconR}`}
               style={{ fontSize: 24 }}></i>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Top app bar — logo (opens More) · search · notifications
function AppHeader({ onMenu, onSearch, onNotify, unread = true }) {
  const btn = {
    width: 40, height: 40, borderRadius: "var(--r-input)",
    background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
    display: "grid", placeItems: "center", cursor: "pointer", color: "#141C41",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0 16px 8px", gap: 8, flexShrink: 0 }}>
      <button aria-label="Menu" onClick={onMenu}
              style={{ width: 40, height: 40, border: "none", background: "none", padding: 0,
                       display: "grid", placeItems: "center", cursor: "pointer" }}>
        <img src="assets/dhan-mark.svg" alt="Dhan"
             style={{ width: 32, height: 32, display: "block" }}/>
      </button>
      <div style={{ display: "flex", gap: 8 }}>
        <button aria-label="Search" onClick={onSearch} style={btn}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 20 }}/>
        </button>
        <button aria-label="Notifications" onClick={onNotify} style={{ ...btn, position: "relative" }}>
          <i className="ph ph-bell" style={{ fontSize: 20 }}/>
          {unread && (
            <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8,
                           borderRadius: 999, background: "var(--dhan-gold)",
                           border: "2px solid var(--bg-elevated)", boxSizing: "content-box" }}/>
          )}
        </button>
      </div>
    </div>
  );
}

// Buttons
function Button({ variant = "primary", children, onClick, full = false, icon, iconRight, size = "md", disabled = false, style: extra = {} }) {
  const sizes = {
    md: { h: 48, px: 20, fs: 15, r: "var(--r-control)" },
    sm: { h: 36, px: 14, fs: 13, r: "var(--r-control)" },
    lg: { h: 56, px: 24, fs: 16, r: "var(--r-control)" },
  }[size];
  const vars = {
    primary:     { bg: "var(--dhan-navy)",   fg: "#fff" },
    secondary:   { bg: "var(--bg-surface)",  fg: "var(--dhan-navy)" },
    gold:        { bg: "var(--dhan-gold)",   fg: "var(--dhan-navy)" },
    ghost:       { bg: "transparent",        fg: "var(--dhan-navy)" },
    outline:     { bg: "#fff",               fg: "var(--dhan-navy)", border: "1px solid var(--border-default)" },
    destructive: { bg: "var(--expense-bg)",  fg: "var(--expense)" },
  }[variant];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      height: sizes.h, padding: `0 ${sizes.px}px`,
      background: vars.bg, color: vars.fg,
      border: vars.border || "none", borderRadius: sizes.r,
      fontWeight: 600, fontSize: sizes.fs,
      width: full ? "100%" : "auto", cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "transform var(--dur-fast) var(--ease-out), opacity var(--dur-fast)",
      ...extra,
    }}
    onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
      {icon && (icon.includes("/")
        ? <img src={icon} alt="" style={{ width: 18, height: 18, display: "block" }}/>
        : <i className={`ph ph-${icon}`} style={{ fontSize: 18 }}></i>)}
      {children}
      {iconRight && <i className={`ph ph-${iconRight}`} style={{ fontSize: 18 }}></i>}
    </button>
  );
}

function Card({ children, style, onClick, className }) {
  return (
    <div onClick={onClick} className={className} style={{
      background: "var(--bg-elevated)", borderRadius: "var(--r-card)", padding: 16,
      boxShadow: "var(--shadow-card)",
      border: "1px solid var(--card-border-color)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}

// Currency
function formatINR(n, { showSign = false, noSymbol = false } = {}) {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const sign = n < 0 ? "−" : (showSign ? "+" : "");
  return `${sign}${noSymbol ? "" : "₹"}${s}`;
}

// Category meta — phosphor icons + category colours
const CATEGORIES = {
  food:      { name: "Food",          icon: "fork-knife",     color: "#E88B5C" },
  transport: { name: "Transport",     icon: "car-simple",     color: "#6A8FD4" },
  shopping:  { name: "Shopping",      icon: "shopping-bag",   color: "#C97BB6" },
  bills:     { name: "Bills",         icon: "receipt",        color: "#7C9B5F" },
  ent:       { name: "Entertainment", icon: "film-strip",     color: "#B079D9" },
  health:    { name: "Health",        icon: "heartbeat",      color: "#5CB4A8" },
  edu:       { name: "Education",     icon: "graduation-cap", color: "#D4A84C" },
  groceries: { name: "Groceries",     icon: "basket",         color: "#7FB36B" },
  rent:      { name: "Rent",          icon: "house",          color: "#6A8FD4" },
  travel:    { name: "Travel",        icon: "airplane-takeoff", color: "#4F8FAF" },
  income:    { name: "Income",        icon: "arrow-down-left",color: "#2E7D5B" },
  cc:        { name: "Credit card",   icon: "credit-card",    color: "#C4696B" },
  emi:       { name: "Loan EMI",       icon: "bank",           color: "#A2708F" },
  ploan:     { name: "Personal loan",  icon: "hand-coins",     color: "#8B7BC4" },
  invest:    { name: "Investments",    icon: "trend-up",       color: "#3E9B77" },
  "forex-fee": { name: "Forex Fee",   icon: "currency-circle-dollar", color: "#8A90A8", locked: true },
  other:     { name: "Other",         icon: "dots-three",     color: "#8A90A8" },
};

function CategoryIcon({ cat, size = 40, tint = false }) {
  const c = CATEGORIES[cat] || CATEGORIES.other;
  if (tint) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "var(--r-input)",
        background: c.color + "1F", display: "grid", placeItems: "center",
        color: c.color, flexShrink: 0,
      }}>
        <i className={`ph ph-${c.icon}`} style={{ fontSize: size * 0.5 }}></i>
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "var(--r-icon)",
      background: c.color, display: "grid", placeItems: "center",
      color: "#fff", flexShrink: 0,
    }}>
      <i className={`ph ph-${c.icon}`} style={{ fontSize: size * 0.5 }}></i>
    </div>
  );
}

// Transaction row
function TxnRow({ merchant, meta, amount, cat, last = false, onClick,
                 isForeign = false, currency, originalAmount, budgetTag }) {
  const isIn = amount > 0;
  const isFee = cat === "forex-fee";
  const pill = {
    fontSize: 10.5, fontWeight: 500, lineHeight: 1.4, borderRadius: 4,
    padding: "2px 6px", letterSpacing: ".02em", whiteSpace: "nowrap",
    maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
  };
  const badge = isFee
    ? <span style={{ ...pill, background: "var(--bg-surface)", color: "var(--fg-2)",
                     border: "1px solid var(--border-subtle)" }}>Forex Fee</span>
    : isForeign && currency
      ? <span title={originalAmount ? `${currency} ${originalAmount}` : currency}
              style={{ ...pill, background: "rgba(201,168,76,.18)", color: "#141C41" }}>{currency}</span>
      : null;
  return (
    <div onClick={onClick} style={{
      display: "grid", gridTemplateColumns: "40px minmax(0,1fr) auto", gap: 12,
      alignItems: "center", padding: "16px 0",
      borderBottom: last ? "none" : "1px solid var(--border-subtle)",
      cursor: onClick ? "pointer" : "default",
    }}>
      <CategoryIcon cat={cat} tint />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis" }}>{merchant}</div>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2,
                      overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap" }}>{meta}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end",
                    gap: 4, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 15, fontVariantNumeric: "tabular-nums",
          color: isIn ? "var(--income)" : "var(--fg-1)",
          whiteSpace: "nowrap",
        }}>
          {isIn ? "+" : "−"}₹{Math.abs(amount).toLocaleString("en-IN")}
        </div>
        {badge}
        {budgetTag && (
          <span style={{ ...pill, background: "var(--bg-surface)", color: "#141C41",
                         border: "1px solid var(--border-default)", fontWeight: 600 }}>{budgetTag}</span>
        )}
      </div>
    </div>
  );
}

// Circular progress ring
function Ring({ value, max, size = 140, stroke = 12, color = "var(--dhan-navy)", track = "var(--bg-surface)", children }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(1, value / max);
  const dash = circ * pct;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius}
          stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray .6s var(--ease-out)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        {children}
      </div>
    </div>
  );
}

// Bottom sheet
function BottomSheet({ open, onClose, children, height = "auto", title }) {
  if (!open) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      pointerEvents: "auto",
    }}>
      <div className="scrim-in" onClick={onClose} style={{
        position: "absolute", inset: 0, background: "var(--bg-overlay)",
      }}/>
      <div className="sheet-in" style={{
        position: "relative", background: "var(--bg-elevated)",
        borderRadius: "var(--r-sheet) var(--r-sheet) 0 0",
        padding: "10px 20px 28px",
        maxHeight: "88%",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -10px 30px rgba(var(--shadow-rgb),.16)",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border-strong)",
                      margin: "4px auto 10px" }}/>
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 999, border: "none",
              background: "var(--bg-surface)", cursor: "pointer",
              display: "grid", placeItems: "center",
            }}>
              <i className="ph ph-x" style={{ fontSize: 16 }}></i>
            </button>
          </div>
        )}
        <div style={{ overflowY: "auto", flex: "0 1 auto" }} className="phone-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}

// Chip/Filter
function Chip({ active, onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 999, border: "none",
      fontWeight: 600, fontSize: 13,
      background: active ? "var(--dhan-navy)" : "var(--bg-surface)",
      color: active ? "#fff" : "var(--fg-2)",
      whiteSpace: "nowrap", cursor: "pointer",
      transition: "background .15s, color .15s",
      ...style,
    }}>
      {children}
    </button>
  );
}

function StatusPill({ tone = "info", children }) {
  const meta = {
    info:     { bg: "var(--info-bg)",    fg: "var(--info)" },
    income:   { bg: "var(--income-bg)",  fg: "var(--income)" },
    expense:  { bg: "var(--expense-bg)", fg: "var(--expense)" },
    warning:  { bg: "var(--warning-bg)", fg: "var(--warning)" },
    neutral:  { bg: "var(--bg-surface)", fg: "var(--fg-2)" },
  }[tone];
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px",
      borderRadius: 999, fontSize: 10.5, fontWeight: 500,
      background: meta.bg, color: meta.fg,
      letterSpacing: "0.02em",
    }}>{children}</span>
  );
}

// Dhan Plus lock treatment — dim + lock badge + gold tag, taps open the paywall
function PlusTag({ label = "Dhan Plus" }) {
  return (
    <span style={{
      fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600,
      letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dhan-gold)",
      border: "1px solid var(--dhan-gold)", borderRadius: 999, padding: "3px 8px",
      whiteSpace: "nowrap", lineHeight: 1,
    }}>{label}</span>
  );
}

function PlusLock({ locked = true, onUpgrade, tag = "below", children }) {
  if (!locked) return children;
  const core = (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span style={{ opacity: .5, display: "inline-flex", pointerEvents: "none" }}>{children}</span>
      <span style={{
        position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: 999,
        background: "var(--dhan-navy)", display: "grid", placeItems: "center",
        boxShadow: "0 0 0 2px var(--bg-elevated)", zIndex: 2,
      }}>
        <i className="ph-fill ph-lock-simple" style={{ fontSize: 10, color: "#fff" }}></i>
      </span>
    </span>
  );
  const wrap = (style, kids) => (
    <span role="button" tabIndex={0} onClick={() => onUpgrade?.()}
          aria-label="Dhan Plus feature — upgrade to unlock"
          style={{ cursor: "pointer", ...style }}>{kids}</span>
  );
  if (tag === "none") return wrap({ display: "inline-flex" }, core);
  if (tag === "left")  return wrap({ display: "inline-flex", alignItems: "center", gap: 8 }, <>
    <PlusTag />{core}
  </>);
  if (tag === "right") return wrap({ display: "inline-flex", alignItems: "center", gap: 8 }, <>
    {core}<PlusTag />
  </>);
  return wrap({ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }, <>
    {core}<PlusTag />
  </>);
}

// Screen header (back + title + trailing)
function ScreenHeader({ title, onBack, right, dark = false }) {
  const fg = dark ? "#fff" : "var(--fg-1)";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "4px 16px 12px",
    }}>
      <button onClick={onBack} style={{
        width: 40, height: 40, borderRadius: "var(--r-control)",
        background: dark ? "rgba(255,255,255,.1)" : "#fff",
        border: dark ? "none" : "1px solid var(--border-subtle)",
        display: "grid", placeItems: "center", cursor: "pointer",
        color: fg,
      }} aria-label="Back">
        <i className="ph ph-arrow-left" style={{ fontSize: 20 }}></i>
      </button>
      <div style={{ fontSize: 16, fontWeight: 600, color: fg }}>{title}</div>
      <div style={{ minWidth: 40, height: 40, display: "flex", alignItems: "center",
                    justifyContent: "flex-end", flexShrink: 0 }}>{right}</div>
    </div>
  );
}

// FAB
function FAB({ onClick, icon = "plus" }) {
  return (
    <button onClick={onClick} style={{
      position: "absolute", bottom: 92, right: 20, zIndex: 10,
      width: 56, height: 56, borderRadius: 999,
      background: "var(--dhan-navy)", border: "none",
      boxShadow: "0 10px 24px rgba(var(--shadow-rgb),.35), 0 2px 6px rgba(var(--shadow-rgb),.15)",
      display: "grid", placeItems: "center", cursor: "pointer",
      color: "#fff",
      transition: "transform .15s var(--ease-out)",
    }}
    onMouseDown={e => e.currentTarget.style.transform = "scale(0.94)"}
    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <i className={`ph ph-${icon}`} style={{ fontSize: 26, fontWeight: 700 }}></i>
    </button>
  );
}

// Section header ("View all" link)
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", margin: "0 4px 10px" }}>
      <div style={{ fontSize: 16, fontWeight: 500 }}>{title}</div>
      {action && (
        <button onClick={onAction} style={{
          border: "none", background: "none",
          color: "var(--dhan-navy)", fontSize: 12, fontWeight: 500, cursor: "pointer",
        }}>{action}</button>
      )}
    </div>
  );
}

// Text input
function Field({ label, value, onChange, onBlur, placeholder, prefix, type = "text", right, autoFocus, disabled }) {
  return (
    <label style={{ display: "block", marginBottom: 14, minWidth: 0 }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)", marginBottom: 6 }}>
          {label}
        </div>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        border: "1px solid var(--border-default)", borderRadius: "var(--r-input)",
        padding: "0 12px", height: 52, background: "#fff",
        transition: "border-color .15s",
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = "var(--dhan-navy)"}
      onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-default)"}>
        {prefix && <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>{prefix}</span>}
        <input
          type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder}
          autoFocus={autoFocus} disabled={disabled} onBlur={onBlur}
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: 15, fontWeight: 500, color: "var(--fg-1)",
            background: "transparent",
          }}/>
        {right}
      </div>
    </label>
  );
}

// Shared single-select indicator — navy circle + light tick (all radio/check rows)
function SelectIndicator({ on, size = 22 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      border: "1.5px solid " + (on ? "#141C41" : "var(--border-strong)"),
      background: on ? "#141C41" : "transparent",
      display: "grid", placeItems: "center",
    }}>
      {on && <i className="ph-bold ph-check" style={{ fontSize: Math.round(size * 0.68), color: "#FAFAFA" }}/>}
    </span>
  );
}

// Icon chip — 40×40 light rounded square (Transaction Detail standard)
function IconChip({ icon, size = 40, color = "#141C41", bg = "var(--bg-surface)", fill = false }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "var(--r-input)",
                   background: bg, color, display: "grid", placeItems: "center", flexShrink: 0 }}>
      <Glyph icon={icon} size={Math.round(size * 0.45)} fill={fill} />
    </span>
  );
}

// Any icon value that isn't a Phosphor slug (i.e. contains non-ASCII) is treated
// as a user-picked emoji and rendered as text in the same badge slot.
function isEmojiIcon(v) { return typeof v === "string" && /[^\x00-\x7F]/.test(v); }

function pickEmoji(str) {
  const s = (str || "").trim();
  if (!s) return null;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segs = [...new Intl.Segmenter().segment(s)].map(x => x.segment).filter(isEmojiIcon);
    return segs.length ? segs[segs.length - 1] : null;
  }
  return isEmojiIcon(s) ? s.slice(-2) : null;
}

function Glyph({ icon, size = 18, fill = false, style }) {
  if (isEmojiIcon(icon))
    return <span style={{ fontSize: Math.round(size * 1.05), lineHeight: 1, ...style }}>{icon}</span>;
  return <i className={(fill ? "ph-fill ph-" : "ph ph-") + icon} style={{ fontSize: size, ...style }}/>;
}

// Emoji tile — sits at the end of a fixed icon row and opens the device's native
// keyboard (emoji panel) so any emoji can be used as the item's icon.
function EmojiTile({ value, onChange, size = 44, iconSize = 18,
                     activeBg = "#141C41", activeColor = "#fff", radius = "var(--r-input)" }) {
  const on = isEmojiIcon(value);
  return (
    <label title="Pick any emoji" style={{
      position: "relative", width: size, height: size, borderRadius: radius, cursor: "pointer",
      border: "1px solid " + (on ? activeBg : "var(--border-subtle)"),
      background: on ? activeBg : "transparent",
      color: on ? activeColor : "var(--fg-2)", display: "grid", placeItems: "center",
    }}>
      {on
        ? <span style={{ fontSize: Math.round(iconSize * 1.15), lineHeight: 1 }}>{value}</span>
        : <i className="ph ph-smiley" style={{ fontSize: iconSize }}/>}
      <input value="" aria-label="Type or pick an emoji" inputMode="text" autoComplete="off"
             onChange={(e) => { const em = pickEmoji(e.target.value); if (em) onChange(em); }}
             style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0,
                      border: "none", background: "transparent", outline: "none",
                      cursor: "pointer", fontSize: 16, padding: 0 }}/>
    </label>
  );
}

// Icon-led label / value row — the shared list-row standard
function DetailRow({ icon, iconColor, iconBg, label, sub, value, children,
                     last = false, onClick, chevron = false }) {
  return (
    <div onClick={onClick} style={{
      display: "grid",
      gridTemplateColumns: chevron ? "40px 1fr auto 16px" : "40px 1fr auto",
      gap: 16, alignItems: "center", padding: "16px 0",
      borderBottom: last ? "none" : "1px solid var(--border-subtle)",
      cursor: onClick ? "pointer" : "default",
    }}>
      <IconChip icon={icon} color={iconColor} bg={iconBg} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 400, color: "var(--fg-2)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#141C41", textAlign: "right",
                    fontVariantNumeric: "tabular-nums" }}>{children || value}</div>
      {chevron && <i className="ph ph-caret-right" style={{ fontSize: 14, color: "var(--fg-4)" }}/>}
    </div>
  );
}

// Tiny line chart (sparkline-ish)
function MiniSpark({ data, color = "#fff", width = 120, height = 30 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

Object.assign(window, { isEmojiIcon, pickEmoji, Glyph, EmojiTile,
  PlusLock, PlusTag,
  Phone, StatusBar, TabBar, AppHeader, Button, Card, Chip, StatusPill,
  ScreenHeader, FAB, SectionHead, Field, MiniSpark, Ring, IconChip, DetailRow,
  BottomSheet, CategoryIcon, CATEGORIES, TxnRow, formatINR, SelectIndicator,
});
