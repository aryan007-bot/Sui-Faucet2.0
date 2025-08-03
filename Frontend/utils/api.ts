const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

console.log("✅ API Base URL:", BASE_URL)

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

interface FaucetRequestData {
  transactionHash: string
  recipientAddress: string
  amount: number
  estimatedConfirmationTime: string
}

interface FaucetStatusData {
  faucetAddress: string
  network: string
  balance: {
    sui: number
    isLowBalance: boolean
  }
  health: {
    status: string
    networkLatency: number
  }
}

interface FaucetHealthData {
  status: string
  faucetBalance: number
  networkLatency: number
  timestamp: string
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data: ApiResponse<T> = await response.json()
      return data
    } catch (error: any) {
      console.error("API request failed:", error.message)
      return {
        success: false,
        message: error.message || "Unknown error",
        error: error.message,
      } as ApiResponse<T>
    }
  }

  // 🟢 Request tokens to recipient address
  async requestTokens(address: string): Promise<ApiResponse<FaucetRequestData>> {
    return this.request<FaucetRequestData>("/api/faucet/request", {
      method: "POST",
      body: JSON.stringify({ address }),
    })
  }

  // 🟡 Get current faucet status
  async getFaucetStatus(): Promise<ApiResponse<FaucetStatusData>> {
    return this.request<FaucetStatusData>("/api/faucet/status")
  }

  // 🔵 Get faucet health check
  async getFaucetHealth(): Promise<ApiResponse<FaucetHealthData>> {
    return this.request<FaucetHealthData>("/api/faucet/health")
  }
}

export const api = new ApiClient()
export default api
export type { ApiResponse, FaucetRequestData, FaucetStatusData, FaucetHealthData }
import { useCallback, useState } from "react"