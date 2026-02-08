export const CONTRACT_CONFIG = {
  // Mock addresses - User/Operator should replace these
  PITCHFORK_N3: "N3PitchforkContractAddressPlaceholder",
  PITCHFORK_NEOX: "0x1234567890123456789012345678901234567890", // EVM Address
  PITCHFORK_ETH: "0x1234567890123456789012345678901234567890", // EVM Address
  FATE_NEOX: "0xFateTokenContractAddressOnNeoX",
  
  // Treasury for 1 NEO payment
  TREASURY_NEOX: "0xTreasuryAddressOnNeoX",
  TREASURY_N3: "N3TreasuryAddressPlaceholder"
};

const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export function validateEvmAddress(address: string, label: string): void {
  if (!EVM_ADDRESS_RE.test(address)) {
    throw new Error(`Invalid EVM address for ${label}: "${address}". Replace placeholder in config/contracts.ts.`);
  }
}

export const EXPLORER_URLS = {
  N3: "https://dora.coz.io/contract/neo3/mainnet/",
  NEOX: "https://xexplorer.neo.org/address/",
  ETH: "https://etherscan.io/address/"
};
