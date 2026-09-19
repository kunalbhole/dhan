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
const REFUND_RE = /\b(refund|refunded|reversed|reversal|cashback)\b/i;
const CREDIT_RE = /\b(credited|received|refund(?:ed)?|deposited|reversed|cashback|credited to)\b/i;
const DEBIT_RE = /\b(debited|spent|paid|withdrawn|charged|purchase|sent to)\b/i;
const SELF_RE = /\b(self transfer|own account|internal transfer|a\/c transfer)\b/i;

// Expanded merchant extraction patterns for Indian UPI, netbanking & card SMS
const MERCHANT_PATTERNS = [
  /\b(?:at|to|towards|for|paid to|info:)\s+([A-Z0-9][A-Za-z0-9&'._\- ]{1,38}?)(?=\s+(?:on|via|using|dated|ref|txn|from|with|a\/c|upi|val|\.)\b|[.,;!]|$)/i,
  /\b(?:vpa|upi\/)\s*([A-Za-z0-9._\- ]{2,30})/i,
];

// Known brand keyword fallback dictionary
const BRAND_KEYWORDS: Array<[string, RegExp]> = [
  ['Zomato', /zomato/i],
  ['Swiggy', /swiggy/i],
  ['Zepto', /zepto/i],
  ['Blinkit', /blinkit/i],
  ['BigBasket', /bigbasket/i],
  ['CRED Club', /cred/i],
  ['LazyPay', /lazypay/i],
  ['Google Cloud', /google\s*cloud/i],
  ['Netflix', /netflix/i],
  ['Spotify', /spotify/i],
  ['Amazon', /amazon/i],
  ['Flipkart', /flipkart/i],
  ['Airtel', /airtel/i],
  ['Jio', /jio/i],
  ['Uber', /uber/i],
  ['Ola', /ola/i],
  ['Cult.fit', /cult\.fit|cultfit/i],
];

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
  // Check brand dictionary first
  for (const [brand, re] of BRAND_KEYWORDS) {
    if (re.test(text)) return brand;
  }

  // Check merchant regex patterns
  for (const pattern of MERCHANT_PATTERNS) {
    const m = text.match(pattern);
    if (m && m[1]) {
      const name = m[1].trim().replace(/\s{2,}/g, ' ').replace(/[.\s]+$/, '').replace(/\d{6,}$/, '');
      if (name && !/^\d+$/.test(name) && name.length >= 2) {
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

let seq = 0;
const nextId = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${(++seq).toString(36)}`;

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
}

function baseTxn(): ParsedTxn {
  return {
    id: null, m: null, s: '', a: 0, c: 'other',
    isForeignTransaction: false,
    originalCurrency: null,
    originalAmount: null,
    inrAmount: null,
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
  };
}

function buildSpendTxn(text: string, amounts: ScannedAmount[]): ParsedTxn | null {
  const inr = amounts.find((a) => a.inr);
  const fx = amounts.find((a) => !a.inr);
  if (!inr && !fx) return null;

  const isRefund = REFUND_RE.test(text);
  const isCredit = (CREDIT_RE.test(text) && !DEBIT_RE.test(text)) || isRefund;
  const isSelf = SELF_RE.test(text);
  const merchant = guessMerchant(text);
  const settled = inr ? inr.amount : fx!.amount;

  let subtitle = 'Auto-detected from SMS';
  if (isSelf) subtitle = 'Self-transfer · Internal';
  else if (isRefund) subtitle = 'Refund · auto-detected';
  else if (isCredit) subtitle = 'Income · auto-detected';

  const txn: ParsedTxn = {
    ...baseTxn(),
    id: nextId('txn'),
    m: merchant,
    s: subtitle,
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

function parseSms(text: string): ParsedTxn[] {
  if (!text || typeof text !== 'string') return [];
  const amounts = scanAmounts(text);
  if (!amounts.length) return [];

  if (FEE_RE.test(text)) {
    const fee = buildFeeTxn(text, amounts);
    return fee ? [fee] : [];
  }
  const txn = buildSpendTxn(text, amounts);
  return txn ? [txn] : [];
}

const parseSmsBatch = (list: string[] = []): ParsedTxn[] => list.flatMap((t) => parseSms(t));

const FOREX_FEE_CATEGORY = { id: 'forex-fee', label: 'Forex Fee', locked: true };

export { parseSms, parseSmsBatch, scanAmounts, FOREIGN_CODES, FOREX_FEE_CATEGORY };
