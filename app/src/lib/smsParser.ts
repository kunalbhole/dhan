const INR_TOKENS = ['INR', 'RS', 'RS.', '₹', 'INR.'];

const FOREIGN_CODES = [
  'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'CHF', 'JPY', 'CNY',
  'HKD', 'THB', 'MYR', 'NZD', 'SAR', 'QAR', 'KWD', 'OMR', 'BHD', 'LKR',
  'NPR', 'IDR', 'PHP', 'KRW', 'SEK', 'NOK', 'DKK', 'ZAR', 'TRY', 'RUB',
  'BRL', 'MXN', 'ILS', 'PLN', 'CZK', 'VND', 'TWD', 'MVR', 'BDT',
];

const CURRENCY_SYMBOLS: Record<string, string> = { $: 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY' };

const CUR_FIRST = /(₹|\$|€|£|¥|\b(?:INR|Inr|inr|RS|Rs|rs)\b\.?|\b[A-Z]{3}\b)\s*\.?\s*([\d][\d,]*(?:\.\d{1,2})?)/g;
const CUR_LAST = /([\d][\d,]*(?:\.\d{1,2})?)\s*(\b[A-Z]{3}\b|\b(?:Rs|rs)\b|₹)/g;

const FEE_RE =
  /(forex|foreign\s+currency|cross[-\s]?currency|currency\s+conversion)[^.;]{0,24}?(markup|conversion|txn)?\s*(fee|charge|charges|mark[-\s]?up)|markup\s+fee|mark[-\s]?up\s+charge/i;
const LATE_FEE_RE = /\blate\s+fee\b[^.;]{0,30}?\b(added|charged|applicable|levied)\b|\ba\s+late\s+fee\s+of\b/i;
const REFUND_RE = /\b(refund|refunded|reversed|reversal|cashback)\b/i;
const CREDIT_RE = /\b(credited|received|refund(?:ed)?|deposited|reversed|cashback|credited to)\b/i;
const DEBIT_RE = /\b(debited|spent|paid|withdrawn|charged|purchase|sent to)\b/i;
const SELF_RE = /\b(self transfer|own account|internal transfer|a\/c transfer)\b/i;

// --- Messages that are not payments at all (Stage 2 item 2 + extra rule B) ---
// Checked before any amount extraction — if one of these matches, the
// message never becomes a transaction, no matter what numbers appear in it.
const IGNORE_PATTERNS: Array<[string, RegExp]> = [
  ['otp', /\botp\b|one[-\s]?time\s+password/i],
  ['mandate', /\b(?:upi\s*)?mandate\b[^.;]{0,40}\b(created|registered|revoked|cancelled|canceled|approved|activated)\b/i],
  ['mandate', /\b(created|registered|revoked|cancelled|canceled)\b[^.;]{0,40}\bmandate\b/i],
  ['collect-request', /\b(requested money|has requested|collect request|payment request from)\b/i],
  ['declined', /\b(transaction|txn|payment)\b[^.;]{0,20}\b(declined|failed|unsuccessful|not successful)\b|\bdeclined due to\b/i],
  ['lazypay-payable', /\bis payable towards your lazypay account\b/i],
  ['due-reminder', /\b(has an overdue|is overdue|overdue\.?\s*pay|min(?:imum)? due|pay the min due|payment (?:is )?due|due (?:on|by)|will be due)\b/i],
  ['statement', /\b(e-?statement|statement (?:is|has been)?\s*generated|view (?:your )?(?:latest )?statement)\b/i],
  ['promo', /\b(exclusive offer|limited period offer|flat \d+% off|win .*cashback|shop now|use code|download the app|t&c apply|terms and conditions apply)\b/i],
];

// A message that only reports a balance, with no debit/credit action word
// in it, isn't a payment either — but only when there's no actual
// debit/credit wording alongside it (a real debit message often mentions
// "Avl Bal" too, and that one must still go through).
function isBalanceOnlyAlert(text: string): boolean {
  const mentionsBalance = /\b(available balance|avl\.?\s*bal|a\/c balance|account balance)\b/i.test(text);
  if (!mentionsBalance) return false;
  return !DEBIT_RE.test(text) && !CREDIT_RE.test(text) && !REFUND_RE.test(text);
}

export function getIgnoreReason(text: string): string | null {
  for (const [reason, re] of IGNORE_PATTERNS) {
    if (re.test(text)) return reason;
  }
  if (isBalanceOnlyAlert(text)) return 'balance-alert';
  return null;
}

// --- Sender-ID normalisation (extra rule A) ---
// DLT sender IDs look like "JD-KOTAKB-S" / "JX-KOTAKB-S" / "AX-KOTAKB-S":
// a 2-letter telecom-operator prefix, the bank/service code, and a -S/-T
// suffix. Only the middle code identifies who actually sent the message,
// so that's what both the live receiver and the history scan reduce the
// sender to before comparing/deduping anything.
const SENDER_PREFIX_SUFFIX_RE = /^[A-Z]{2}-([A-Z0-9]+)-[ST]$/;

export function normalizeSenderId(sender: string | null | undefined): string {
  if (!sender) return '';
  const trimmed = sender.trim().toUpperCase();
  const m = trimmed.match(SENDER_PREFIX_SUFFIX_RE);
  return m ? m[1] : trimmed;
}

// Same SMS text, read either live or from history, should normalise to the
// same string — used as the other half of the duplicate-detection key.
export function normalizeSmsText(text: string | null | undefined): string {
  return (text ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Expanded merchant extraction patterns for Indian UPI, netbanking & card SMS
const MERCHANT_PATTERNS = [
  /\b(?:at|to|towards|for|paid to|info:)\s+([A-Z0-9][A-Za-z0-9&'._\- ]{1,38}?)(?=\s+(?:on|via|using|dated|ref|txn|from|with|a\/c|upi|val|\.)\b|[.,;!]|$)/i,
  /\b(?:vpa|upi\/)\s*([A-Za-z0-9._\- ]{2,30})/i,
];

// Known brand keyword fallback dictionary. Every pattern here is matched as
// a whole word against the extracted merchant name only (never the raw SMS
// body) — see guessMerchant/classifyCounterparty, and Stage 2 item 3 for why
// ("credited" must not match "CRED").
const BRAND_KEYWORDS: Array<[string, RegExp]> = [
  ['Zomato', /\bzomato\b/i],
  ['Swiggy', /\bswiggy\b/i],
  ['Zepto', /\bzepto\b/i],
  ['Blinkit', /\bblinkit\b/i],
  ['BigBasket', /\bbigbasket\b/i],
  ['CRED Club', /\bcred\b/i],
  ['LazyPay', /\blazypay\b/i],
  ['Google Cloud', /\bgoogle\s*cloud\b/i],
  ['Netflix', /\bnetflix\b/i],
  ['Spotify', /\bspotify\b/i],
  ['Amazon', /\bamazon\b/i],
  ['Flipkart', /\bflipkart\b/i],
  ['Airtel', /\bairtel\b/i],
  ['Jio', /\bjio\b/i],
  ['Uber', /\buber\b/i],
  ['Ola', /\bola\b/i],
  ['Cult.fit', /\bcult\.fit\b|\bcultfit\b/i],
];

// Bank reference/UTR numbers — used to merge the same real payment when
// both a bank and a UPI app text you about it (see db.ts's findMergeCandidate).
// Every major Indian bank/UPI SMS format uses one of these labels.
const REF_NO_RE = /\b(?:UPI\s*Ref(?:erence)?(?:\s*No)?|RRN|UTR|Ref(?:erence)?\.?\s*(?:No\.?|Number|ID)?|Txn\.?\s*ID)\s*[:.-]?\s*(\d{6,22})\b/i;

export function extractRefNo(text: string): string | null {
  const m = text.match(REF_NO_RE);
  return m ? m[1] : null;
}

// The strongest merge signal (Stage 2 item 4 / item 1): a genuine 12-digit
// UPI reference number. Shorter/longer "reference"-labelled numbers (some
// banks print an internal txn id under the same label) aren't trusted for
// merging — only for display/linking.
export function isTwelveDigitUpiRef(refNo: string | null | undefined): boolean {
  return !!refNo && /^\d{12}$/.test(refNo);
}

// Business-style signals — a name matching any of these is a merchant, not
// a person, regardless of how it's capitalized. Checked only against the
// extracted counterparty name itself, not the whole SMS body — unlike
// BRAND_KEYWORDS above (which guessMerchant matches against the full text,
// since it's picking the best merchant label for the whole message), this
// only ever decides "is this specific name a business," so it can safely
// include payment-app/gateway names without risking misattributing an
// unrelated purchase's merchant just because "Paytm" is mentioned in the
// same SMS as the payment rail.
const BUSINESS_WORD_RE =
  /\b(pvt|ltd|llp|llc|inc|enterprises?|stores?|mart|shop|traders?|services?|solutions?|technologies|technology|infotech|designing|design|consultancy|payments?|agenc(?:y|ies)|associates?|hospital|clinic|pharmacy|restaurant|cafe|hotel|academy|institute|college|school|kirana|supermarket|grocery|grocers?|retail|gateway|razorpay|payu|cashfree|billdesk|instamojo|paytm|phonepe|bharatpe|mobikwik|freecharge|india)\b/i;

// Two-to-four space-separated word tokens, letters only (plus apostrophe/
// hyphen for names like "D'Souza" or "Anne-Marie") — the shape of a
// person's name as it appears in UPI SMS ("RAHUL SHARMA", "Priya N Kapoor").
const PERSON_NAME_SHAPE_RE = /^[A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*){1,3}$/;

const HONORIFIC_RE = /^(mr|mrs|ms|miss|mx|dr|shri|smt)\.?$/i;

// Grouping key for "same person across many SMS" — case/spacing/honorific
// insensitive, so "RAHUL SHARMA", "Rahul  Sharma" and "Mr Rahul Sharma" all
// land on the same Split row.
export function normalizePersonKey(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(tok => !HONORIFIC_RE.test(tok))
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z' -]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface CounterpartyClassification {
  counterpartyType: 'person' | 'merchant' | null;
  personKey: string | null;
}

// Best-effort, applied once per SMS at parse time — see personClassifier.ts
// for the second pass (recurring-pattern detection over real history,
// which needs many transactions at once, not just this one message's text).
export function classifyCounterparty(name: string | null, isSelfTransfer: boolean): CounterpartyClassification {
  if (!name || isSelfTransfer) return { counterpartyType: null, personKey: null };
  const trimmed = name.trim();

  for (const [, re] of BRAND_KEYWORDS) {
    if (re.test(trimmed)) return { counterpartyType: 'merchant', personKey: null };
  }
  if (BUSINESS_WORD_RE.test(trimmed)) return { counterpartyType: 'merchant', personKey: null };
  if (/\d/.test(trimmed)) return { counterpartyType: 'merchant', personKey: null };

  if (PERSON_NAME_SHAPE_RE.test(trimmed)) {
    const key = normalizePersonKey(trimmed);
    if (!key) return { counterpartyType: null, personKey: null };
    return { counterpartyType: 'person', personKey: key };
  }

  // Doesn't look like a business (no suffix/digits/brand) and doesn't have
  // a clean name shape either (single word, unusual punctuation, VPA-like
  // string) — per the "if unsure, treat it as a person" rule, still a
  // person, just grouped under whatever text we found.
  const key = normalizePersonKey(trimmed);
  if (!key) return { counterpartyType: null, personKey: null };
  return { counterpartyType: 'person', personKey: key };
}

const CATEGORY_HINTS: Array<[string, RegExp]> = [
  ['food', /swiggy|zomato|domino|starbucks|blue tokai|cafe|coffee|restaurant|eatery|kfc|mcdonald/i],
  ['groceries', /bigbasket|blinkit|zepto|dmart|grocer|supermarket|instamart/i],
  ['transport', /uber|ola|rapido|irctc|metro|fuel|petrol|indian oil|hpcl|airline|indigo|vistara/i],
  ['shopping', /myntra|amazon|flipkart|ajio|nykaa|zara|uniqlo|apple store|store/i],
  ['bills', /airtel|jio|vodafone|bses|tata power|broadband|fiber|electricity|gas|recharge/i],
  ['ent', /netflix|spotify|prime video|bookmyshow|hotstar|youtube|pvr|inox/i],
  ['health', /apollo|pharmeasy|1mg|hospital|clinic|pharmacy|diagnostic/i],
  ['income', /salary|payroll|refund|reversal|cashback/i],
];

const toNumber = (s: string): number => parseFloat(String(s).replace(/,/g, ''));
const isInr = (tok: string): boolean =>
  INR_TOKENS.includes(String(tok).toUpperCase().replace(/\.$/, '').replace(/\.$/, '')) || tok === '₹';
const normCode = (tok: string): string => CURRENCY_SYMBOLS[tok] || String(tok).toUpperCase().replace(/\./g, '');

export interface ScannedAmount {
  code: string;
  amount: number;
  index: number;
  inr: boolean;
}

function scanAmounts(text: string): ScannedAmount[] {
  const found: ScannedAmount[] = [];
  const push = (code: string, amount: number, index: number) => {
    if (!Number.isFinite(amount)) return;
    if (found.some((f) => f.index === index)) return;
    found.push({ code, amount, index, inr: isInr(code) || code === 'INR' });
  };
  let m: RegExpExecArray | null;
  CUR_FIRST.lastIndex = 0;
  while ((m = CUR_FIRST.exec(text))) {
    const code = normCode(m[1]);
    if (code === 'INR' || code === 'RS' || FOREIGN_CODES.includes(code)) {
      push(code === 'RS' ? 'INR' : code, toNumber(m[2]), m.index);
    }
  }
  CUR_LAST.lastIndex = 0;
  while ((m = CUR_LAST.exec(text))) {
    const code = normCode(m[2]);
    if (code === 'INR' || FOREIGN_CODES.includes(code)) {
      const overlaps = found.some(
        (f) => m!.index >= f.index && m!.index <= f.index + 24 && f.amount === toNumber(m![1]),
      );
      if (!overlaps) push(code, toNumber(m[1]), m.index);
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

function guessMerchant(text: string): string | null {
  // Extract the merchant-name clause first ("at/to/towards/for/paid to/
  // vpa/upi ..."), then only ever check the brand dictionary against that
  // narrow candidate — never against the raw SMS body. This is what keeps
  // "credited" from matching the "CRED" brand keyword: brand matching only
  // ever sees a candidate merchant name, never a full sentence.
  for (const pattern of MERCHANT_PATTERNS) {
    const m = text.match(pattern);
    if (m && m[1]) {
      const name = m[1].trim().replace(/\s{2,}/g, ' ').replace(/[.\s]+$/, '').replace(/\d{6,}$/, '');
      if (name && !/^\d+$/.test(name) && name.length >= 2) {
        for (const [brand, re] of BRAND_KEYWORDS) {
          if (re.test(name)) return brand;
        }
        return name;
      }
    }
  }
  return null;
}

function guessCategory(text: string, merchant: string | null, isCredit: boolean): string {
  const hay = `${merchant || ''} ${text}`;
  for (const [cat, re] of CATEGORY_HINTS) if (re.test(hay)) return cat;
  return isCredit ? 'income' : 'other';
}

// --- Settlement detection (Stage 2 item 6 + extra rule E) ---
// A credit-card bill payment or pay-later repayment is not new spending —
// it's money moving to settle a bill you already counted as an expense
// when you actually spent it.
const CREDIT_CARD_PAYEE_RE = /credit\s*car(?:d)?\b/i;
const LAZYPAY_STATEMENT_PAYMENT_RE = /\bagainst your lazypay statement\b/i;
// "Payment of INR X has been received towards your Axis Bank Credit Card XXnnnn"
const CARD_PAYMENT_RECEIVED_RE =
  /payment of\s*(?:inr|rs\.?|₹)?\s*[\d,.]+\s*has been received towards your\s+([a-z0-9 .]*?)credit\s*card(?:\s*no\.?)?\s*(?:xx+|x{2,})?\s*(\d{2,6})?/i;

function detectSettlement(text: string, merchant: string | null): { isSettlement: boolean; cardLast4: string | null } {
  const cardReceived = text.match(CARD_PAYMENT_RECEIVED_RE);
  if (cardReceived) return { isSettlement: true, cardLast4: cardReceived[2] ?? null };
  if (LAZYPAY_STATEMENT_PAYMENT_RE.test(text)) return { isSettlement: true, cardLast4: null };
  if (merchant && CREDIT_CARD_PAYEE_RE.test(merchant)) return { isSettlement: true, cardLast4: null };
  return { isSettlement: false, cardLast4: null };
}

// --- Kotak UPI payee field (extra rule F) ---
// The payee after "to"/"from" can be a person's name or a raw UPI ID
// (9876543210@ybl). Saved exactly as written, tagged with which kind it
// is — no person/merchant decision is made from this field in this task.
function extractPayeeRaw(text: string): { payeeRaw: string | null; payeeKind: 'name' | 'upi_id' | null } {
  const m = text.match(/\b(?:to|from)\s+([A-Za-z0-9._-]+@[A-Za-z0-9.-]+)\b/i);
  if (m) return { payeeRaw: m[1], payeeKind: 'upi_id' };
  const nameMatch = text.match(/\b(?:to|from)\s+([A-Z][A-Za-z0-9&'._\- ]{1,38}?)(?=\s+(?:on|via|using|dated|ref|txn|upi|val)\b|[.,;!]|$)/i);
  if (nameMatch && nameMatch[1] && nameMatch[1].trim().length >= 2) {
    return { payeeRaw: nameMatch[1].trim(), payeeKind: 'name' };
  }
  return { payeeRaw: null, payeeKind: null };
}

let seq = 0;
const nextId = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${(++seq).toString(36)}`;

export type TxnType = 'expense' | 'income' | 'transfer' | 'settlement' | 'refund' | 'fee';

export interface ParsedTxn {
  id: string | null;
  m: string | null;
  s: string;
  a: number;
  c: string;
  isForeignTransaction: boolean;
  originalCurrency: string | null;
  originalAmount: number | null;
  inrAmount: number | null;
  categoryLocked?: boolean;
  raw?: string;
  refNo?: string | null;
  counterpartyType?: 'person' | 'merchant' | null;
  personKey?: string | null;
  type: TxnType;
  payeeRaw?: string | null;
  payeeKind?: 'name' | 'upi_id' | null;
  cardLast4?: string | null;
}

function baseTxn(): ParsedTxn {
  return {
    id: null, m: null, s: '', a: 0, c: 'other',
    isForeignTransaction: false,
    originalCurrency: null,
    originalAmount: null,
    inrAmount: null,
    refNo: null,
    counterpartyType: null,
    personKey: null,
    type: 'expense',
    payeeRaw: null,
    payeeKind: null,
    cardLast4: null,
  };
}

function buildFeeTxn(text: string, amounts: ScannedAmount[]): ParsedTxn | null {
  const inr = amounts.find((a) => a.inr);
  if (!inr) return null;
  const fx = amounts.find((a) => !a.inr);
  return {
    ...baseTxn(),
    id: nextId('fx-fee'),
    m: 'Forex markup fee',
    s: 'Forex Fee · auto-detected',
    a: -Math.abs(inr.amount),
    c: 'forex-fee',
    categoryLocked: true,
    inrAmount: Math.abs(inr.amount),
    isForeignTransaction: !!fx,
    originalCurrency: fx ? fx.code : null,
    originalAmount: fx ? Math.abs(fx.amount) : null,
    raw: text,
    type: 'fee',
  };
}

function buildLateFeeTxn(text: string, amounts: ScannedAmount[]): ParsedTxn | null {
  const inr = amounts.find((a) => a.inr) ?? amounts[0];
  if (!inr) return null;
  return {
    ...baseTxn(),
    id: nextId('late-fee'),
    m: 'Late fee',
    s: 'Late fee · auto-detected',
    a: -Math.abs(inr.amount),
    c: 'other',
    categoryLocked: true,
    inrAmount: inr.inr ? Math.abs(inr.amount) : null,
    raw: text,
    type: 'fee',
  };
}

function buildSpendTxn(text: string, amounts: ScannedAmount[], selfName: string | null): ParsedTxn | null {
  const inr = amounts.find((a) => a.inr);
  const fx = amounts.find((a) => !a.inr);
  if (!inr && !fx) return null;

  const isRefund = REFUND_RE.test(text);
  const isCredit = (CREDIT_RE.test(text) && !DEBIT_RE.test(text)) || isRefund;
  const merchant = guessMerchant(text);

  const { payeeRaw, payeeKind } = extractPayeeRaw(text);
  const payeeIsSelf =
    !!selfName && !!payeeRaw && payeeKind === 'name' && normalizePersonKey(payeeRaw) === normalizePersonKey(selfName);
  const isSelf = SELF_RE.test(text) || payeeIsSelf;

  const { isSettlement, cardLast4 } = isRefund ? { isSettlement: false, cardLast4: null } : detectSettlement(text, merchant);

  let type: TxnType = 'expense';
  let subtitle = 'Auto-detected from SMS';
  let creditOverride: boolean | null = null;

  if (isRefund) {
    type = 'refund';
    subtitle = 'Refund · auto-detected';
    creditOverride = true;
  } else if (isSettlement) {
    type = 'settlement';
    subtitle = 'Card/pay-later bill payment · auto-detected';
    creditOverride = false; // money leaving the account, even if the SMS says "received"
  } else if (isSelf) {
    type = 'transfer';
    subtitle = 'Self-transfer · Internal';
  } else if (isCredit) {
    type = 'income';
    subtitle = 'Income · auto-detected';
  }

  const settled = inr ? inr.amount : fx!.amount;
  const finalIsCredit = creditOverride !== null ? creditOverride : isCredit;

  const { counterpartyType, personKey } = classifyCounterparty(merchant, isSelf);

  const txn: ParsedTxn = {
    ...baseTxn(),
    id: nextId('txn'),
    m: merchant,
    s: subtitle,
    a: finalIsCredit ? Math.abs(settled) : -Math.abs(settled),
    c: guessCategory(text, merchant, finalIsCredit),
    raw: text,
    refNo: extractRefNo(text),
    counterpartyType,
    personKey,
    type,
    payeeRaw,
    payeeKind,
    cardLast4,
  };
  if (inr) txn.inrAmount = Math.abs(inr.amount);
  if (fx) {
    txn.isForeignTransaction = true;
    txn.originalCurrency = fx.code;
    txn.originalAmount = Math.abs(fx.amount);
    if (type === 'expense' || type === 'income') {
      txn.s = `${fx.code} ${fx.amount} · international`;
    }
  }
  return txn;
}

function parseSms(text: string, selfName: string | null = null): ParsedTxn[] {
  if (!text || typeof text !== 'string') return [];
  if (getIgnoreReason(text)) return [];

  const amounts = scanAmounts(text);
  if (!amounts.length) return [];

  if (LATE_FEE_RE.test(text)) {
    const fee = buildLateFeeTxn(text, amounts);
    if (fee) return [fee];
  }
  if (FEE_RE.test(text)) {
    const fee = buildFeeTxn(text, amounts);
    return fee ? [fee] : [];
  }
  const txn = buildSpendTxn(text, amounts, selfName);
  return txn ? [txn] : [];
}

const parseSmsBatch = (list: string[] = [], selfName: string | null = null): ParsedTxn[] =>
  list.flatMap((t) => parseSms(t, selfName));

const FOREX_FEE_CATEGORY = { id: 'forex-fee', label: 'Forex Fee', locked: true };

export { parseSms, parseSmsBatch, scanAmounts, FOREIGN_CODES, FOREX_FEE_CATEGORY };
