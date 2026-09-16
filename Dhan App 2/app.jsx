// ─── App — router + state ─────────────────────────────────

// Toast icon by message intent
function toastIcon(msg = "") {
  const m = String(msg).toLowerCase();
  if (m.includes("delet") || m.includes("remov")) return "trash";
  if (m.includes("paid") || m.includes("settl")) return "hand-coins";
  if (m.includes("filter")) return "sliders-horizontal";
  if (m.includes("export") || m.includes("download")) return "download-simple";
  if (m.includes("plus") || m.includes("upgrad")) return "star";
  if (m.includes("split")) return "users-three";
  if (m.includes("pin")) return "lock-key";
  return "check-circle";
}

const { useState: uS, useEffect: uE } = React;

const FLOW = ["splash", "onboarding", "signup", "permissions", "linkbank", "income", "framework", "home"];

// Has the user already onboarded? Used by Splash to branch new vs returning.
const hasAccount = () => localStorage.getItem("dhan-onboarded") === "1";

// Defaults wrapped in EDITMODE markers so host can persist
const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "userName": "Priya",
  "isPlus": false,
  "skipIntro": true,
  "greeting": "Morning",
  "mood": "midnight",
  "shape": "soft",
  "depth": "elevated"
}/*EDITMODE-END*/;

// ─── Expressive theme tables ──────────────────────────────
// Each control rewrites a whole family of tokens, so one pick
// re-skins all 26 screens rather than nudging a single value.

const MOODS = {
  midnight: { label: "Midnight & gold", swatch: ["#141C41", "#F5F6FA", "#C9A84C"], vars: {
    "--dhan-navy": "#141C41", "--dhan-navy-80": "#2A3158",
    "--dhan-gold": "#C9A84C", "--dhan-gold-soft": "#FED977", "--dhan-gold-bg": "#FBF5E3",
    "--dhan-ink": "#0E1432", "--bg-surface": "#F5F6FA", "--app-bg": "#EDEEF4",
    "--fg-1": "#141C41", "--fg-2": "#4A5172", "--fg-3": "#8A90A8", "--fg-4": "#B8BCCB",
    "--border-subtle": "#EEF0F5", "--border-default": "#E1E3EC", "--border-strong": "#C6CAD8",
    "--income": "#2E7D5B", "--income-bg": "#E6F2EC",
    "--expense": "#C94A3B", "--expense-bg": "#FBEAE7",
    "--warning": "#D89838", "--warning-bg": "#FBF2DF",
    "--info": "#3B6FD4", "--info-bg": "#E6EEFB",
    "--bg-overlay": "rgba(20,28,65,0.48)", "--shadow-rgb": "20,28,65",
  }},
  clay: { label: "Clay & amber", swatch: ["#4A2C23", "#FAF5F0", "#C87F3C"], vars: {
    "--dhan-navy": "#4A2C23", "--dhan-navy-80": "#6B4436",
    "--dhan-gold": "#C87F3C", "--dhan-gold-soft": "#F0B771", "--dhan-gold-bg": "#FBF0E4",
    "--dhan-ink": "#2E1A14", "--bg-surface": "#FAF5F0", "--app-bg": "#F2E9E1",
    "--fg-1": "#33201A", "--fg-2": "#6B5248", "--fg-3": "#A08578", "--fg-4": "#C9B5A9",
    "--border-subtle": "#F4ECE4", "--border-default": "#E7D9CD", "--border-strong": "#D0BCAC",
    "--income": "#4F7A50", "--income-bg": "#E9F0E6",
    "--expense": "#B34733", "--expense-bg": "#FAE8E3",
    "--warning": "#C88A2E", "--warning-bg": "#FBF1DF",
    "--info": "#56708F", "--info-bg": "#E9EEF4",
    "--bg-overlay": "rgba(46,26,20,0.48)", "--shadow-rgb": "74,44,35",
  }},
  forest: { label: "Forest & brass", swatch: ["#17362B", "#F3F7F3", "#B08D57"], vars: {
    "--dhan-navy": "#17362B", "--dhan-navy-80": "#2C5244",
    "--dhan-gold": "#B08D57", "--dhan-gold-soft": "#E0C48C", "--dhan-gold-bg": "#F5F1E6",
    "--dhan-ink": "#0E241C", "--bg-surface": "#F3F7F3", "--app-bg": "#E7EFE8",
    "--fg-1": "#14241E", "--fg-2": "#43584F", "--fg-3": "#7E8F86", "--fg-4": "#AFBDB4",
    "--border-subtle": "#E9F0EA", "--border-default": "#DCE6DD", "--border-strong": "#BECCC0",
    "--income": "#2F7A54", "--income-bg": "#E4F1E9",
    "--expense": "#B24A3C", "--expense-bg": "#F9E9E6",
    "--warning": "#C08A33", "--warning-bg": "#F8F0DE",
    "--info": "#3C6B87", "--info-bg": "#E6EFF4",
    "--bg-overlay": "rgba(14,36,28,0.48)", "--shadow-rgb": "23,54,43",
  }},
  ink: { label: "Ink & violet", swatch: ["#1E1B4B", "#F5F5FC", "#7C6BF5"], vars: {
    "--dhan-navy": "#1E1B4B", "--dhan-navy-80": "#33307A",
    "--dhan-gold": "#7C6BF5", "--dhan-gold-soft": "#B4A8FF", "--dhan-gold-bg": "#EFECFE",
    "--dhan-ink": "#14123A", "--bg-surface": "#F5F5FC", "--app-bg": "#ECECF7",
    "--fg-1": "#17163A", "--fg-2": "#4B4A72", "--fg-3": "#8B8AAB", "--fg-4": "#B9B8D0",
    "--border-subtle": "#EEEEF8", "--border-default": "#E2E1F0", "--border-strong": "#C7C6DE",
    "--income": "#2D7A6A", "--income-bg": "#E4F2EF",
    "--expense": "#C0455F", "--expense-bg": "#FBE8ED",
    "--warning": "#C58A2C", "--warning-bg": "#FAF1DE",
    "--info": "#4A63D8", "--info-bg": "#E9ECFB",
    "--bg-overlay": "rgba(20,18,58,0.48)", "--shadow-rgb": "30,27,75",
  }},
};

