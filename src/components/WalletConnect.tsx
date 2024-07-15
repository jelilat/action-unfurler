"use client";

import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { baseSepolia } from "thirdweb/chains";

const clientId = "1681f00450f64d21e65f11907652d7b1";
export const client = createThirdwebClient({ clientId });
const wallets = [
  inAppWallet({
    smartAccount: {
      chain: baseSepolia,
      sponsorGas: true,
    },
  }),
  createWallet("walletConnect"),
];
const chain = baseSepolia;

export default function WalletConnect() {
  return (
    <div>
      <ConnectButton
        client={client}
        wallets={wallets}
        chain={chain}
        connectButton={{
          label: "Sign in",
          className: "",
        }}
      />
    </div>
  );
}
