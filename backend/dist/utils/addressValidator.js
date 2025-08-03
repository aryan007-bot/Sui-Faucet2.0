"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSuiAddress = isValidSuiAddress;
exports.normalizeSuiAddress = normalizeSuiAddress;
exports.validateAndNormalizeSuiAddress = validateAndNormalizeSuiAddress;
exports.isValidRecipientAddress = isValidRecipientAddress;
exports.formatAddressForDisplay = formatAddressForDisplay;
const constants_1 = require("./constants");
function isValidSuiAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }
    const cleanAddress = address.trim();
    if (!constants_1.VALIDATION_PATTERNS.SUI_ADDRESS.test(cleanAddress)) {
        return false;
    }
    if (cleanAddress.length !== 66) {
        return false;
    }
    return true;
}
function normalizeSuiAddress(address) {
    if (!isValidSuiAddress(address)) {
        throw new Error('Invalid Sui address format');
    }
    const hexPart = address.slice(2).padStart(64, '0').toLowerCase();
    return `0x${hexPart}`;
}
function validateAndNormalizeSuiAddress(address) {
    try {
        return normalizeSuiAddress(address);
    }
    catch (error) {
        throw new Error(`Invalid Sui address: ${address}`);
    }
}
function isValidRecipientAddress(address) {
    if (!isValidSuiAddress(address)) {
        return false;
    }
    const normalized = normalizeSuiAddress(address);
    const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000';
    if (normalized === zeroAddress) {
        return false;
    }
    return true;
}
function formatAddressForDisplay(address) {
    if (!isValidSuiAddress(address)) {
        return 'Invalid Address';
    }
    const normalized = normalizeSuiAddress(address);
    return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}
//# sourceMappingURL=addressValidator.js.map