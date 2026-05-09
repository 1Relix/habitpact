import { useEffect, useState } from "react";
import { pactStore, type Pact } from "./pact-store";

export function usePacts() {
  const [pacts, setPacts] = useState<Pact[]>([]);
  useEffect(() => {
    setPacts(pactStore.list());
    const sync = () => setPacts(pactStore.list());
    window.addEventListener("pact:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pact:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return pacts;
}
