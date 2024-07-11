"use client";

import React from "react";
import { BlinkRenderer } from "./BlinkRenderer";
import { ActionAdapter } from "@dialectlabs/blinks";
import { useConnect, useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";

export function ClientBlinkRenderer({ url }: { url: string }) {
  const { connectors, connect } = useConnect();
  const { address } = useAccount();
  const { data: hash, sendTransaction } = useSendTransaction();

  const ethereumAdapter: ActionAdapter = {
    async connect() {
      await connect({ connector: connectors[0] });
      return address || null;
    },
    async signTransaction(tx: string) {
      if (!address) {
        return { error: "Wallet not connected" };
      }
      try {
        const transaction = JSON.parse(tx);
        await sendTransaction({
          to: transaction.to,
          value: parseEther(transaction.value),
        });
        return { signature: hash! };
      } catch (error) {
        console.error("Error signing transaction:", error);
        return { error: "Failed to sign transaction" };
      }
    },
    async confirmTransaction(sig: string) {
      console.log("confirmTransaction");
    },
  };

  return (
    <div className="w-full h-screen flex">
      <div className="w-1/4"></div>
      <div className="w-1/2 m-4 max-h-screen">
        <BlinkRenderer
          url={url}
          config={ethereumAdapter}
          securityLevel="only-trusted"
        />
      </div>
      <div className="w-1/4"></div>
    </div>
  );
}
