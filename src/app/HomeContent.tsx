"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ClientBlinkRenderer } from "./components/ClientBlinkRenderer";
import { WagmiWrapper } from "./components/WagmiWrapper";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [isUnfurled, setIsUnfurled] = useState(false);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setUrl(urlParam);
      setIsUnfurled(true);
    }
  }, [searchParams]);

  const handleUnfurl = () => {
    setIsUnfurled(true);
  };

  return (
    <div className="Home my-10 min-h-screen flex flex-col items-center justify-center bg-gray-100 transition-all duration-300 ease-in-out">
      <h1 className="text-4xl font-bold mb-8">Blink Unfurler</h1>
      <div
        className={`flex flex-col items-center transition-all duration-300 ease-in-out ${
          isUnfurled ? "-translate-y-20" : ""
        }`}
      >
        <div className="flex items-center mb-4">
          <input
            type="text"
            onChange={(e) => setUrl(e.target.value)}
            value={url}
            placeholder="https://buy-me-a-cofee-action.vercel.app/api/tip"
            className="text-black border-2 border-gray-300 rounded-l-lg p-2 w-80 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleUnfurl}
            className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 transition-colors duration-200"
          >
            Unfurl
          </button>
        </div>
        {isUnfurled && (
          <WagmiWrapper>
            <ClientBlinkRenderer url={url} />
          </WagmiWrapper>
        )}
      </div>
    </div>
  );
}
