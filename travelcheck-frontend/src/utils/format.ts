/**
 * @file Formatting Utility Functions
 * @description Functions for formatting addresses, amounts, dates, and countdown timers
 */

/**
 * Format a wallet address to shortened form (0x1234...5678)
 *
 * @param address - The wallet address to format
 * @param startLength - Number of characters to show at start (default: 6)
 * @param endLength - Number of characters to show at end (default: 4)
 * @returns Formatted address string
 *
 * @example
 * formatAddress('0x1234567890abcdef1234567890abcdef12345678')
 * // Returns: '0x1234...5678'
 *
 * @example
 * formatAddress('0x1234567890abcdef1234567890abcdef12345678', 8, 6)
 * // Returns: '0x123456...345678'
 */
export function formatAddress(
  address: string,
  startLength = 6,
  endLength = 4
): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format a numeric amount with specified decimals
 *
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted amount string
 *
 * @example
 * formatAmount(1234.5678)
 * // Returns: '1,234.57'
 *
 * @example
 * formatAmount(1234.5678, 4)
 * // Returns: '1,234.5678'
 *
 * @example
 * formatAmount(0.001, 6)
 * // Returns: '0.001000'
 */
export function formatAmount(amount: number, decimals = 4): string {
  if (Number.isNaN(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format a date to specified format
 *
 * @param date - Date object or ISO string
 * @param format - Date format string (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date('2026-01-15'))
 * // Returns: '2026-01-15'
 *
 * @example
 * formatDate(new Date('2026-01-15T10:30:00'), 'YYYY-MM-DD HH:mm')
 * // Returns: '2026-01-15 10:30'
 *
 * @example
 * formatDate('2026-01-15T10:30:00Z', 'MM/DD/YYYY')
 * // Returns: '01/15/2026'
 */
export function formatDate(date: Date | string, format = "YYYY-MM-DD"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(dateObj.getTime())) {
    return "";
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * Format seconds into countdown string (HH:mm:ss or mm:ss)
 *
 * @param seconds - Total seconds to format
 * @returns Formatted countdown string
 *
 * @example
 * formatCountdown(3661)
 * // Returns: '01:01:01'
 *
 * @example
 * formatCountdown(125)
 * // Returns: '02:05'
 *
 * @example
 * formatCountdown(86399)
 * // Returns: '23:59:59'
 */
export function formatCountdown(seconds: number): string {
  if (seconds < 0) {
    return "00:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * Format a number to percentage string
 *
 * @param value - The value to format (e.g., 0.05 for 5%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.05)
 * // Returns: '5.0%'
 *
 * @example
 * formatPercentage(0.1234, 2)
 * // Returns: '12.34%'
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format file size in bytes to human-readable string
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024)
 * // Returns: '1.00 KB'
 *
 * @example
 * formatFileSize(1048576)
 * // Returns: '1.00 MB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}
