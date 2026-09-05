export type LedgerLine = {
  date: string
  desc: string
  /** Signed amount string; credits carry + and render in brighter gold. */
  amount: string
  credit?: boolean
  balance: string
  chip: string
  flagged?: boolean
}

/**
 * Seven verified statement lines; the running balances reconcile exactly
 * (23,965.59 to -9,701.95) and demonstrate the real capability set.
 */
export const LEDGER_LINES: LedgerLine[] = [
  { date: '03 Mar 24', desc: 'WOOLWORTHS 3646 CHATSWOOD', amount: '−214.63', balance: '23,965.59', chip: 'Groceries' },
  { date: '04 Mar 24', desc: 'TRANSFER TO J HARPER - NETBANK', amount: '−3,000.00', balance: '20,965.59', chip: 'Related acct' },
  {
    date: '07 Mar 24',
    desc: 'ATM WITHDRAWAL - CROWS NEST',
    amount: '−9,500.00',
    balance: '11,465.59',
    chip: 'Cash',
    flagged: true,
  },
  {
    date: '11 Mar 24',
    desc: 'SALARY - MERIDIAN CONSULTING',
    amount: '+8,412.90',
    credit: true,
    balance: '19,878.49',
    chip: 'Income',
  },
  { date: '18 Mar 24', desc: 'SPORTSBET DEPOSIT 0645', amount: '−400.00', balance: '19,478.49', chip: 'Gambling' },
  { date: '21 Mar 24', desc: 'BPAY - STRATA PLAN 38254', amount: '−1,180.44', balance: '18,298.05', chip: 'Property' },
  { date: '02 Apr 24', desc: 'INTL TRANSFER AUD→EUR REF 8991', amount: '−28,000.00', balance: '−9,701.95', chip: 'Cross-currency' },
]
