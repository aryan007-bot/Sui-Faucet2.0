"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"

interface ErrorMessageProps {
  message: string
  onDismiss: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <AlertCircle className="mr-3 h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Request Failed</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-800 dark:text-red-400 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
