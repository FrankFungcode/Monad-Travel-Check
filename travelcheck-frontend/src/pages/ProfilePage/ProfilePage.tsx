/**
 * @file ProfilePage Component
 * @description User profile and account management page with real on-chain data
 */

import Achievement from "@/components/common/Achievement";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EditProfileModal } from "@/components/business/EditProfileModal";
import { useWallet } from "@/hooks/useWallet";
import { useStaking, StakeStatus } from "@/hooks/useStaking";
import { useAttraction } from "@/hooks/useAttraction";
import { formatAmount } from "@/utils/format";
import { getProfile, createDefaultProfile, type UserProfile } from "@/services/db.service";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { formatEther } from "ethers";

interface ProfileStats {
  totalStaked: string;
  totalEarned: string;
  activeStakes: number;
  completedStakes: number;
  totalCheckins: number;
  attractionsCompleted: number;
}

/**
 * ProfilePage Component
 */
export function ProfilePage() {
  const { t } = useTranslation();
  const { address, balance } = useWallet();
  const { getUserStakes, getStake, getCheckinRecords, calculateInterest, getTotalRedPacketClaimed } = useStaking();
  const { getAllTasks, getUserTaskInfo } = useAttraction();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    totalStaked: "0",
    totalEarned: "0",
    activeStakes: 0,
    completedStakes: 0,
    totalCheckins: 0,
    attractionsCompleted: 0
  });
  const [memberSinceDays, setMemberSinceDays] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load user profile from IndexedDB
  const loadProfile = useCallback(async () => {
    if (!address) return;
    try {
      let userProfile = await getProfile(address);
      if (!userProfile) {
        userProfile = createDefaultProfile(address);
      }
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }, [address]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Load real data from blockchain
  const loadProfileData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get user's stake IDs
      const stakeIds = await getUserStakes(address);

      let totalStaked = BigInt(0);
      let totalInterest = BigInt(0);
      let totalRedPackets = BigInt(0);
      let activeCount = 0;
      let completedCount = 0;
      let totalCheckinCount = 0;
      let earliestStakeTime = Date.now();

      // Process each stake
      for (const stakeId of stakeIds) {
        const stake = await getStake(stakeId);
        if (stake) {
          // Total staked amount
          totalStaked += BigInt(Math.floor(parseFloat(stake.amount) * 1e18));

          // Count active vs completed
          if (stake.status === StakeStatus.ACTIVE) {
            activeCount++;
          } else if (stake.status === StakeStatus.COMPLETED || stake.status === StakeStatus.WITHDRAWN) {
            completedCount++;
          }

          // Get checkin records
          const checkins = await getCheckinRecords(stakeId);
          totalCheckinCount += checkins.length;

          // Calculate interest earned
          const interest = await calculateInterest(stakeId);
          totalInterest += BigInt(Math.floor(parseFloat(interest) * 1e18));

          // Get red packets claimed
          const redPacketClaimed = await getTotalRedPacketClaimed(stakeId);
          totalRedPackets += BigInt(Math.floor(parseFloat(redPacketClaimed) * 1e18));

          // Track earliest stake for "member since"
          if (stake.startTime) {
            const stakeTime = stake.startTime * 1000;
            if (stakeTime < earliestStakeTime) {
              earliestStakeTime = stakeTime;
            }
          }
        }
      }

      // Calculate member since days
      if (stakeIds.length > 0) {
        const days = Math.floor((Date.now() - earliestStakeTime) / (1000 * 60 * 60 * 24));
        setMemberSinceDays(days);
      }

      // Get attraction tasks completed
      let attractionsCompleted = 0;
      try {
        const tasks = await getAllTasks();
        for (const task of tasks) {
          const userInfo = await getUserTaskInfo(task.id, address);
          if (userInfo?.completed) {
            attractionsCompleted++;
          }
        }
      } catch (e) {
        console.warn('Failed to get attraction data:', e);
      }

      // Total earned = interest + red packets
      const totalEarned = totalInterest + totalRedPackets;

      setStats({
        totalStaked: formatEther(totalStaked),
        totalEarned: formatEther(totalEarned),
        activeStakes: activeCount,
        completedStakes: completedCount,
        totalCheckins: totalCheckinCount,
        attractionsCompleted
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [address, getUserStakes, getStake, getCheckinRecords, calculateInterest, getTotalRedPacketClaimed, getAllTasks, getUserTaskInfo]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleChangeAvatar = () => {
    setShowEditModal(true);
  };

  const handleProfileSave = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const formatWalletAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Generate avatar based on wallet address or use saved avatar
  const defaultAvatarUrl = address
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  const avatarUrl = profile?.avatar || defaultAvatarUrl;

  // Display name
  const displayName = profile?.nickname || t("profile.traveler");

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-6xl">👤</div>
        <h2 className="text-xl font-semibold text-white">{t("profile.connectWallet")}</h2>
        <p className="text-text-muted">{t("profile.connectWalletDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("profile.title")}
        </h1>
        <p className="text-text-muted">{t("profile.subtitle")}</p>
      </div>

      {/* Profile Card */}
      <Card>
        <Card.Body>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-32 h-32 rounded-full border-4 border-primary"
                />
                <button
                  onClick={handleChangeAvatar}
                  className="absolute bottom-0 right-0 bg-primary hover:bg-primary/80 text-background-dark rounded-full p-2 transition-colors"
                  type="button"
                  aria-label={t("profile.changeAvatar")}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">
                {displayName}
              </h2>
              {profile?.bio && (
                <p className="text-text-muted text-sm mb-2">{profile.bio}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-text-muted">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                  <span className="font-mono text-sm">
                    {formatWalletAddress(address)}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-text-muted">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    {t("profile.memberSince")}: {memberSinceDays} {t("profile.days")}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <span className="text-sm font-semibold">
                    {t("profile.balance")}: {formatAmount(parseFloat(balance), 4)} MON
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={handleEditProfile}>
                  {t("profile.editProfile")}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {loading ? "..." : stats.totalCheckins}
                </p>
                <p className="text-xs text-text-muted">
                  {t("achievements.totalCheckins")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {loading ? "..." : stats.activeStakes}
                </p>
                <p className="text-xs text-text-muted">
                  {t("checkins.activeStakes")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {loading ? "..." : stats.attractionsCompleted}
                </p>
                <p className="text-xs text-text-muted">
                  {t("profile.attractions")}
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Statistics Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          {t("profile.statistics")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t("profile.totalStaked")}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? "..." : formatAmount(parseFloat(stats.totalStaked), 4)} MON
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t("profile.totalEarned")}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {loading ? "..." : formatAmount(parseFloat(stats.totalEarned), 6)} MON
                  </p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t("checkins.activeStakes")}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.activeStakes}
                  </p>
                </div>
                <div className="text-4xl">🔥</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t("checkins.completedStakes")}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.completedStakes}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t("achievements.totalCheckins")}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.totalCheckins}
                  </p>
                </div>
                <div className="text-4xl">✨</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    {t("profile.attractionsVisited", {
                      defaultValue: "Attractions Completed"
                    })}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.attractionsCompleted}
                  </p>
                </div>
                <div className="text-4xl">🗺️</div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Achievement Wall */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-white">{t('achievementWall.title')}</h2>
        </Card.Header>
        <Card.Body>
          <Achievement />
        </Card.Body>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={loadProfileData}
          disabled={loading}
        >
          {loading ? t("common.loading") : t("profile.refresh")}
        </Button>
      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
}
