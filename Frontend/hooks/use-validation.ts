"use client"

import { useCallback } from "react"

const SUI_ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}$/

export function useValidation() {
  const isValidSuiAddress = useCallback((address: string): boolean => {
    if (!address) return false
    return SUI_ADDRESS_REGEX.test(address) && address.length === 66
  }, [])

  const formatAddress = useCallback((address: string): string => {
    // Remove any whitespace
    let formatted = address.trim()

    // Convert to lowercase
    formatted = formatted.toLowerCase()

    // Ensure it starts with 0x
    if (formatted && !formatted.startsWith("0x")) {
      formatted = "0x" + formatted
    }

    return formatted
  }, [])

  return {
    isValidSuiAddress,
    formatAddress,
  }
}
