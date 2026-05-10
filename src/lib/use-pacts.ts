import { useEffect, useState } from "react";
import { pactStore, type Pact } from "./pact-store";

export function usePacts(ownerAccountId?: string) {
  const [pacts, setPacts] = useState<Pact[]>(() =>
    ownerAccountId ? pactStore.list(ownerAccountId) : []
  );

  useEffect(() => {
    const sync = () => setPacts(ownerAccountId ? pactStore.list(ownerAccountId) : []);
    window.addEventListener("pact:changed", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("account:changed", sync);
    return () => {
      window.removeEventListener("pact:changed", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("account:changed", sync);
    };
  }, [ownerAccountId]);

  return pacts;
}
