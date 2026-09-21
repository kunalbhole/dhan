import { parseSms, scanAmounts } from '../smsParser';
import { normalizeSenderId, normalizeSmsText, getIgnoreReason } from '../smsParser';

describe('amount parsing — comma grouping', () => {
  // Regression test: an earlier build mis-parsed comma-grouped amounts,
  // e.g. turning ₹15,000 into ₹1,500. Amounts over 3 digits must keep
  // every digit regardless of how the commas group them.
  it('does not truncate a 5-digit amount at the first comma', () => {
    const [amount] = scanAmounts('Rs.15,000 debited from a/c XX1234 for purchase at Amazon');
    expect(amount.amount).toBe(15000);
    expect(amount.amount).not.toBe(1500);
  });

  it('handles Indian lakh-style grouping (2-digit groups after the first)', () => {
    const [amount] = scanAmounts('Rs.1,50,000 credited to a/c XX1234 towards Salary');
    expect(amount.amount).toBe(150000);
  });

  it('still parses plain 3-digit and under-1000 amounts correctly', () => {
    const [amount] = scanAmounts('Rs.420 spent at Swiggy');
    expect(amount.amount).toBe(420);
  });

  it('carries the comma-grouped amount through into the parsed transaction', () => {
    const [txn] = parseSms(
      'Rs.15,000 debited from a/c XX1234 for purchase at Amazon on 12-Apr-26. UPI Ref 123456789012.',
    );
    expect(txn.a).toBe(-15000);
  });
});

describe('parseSms — merchant and category detection', () => {
  it('detects merchant and food category from a Swiggy debit SMS', () => {
    const [txn] = parseSms('Rs.420 debited from a/c XX1234 at Swiggy on UPI Ref 987654321.');
    expect(txn.m).toBe('Swiggy');
    expect(txn.c).toBe('food');
    expect(txn.a).toBe(-420);
  });

  it('marks credits as income and keeps the amount positive', () => {
    const [txn] = parseSms('Rs.82,500 credited to a/c XX1234 towards Salary on 01-Apr-26.');
    expect(txn.a).toBe(82500);
    expect(txn.c).toBe('income');
  });
});

describe('Stage 2 item 2 / extra rule B — ignore non-payment messages', () => {
  const cases: Array<[string, string]> = [
    ['OTP', 'Your DBS debit card transaction at ZEPTO for INR 240.00 requires an OTP for verification. Do not share this OTP.'],
    ['LazyPay OTP', '4521 is LazyPay OTP for transaction of Rs.500 at ZOMATO'],
    ['due reminder', 'Your Axis Bank Credit Card no. XX3148 has an overdue. Pay the min due of INR 1200 at http://axis.co/pay'],
    ['LazyPay statement overdue', 'LazyPay statement of Rs.4500 is overdue'],
    ['LazyPay payable reminder', 'Rs 900 is payable towards your Lazypay account. Pay now to avoid late fees.'],
    ['mandate created', 'Your UPI AutoPay mandate has been successfully created towards NETFLIX for INR 649'],
    ['mandate registered', 'Mandate for SPOTIFY has been registered with UMRN ABCD1234567890'],
    ['collect request', 'RAHUL has requested money of Rs.500 via UPI. Approve on your UPI app.'],
    ['declined transaction', 'Your transaction of Rs.2000 at AMAZON was declined due to insufficient balance.'],
    ['balance-only alert', 'Your available balance as of today is Rs.15,320.50 in a/c XX1234'],
  ];

  it.each(cases)('produces no transaction for a %s message', (_label, text) => {
    expect(parseSms(text)).toEqual([]);
  });

  it('exposes why a message was ignored via getIgnoreReason', () => {
    expect(getIgnoreReason('4521 is LazyPay OTP for transaction of Rs.500 at ZOMATO')).toBe('otp');
    expect(getIgnoreReason('Rs.420 debited from a/c XX1234 at Swiggy on UPI Ref 987654321.')).toBeNull();
  });

  it('still counts a real debit even though the message also mentions available balance', () => {
    const [txn] = parseSms('INR 240.00 debited from a/c XX1234 at ZEPTO on 12-04-26. Available balance is INR 5,000.00');
    expect(txn).toBeDefined();
    expect(txn.a).toBe(-240);
  });
});

describe('Stage 2 item 3 — CRED Club must not match "credited"', () => {
  it('does not tag an ordinary credit message as CRED Club', () => {
    const [txn] = parseSms('Rs.3000.00 credited to your Kotak Bank account XX1234 on 12-04-26. Avl Bal INR 10,000.00');
    expect(txn.m).not.toBe('CRED Club');
  });

  it('still detects a real CRED Club payment', () => {
    const [txn] = parseSms('Rs.500.00 debited from a/c XX1234 paid to CRED Club via UPI Ref 123456789012.');
    expect(txn.m).toBe('CRED Club');
  });
});

