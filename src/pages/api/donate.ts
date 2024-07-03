import { createPublicClient, http, parseEther, Address } from "viem";
import { sepolia } from "viem/chains";
import { NextApiRequest, NextApiResponse } from "next";

const DONATION_DESTINATION_WALLET =
  "0xBC807A82cc5C6dCE270E2262328059f3B7eEaaaf";
const DONATION_AMOUNT_ETH_OPTIONS = [0.01, 0.05, 0.1];
const DEFAULT_DONATION_AMOUNT_ETH = "0.01";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.ETHEREUM_RPC_URL),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { account, amount = DEFAULT_DONATION_AMOUNT_ETH } = req.body;

    try {
      const parsedAmount = parseEther(amount);
      const transaction = await prepareDonateTransaction(
        account,
        DONATION_DESTINATION_WALLET,
        parsedAmount
      );
      res.status(200).json({ transaction: JSON.stringify(transaction) });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  } else if (req.method === "GET") {
    const { icon, title, description } = getDonateInfo();
    const amountParameterName = "amount";
    const response = {
      icon,
      label: `${DEFAULT_DONATION_AMOUNT_ETH} ETH`,
      title,
      description,
      links: {
        actions: [
          ...DONATION_AMOUNT_ETH_OPTIONS.map((amount) => ({
            label: `${amount} ETH`,
            href: `/api/donate?amount=${amount}`,
          })),
          {
            href: `/api/donate?amount={${amountParameterName}}`,
            label: "Donate",
            parameters: [
              {
                name: amountParameterName,
                label: "Enter a custom ETH amount",
              },
            ],
          },
        ],
      },
    };

    res.status(200).json(response);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

async function prepareDonateTransaction(
  sender: Address,
  recipient: Address,
  amount: bigint
) {
  const nonce = await client.getTransactionCount({ address: sender });
  const gasPrice = await client.getGasPrice();

  return {
    to: recipient,
    value: amount,
    nonce: nonce,
    gasLimit: "0x5208", // Standard gas limit for ETH transfers (21000 in hex)
    gasPrice: gasPrice,
  };
}

function getDonateInfo() {
  const icon =
    "https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb146c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/";
  const title = "Donate to Alice";
  const description =
    "Ethereum Enthusiast | Support my research with an ETH donation.";
  return { icon, title, description };
}
