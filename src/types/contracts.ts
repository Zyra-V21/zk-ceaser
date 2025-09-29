// Contract Types para CEASER Frontend

export interface MixingParams {
  amount: string
  receiver: string
  targetAccounts: number
}

export interface MixingResult {
  transactionHash: string
  success: boolean
  operationId?: string
}

export interface BalanceInfo {
  balance: string
  balanceFormatted: string
  isLoading: boolean
  error?: string | null
}

export interface GasCalculationRequest {
  amount: string
  targetAccounts: number
}

export interface GasCalculationResult {
  totalGasCost: string
  deploymentCost: string
  transferCost: string
  estimatedTime: number
}