const SHAPES = {
  crisp: { label: "Crisp", vars: {
    "--r-input": "4px", "--r-control": "6px", "--r-card-sm": "7px",
    "--r-card": "8px", "--r-card-lg": "10px", "--r-sheet": "14px", "--r-icon": "18%",
  }},
  soft: { label: "Soft", vars: {
    "--r-input": "8px", "--r-control": "12px", "--r-card-sm": "14px",
    "--r-card": "16px", "--r-card-lg": "20px", "--r-sheet": "24px", "--r-icon": "30%",
  }},
  round: { label: "Round", vars: {
    "--r-input": "999px", "--r-control": "999px", "--r-card-sm": "20px",
    "--r-card": "22px", "--r-card-lg": "28px", "--r-sheet": "32px", "--r-icon": "50%",
  }},
};

const DEPTHS = {
  flat: { label: "Flat", vars: {
    "--shadow-card": "none", "--shadow-xs": "none", "--shadow-sm": "none",
    "--shadow-md": "none", "--shadow-lg": "none",
    "--card-border-color": "var(--border-default)",
  }},
  elevated: { label: "Elevated", vars: {
    "--shadow-card": "0 2px 8px rgba(var(--shadow-rgb),.05), 0 1px 2px rgba(var(--shadow-rgb),.04)",
    "--shadow-xs": "0 1px 2px rgba(var(--shadow-rgb),.05)",
    "--shadow-sm": "0 2px 6px rgba(var(--shadow-rgb),.06)",
    "--shadow-md": "0 6px 16px rgba(var(--shadow-rgb),.09)",
    "--shadow-lg": "0 12px 32px rgba(var(--shadow-rgb),.13)",
    "--card-border-color": "transparent",
  }},
  lifted: { label: "Lifted", vars: {
    "--shadow-card": "0 10px 26px rgba(var(--shadow-rgb),.11), 0 2px 6px rgba(var(--shadow-rgb),.06)",
    "--shadow-xs": "0 2px 6px rgba(var(--shadow-rgb),.08)",
    "--shadow-sm": "0 6px 14px rgba(var(--shadow-rgb),.10)",
    "--shadow-md": "0 16px 36px rgba(var(--shadow-rgb),.15)",
    "--shadow-lg": "0 26px 60px rgba(var(--shadow-rgb),.21)",
    "--card-border-color": "transparent",
  }},
};

function themeCSS(mood, shape, depth) {
  const vars = Object.assign({},
    (MOODS[mood] || MOODS.midnight).vars,
    (SHAPES[shape] || SHAPES.soft).vars,
    (DEPTHS[depth] || DEPTHS.elevated).vars);
  return ":root{" + Object.keys(vars).map(k => k + ":" + vars[k]).join(";") + "}";
}

// Which bottom-nav tab a given view belongs to (keeps the indicator honest)
const VIEW_TAB = {
  home: "home", txn: "txn", "txn-detail": "txn", budget: "budget", "edit-budget": "budget",
  bills: "bills", "bill-detail": "bills", splits: "split", friend: "split", group: "split",
  settings: "more",
};

