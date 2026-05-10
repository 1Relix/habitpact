export type Account = {
  id: string;
  name: string;
  handle: string;
  balance: number;
  createdAt: string;
};

const ACCOUNTS_KEY = "accounts:v1";
const CURRENT_KEY = "account:current";

function readAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  window.dispatchEvent(new CustomEvent("account:changed"));
}

function readCurrentId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CURRENT_KEY);
}

function writeCurrentId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id === null) {
    window.localStorage.removeItem(CURRENT_KEY);
  } else {
    window.localStorage.setItem(CURRENT_KEY, id);
  }
  window.dispatchEvent(new CustomEvent("account:changed"));
}

function createDefault(): Account {
  return {
    id: crypto.randomUUID(),
    name: "You",
    handle: "@you",
    balance: 200,
    createdAt: new Date().toISOString(),
  };
}

export const accountStore = {
  list() {
    const accounts = readAccounts();
    if (accounts.length === 0) {
      const first = createDefault();
      writeAccounts([first]);
      writeCurrentId(first.id);
      return [first];
    }
    return accounts;
  },
  get(id: string) {
    return this.list().find((account) => account.id === id);
  },
  current() {
    const accounts = this.list();
    const currentId = readCurrentId();
    const match = accounts.find((account) => account.id === currentId);
    if (match) return match;
    const fallback = accounts[0];
    writeCurrentId(fallback?.id ?? null);
    return fallback;
  },
  setCurrent(id: string) {
    writeCurrentId(id);
  },
  create(input: Omit<Account, "id" | "createdAt">) {
    const accounts = this.list();
    const account: Account = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    writeAccounts([...accounts, account]);
    return account;
  },
  update(id: string, updates: Partial<Omit<Account, "id" | "createdAt">>) {
    const accounts = this.list().map((account) =>
      account.id === id ? { ...account, ...updates } : account
    );
    writeAccounts(accounts);
    return this.get(id);
  },
  deposit(id: string, amount: number) {
    const account = this.get(id);
    if (!account || amount <= 0) return;
    this.update(id, { balance: account.balance + amount });
  },
  withdraw(id: string, amount: number) {
    const account = this.get(id);
    if (!account || amount <= 0) return;
    this.update(id, { balance: Math.max(0, account.balance - amount) });
  },
  transfer(fromId: string, toId: string | null, amount: number) {
    if (amount <= 0) return;
    const from = this.get(fromId);
    if (!from) return;
    const withdrawAmount = Math.min(amount, from.balance);
    this.withdraw(fromId, withdrawAmount);
    if (toId) {
      const to = this.get(toId);
      if (!to) return;
      this.update(toId, { balance: to.balance + withdrawAmount });
    }
  },
};
