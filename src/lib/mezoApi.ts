const API_BASE = "https://api.explorer.test.mezo.org/api/v2";

export interface TokenTransfer {
  from: { hash: string; name: string | null; is_contract: boolean };
  to: { hash: string; name: string | null; is_contract: boolean };
  token: { name: string; symbol: string; decimals: string };
  total: { value: string; decimals: string };
  type: string;
}

export interface TxData {
  hash: string;
  status: string;
  result: string;
  method: string | null;
  from: { hash: string; name: string | null; is_contract: boolean };
  to: { hash: string; name: string | null; is_contract: boolean; implementations?: { name: string }[] };
  value: string;
  fee: { value: string };
  gas_used: string;
  gas_price: string;
  gas_limit: string;
  block_number: number;
  timestamp: string;
  confirmations: number;
  token_transfers: TokenTransfer[];
  decoded_input: { method_call: string; parameters: { name: string; type: string; value: string }[] } | null;
  tx_types: string[];
  nonce: number;
}

export async function fetchTransaction(hash: string): Promise<TxData> {
  const res = await fetch(`${API_BASE}/transactions/${hash}`);
  if (!res.ok) throw new Error(`Transaction not found: ${hash}`);
  return res.json();
}

export function formatTokenAmount(value: string, decimals: string): string {
  const d = parseInt(decimals);
  const num = parseFloat(value) / Math.pow(10, d);
  return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function computeRiskScore(tx: TxData): number {
  let score = 20; // base low risk
  if (tx.token_transfers.length > 2) score += 15;
  if (tx.to.is_contract) score += 10;
  if (tx.token_transfers.some(t => t.type === "token_minting")) score += 20;
  if (parseInt(tx.gas_used) > 200000) score += 10;
  if (tx.tx_types.includes("token_transfer")) score += 5;
  return Math.min(score, 100);
}

export function computeSubRisks(tx: TxData) {
  const hasContractInteraction = tx.to.is_contract;
  const hasMinting = tx.token_transfers.some(t => t.type === "token_minting");
  const largeTransfer = tx.token_transfers.some(t => {
    const amt = parseFloat(t.total.value) / Math.pow(10, parseInt(t.total.decimals));
    return amt > 50;
  });

  return {
    incoming: hasMinting ? 65 : largeTransfer ? 45 : 25,
    outgoing: hasContractInteraction ? 55 : 15,
    indirect: tx.token_transfers.length > 2 ? 60 : 30,
  };
}
