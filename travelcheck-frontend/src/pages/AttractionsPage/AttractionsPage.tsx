/**
 * @file AttractionsPage Component
 * @description Page for browsing attraction tasks
 */

import { TaskCard } from "@/components/business/TaskCard";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import type { AttractionTask } from "@/types/models.types";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAttraction } from "@/hooks/useAttraction";
import { useWallet } from "@/hooks/useWallet";

/**
 * AttractionsPage Component
 */
export function AttractionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isConnected, address, connect } = useWallet();
  const { getAllTasks, joinTask, getUserTaskInfo } = useAttraction();

  const [tasks, setTasks] = useState<AttractionTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "active" | "upcoming" | "expiring" | "completed"
  >("all");
  const [userTaskStatus, setUserTaskStatus] = useState<Record<string, { accepted: boolean; completed: boolean }>>({});

  const [selectedTask, setSelectedTask] = useState<AttractionTask | null>(null);

  // Join Flow State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [taskToJoin, setTaskToJoin] = useState<AttractionTask | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const allTasks = await getAllTasks();
        setTasks(allTasks);

        // Fetch user status for each task if connected
        if (address) {
          const statusMap: Record<string, { accepted: boolean; completed: boolean }> = {};
          await Promise.all(allTasks.map(async (task) => {
            const info = await getUserTaskInfo(task.id, address);
            if (info) {
              statusMap[task.id] = {
                accepted: info.accepted,
                completed: info.completed
              };
            }
          }));
          setUserTaskStatus(statusMap);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (window.ethereum) {
      loadTasks();
    }
  }, [getAllTasks, getUserTaskInfo, address]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const handleAction = async (task: AttractionTask) => {
    if (!isConnected) {
      await connect();
      return;
    }

    const status = userTaskStatus[task.id];

    // If accepted and not completed, navigate to check-in page
    if (status?.accepted && !status?.completed) {
      navigate(`/attraction-checkin/${task.id}`);
      return;
    }

    // Open confirmation modal
    setTaskToJoin(task);
    setJoinResult(null);
    setConfirmModalOpen(true);
  };

  const confirmJoin = async () => {
    if (!taskToJoin) return;

    setIsJoining(true); // Start loading UI
    setJoinResult(null);

    try {
      // DO NOT close modal here, wait for transaction
      await joinTask(taskToJoin.id);

      // Update status locally
      if (address) {
        const info = await getUserTaskInfo(taskToJoin.id, address);
        if (info) {
          setUserTaskStatus(prev => ({
            ...prev,
            [taskToJoin.id]: { accepted: info.accepted, completed: info.completed }
          }));
        }
      }
      setJoinResult({ success: true, message: '成功加入任务！' });
    } catch (error) {
      console.error('Failed to join:', error);

      // Double check: if explicit error, check if we actually joined (handling timeouts/false negatives)
      let actualSuccess = false;
      if (address) {
        try {
          const info = await getUserTaskInfo(taskToJoin.id, address);
          if (info && info.accepted) {
            actualSuccess = true;
            setUserTaskStatus(prev => ({
              ...prev,
              [taskToJoin.id]: { accepted: info.accepted, completed: info.completed }
            }));
          }
        } catch (checkError) {
          console.error('Failed to double-check status:', checkError);
        }
      }

      if (actualSuccess) {
        setJoinResult({ success: true, message: '成功加入任务！(检测到链上状态更新)' });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Simplify error message for user
        let displayError = errorMessage;
        if (errorMessage.includes('user rejected')) displayError = '用户取消了操作';
        else if (errorMessage.includes('reverted')) displayError = '交易被撤销 (可能已加入或条件不符)';

        setJoinResult({ success: false, message: '加入失败: ' + displayError });
      }
    } finally {
      setIsJoining(false);
    }
  };

  const getActionLabel = (task: AttractionTask) => {
    const status = userTaskStatus[task.id];
    if (status?.completed) return t("taskCard.completed") || "Completed";
    if (status?.accepted) return t("common.checkIn") || "Check In";
    return undefined; // Default "Join Task"
  };

  const handleViewDetails = (task: AttractionTask) => {
    setSelectedTask(task);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('attractions.title')}</h1>
          <p className="text-text-muted">
            {t('attractions.subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/attraction-checkin/create')}>
          创建景区打卡
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card>
        <Card.Body>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: "all", label: t('attractions.allTasks'), icon: "🗺️" },
              { value: "active", label: t('attractions.active'), icon: "🔥" },
              { value: "upcoming", label: t('attractions.upcoming'), icon: "📅" },
              { value: "expiring", label: t('attractions.expiringSoon'), icon: "⏰" }
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value as typeof filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab.value
                  ? "bg-primary text-background-dark"
                  : "bg-background-dark text-text-muted hover:text-primary"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('attractions.availableTasks')}</p>
            <p className="text-2xl font-bold text-white">{tasks.length}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('attractions.totalRewards')}</p>
            <p className="text-2xl font-bold text-primary">
              {tasks.reduce((sum, task) => sum + task.minStake, 0)} MON
            </p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('attractions.avgRewardApy')}</p>
            <p className="text-2xl font-bold text-white">
              {(
                tasks.reduce((sum, task) => sum + task.rewardApy, 0) /
                tasks.length
              ).toFixed(1)}
              %
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading attractions...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onJoin={handleAction}
              actionLabel={getActionLabel(task)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('attractions.noTasksFound')}
              </h3>
              <p className="text-text-muted mb-6">
                {t('attractions.noTasksDescription')}
              </p>
              <Button variant="primary" onClick={() => setFilter("all")}>
                {t('attractions.viewAllTasks')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.name}
          size="lg"
        >
          <div className="space-y-4">
            {/* Image */}
            <div className="relative h-48 -mx-4 -mt-4 mb-4 overflow-hidden rounded-t-lg">
              <img
                src={selectedTask.overviewImage}
                alt={selectedTask.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-1">{t('common.description')}</h4>
                  <p className="text-white">{selectedTask.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-1">{t('taskCard.location')}</h4>
                  <p className="text-white flex items-center gap-2">
                    <span>📍</span>
                    {selectedTask.location.address || selectedTask.location.name}
                  </p>
                </div>
              </div>

              <div className="bg-background-darker p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">{t('taskCard.reward')}</span>
                  <span className="text-primary font-bold">{selectedTask.rewardAmount} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">{t('taskCard.duration')}</span>
                  <span className="text-white">{selectedTask.duration} {t('taskCard.days')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">{t('taskCard.remainingSlots')}</span>
                  <span className="text-white">{selectedTask.totalSlots - selectedTask.claimedSlots} / {selectedTask.totalSlots}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border-dark mt-4">
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                {t('common.close')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleAction(selectedTask);
                  setSelectedTask(null);
                }}
              >
                {getActionLabel(selectedTask) || t('common.joinTask')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => {
          // Prevent closing while joining to ensure transaction isn't interrupted in UI
          if (!isJoining) {
            setConfirmModalOpen(false);
            setJoinResult(null);
          }
        }}
        title={t('common.joinTask')}
        size="sm"
        showClose={!isJoining}
      >
        <div className="space-y-4">
          {!isJoining && !joinResult && (
            <>
              <p className="text-white text-lg">
                {t('attractions.confirmJoin', { name: taskToJoin?.name })}
              </p>
              <p className="text-text-muted text-sm">
                {t('attractions.joinDescription')}
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-dark">
                <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" onClick={confirmJoin}>
                  {t('common.confirm')}
                </Button>
              </div>
            </>
          )}

          {isJoining && (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white font-medium">正在等待钱包授权...</p>
              <p className="text-text-muted text-sm mt-2">请在您的钱包中确认交易</p>
            </div>
          )}

          {joinResult && (
            <div className="py-4 text-center">
              <div className="text-5xl mb-4">{joinResult.success ? '🎉' : '❌'}</div>
              <p className={`text-lg font-medium mb-2 ${joinResult.success ? 'text-green-500' : 'text-red-500'}`}>
                {joinResult.success ? '加入成功' : '加入失败'}
              </p>
              <p className="text-text-muted text-sm mb-6">{joinResult.message}</p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setConfirmModalOpen(false);
                  setJoinResult(null);
                  if (joinResult.success) {
                    navigate(`/attraction-checkin/${taskToJoin?.id}`);
                  }
                }}
              >
                {joinResult.success ? '去打卡' : '关闭'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
