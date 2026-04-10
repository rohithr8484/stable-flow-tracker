import { getConfig, mezoTestnet } from "@mezo-org/passport";

export { mezoTestnet };

export const WALLETCONNECT_PROJECT_ID = "696956c426d467cb2aed00d4b0a543b";

export const MUSD_CONTRACT = "0x94FF830F078eb9c6e77bADe29FB46B1a249A5fd3" as const;
export const MUSD_PAYMENT_AMOUNT = "200000000000000000" as const;
export const MUSD_PAYMENT_DISPLAY = "0.2";
export const BTC_PAYMENT_DISPLAY = "0.0002";
export const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

export const config = getConfig({
  appName: "Mezo Treasury",
  mezoNetwork: "testnet",
  walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
});
