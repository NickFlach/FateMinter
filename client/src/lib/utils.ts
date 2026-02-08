import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const CHAIN_CONFIG = {
  NEO_X: {
    id: 47763,
    name: "Neo X Mainnet",
    rpc: "https://mainnet-1.rpc.banelabs.org",
    symbol: "GAS",
    explorer: "https://xexplorer.neo.org/"
  },
  ETHEREUM: {
    id: 1,
    name: "Ethereum Mainnet",
    rpc: "https://cloudflare-eth.com", // Fallback
    symbol: "ETH",
    explorer: "https://etherscan.io/"
  }
};
