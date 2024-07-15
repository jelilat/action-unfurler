"use client";

import { http, createConfig } from "wagmi";
import { base, mainnet, optimism } from "wagmi/chains";
import { injected, metaMask, safe } from "wagmi/connectors";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [injected(), metaMask(), safe()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});

export const WagmiWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
