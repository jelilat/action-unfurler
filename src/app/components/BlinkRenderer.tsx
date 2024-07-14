"use client";
import React, { useEffect, useState } from "react";
import {
  Action,
  ActionContainer,
  ActionsRegistry,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  type ActionAdapter,
  type ActionCallbacksConfig,
} from "@dialectlabs/blinks";
import { useActionAdapter } from "@dialectlabs/blinks/react";
import { checkSecurity, type SecurityLevel } from "./shared/security";
import { proxify } from "./utils/proxify";
import { ActionsURLMapper, type ActionsJsonConfig } from "./utils/url-mapper";
import { isInterstitial } from "./utils/interstitial-url";
import "@dialectlabs/blinks/index.css";

interface BlinkRendererProps {
  url: string;
  config: ActionAdapter;
  callbacks?: Partial<ActionCallbacksConfig>;
  securityLevel?: SecurityLevel;
}

export function BlinkRenderer({
  url,
  config,
  callbacks = {},
  securityLevel = "only-trusted",
}: BlinkRendererProps) {
  const [action, setAction] = useState<Action | null>(null);
  const { adapter } = useActionAdapter(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL!
  );

  useEffect(() => {
    console.log(url);
    const fetchAction = async () => {
      // TODO: CHECK SECURITY
      try {
        await ActionsRegistry.getInstance().init();

        const actionUrl = new URL(url);

        const interstitialData = isInterstitial(actionUrl);

        let actionApiUrl: string | null;
        if (interstitialData.isInterstitial) {
          console.log("Processing interstitial URL");
          const interstitialState = getExtendedInterstitialState(
            actionUrl.toString()
          );

          if (!checkSecurity(interstitialState, securityLevel)) {
            console.log("Security check failed for interstitial");
            // return;
          }
          actionApiUrl = interstitialData.decodedActionUrl;
          console.log("Decoded action URL:", actionApiUrl);
        } else if (url.includes("/api/")) {
          actionApiUrl = url;
        } else {
          console.log("Processing non-interstitial URL");
          const websiteState = getExtendedWebsiteState(actionUrl.toString());
          console.log("Website state:", websiteState);
          if (!checkSecurity(websiteState, securityLevel)) {
            console.log("Security check failed for website");
            // return;
          }
          const actionsJsonUrl = actionUrl.origin + "/actions.json";
          console.log("Fetching actions.json from:", actionsJsonUrl);
          const actionsJson = await fetch(proxify(actionsJsonUrl)).then(
            (res) => res.json() as Promise<ActionsJsonConfig>
          );

          const actionsUrlMapper = new ActionsURLMapper(actionsJson);
          actionApiUrl = actionsUrlMapper.mapUrl(actionUrl);
        }
        if (actionApiUrl) {
          const actionJson = await fetch(proxify(actionApiUrl)).then((res) =>
            res.json()
          );

          const state = actionApiUrl
            ? getExtendedActionState(actionApiUrl)
            : null;

          // if (!actionApiUrl || !state || !checkSecurity(state, securityLevel)) {
          //   console.log("Security check failed or invalid action API URL");
          //   return;
          // }
          console.log(actionJson.isEthereum);
          const fetchedAction = await Action.fetch(
            actionApiUrl!,
            actionJson.isEthereum ? config : adapter
          );
          console.log(fetchedAction);
          setAction(fetchedAction);
        }
      } catch (error) {
        console.error("Error in fetchAction:", error);
      }
    };

    fetchAction();
  }, [url, config, securityLevel]);

  if (!action) return null;

  return (
    <>
      {url && (
        <ActionContainer
          action={action}
          websiteUrl={url}
          websiteText={new URL(url).hostname}
          callbacks={callbacks}
          stylePreset="default"
          //   securityLevel={{
          //     actions: securityLevel,
          //     websites: securityLevel,
          //     interstitials: securityLevel,
          //   }}
        />
      )}
    </>
  );
}
