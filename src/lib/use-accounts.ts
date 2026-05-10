import { useEffect, useState } from "react";
import { accountStore, type Account } from "./account-store";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(accountStore.list());

  useEffect(() => {
    const sync = () => setAccounts(accountStore.list());
    window.addEventListener("account:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("account:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return accounts;
}
