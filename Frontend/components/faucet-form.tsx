"use client"

import type React from "react"
import { useEffect, useState } from "react" // Import useEffect and useState
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useValidation } from "@/hooks/use-validation"
import { Loader2, Droplets } from "lucide-react"

interface FaucetFormProps {
  onSubmit: (address: string) => Promise<void>
  isLoading: boolean
  disabled?: boolean
  initialAddress?: string // <--- Ensure this is here
}

export function FaucetForm({ onSubmit, isLoading, disabled, initialAddress }: FaucetFormProps) {
  // Use a functional update for useState to set initial value from prop,
  // or simply useState(initialAddress || "")
  const [address, setAddress] = useState(initialAddress || "")
  const { isValidSuiAddress, formatAddress } = useValidation()

  // Use useEffect to update the address state if initialAddress prop changes
  // This is important because useState only uses its initial value on the first render.
  useEffect(() => {
    if (initialAddress && initialAddress !== address) {
      setAddress(formatAddress(initialAddress));
    }
    // Also, if initialAddress becomes empty (e.g., wallet disconnects), clear the input
    if (!initialAddress && address !== "") {
        setAddress("");
    }
  }, [initialAddress, address, formatAddress]); // Add address and formatAddress to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidSuiAddress(address) || disabled) return

    await onSubmit(formatAddress(address))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(formatAddress(value))
  }

  const isValid = isValidSuiAddress(address)
  const showValidation = address.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Sui Wallet Address
        </Label>
        <div className="relative">
          <Input
            id="address"
            type="text"
            placeholder="Enter your Sui address (0x...)"
            value={address} // <--- Value is controlled by the `address` state
            onChange={handleAddressChange}
            className={`pr-10 ${
              showValidation
                ? isValid
                  ? "border-green-500 focus:border-green-500"
                  : "border-red-500 focus:border-red-500"
                : ""
            }`}
            disabled={isLoading || disabled}
            autoComplete="off"
            spellCheck={false}
          />
          {showValidation && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid ? (
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              ) : (
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          )}
        </div>
        {showValidation && !isValid && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Please enter a valid Sui address (66 characters starting with 0x)
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid || isLoading || disabled}
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Requesting Tokens...
          </>
        ) : (
          <>
            <Droplets className="mr-2 h-4 w-4" />
            Request SUI Tokens
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        You will receive 1 SUI token (~1,000,000,000 MIST)
      </p>
    </form>
  )
}