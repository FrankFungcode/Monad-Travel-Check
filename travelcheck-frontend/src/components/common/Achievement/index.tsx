"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AchievementBadge, { Achievement } from "./achievement-badge";

// Achievement data keys for i18n
const ACHIEVEMENT_KEYS = [
  { id: "1", nameKey: "travelSprout", icon: "🌱", rarity: "common" as const, unlocked: true, unlockedAt: "2026-01-01" },
  { id: "2", nameKey: "sevenDays", icon: "📅", rarity: "common" as const, unlocked: true, unlockedAt: "2026-01-07" },
  { id: "3", nameKey: "travelExpert", icon: "⭐", rarity: "rare" as const, unlocked: true, unlockedAt: "2026-01-20" },
  { id: "4", nameKey: "explorer", icon: "🌟", rarity: "epic" as const, unlocked: false, progress: 12, maxProgress: 20 },
  { id: "5", nameKey: "travelMaster", icon: "👑", rarity: "legendary" as const, unlocked: false, progress: 12, maxProgress: 50 },
  { id: "6", nameKey: "spotCollector", icon: "📍", rarity: "rare" as const, unlocked: false, progress: 2, maxProgress: 5 },
  { id: "7", nameKey: "worldTraveler", icon: "🌍", rarity: "epic" as const, unlocked: false, progress: 2, maxProgress: 20 },
  { id: "8", nameKey: "wealthAccumulator", icon: "💰", rarity: "rare" as const, unlocked: false, progress: 356, maxProgress: 1000 },
  { id: "9", nameKey: "luckyStar", icon: "🎰", rarity: "epic" as const, unlocked: false, progress: 3, maxProgress: 10 },
  { id: "10", nameKey: "perfectionist", icon: "💯", rarity: "epic" as const, unlocked: false, progress: 7, maxProgress: 30 },
  { id: "11", nameKey: "communityStar", icon: "🌟", rarity: "rare" as const, unlocked: false, progress: 0, maxProgress: 10 },
  { id: "12", nameKey: "legendaryTraveler", icon: "🏆", rarity: "legendary" as const, unlocked: false, progress: 3, maxProgress: 11 }
];

type FilterType = "all" | "unlocked" | "locked";
type RarityFilter = "all" | "common" | "rare" | "epic" | "legendary";

export default function AchievementsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>("all");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");

  // Generate achievements with translations
  const achievements: Achievement[] = useMemo(() => {
    return ACHIEVEMENT_KEYS.map(item => ({
      id: item.id,
      name: t(`achievementWall.badges.${item.nameKey}`),
      description: t(`achievementWall.badges.${item.nameKey}Desc`),
      icon: item.icon,
      requirement: t(`achievementWall.badges.${item.nameKey}Req`),
      rarity: item.rarity,
      unlocked: item.unlocked,
      unlockedAt: item.unlockedAt,
      progress: item.progress,
      maxProgress: item.maxProgress
    }));
  }, [t]);

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "unlocked" && !achievement.unlocked) return false;
    if (filter === "locked" && achievement.unlocked) return false;
    if (rarityFilter !== "all" && achievement.rarity !== rarityFilter)
      return false;
    return true;
  });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.unlocked).length,
    progress: Math.round(
      (achievements.filter((a) => a.unlocked).length / achievements.length) *
        100
    )
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl ">
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {stats.unlocked} / {stats.total}
                </h2>
                <p className="text-sm text-gray-400">{t('achievementWall.unlockedAchievements')}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {stats.progress}%
                </p>
                <p className="text-sm text-gray-400">{t('achievementWall.completionRate')}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-black/30 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="glass-panel p-4 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === "all"
                      ? "bg-primary text-background-dark"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t('achievementWall.all')} ({achievements.length})
                </button>
                <button
                  onClick={() => setFilter("unlocked")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === "unlocked"
                      ? "bg-primary text-background-dark"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t('achievementWall.unlocked')} ({stats.unlocked})
                </button>
                <button
                  onClick={() => setFilter("locked")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === "locked"
                      ? "bg-primary text-background-dark"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t('achievementWall.locked')} ({stats.total - stats.unlocked})
                </button>
              </div>

              {/* Rarity Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{t('achievementWall.rarity')}:</span>
                <select
                  value={rarityFilter}
                  onChange={(e) =>
                    setRarityFilter(e.target.value as RarityFilter)
                  }
                  className="bg-black/30 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="all">{t('achievementWall.all')}</option>
                  <option value="common">{t('achievementWall.common')}</option>
                  <option value="rare">{t('achievementWall.rare')}</option>
                  <option value="epic">{t('achievementWall.epic')}</option>
                  <option value="legendary">{t('achievementWall.legendary')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="glass-panel p-4 rounded-xl hover:border-primary transition-all cursor-pointer"
              >
                <AchievementBadge achievement={achievement} size="medium" />

                {/* Requirement */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 text-center">
                    {achievement.requirement}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAchievements.length === 0 && (
            <div className="glass-panel p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
                search_off
              </span>
              <p className="text-gray-400">{t('achievementWall.noResults')}</p>
            </div>
          )}

          {/* Tips */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                emoji_events
              </span>
              {t('achievementWall.howToEarn')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">{t('achievementWall.dailyCheckin')}</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.dailyCheckinTip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.dailyCheckinTip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.dailyCheckinTip3')}</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">{t('achievementWall.attractionCheckin')}</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.attractionTip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.attractionTip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.attractionTip3')}</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">{t('achievementWall.earnings')}</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.earningsTip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.earningsTip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.earningsTip3')}</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">{t('achievementWall.community')}</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.communityTip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.communityTip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('achievementWall.communityTip3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