function App() {
  const [tweaks, setTweaks] = uS(TWEAKS_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = uS(false);

  const [view, setView] = uS(() => {
    const saved = localStorage.getItem("dhan-view");
    if (saved) return saved;
    return TWEAKS_DEFAULTS.skipIntro ? "home" : "splash";
  });
  const [tab, setTab] = uS(() => localStorage.getItem("dhan-tab") || "home");
  const [friend, setFriend] = uS(null);
  const [txnCat, setTxnCat] = uS(null);
  const [catScope, setCatScope] = uS({ cat: "groceries", month: "Apr 2026", spent: 3840, cap: 4000 });
  const [prefs, setPrefs] = uS({language: "English", langId: "en", currency: "₹ INR",
                                 currencyId: "INR", appearance: "System", appLock: "Face ID",
                                 notifCount: 3, notifs: null });
  const backToSettings = () => setView("settings");
  const budgetNameOf = (id) => id === "personal" ? "Personal"
    : (projectBudgets.find(b => b.id === id)?.name || null);
  const budgetOf = (t) => (t && txnBudget[t.id]) || "personal";
  const budgetTag = (t) => {
    const id = budgetOf(t);
    return id === "personal" ? null : budgetNameOf(id);
  };
  const suggestBudgetFor = (t) => {
    if (!t || txnBudget[t.id]) return null;
    const id = budgetRules[String(t.m || "").toLowerCase()] || budgetRules["cat:" + t.c];
    return id && id !== "personal" && budgetNameOf(id) ? id : null;
  };
  const assignBudget = (t, id, learn = true) => {
    setTxnBudget(m => ({ ...m, [t.id]: id }));
    if (learn && id !== "personal") {
      setBudgetRules(r => ({ ...r, [String(t.m || "").toLowerCase()]: id, ["cat:" + t.c]: id }));
    }
  };
  // A restored view whose payload didn't survive the reload falls back to its list.
  uE(() => {
    if (view === "friend" && !friend) setView("splits");
    if (view === "group" && !activeGroup) setView("splits");
    if (view === "search" && !["home", "txn", "budget", "bills"].includes(searchFrom)) setSearchFrom("home");
    if (view === "bill-detail" && !activeBill) setView("bills");
    if (view === "txn-detail" && !activeTxn) setView("txn");
  }, [view]);
  const [activeTxn, setActiveTxn] = uS(null);
  const [activeBill, setActiveBill] = uS(null);
  const [sheet, setSheet] = uS(null);
  const [sheetData, setSheetData] = uS({});
  const [toast, setToast] = uS(null);
  const [moreFrom, setMoreFrom] = uS("home");
  const [txnFrom, setTxnFrom] = uS("txn");     // where the open txn detail was entered from
  const [searchFrom, setSearchFrom] = uS("home"); // screen the search was opened from
  const [deletedTxns, setDeletedTxns] = uS([]); // ids removed from split history
  const [settledTxns, setSettledTxns] = uS([]); // split lines marked settled by the lender
  const [groups, setGroups] = uS(() => DEFAULT_GROUPS);
  const [activeGroup, setActiveGroup] = uS(null);
  const [paywallNote, setPaywallNote] = uS(null);
  const [groupExtras, setGroupExtras] = uS({}); // groupId -> expenses added in-session
  // Which budget each transaction belongs to, plus the patterns the user has
  // taught us (merchant / sub-category -> project budget). Rules only SUGGEST.
  const [txnBudget, setTxnBudget] = uS({ 5: "marriage" });
  const [budgetRules, setBudgetRules] = uS({ "myntra": "marriage", "cat:shopping": "marriage" });
  const [projectBudgets, setProjectBudgets] = uS([
    { id: "marriage", name: "Marriage", icon: "confetti", subtitle: "Dec 2026 · project budget",
      lines: [
        { name: "Venue & catering", spent: 180000, cap: 400000 },
        { name: "Outfits & jewellery", spent: 96000, cap: 250000 },
        { name: "Photography", spent: 40000, cap: 120000 },
        { name: "Travel & stay", spent: 0, cap: 90000 },
      ] },
  ]);
  const [billsState, setBillsState] = uS(UPCOMING_BILLS);

  uE(() => { localStorage.setItem("dhan-view", view); }, [view]);
  uE(() => { localStorage.setItem("dhan-tab", tab); }, [tab]);
  uE(() => {
    // txn detail keeps the tab of the list it was opened from (txns or splits)
    const t = view === "search" ? VIEW_TAB[searchFrom]
            : view === "txn-detail" ? (["friend", "group"].includes(txnFrom) ? "split"
                                       : txnFrom === "search" ? VIEW_TAB[searchFrom] : "txn")
                                    : VIEW_TAB[view];
    setTab(t !== undefined ? t : "");
  }, [view, txnFrom, searchFrom]);

  // Any screen change dismisses an open sheet, so side-panel jumps
  // never strand a sheet over an unrelated screen.
  uE(() => { setSheet(null); setSheetData({}); }, [view]);

  uE(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const setTweak = (k, v) => {
    setTweaks(prev => ({ ...prev, [k]: v }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v }}, "*");
  };

  const segmented = (key, table) => (
    <div className="seg" style={{ gridTemplateColumns: `repeat(${Object.keys(table).length}, 1fr)` }}>
      {Object.keys(table).map(id => (
        <button key={id} className={tweaks[key] === id ? "on" : ""}
                onClick={() => setTweak(key, id)}>{table[id].label}</button>
      ))}
    </div>
  );

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2600);
  };

  const nav = (to, payload) => {
    if (to === "txn-detail" && payload) {
      setActiveTxn(payload);
      setTxnFrom(["friend", "group"].includes(view) ? view : "txn");
    }
    if (to === "bill-detail" && payload) setActiveBill(payload);
    if (to === "friend" && payload) setFriend(payload);
    if (to === "cat-txns" && payload) setCatScope(payload);
    if (["home", "txn", "budget", "bills"].includes(to)) {
      setTab(to); setView(to);
    } else if (to === "split" || to === "splits") {
      setTab("split"); setView("splits");
    } else if (to === "search") {
      setSearchFrom(["home", "txn", "budget", "bills"].includes(view) ? view : "home");
      setView("search");
    } else if (to === "more") {
      setMoreFrom(view); setTab("more"); setView("settings");
    } else {
      setView(to);
    }
  };

  const onTab = (t) => {
    setTab(t);
    if (t === "more") { setMoreFrom(view); setView("settings"); }
    else if (t === "split") setView("splits");
    else setView(t);
  };

  const onOpenSheet = (id, data = {}) => { setSheet(id); setSheetData(data); };
  const closeSheet = () => { setSheet(null); setSheetData({}); };

  const handleTogglePaid = (id) => {
    setBillsState(bs => bs.map(b => b.id === id ? { ...b, status: "paid" } : b));
    showToast("Marked as paid 💸");
  };

  const handleOpenFriend = (f) => { setFriend(f); setView("friend"); };
  const handleOpenTxn = (t, from = "txn") => { setActiveTxn(t); setTxnFrom(from); setView("txn-detail"); };
  const handleOpenBill = (b) => { setActiveBill(b); setView("bill-detail"); };

  const advance = () => {
    const idx = FLOW.indexOf(view);
    if (idx >= 0 && idx < FLOW.length - 1) setView(FLOW[idx + 1]);
    else setView("home");
  };

  let screen;
  switch (view) {
    case "splash":
      // Returning users land on Login; new users on Onboarding.
      screen = <SplashScreen onDone={() => setView(hasAccount() ? "login" : "onboarding")} />;
      break;
    case "onboarding":
      screen = <OnboardingScreen onDone={() => setView("signup")} />;
      break;
    case "signup":
      screen = <SignUpScreen onDone={(d) => d === "back" ? setView("onboarding") : setView("permissions")} />;
      break;
    case "permissions":
      screen = <PermissionsScreen onDone={(d) => d === "back" ? setView("signup") : setView("linkbank")} />;
      break;
    case "linkbank":
      screen = <LinkBankScreen onDone={(d) => d === "back" ? setView("permissions") : setView("income")} />;
      break;
    case "income":
      screen = <IncomeSetupScreen onDone={(d) => d === "back" ? setView("linkbank") : setView("framework")} />;
      break;
    case "framework":
      screen = <FrameworkScreen onDone={(d) => {
        if (d === "back") return setView("income");
        localStorage.setItem("dhan-onboarded", "1");
        setView("home");
      }} />;
      break;
    case "login":
      screen = <LoginScreen onDone={() => setView("home")}
                            onForgot={() => setView("forgot-pin")}
                            userName={tweaks.userName} />;
      break;
    case "forgot-pin":
      screen = <ForgotPinScreen onBack={() => setView("login")}
                                onDone={() => { showToast("PIN reset"); setView("login"); }} />;
      break;
    case "txn":
      screen = <TransactionsScreen tab={tab} setTab={onTab} onOpenSheet={onOpenSheet}
                                   nav={nav} onOpenTxn={handleOpenTxn} budgetTag={budgetTag}
                                   initialCat={txnCat} onCatConsumed={() => setTxnCat(null)} />;
      break;
    case "txn-detail":
      screen = <TxnDetailScreen txn={activeTxn} onBack={() => setView(txnFrom)}
                                onSplit={(t) => onOpenSheet("split-txn", { txn: t })}
                                budgetId={budgetOf(activeTxn)}
                                budgetName={budgetNameOf(budgetOf(activeTxn))}
                                budgets={[{ id: "personal", name: "Personal", icon: "user" },
                                          ...projectBudgets.map(b => ({ id: b.id, name: b.name, icon: b.icon }))]}
                                suggestedBudgetId={suggestBudgetFor(activeTxn)}
                                suggestedBudgetName={budgetNameOf(suggestBudgetFor(activeTxn))}
                                onAssignBudget={(t, id) => {
                                  assignBudget(t, id);
                                  showToast(id === "personal" ? "Moved to Personal"
                                                              : `Moved to ${budgetNameOf(id)}`);
                                }}
                                isSettled={!!activeTxn && settledTxns.includes(activeTxn.id)}
                                onMarkSettled={(t) => {
                                  setSettledTxns(s => [...new Set([...s, t.id])]);
                                  showToast("Marked as settled"); setView(txnFrom);
                                }}
                                onDelete={(t) => {
                                  if (t?.id) setDeletedTxns(ids => [...ids, t.id]);
                                  showToast("Transaction deleted"); setView(txnFrom);
                                }} />;
      break;
    case "budget":
      screen = <BudgetScreen tab={tab} setTab={onTab} nav={nav}
                             isPlus={tweaks.isPlus} onUpgrade={() => setView("paywall")}
                             projects={projectBudgets}
                             onNewBudget={() => onOpenSheet("new-budget")}
                             onEditBudget={(b) => onOpenSheet("edit-budget-card", { budget: b })}
                             onDeleteBudget={(b) => {
                               setProjectBudgets(bs => bs.filter(x => x.id !== b.id));
                               showToast(`"${b.name}" deleted`);
                             }}
                             onEdit={() => setView("edit-budget")} />;
      break;
    case "uncat":
      screen = <UncategorisedScreen onBack={() => setView(tab === "budget" ? "budget" : "home")}
                                    onFiled={(name) => showToast(`Filed under ${name}`)} />;
      break;
    case "edit-budget":
      screen = <EditBudgetScreen onBack={() => setView("budget")} />;
      break;
    case "bills":
      screen = <BillsScreen tab={tab} setTab={onTab} onOpenSheet={onOpenSheet} nav={nav}
                            billsState={billsState} onTogglePaid={handleTogglePaid}
                            onOpenBill={handleOpenBill} />;
      break;
    case "bill-detail":
      screen = <BillDetailScreen bill={activeBill} onBack={() => setView("bills")}
                                 onTogglePaid={(id) => { handleTogglePaid(id); setView("bills"); }} />;
      break;
    case "debt":
    case "splits":
      screen = <SplitsScreen tab="split" setTab={onTab} nav={nav}
                             isPlus={tweaks.isPlus} onOpenSheet={onOpenSheet}
                             groups={groups}
                             onOpenGroup={(g) => { setActiveGroup(g); setView("group"); }}
                             onNewGroup={() => {
                               // Free tier keeps one active group; more needs Plus.
                               if (!tweaks.isPlus && groups.length >= 1) {
                                 setPaywallNote("Track unlimited groups with Dhan Plus.");
                                 setView("paywall");
                               } else onOpenSheet("new-group");
                             }}
                             onOpenFriend={handleOpenFriend} />;
      break;
    case "group":
      screen = <GroupDetailScreen group={activeGroup} onBack={() => setView("splits")}
                                  onOpenSheet={onOpenSheet} onToast={showToast}
                                  deleted={deletedTxns}
                                  added={groupExtras[activeGroup?.id] || []}
                                  onOpenTxn={(t) => handleOpenTxn(t, "group")}
                                  onUpdateGroup={(g) => {
                                    setGroups(gs => gs.map(x => x.id === g.id ? g : x));
                                    setActiveGroup(g);
                                  }}
                                  onLeaveGroup={(g, mode) => {
                                    setGroups(gs => gs.filter(x => x.id !== g.id));
                                    setActiveGroup(null); setView("splits");
                                    showToast(mode === "delete" ? "Group deleted" : "You left the group");
                                  }} />;
      break;
    case "friend":
      screen = <FriendDetailScreen friend={friend} onBack={() => setView("splits")}
                                    deleted={deletedTxns} settled={settledTxns}
                                    onOpenTxn={(t) => handleOpenTxn(t, "friend")}
                                    onToast={showToast}
                                    onSettleTxns={(ids) => setSettledTxns(s => [...new Set([...s, ...ids])])}
                                    onDeleteTxns={(ids) => setDeletedTxns(s => [...new Set([...s, ...ids])])}
                                    onSettle={(f) => onOpenSheet("settle-up", { friend: f })} />;
      break;
    case "insights":
      screen = <InsightsScreen onBack={() => setView("home")} isPlus={tweaks.isPlus}
                               tab={tab} setTab={onTab} nav={nav} onFilterCat={setTxnCat} />;
      break;
    case "goals":
      screen = <GoalsScreen onBack={() => setView("home")} tab={tab} setTab={onTab}
                            onToast={showToast} />;
      break;
    case "profile":
      screen = <ProfileEditScreen onBack={() => setView("settings")} userName={tweaks.userName} onToast={showToast} />;
      break;
    case "linked":
      screen = <LinkedAccountsScreen onBack={() => setView("settings")} />;
      break;
    case "help":
      screen = <HelpScreen onBack={() => setView("settings")} />;
      break;
    case "paywall":
      screen = <PlusPaywallScreen onBack={() => { setPaywallNote(null); setView(paywallNote ? "splits" : "settings"); }}
                                  note={paywallNote}
                                  onUpgrade={() => { setTweak("isPlus", true); showToast("Welcome to Dhan Plus ✨"); setView("settings"); }} />;
      break;
    case "empty":
      screen = <EmptyStateScreen onBack={() => setView("home")} />;
      break;
    case "cat-txns":
      screen = <CategoryTxnsScreen catId={catScope.cat} name={catScope.name} month={catScope.month}
                                   budgetTag={budgetTag}
                                   spent={catScope.spent} cap={catScope.cap}
                                   onBack={() => setView("budget")}
                                   onOpenTxn={handleOpenTxn} onOpenSheet={onOpenSheet} />;
      break;
    case "language":
      screen = <LanguageScreen onBack={backToSettings} value={prefs.langId}
                               onChange={(id) => setPrefs(p => ({ ...p, langId: id,
                                 language: { en: "English", hi: "हिंदी", mr: "मराठी", ta: "तमिल्" }[id] }))} />;
      break;
    case "currency":
      screen = <CurrencyScreen onBack={backToSettings} value={prefs.currencyId}
                               isPlus={tweaks.isPlus} onUpgrade={() => setView("paywall")}
                               onChange={(id) => setPrefs(p => ({ ...p, currencyId: id,
                                 currency: ({ INR: "₹", USD: "$", AED: "د.إ", GBP: "£" }[id] || "") + " " + id }))} />;
      break;
    case "appearance":
      screen = <AppearanceScreen onBack={backToSettings} value={prefs.appearance}
                                 onChange={(v) => setPrefs(p => ({ ...p, appearance: v }))} />;
      break;
    case "notif-settings":
      screen = <NotifSettingsScreen onBack={backToSettings} state={prefs.notifs}
                                    onChange={(rows) => setPrefs(p => ({ ...p, notifs: rows,
                                      notifCount: rows.filter(r => r.on).length }))} />;
      break;
    case "converter":
      screen = <CurrencyConverterScreen onBack={backToSettings} />;
      break;
    case "search":
      screen = <SearchScreen onBack={() => setView(searchFrom)} nav={nav}
                             txns={SAMPLE_TXNS} bills={billsState} people={FRIENDS}
                             budgets={[{ id: "personal", name: "Personal", icon: "user",
                                         subtitle: "Monthly budget" }, ...projectBudgets]}
                             onOpenTxn={(t) => handleOpenTxn(t, "search")}
                             onOpenFriend={handleOpenFriend}
                             onOpenBill={handleOpenBill} />;
      break;
    case "sms-sources":
      screen = <SmsSourcesScreen onBack={backToSettings} onToast={showToast} />;
      break;
    case "export":
      screen = <ExportDataScreen onBack={backToSettings} onToast={showToast} />;
      break;
    case "privacy-settings":
      screen = <PrivacySettingsScreen onBack={backToSettings} onToast={showToast} />;
      break;
    case "app-lock":
      screen = <AppLockScreen onBack={backToSettings} value={prefs.appLock}
                              onChange={(v) => setPrefs(p => ({ ...p, appLock: v }))} />;
      break;
    case "about":
      screen = <LegalScreen kind="about" onBack={backToSettings} />;
      break;
    case "terms":
      screen = <LegalScreen kind="terms" onBack={backToSettings} />;
      break;
    case "privacy-policy":
      screen = <LegalScreen kind="privacy" onBack={backToSettings} />;
      break;
    case "settings":
      screen = <SettingsScreen tab="more" setTab={onTab} nav={nav} prefs={prefs}
                               onClose={() => nav(moreFrom === "settings" ? "home" : moreFrom)}
                               isPlus={tweaks.isPlus}
                               onSignOut={() => onOpenSheet("signout")}
                               setPlus={(v) => { setTweak("isPlus", v); showToast(v ? "Welcome to Dhan Plus ✨" : "Downgraded to Free"); }}
                               userName={tweaks.userName} />;
      break;
    case "notifications":
      screen = <NotificationsScreen onBack={() => setView("home")} nav={nav}
                                    onMarkAll={() => showToast("All marked read")} />;
      break;
    case "home":
    default:
      screen = <HomeScreen tab={tab} setTab={onTab} nav={nav} budgetTag={budgetTag}
                           onOpenSheet={onOpenSheet} userName={tweaks.userName}
                           greeting={tweaks.greeting} />;
  }

  const screens = [
    { id: "splash",         label: "01 Splash" },
    { id: "onboarding",     label: "02 Onboard" },
    { id: "signup",         label: "03 Sign up" },
    { id: "permissions",    label: "13 Perms" },
    { id: "linkbank",       label: "14 Link bank" },
    { id: "income",         label: "15 Income" },
    { id: "framework",      label: "04 Framework" },
    { id: "login",          label: "12 Login" },
    { id: "home",           label: "05 Home" },
    { id: "txn",            label: "06 Txns" },
    { id: "txn-detail",     label: "16 Txn detail" },
    { id: "budget",         label: "07 Budget" },
    { id: "edit-budget",    label: "17 Edit budg." },
    { id: "bills",          label: "08 Bills" },
    { id: "bill-detail",    label: "18 Bill detail" },
    { id: "insights",       label: "19 Insights" },
    { id: "goals",          label: "20 Goals" },
    { id: "splits",         label: "09 Splits" },
    { id: "settings",       label: "10 Settings" },
    { id: "profile",        label: "21 Profile" },
    { id: "group",          label: "09c Group" },
    { id: "linked",         label: "22 Linked" },
    { id: "help",           label: "23 Help" },
    { id: "paywall",        label: "24 Plus" },
    { id: "notifications",  label: "11 Notifs" },
    { id: "empty",          label: "25 Empty" },
    { id: "uncat",          label: "27 Uncateg." },
    { id: "cat-txns",       label: "39 Cat txns" },
    { id: "language",       label: "28 Language" },
    { id: "currency",       label: "29 Currency" },
    { id: "appearance",     label: "30 Appearance" },
    { id: "notif-settings", label: "31 Notif set." },
    { id: "search",         label: "41 Search" },
    { id: "converter",      label: "40 Converter" },
    { id: "sms-sources",    label: "32 SMS src" },
    { id: "export",         label: "33 Export" },
    { id: "privacy-settings", label: "34 Privacy" },
    { id: "app-lock",       label: "35 App lock" },
    { id: "about",          label: "36 About" },
    { id: "terms",          label: "37 Terms" },
    { id: "privacy-policy", label: "38 Policy" },
    { id: "forgot-pin",     label: "26 Forgot PIN" },
  ];

  return (
    <div className="stage-wrap">
      <style>{themeCSS(tweaks.mood, tweaks.shape, tweaks.depth)}</style>
      <div key={view} className="screen-in" style={{ position: "relative" }}>
        {screen}
        {toast && (
          <div style={{
            position: "absolute", top: 92, left: 16, right: 16,
            background: "#F7EFD8", color: "#141C41",
            border: "1px solid rgba(201,168,76,.35)",
            padding: "15px 14px", borderRadius: 12,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 13, fontWeight: 500,
            boxShadow: "0 12px 28px rgba(20,28,65,.16)",
            animation: "toastDrop .28s var(--ease-out) both",
            zIndex: 30,
          }}>
            <i className={"ph-fill ph-" + toastIcon(toast)} style={{ fontSize: 18, flexShrink: 0 }}></i>
            <span style={{ flex: 1, lineHeight: 1.35 }}>{toast}</span>
          </div>
        )}
        <AddTxnSheet open={sheet === "add-txn"} onClose={closeSheet}
          initial={sheetData}
          onSave={(d) => { closeSheet(); showToast(d.kind === "income" ? "Income added" : "Expense added"); }} />
        <AddBillSheet open={sheet === "add-bill"} onClose={closeSheet}
          onSave={() => { closeSheet(); showToast("Bill added"); }} />
        <SplitSheet open={sheet === "split-new" || sheet === "add-split" || sheet === "split-txn"}
                    onClose={closeSheet} txn={sheetData.txn}
                    isPlus={tweaks.isPlus}
                    onUpgrade={() => { closeSheet(); setView("paywall"); }}
                    onSave={(d) => { closeSheet(); showToast(`Split with ${d.sel.length} ${d.sel.length === 1 ? "person" : "people"}`); }} />
        <TxnFilterSheet open={sheet === "txn-filter"} onClose={closeSheet}
                        initial={sheetData}
                        onApply={(f) => { closeSheet(); showToast("Filters applied"); }} />
        <AddGroupExpenseSheet open={sheet === "group-expense"} onClose={closeSheet}
                              group={sheetData.group || activeGroup}
                              onSave={(x) => {
                                const gid = (sheetData.group || activeGroup)?.id;
                                setGroupExtras(m => ({ ...m, [gid]: [x, ...(m[gid] || [])] }));
                                closeSheet(); showToast("Expense added");
                              }} />
        <EditBudgetSheet open={sheet === "edit-budget-card"} onClose={closeSheet}
                         budget={sheetData.budget}
                         onSave={(b) => {
                           if (b.id === "personal") {
                             // Personal's structure lives in its framework setting.
                             if (b.framework) localStorage.setItem("dhan-framework", b.framework);
                           } else {
                             setProjectBudgets(bs => bs.map(x => x.id === b.id ? b : x));
                           }
                           closeSheet(); showToast("Budget updated");
                         }} />
        <CreateBudgetSheet open={sheet === "new-budget"} onClose={closeSheet}
                           onCreate={(b) => { setProjectBudgets(bs => [...bs, b]); closeSheet();
                                              showToast("Budget created"); }} />
        <CreateGroupSheet open={sheet === "new-group"} onClose={closeSheet}
                          onCreate={(g) => {
                            setGroups(gs => [...gs, g]); closeSheet();
                            setActiveGroup(g); setView("group"); showToast("Group created");
                          }} />
        <SignOutSheet open={sheet === "signout"} onClose={closeSheet}
                      onConfirm={() => { closeSheet(); localStorage.removeItem("dhan-onboarded"); setView("splash"); }} />
        <SettleUpSheet open={sheet === "settle-up"} onClose={closeSheet}
                       friend={sheetData.friend}
                       onConfirm={() => { closeSheet(); showToast("Settled up via UPI"); }} />
      </div>

      {/* Side jump panel */}
      <div className="side">
        <h4>Flow · jump to screen</h4>
        <div className="jump-grid" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {screens.map(s => (
            <button key={s.id} onClick={() => setView(s.id)}
                    className={view === s.id ? "active" : ""}>{s.label}</button>
          ))}
        </div>
        <div style={{ height: 10, borderTop: "1px solid var(--border-subtle)", margin: "10px 0 8px" }}/>
        <button onClick={() => { localStorage.removeItem("dhan-view"); localStorage.removeItem("dhan-tab"); setView("splash"); setTab("home"); }}
                style={{ width: "100%", border: "1px solid var(--border-subtle)",
                         background: "var(--bg-surface)", borderRadius: 8, padding: "6px 8px",
                         fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--fg-2)" }}>
          ↺ Restart flow
        </button>
      </div>

      <div className={`tweaks-panel ${tweaksOpen ? "open" : ""}`}>
        <div className="hd">
          <span>Tweaks</span>
          <button onClick={() => setTweaksOpen(false)}>×</button>
        </div>
        <div className="body">
          <div className="sect">Feel</div>

          <div className="ctl">
            <div className="cap">
              <span className="name">Mood</span>
              <span className="val">{(MOODS[tweaks.mood] || MOODS.midnight).label}</span>
            </div>
            <div className="swatches">
              {Object.keys(MOODS).map(id => {
                const m = MOODS[id];
                return (
                  <button key={id} title={m.label}
                          className={"swatch" + (tweaks.mood === id ? " on" : "")}
                          onClick={() => setTweak("mood", id)}>
                    <span className="a" style={{ background: m.swatch[0] }}/>
                    <span className="b" style={{ background: m.swatch[1] }}/>
                    <span className="c" style={{ background: m.swatch[2] }}/>
                    {tweaks.mood === id && (
                      <span className="tick"><i className="ph-bold ph-check"/></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ctl">
            <div className="cap">
              <span className="name">Shape</span>
              <span className="val">
                {tweaks.shape === "crisp" ? "Sharp, institutional"
                  : tweaks.shape === "round" ? "Pills, playful" : "Balanced"}
              </span>
            </div>
            {segmented("shape", SHAPES)}
          </div>

          <div className="ctl">
            <div className="cap">
              <span className="name">Depth</span>
              <span className="val">
                {tweaks.depth === "flat" ? "Borders, no shadow"
                  : tweaks.depth === "lifted" ? "Cards float" : "Soft shadow"}
              </span>
            </div>
            {segmented("depth", DEPTHS)}
          </div>

          <div className="divider"/>

          <div className="sect">Prototype state</div>
          <div className="row">
            <label>User name</label>
            <input type="text" value={tweaks.userName}
                   onChange={(e) => setTweak("userName", e.target.value)} />
          </div>
          <div className="row">
            <label>Greeting</label>
            <select value={tweaks.greeting} onChange={(e) => setTweak("greeting", e.target.value)}>
              <option>Morning</option><option>Afternoon</option><option>Evening</option>
            </select>
          </div>
          <div className="row">
            <label>Dhan Plus</label>
            <div className={`tgl ${tweaks.isPlus ? "on" : ""}`}
                 onClick={() => setTweak("isPlus", !tweaks.isPlus)}/>
          </div>
          <div className="row">
            <label>Skip intro on open</label>
            <div className={`tgl ${tweaks.skipIntro ? "on" : ""}`}
                 onClick={() => setTweak("skipIntro", !tweaks.skipIntro)}/>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 4, lineHeight: 1.4 }}>
            Toggle Plus to see the debt tracker unlock. Changes persist across reload.
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
