/**
 * @file StakePage Component
 * @description Page for creating and managing stakes
 */

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import {
  MILESTONES,
  INTEREST_RATES_SEALED,
  INTEREST_RATES_ANYTIME,
  type Milestone
} from "@/constants/business";
import { useStaking, StakeType, StakeMode } from "@/hooks/useStaking";
import { useWallet } from "@/hooks/useWallet";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/**
 * StakePage Component
 */
export function StakePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const { createStake, loading } = useStaking();
  const [formData, setFormData] = useState({
    type: "daily" as "daily" | "attraction",
    amount: "",
    milestone: 30 as Milestone,
    mode: "sealed" as "sealed" | "anytime"
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      await connect();
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }

    const stakeType =
      formData.type === "daily" ? StakeType.DAILY : StakeType.ATTRACTION;
    const stakeMode =
      formData.mode === "sealed" ? StakeMode.SEALED : StakeMode.ANYTIME;

    const stakeId = await createStake(
      stakeType,
      formData.milestone,
      stakeMode,
      formData.amount
    );

    if (stakeId) {
      // Navigate to checkin page for the new stake
      console.log("Navigating to checkin page with stakeId:", stakeId);
      navigate(`/checkin/${stakeId}`);
    } else {
      console.error("StakeId is null or undefined, cannot navigate");
    }
  };

  // Format interest rate as percentage string
  const formatRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("stake.title")}
        </h1>
        <p className="text-text-muted">{t("stake.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Stake Form */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-white">
              {t("stake.newStake")}
            </h2>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount Input */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-white mb-2"
                >
                  {t("stake.stakeAmount")} (ETH)
                </label>
                <Input
                  style={{ width: "100%" }}
                  id="amount"
                  type="number"
                  step="0.0001"
                  placeholder={t("stake.enterAmount")}
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  min="0.0001"
                  max="1000"
                  required
                />
                <p className="text-xs text-text-muted mt-1">
                  {t("stake.minMaxAmount")} (0.0001 - 1000 MON)
                </p>
              </div>

              {/* Milestone Selection */}
              <div>
                <div className="block text-sm font-medium text-white mb-2">
                  {t("stake.milestone")}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {MILESTONES.map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, milestone: days })
                      }
                      className={`p-2 rounded-lg border-2 transition-colors flex justify-center items-center ${
                        formData.milestone === days
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border-dark text-text-muted hover:border-primary"
                      }`}
                    >
                      <div className="font-bold">{days}</div>
                      <div className="text-xs ml-1">{t("common.count")}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <div className="block text-sm font-medium text-white mb-2">
                  {t("stake.lockMode")}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: "sealed" })}
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      formData.mode === "sealed"
                        ? "border-primary bg-primary/20"
                        : "border-border-dark hover:border-primary"
                    }`}
                  >
                    <div className="font-medium text-white mb-1">
                      {t("stake.sealed")}
                    </div>
                    <div className="text-xs text-text-muted">
                      {t("stake.sealedDescription")}
                    </div>
                    <div className="text-sm text-primary mt-1">
                      {formatRate(INTEREST_RATES_SEALED[formData.milestone])}{" "}
                      APY
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, mode: "anytime" })
                    }
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      formData.mode === "anytime"
                        ? "border-primary bg-primary/20"
                        : "border-border-dark hover:border-primary"
                    }`}
                  >
                    <div className="font-medium text-white mb-1">
                      {t("stake.anytime")}
                    </div>
                    <div className="text-xs text-text-muted">
                      {t("stake.anytimeDescription")}
                    </div>
                    <div className="text-sm text-text-muted mt-1">
                      {formatRate(INTEREST_RATES_ANYTIME[formData.milestone])}{" "}
                      APY
                    </div>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading || !formData.amount}
              >
                {!isConnected
                  ? t("common.connectWallet")
                  : loading
                  ? t("stake.creating")
                  : t("stake.createStake")}
              </Button>
            </form>
          </Card.Body>
        </Card>

        {/* Info Card */}
        <div className="space-y-4">
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-white">
                {t("stake.interestRates")}
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {MILESTONES.map((days) => (
                  <div
                    key={days}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-text-muted">
                      {days} {t("common.count")}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-primary font-medium">
                        {formatRate(INTEREST_RATES_SEALED[days])}
                      </span>
                      <span className="text-text-muted">
                        {formatRate(INTEREST_RATES_ANYTIME[days])}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border-dark">
                  <div className="flex gap-4 text-xs">
                    <span className="text-primary">
                      {t("stake.sealedMode")}
                    </span>
                    <span className="text-text-muted">
                      {t("stake.anytimeMode")}
                    </span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-white">
                {t("stake.rewards")}
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧧</span>
                  <span className="text-text-muted">
                    {t("stake.dailyRedPackets")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎰</span>
                  <span className="text-text-muted">
                    {t("stake.lotteryChances")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-text-muted">
                    {t("stake.achievementBadges")}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-white">
                {t("stake.redPacketRules")}
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2 text-sm text-text-muted">
                <div className="flex justify-between">
                  <span>0-20% {t("common.progress")}</span>
                  <span className="text-primary">{t("common.max")} 1%</span>
                </div>
                <div className="flex justify-between">
                  <span>20-50% {t("common.progress")}</span>
                  <span className="text-primary">{t("common.max")} 2%</span>
                </div>
                <div className="flex justify-between">
                  <span>50-80% {t("common.progress")}</span>
                  <span className="text-primary">{t("common.max")} 3%</span>
                </div>
                <div className="flex justify-between">
                  <span>80-99% {t("common.progress")}</span>
                  <span className="text-primary">{t("common.max")} 5%</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>100% {t("common.progress")}</span>
                  <span className="text-primary">{t("common.max")} 10%</span>
                </div>
                <p className="text-xs pt-2 border-t border-border-dark">
                  {t("stake.redPacketNote")}
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
