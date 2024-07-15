"use client";
import React, { useEffect, useState } from "react";
import {
  ActionsRegistry,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  type ActionCallbacksConfig,
} from "@dialectlabs/blinks";
import { useActionAdapter } from "@dialectlabs/blinks/react";
import { checkSecurity, type SecurityLevel } from "@/shared/security";
import { proxify } from "@/utils/proxify";
import { ActionsURLMapper, type ActionsJsonConfig } from "@/utils/url-mapper";
import { isInterstitial } from "@/utils/interstitial-url";
import "@dialectlabs/blinks/index.css";
import Ethereum from "./Ethereum";
import Solana from "./Solana";

export interface BlinkRendererProps {
  actionUrl: string;
  websiteUrl: string;
  callbacks?: Partial<ActionCallbacksConfig>;
}

const securityLevel = "all";

export function BlinkRenderer({ url }: { url: string }) {
  const [isEthereum, setIsEthereum] = useState<boolean>(false);
  const [actionUrl, setActionUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAction = async () => {
      // TODO: CHECK SECURITY
      try {
        await ActionsRegistry.getInstance().init();

        const actionUrl = new URL(url);

        const interstitialData = isInterstitial(actionUrl);

        let actionApiUrl: string | null;
        if (interstitialData.isInterstitial) {
          const interstitialState = getExtendedInterstitialState(
            actionUrl.toString()
          );

          if (!checkSecurity(interstitialState, securityLevel)) {
            console.log("Security check failed for interstitial");
            return;
          }
          actionApiUrl = interstitialData.decodedActionUrl;
        } else if (url.includes("/api/")) {
          actionApiUrl = url;
        } else {
          const websiteState = getExtendedWebsiteState(actionUrl.toString());
          if (!checkSecurity(websiteState, securityLevel)) {
            console.log("Security check failed for website");
            return;
          }

          const actionsJsonUrl = actionUrl.origin + "/actions.json";
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

          if (!actionApiUrl || !state || !checkSecurity(state, securityLevel)) {
            console.log("Security check failed for action");
            return;
          }
          setIsEthereum(actionJson.isEthereum);
          setActionUrl(actionApiUrl);
        }
      } catch (error) {
        console.error("Error in fetchAction:", error);
      }
    };

    fetchAction();
  }, [url]);

  if (!url) return null;

  return (
    <div className="w-full h-screen flex">
      <div className="w-1/4"></div>
      {actionUrl && (
        <div className="w-1/2 m-4 max-h-screen">
          {isEthereum ? (
            <Ethereum actionUrl={actionUrl} websiteUrl={url} />
          ) : (
            <Solana actionUrl={actionUrl} websiteUrl={url} />
          )}
        </div>
      )}
    </div>
  );
}
