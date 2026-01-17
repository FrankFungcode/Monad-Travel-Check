/**
 * @file AttractionCheckinCreatePage Component
 * @description Page for creating attraction check-in tasks
 */

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAttraction } from '@/hooks/useAttraction'
import { useWallet } from '@/hooks/useWallet'
import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * AttractionCheckinCreatePage Component
 */
export function AttractionCheckinCreatePage() {
    const navigate = useNavigate()
    const { isConnected, address, connect } = useWallet()
    const { createTask, getOwner } = useAttraction()
    const [isOwner, setIsOwner] = useState(false)
    const [checkingOwner, setCheckingOwner] = useState(true)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: null as { lat: number; lng: number } | null,
        radius: '500', // Default 500m
        rewardPerUser: '0.001', // Default 0.001 ETH
        totalSlots: '10',
        duration: '7' // Days
    })

    const [loading, setLoading] = useState(false)

    // Check if current user is owner
    useEffect(() => {
        const checkPermission = async () => {
            if (!address) return
            setCheckingOwner(true)
            const owner = await getOwner()
            setIsOwner(owner.toLowerCase() === address.toLowerCase())
            setCheckingOwner(false)
        }
        checkPermission()
    }, [address, getOwner])

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        },
                    })
                },
                (error) => {
                    alert(`获取位置失败: ${error.message}`)
                }
            )
        } else {
            alert('浏览器不支持地理位置')
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!isConnected) {
            await connect()
            return
        }

        if (!isOwner) {
            alert('只有合约管理员(Owner)才能创建任务')
            return
        }

        if (!formData.name) {
            alert('请输入景区名称')
            return
        }

        if (!formData.location) {
            alert('请获取位置信息')
            return
        }

        setLoading(true)
        try {
            // Set start time to now so users can join immediately after task creation
            const startTime = Math.floor(Date.now() / 1000)
            const endTime = startTime + Number(formData.duration) * 24 * 3600

            await createTask({
                name: formData.name,
                description: formData.description || 'Visit this amazing place!',
                latitude: formData.location.lat,
                longitude: formData.location.lng,
                radius: Number(formData.radius),
                rewardPerUser: formData.rewardPerUser,
                totalSlots: Number(formData.totalSlots),
                startTime,
                endTime
            })

            setShowSuccessModal(true)
        } catch (error) {
            console.error('Failed to create attraction check-in:', error)
            const message = error instanceof Error ? error.message : 'Unknown error'
            alert(`创建失败: ${message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleSuccessClose = () => {
        setShowSuccessModal(false)
        navigate('/attractions')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">创建景区打卡</h1>
                <p className="text-text-muted">发布新的景区打卡任务（仅限管理员）</p>

                {!checkingOwner && !isOwner && isConnected && (
                    <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold">无权限操作</p>
                            <p className="text-sm mt-1">
                                当前连接的钱包不是合约管理员，无法创建任务。
                                <br />
                                请切换到管理员账户 (通常是 Account #0) 进行操作。
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <Card>
                <Card.Header>
                    <h2 className="text-xl font-semibold text-white">任务信息</h2>
                </Card.Header>
                <Card.Body>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Attraction Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                                景区名称 *
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="例如：长城"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                                描述
                            </label>
                            <Input
                                id="description"
                                type="text"
                                placeholder="简要描述任务内容"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location-input" className="block text-sm font-medium text-white mb-2">
                                位置信息 *
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    id="location-input"
                                    type="text"
                                    value={
                                        formData.location
                                            ? `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}`
                                            : '未获取位置'
                                    }
                                    readOnly
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" onClick={handleGetLocation}>
                                    获取位置
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Radius */}
                            <div>
                                <label htmlFor="radius" className="block text-sm font-medium text-white mb-2">
                                    打卡半径 (米)
                                </label>
                                <Input
                                    id="radius"
                                    type="number"
                                    value={formData.radius}
                                    onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                                    min="1"
                                    max="10000"
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-white mb-2">
                                    持续时间 (天)
                                </label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Reward Per User */}
                            <div>
                                <label htmlFor="reward" className="block text-sm font-medium text-white mb-2">
                                    单人奖励 (ETH)
                                </label>
                                <Input
                                    id="reward"
                                    type="number"
                                    step="0.0001"
                                    value={formData.rewardPerUser}
                                    onChange={(e) => setFormData({ ...formData, rewardPerUser: e.target.value })}
                                />
                            </div>

                            {/* Total Slots */}
                            <div>
                                <label htmlFor="slots" className="block text-sm font-medium text-white mb-2">
                                    总名额
                                </label>
                                <Input
                                    id="slots"
                                    type="number"
                                    value={formData.totalSlots}
                                    onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Total Deposit Hint */}
                        <div className="p-3 bg-primary-900/30 rounded-lg text-sm text-primary-200">
                            需存入总奖励: {(Number(formData.rewardPerUser) * Number(formData.totalSlots)).toFixed(4)} ETH
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={() => navigate('/attractions')}
                            >
                                取消
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                                disabled={loading || !formData.location}
                            >
                                {!isConnected ? '连接钱包' : '创建并存入奖励'}
                            </Button>
                        </div>
                    </form>
                </Card.Body>
            </Card>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={handleSuccessClose}
                title="创建成功"
                size="sm"
                showClose={false}
            >
                <div className="text-center py-4 space-y-4">
                    <div className="text-5xl">🎉</div>
                    <p className="text-white text-lg">景区打卡任务 "{formData.name}" 创建成功！</p>
                    <p className="text-text-muted text-sm">奖励已存入合约，用户可以开始打卡了。</p>
                    <div className="flex justify-center pt-2">
                        <Button variant="primary" onClick={handleSuccessClose} fullWidth>
                            确定
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
