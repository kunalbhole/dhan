import { parseSms, scanAmounts } from '../smsParser';

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
