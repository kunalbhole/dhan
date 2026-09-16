// ─── Dhan · bank-SMS transaction parser ─────────────────────
// parseSms(text, opts) -> array of transaction objects (0, 1 or 2 entries).
// A spend SMS yields one entry. A forex-markup SMS yields its own separate
// "Forex Fee" entry — never merged into the spend it belongs to (V1: no linking).

const INR_TOKENS = ["INR", "RS", "RS.", "₹", "INR."];

// ISO-4217 codes we accept as "foreign". A closed list keeps stray uppercase
// words (UPI, OTP, VPA, NEFT) from being read as currencies.
const FOREIGN_CODES = [
  "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "CHF", "JPY", "CNY",
  "HKD", "THB", "MYR", "NZD", "SAR", "QAR", "KWD", "OMR", "BHD", "LKR",
  "NPR", "IDR", "PHP", "KRW", "SEK", "NOK", "DKK", "ZAR", "TRY", "RUB",
  "BRL", "MXN", "ILS", "PLN", "CZK", "VND", "TWD", "MVR", "BDT",
];

const CURRENCY_SYMBOLS = { "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY" };

// currency-before-amount  (USD 45.00 / Rs. 3,842 / ₹1,850 / $45)
const CUR_FIRST = /(₹|\$|€|£|¥|\b(?:INR|Inr|inr|RS|Rs|rs)\b\.?|\b[A-Z]{3}\b)\s*\.?\s*([\d][\d,]*(?:\.\d{1,2})?)/g;
// amount-before-currency  (45.00 USD / 3,842 INR)
const CUR_LAST = /([\d][\d,]*(?:\.\d{1,2})?)\s*(\b[A-Z]{3}\b|\b(?:Rs|rs)\b|₹)/g;

const FEE_RE = /(forex|foreign\s+currency|cross[-\s]?currency|currency\s+conversion)[^.;]{0,24}?(markup|conversion|txn)?\s*(fee|charge|charges|mark[-\s]?up)|markup\s+fee|mark[-\s]?up\s+charge/i;
const CREDIT_RE = /\b(credited|received|refund(?:ed)?|deposited|reversed)\b/i;
const DEBIT_RE = /\b(debited|spent|paid|withdrawn|charged|purchase)\b/i;

