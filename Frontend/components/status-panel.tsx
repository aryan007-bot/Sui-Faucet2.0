"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Activity, Clock, Zap } from "lucide-react"
import type { FaucetStatus } from "@/types"

interface StatusPanelProps {
  faucetStatus: FaucetStatus | null
  isLoading: boolean
}

export function StatusPanel({ faucetStatus, isLoading }: StatusPanelProps) {
  if (isLoading && !faucetStatus) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Faucet Balance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            Faucet Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {faucetStatus?.balance?.sui?.toFixed(2) || "0.00"} SUI
          </div>
          <div className="flex items-center mt-2">
            <Badge variant={faucetStatus?.balance?.isLowBalance ? "destructive" : "default"} className="text-xs">
              {faucetStatus?.balance?.isLowBalance ? "Low Balance" : "Healthy"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Network Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Network</span>
              <Badge variant="outline" className="text-xs">
                {faucetStatus?.network || "testnet"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {faucetStatus?.health?.status || "healthy"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Latency</span>
              <span className="text-sm font-medium">{faucetStatus?.health?.networkLatency || 0}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Limit</span>
              <span className="text-sm font-medium">5 per 15 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Per Address</span>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Amount per Request</span>
              <span className="text-sm font-medium">1 SUI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Confirmation Time</span>
              <span className="text-sm font-medium">5-10 sec</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
