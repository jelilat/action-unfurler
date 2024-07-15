"use client";
import { useEffect, useState } from "react";
import { useConnect, useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { Action, ActionAdapter, Blink } from "@dialectlabs/blinks";
import { BlinkRendererProps } from "./BlinkRenderer";

const Ethereum = ({ actionUrl, websiteUrl, callbacks }: BlinkRendererProps) => {
  const [action, setAction] = useState<Action | null>(null);
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

  useEffect(() => {
    const fetchAction = async () => {
      const action = await Action.fetch(actionUrl, ethereumAdapter);
      setAction(action);
    };
    fetchAction();
  }, [actionUrl]);

  return (
    <>
      {action && (
        <Blink
          action={action}
          websiteUrl={websiteUrl}
          websiteText={new URL(websiteUrl).hostname}
          callbacks={callbacks}
        />
      )}
    </>
  );
};

export default Ethereum;