const MERCHANT_RE = /\b(?:at|to|towards|for)\s+([A-Z0-9][A-Za-z0-9&'._\- ]{1,38}?)(?=\s+(?:on|via|using|dated|ref|txn|from|with|a\/c)\b|[.,;!]|$)/;

const CATEGORY_HINTS = [
  ["food", /swiggy|zomato|domino|starbucks|blue tokai|cafe|coffee|restaurant|eatery|kfc|mcdonald/i],
  ["groceries", /bigbasket|blinkit|zepto|dmart|grocer|supermarket|instamart/i],
  ["transport", /uber|ola|rapido|irctc|metro|fuel|petrol|indian oil|hpcl|airline|indigo|vistara/i],
  ["shopping", /myntra|amazon|flipkart|ajio|nykaa|zara|uniqlo|apple store|store/i],
  ["bills", /airtel|jio|vodafone|bses|tata power|broadband|fiber|electricity|gas|recharge/i],
  ["ent", /netflix|spotify|prime video|bookmyshow|hotstar|youtube|pvr|inox/i],
  ["health", /apollo|pharmeasy|1mg|hospital|clinic|pharmacy|diagnostic/i],
  ["income", /salary|payroll/i],
];

const toNumber = (s) => parseFloat(String(s).replace(/,/g, ""));
const isInr = (tok) => INR_TOKENS.includes(String(tok).toUpperCase().replace(/\.$/, "").replace(/\.$/, "")) || tok === "₹";
const normCode = (tok) => CURRENCY_SYMBOLS[tok] || String(tok).toUpperCase().replace(/\./g, "");

// Every currency+amount pair in the message, in text order.
function scanAmounts(text) {
  const found = [];
  const push = (code, amount, index) => {
    if (!Number.isFinite(amount)) return;
    if (found.some((f) => f.index === index)) return;
    found.push({ code, amount, index, inr: isInr(code) || code === "INR" });
  };
  let m;
  CUR_FIRST.lastIndex = 0;
  while ((m = CUR_FIRST.exec(text))) {
    const code = normCode(m[1]);
    if (code === "INR" || code === "RS" || FOREIGN_CODES.includes(code)) {
      push(code === "RS" ? "INR" : code, toNumber(m[2]), m.index);
    }
    // a lone ISO code we don't know (UPI, VPA, OTP…) is skipped by design
  }
  CUR_LAST.lastIndex = 0;
  while ((m = CUR_LAST.exec(text))) {
    const code = normCode(m[2]);
    if (code === "INR" || FOREIGN_CODES.includes(code)) {
      const overlaps = found.some((f) => m.index >= f.index && m.index <= f.index + 24 && f.amount === toNumber(m[1]));
      if (!overlaps) push(code, toNumber(m[1]), m.index);
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

function guessMerchant(text) {
  const m = text.match(MERCHANT_RE);
  if (!m) return null;
  const name = m[1].trim().replace(/\s{2,}/g, " ").replace(/[.\s]+$/, "");
  if (!name || /^\d+$/.test(name) || name.length < 2) return null;
  return name;
}

function guessCategory(text, merchant, isCredit) {
  const hay = `${merchant || ""} ${text}`;
  for (const [cat, re] of CATEGORY_HINTS) if (re.test(hay)) return cat;
  return isCredit ? "income" : "other";
}

let seq = 0;
const nextId = (prefix) => `${prefix}-${Date.now().toString(36)}-${(++seq).toString(36)}`;

function baseTxn() {
  return {
    id: null, m: null, s: "", a: 0, c: "other",
    // foreign-currency schema — always present, inert for domestic txns
    isForeignTransaction: false,
    originalCurrency: null,
    originalAmount: null,
    inrAmount: null,
  };
}

function buildFeeTxn(text, amounts) {
  const inr = amounts.find((a) => a.inr);
  if (!inr) return null;
  const fx = amounts.find((a) => !a.inr);
  return {
    ...baseTxn(),
    id: nextId("fx-fee"),
    m: "Forex markup fee",
    s: "Forex Fee · auto-detected",
    a: -Math.abs(inr.amount),
    c: "forex-fee",
    categoryLocked: true, // fixed category — not user-editable
    inrAmount: Math.abs(inr.amount),
    isForeignTransaction: !!fx,
    originalCurrency: fx ? fx.code : null,
    originalAmount: fx ? Math.abs(fx.amount) : null,
    raw: text,
  };
}

function buildSpendTxn(text, amounts) {
  const inr = amounts.find((a) => a.inr);
  const fx = amounts.find((a) => !a.inr);
  if (!inr && !fx) return null;

  const isCredit = CREDIT_RE.test(text) && !DEBIT_RE.test(text);
  const merchant = guessMerchant(text);
  // Settled value is always the INR leg when the bank gives one; a foreign-only
  // alert (rare, pre-settlement) falls back to the foreign amount.
  const settled = inr ? inr.amount : fx.amount;

  const txn = {
    ...baseTxn(),
    id: nextId("txn"),
    m: merchant,
    s: isCredit ? "Income · auto-detected" : "Auto-detected from SMS",
    a: isCredit ? Math.abs(settled) : -Math.abs(settled),
    c: guessCategory(text, merchant, isCredit),
    raw: text,
  };
  if (inr) txn.inrAmount = Math.abs(inr.amount);
  if (fx) {
    txn.isForeignTransaction = true;
    txn.originalCurrency = fx.code;
    txn.originalAmount = Math.abs(fx.amount);
    txn.s = `${fx.code} ${fx.amount} · international`;
  }
  return txn;
}

function parseSms(text) {
  if (!text || typeof text !== "string") return [];
  const amounts = scanAmounts(text);
  if (!amounts.length) return [];

  // A markup-fee SMS becomes its own entry. It is NOT linked to the spend
  // that caused it (V1) and never folded into another amount.
  if (FEE_RE.test(text)) {
    const fee = buildFeeTxn(text, amounts);
    return fee ? [fee] : [];
  }
  const txn = buildSpendTxn(text, amounts);
  return txn ? [txn] : [];
}

const parseSmsBatch = (list = []) => list.flatMap((t) => parseSms(t));

Object.assign(window, {
  parseSms, parseSmsBatch, scanAmounts,
  FOREIGN_CODES, FOREX_FEE_CATEGORY: { id: "forex-fee", label: "Forex Fee", locked: true },
});
