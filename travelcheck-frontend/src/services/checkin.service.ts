/**
 * @file Check-in Service
 * @description API calls for check-in operations
 */

import type {
  GetCalendarResponse,
  SubmitCheckinRequest,
  SubmitCheckinResponse,
  SubmitMakeupRequest,
  SubmitMakeupResponse
} from "@/types/api.types";
import type { Checkin } from "@/types/models.types";
import api, { extractData } from "./api";

/**
 * Submit a daily check-in
 *
 * @param request - Check-in data
 * @returns Promise resolving to check-in result with optional reward
 *
 * @example
 * const result = await submitCheckin({
 *   stakeId: 'stake-123',
 *   content: 'Today I visited the park',
 *   images: ['url1', 'url2'],
 *   location: { lat: 40.7128, lng: -74.0060 }
 * })
 */
export async function submitCheckin(
  request: SubmitCheckinRequest
): Promise<SubmitCheckinResponse> {
  const response = await api.post<never, never, SubmitCheckinRequest>(
    "/checkins",
    request
  );

  return extractData<SubmitCheckinResponse>(response);
}

/**
 * Submit a makeup check-in for a missed day
 *
 * @param request - Makeup check-in data
 * @returns Promise resolving to makeup check-in record
 *
 * @example
 * const checkin = await submitMakeup({
 *   stakeId: 'stake-123',
 *   date: '2026-01-15',
 *   content: 'Makeup for missed day',
 *   images: ['url1']
 * })
 */
export async function submitMakeup(
  request: SubmitMakeupRequest
): Promise<SubmitMakeupResponse> {
  const response = await api.post<never, never, SubmitMakeupRequest>(
    "/checkins/makeup",
    request
  );

  return extractData<SubmitMakeupResponse>(response);
}

/**
 * Get calendar data for a specific month
 *
 * @param stakeId - Stake ID
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Promise resolving to calendar data
 *
 * @example
 * const calendar = await getCalendar('stake-123', 2026, 1)
 * console.log('January 2026 check-ins:', calendar.checkins)
 */
export async function getCalendar(
  stakeId: string,
  year: number,
  month: number
): Promise<GetCalendarResponse> {
  const response = await api.get<never>(
    `/checkins/calendar/${stakeId}?year=${year}&month=${month}`
  );

  return extractData<GetCalendarResponse>(response);
}

/**
 * Get all check-ins for a stake
 *
 * @param stakeId - Stake ID
 * @returns Promise resolving to array of check-ins
 *
 * @example
 * const checkins = await getCheckins('stake-123')
 */
export async function getCheckins(stakeId: string): Promise<Checkin[]> {
  const response = await api.get<never>(`/checkins/${stakeId}`);

  return extractData<Checkin[]>(response);
}

/**
 * Get a specific check-in by ID
 *
 * @param checkinId - Check-in ID
 * @returns Promise resolving to check-in details
 *
 * @example
 * const checkin = await getCheckinById('checkin-123')
 */
export async function getCheckinById(checkinId: string): Promise<Checkin> {
  const response = await api.get<never>(`/checkins/detail/${checkinId}`);

  return extractData<Checkin>(response);
}

/**
 * Get check-in statistics for a stake
 *
 * @param stakeId - Stake ID
 * @returns Promise resolving to statistics
 *
 * @example
 * const stats = await getCheckinStats('stake-123')
 * // Returns: { totalCheckins, missedDays, makeupUsed, currentStreak }
 */
export async function getCheckinStats(stakeId: string): Promise<{
  totalCheckins: number;
  missedDays: number;
  makeupUsed: number;
  currentStreak: number;
}> {
  const response = await api.get<never>(`/checkins/${stakeId}/stats`);

  return extractData<{
    totalCheckins: number;
    missedDays: number;
    makeupUsed: number;
    currentStreak: number;
  }>(response);
}

/**
 * Upload check-in images
 *
 * @param files - Array of image files
 * @returns Promise resolving to array of uploaded image URLs
 *
 * @example
 * const urls = await uploadCheckinImages([file1, file2])
 * console.log('Uploaded URLs:', urls)
 */
export async function uploadCheckinImages(files: File[]): Promise<string[]> {
  const formData = new FormData();

  for (const file of files) {
    formData.append("images", file);
  }

  const response = await api.post<never, never, FormData>(
    "/checkins/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return extractData<string[]>(response);
}
