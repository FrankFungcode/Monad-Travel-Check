'use client';

import { useTranslation } from 'react-i18next';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-100
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export default function AchievementBadge({
  achievement,
  size = 'medium',
  showProgress = true,
}: AchievementBadgeProps) {
  const { t } = useTranslation();

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return {
          bg: 'from-gray-500 to-gray-600',
          border: 'border-gray-500',
          text: 'text-gray-500',
          glow: 'shadow-[0_0_20px_rgba(107,114,128,0.5)]',
        };
      case 'rare':
        return {
          bg: 'from-blue-500 to-blue-600',
          border: 'border-blue-500',
          text: 'text-blue-500',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
        };
      case 'epic':
        return {
          bg: 'from-purple-500 to-purple-600',
          border: 'border-purple-500',
          text: 'text-purple-500',
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
        };
      case 'legendary':
        return {
          bg: 'from-yellow-500 to-orange-500',
          border: 'border-yellow-500',
          text: 'text-yellow-500',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
        };
    }
  };

  const getRarityLabel = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return t('achievementWall.common');
      case 'rare':
        return t('achievementWall.rare');
      case 'epic':
        return t('achievementWall.epic');
      case 'legendary':
        return t('achievementWall.legendary');
    }
  };

  const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return {
          container: 'size-20',
          icon: 'text-4xl',
          badge: 'size-5 text-[10px]',
        };
      case 'medium':
        return {
          container: 'size-28',
          icon: 'text-6xl',
          badge: 'size-6 text-xs',
        };
      case 'large':
        return {
          container: 'size-36',
          icon: 'text-8xl',
          badge: 'size-8 text-sm',
        };
    }
  };

  const colors = getRarityColor(achievement.rarity);
  const sizes = getSizeClasses(size);

  const showProgressText =
    !achievement.unlocked &&
    showProgress &&
    achievement.progress !== undefined;
  const statusText = showProgressText
    ? `${achievement.progress}/${achievement.maxProgress || 100}`
    : achievement.unlocked
      ? achievement.unlockedAt && size === 'large'
        ? `${t('achievementWall.unlockedAt')} ${achievement.unlockedAt}`
        : t('achievementWall.unlocked')
      : '';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 徽章容器 */}
      <div className="relative">
        {/* 徽章圆形 */}
        <div
          className={`${sizes.container} rounded-full border-4 ${
            achievement.unlocked
              ? `${colors.border} bg-gradient-to-br ${colors.bg} ${colors.glow}`
              : 'border-gray-700 bg-gray-800/50'
          } flex items-center justify-center transition-all duration-300 ${
            achievement.unlocked ? 'hover:scale-110' : ''
          } relative overflow-hidden`}
        >
          {/* 未解锁遮罩 */}
          {!achievement.unlocked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600 text-4xl">
                lock
              </span>
            </div>
          )}

          {/* 图标 */}
          <span
            className={`${sizes.icon} ${
              achievement.unlocked ? '' : 'opacity-30 grayscale'
            }`}
          >
            {achievement.icon}
          </span>
        </div>

        {/* 稀有度标签 */}
        {achievement.unlocked && size !== 'small' && (
          <div
            className={`absolute -top-3 -right-3 z-10 px-2 py-0.5 rounded-full border ${colors.border} bg-background-dark/90 ${colors.text} text-[10px] font-bold whitespace-nowrap`}
          >
            {getRarityLabel(achievement.rarity)}
          </div>
        )}

        {/* 进度圆环 */}
        {!achievement.unlocked && showProgress && achievement.progress !== undefined && (
          <svg
            className="absolute inset-0 size-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#25f478"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${
                2 * Math.PI * 46 * (1 - achievement.progress / 100)
              }`}
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* 徽章信息 */}
      <div className="text-center max-w-[120px]">
        <h4
          className={`text-sm font-bold ${
            achievement.unlocked ? 'text-white' : 'text-gray-500'
          }`}
        >
          {achievement.name}
        </h4>
        {size !== 'small' && (
          <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px] leading-snug">
            {achievement.description}
          </p>
        )}
        {size !== 'small' && (
          <p
            className={`text-xs min-h-[16px] ${
              showProgressText ? 'text-primary font-bold' : 'text-gray-500'
            }`}
          >
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
}
