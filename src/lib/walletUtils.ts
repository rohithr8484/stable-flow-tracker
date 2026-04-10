type WalletConnectorLike = {
  id?: string;
  name?: string;
};

export const shortenAddress = (address?: string) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

export const getConnectorLabel = (connector?: WalletConnectorLike | null) => {
  const raw = `${connector?.name ?? ""} ${connector?.id ?? ""}`.toLowerCase();

  if (raw.includes("meta")) return "MetaMask";
  if (raw.includes("coinbase")) return "Coinbase Wallet";
  if (raw.includes("rabby")) return "Rabby";
  if (raw.includes("injected") || connector?.name === "Injected") {
    return "MetaMask / Browser Wallet";
  }

  return connector?.name || "Wallet";
};
