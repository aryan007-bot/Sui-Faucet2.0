"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Copy, X } from "lucide-react"
import { useState } from "react"
import type { Transaction } from "@/types"

interface TransactionStatusProps {
  transaction: Transaction
  onDismiss: () => void
}

export function TransactionStatus({ transaction, onDismiss }: TransactionStatusProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const explorerUrl = `https://explorer.sui.io/txblock/${transaction.transactionHash}?network=testnet`

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center text-green-800 dark:text-green-200">
            <CheckCircle className="mr-2 h-4 w-4" />
            Transaction Successful
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-green-700 dark:text-green-300">Amount Sent</span>
              <Badge variant="outline" className="text-green-700 dark:text-green-300">
                {(transaction.amount / 1000000000).toFixed(2)} SUI
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-green-700 dark:text-green-300">Recipient</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.recipientAddress)}
                className="h-6 px-2 text-xs text-green-600 hover:text-green-800 dark:text-green-400"
              >
                {copied ? "Copied!" : "Copy"}
                <Copy className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs font-mono text-green-600 dark:text-green-400 break-all">
              {transaction.recipientAddress}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-green-700 dark:text-green-300">Transaction Hash</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.transactionHash)}
                className="h-6 px-2 text-xs text-green-600 hover:text-green-800 dark:text-green-400"
              >
                {copied ? "Copied!" : "Copy"}
                <Copy className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs font-mono text-green-600 dark:text-green-400 break-all">
              {transaction.transactionHash}
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(explorerUrl, "_blank")}
              className="w-full text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/30"
            >
              View on Sui Explorer
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>

          <div className="text-xs text-green-600 dark:text-green-400 text-center">
            Estimated confirmation time: {transaction.estimatedConfirmationTime}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