describe('Stage 2 item 6 / extra rule E — credit card and pay-later settlements', () => {
  it('types a Kotak payment to a credit card as a Settlement, not an expense', () => {
    const [txn] = parseSms('Sent Rs.500.00 from Kotak Bank A/c X1234 to Axis Bank Credit Car on 12-04-26. UPI Ref 123456789013. Not done by you? Tap http://kotak.com');
    expect(txn.type).toBe('settlement');
    expect(txn.a).toBe(-500);
  });

  it('types a LazyPay statement payment as a Settlement', () => {
    const [txn] = parseSms('Thanks for your payment of Rs.4500 against your LazyPay statement');
    expect(txn.type).toBe('settlement');
  });

  it('types an Axis card payment-received message as a Settlement and keeps the card last 4', () => {
    const [txn] = parseSms('Payment of INR 6000 has been received towards your Axis Bank Credit Card XX3148. Thank you.');
    expect(txn.type).toBe('settlement');
    expect(txn.a).toBe(-6000);
    expect(txn.cardLast4).toBe('3148');
  });

  it('keeps an actual pay-later purchase as an expense, not a settlement', () => {
    const [txn] = parseSms('your payment of Rs. 799 for txn TXN123456789 on ZEPTO was successful. Pay by 05-05-26');
    expect(txn.type).toBe('expense');
    expect(txn.a).toBe(-799);
  });
});

describe('Stage 2 item 5 — self transfers', () => {
  const selfName = 'KUNAL SHANKAR';

  it('types a debit to the profile name as a Transfer', () => {
    const [txn] = parseSms(
      'Sent Rs.3000.00 from Kotak Bank A/c X1234 to KUNAL SHANKAR on 12-04-26. UPI Ref 123456789099. Not done by you? Tap http://kotak.com',
      selfName,
    );
    expect(txn.type).toBe('transfer');
    expect(txn.a).toBe(-3000);
  });

  it('ignores case and extra spacing when matching the profile name', () => {
    const [txn] = parseSms('Sent Rs.750.00 from Kotak Bank A/c X1234 to  kunal   shankar on 12-04-26.', selfName);
    expect(txn.type).toBe('transfer');
  });

  it('does not mark a payment to someone else as a Transfer', () => {
    const [txn] = parseSms('Sent Rs.750.00 from Kotak Bank A/c X1234 to RAHUL SHARMA on 12-04-26.', selfName);
    expect(txn.type).not.toBe('transfer');
  });
});

describe('extra rule C — refunds', () => {
  it('types a UPI reversal credit as a Refund and keeps its ref number', () => {
    const [txn] = parseSms('Rs. 240.00 is credited to your a/c XX1234 for reversal of UPI transaction Ref no 123456789012');
    expect(txn.type).toBe('refund');
    expect(txn.refNo).toBe('123456789012');
    expect(txn.a).toBe(240);
  });
});

describe('extra rule D — late fees', () => {
  it('types a late fee notice as a Fee expense', () => {
    const [txn] = parseSms('A late fee of Rs 100 has been added to your LazyPay account for the overdue statement.');
    expect(txn.type).toBe('fee');
    expect(txn.a).toBe(-100);
  });
});

describe('extra rule F — Kotak UPI payee name vs UPI ID', () => {
  it('records a name payee and tags it as "name"', () => {
    const [txn] = parseSms('Sent Rs.500.00 from Kotak Bank A/c X1234 to RAHUL SHARMA on 12-04-26. UPI Ref 123456789020.');
    expect(txn.payeeKind).toBe('name');
    expect(txn.payeeRaw).toBe('RAHUL SHARMA');
  });

  it('records a UPI ID payee exactly as written and tags it as "upi_id"', () => {
    const [txn] = parseSms('Sent Rs.500.00 from Kotak Bank A/c X1234 to 9876543210@ybl on 12-04-26. UPI Ref 123456789021.');
    expect(txn.payeeKind).toBe('upi_id');
    expect(txn.payeeRaw).toBe('9876543210@ybl');
  });
});

describe('Stage 2 item 7 — foreign spends use the rupee amount', () => {
  it('uses the INR amount, not the foreign-currency amount', () => {
    const [txn] = parseSms('USD US$25.00/INR 2,402.55 was spent on Card 6087 at GOOGLE*CLOUD on 12-04-26. Avl Bal: INR 50,000.00');
    expect(txn.a).toBe(-2402.55);
    expect(txn.isForeignTransaction).toBe(true);
    expect(txn.originalAmount).toBe(25);
    expect(txn.originalCurrency).toBe('USD');
  });
});

describe('extra rule A — bank sender-id prefix/suffix normalisation', () => {
  it('reduces JD-/JX-/AX- prefixed, -S/-T suffixed sender ids to the bank code', () => {
    expect(normalizeSenderId('JD-KOTAKB-S')).toBe('KOTAKB');
    expect(normalizeSenderId('JX-KOTAKB-S')).toBe('KOTAKB');
    expect(normalizeSenderId('AX-KOTAKB-S')).toBe('KOTAKB');
    expect(normalizeSenderId('VM-AXISBK-T')).toBe('AXISBK');
  });

  it('leaves a sender with no recognised prefix/suffix shape unchanged (uppercased)', () => {
    expect(normalizeSenderId('AXISBANK')).toBe('AXISBANK');
    expect(normalizeSenderId(null)).toBe('');
  });
});

describe('normalizeSmsText — same message text normalises identically', () => {
  it('collapses whitespace and case differences', () => {
    expect(normalizeSmsText('Rs.240  debited   at ZEPTO')).toBe(normalizeSmsText('  rs.240 debited at zepto  '));
  });
});
