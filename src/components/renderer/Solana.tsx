"use client";

import { useEffect, useState } from "react";
import { Action, Blink, type ActionCallbacksConfig } from "@dialectlabs/blinks";
import { useActionAdapter } from "@dialectlabs/blinks/react";
import { BlinkRendererProps } from "./BlinkRenderer";

const Solana = ({ actionUrl, websiteUrl, callbacks }: BlinkRendererProps) => {
  const [action, setAction] = useState<Action | null>(null);
  const { adapter } = useActionAdapter(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);

  useEffect(() => {
    const fetchAction = async () => {
      const action = await Action.fetch(actionUrl, adapter);
      setAction(action);
    };
    fetchAction();
  }, [adapter, actionUrl]);

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

export default Solana;
