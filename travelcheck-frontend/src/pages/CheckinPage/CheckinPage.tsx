/**
 * @file CheckinPage Component
 * @description Page for daily check-in
 */

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { useStaking } from '@/hooks/useStaking'
import { useWallet } from '@/hooks/useWallet'
import { imageToBase64 } from '@/services/db.service'
import { type FormEvent, useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * CheckinPage Component
 */
export function CheckinPage() {
  const { stakeId } = useParams<{ stakeId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isConnected, connect } = useWallet()
  const { checkIn, getStake, loading } = useStaking()

  const [stakeInfo, setStakeInfo] = useState<{
    checkedDays: number
    milestone: number
    status: number
  } | null>(null)
  const [formData, setFormData] = useState({
    content: '',
    location: null as { lat: number; lng: number } | null,
    images: [] as string[],
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load stake info
  useEffect(() => {
    if (stakeId) {
      getStake(stakeId).then((stake) => {
        if (stake) {
          setStakeInfo({
            checkedDays: stake.checkedDays,
            milestone: stake.milestone,
            status: stake.status,
          })
        }
      })
    }
  }, [stakeId, getStake])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      await connect()
      return
    }

    if (!stakeId) {
      return
    }

    // Only validate location is present
    if (!formData.location) {
      alert(t('checkin.locationRequired') || 'Please enable location access')
      return
    }

    const success = await checkIn(
      stakeId,
      formData.content || 'Daily check-in', // Provide default content if empty
      formData.images,
      formData.location
    )

    console.log('Check-in result:', success)

    if (success) {
      // Reload stake info to get updated checkedDays
      const updatedStake = await getStake(stakeId)
      if (updatedStake) {
        setStakeInfo({
          checkedDays: updatedStake.checkedDays,
          milestone: updatedStake.milestone,
          status: updatedStake.status,
        })
      }

      // Navigate to rewards page
      navigate('/rewards')
    }
  }



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
          alert(`${t('checkin.locationError')}: ${error.message}`)
        }
      )
    } else {
      alert(t('checkin.geolocationNotSupported'))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const base64 = await imageToBase64(file)
        newImages.push(base64)
      }
    }

    setFormData({
      ...formData,
      images: [...formData.images, ...newImages].slice(0, 9), // Max 9 images
    })
  }

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('checkin.title')}
        </h1>
        <p className="text-text-muted">{t('checkin.subtitle')}</p>
        {stakeInfo && (
          <p className="text-sm text-primary mt-1">
            {t('checkin.currentProgress')}: {stakeInfo.checkedDays} / {stakeInfo.milestone} {t('common.days')}
          </p>
        )}
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-white">
            {t('checkin.formTitle')}
          </h2>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content Input */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
                {t('checkin.shareExperience')} ({t('checkin.optional')})
              </label>
              <textarea
                id="content"
                className="w-full px-4 py-3 bg-background-dark border-2 border-border-dark rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none"
                placeholder={t('checkin.contentPlaceholder')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
              <p className="text-xs mt-1 text-text-muted">
                {formData.content.length} {t('checkin.characters')}
              </p>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location-input" className="block text-sm font-medium text-white mb-2">
                {t('checkin.location')}
              </label>
              <div className="flex gap-2">
                <Input
                  id="location-input"
                  type="text"
                  value={
                    formData.location
                      ? `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}`
                      : t('checkin.noLocation')
                  }
                  readOnly
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleGetLocation}>
                  {t('checkin.getLocation')}
                </Button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <div className="block text-sm font-medium text-white mb-2">
                {t('checkin.photos')} ({t('checkin.optional')}) ({formData.images.length}/9)
              </div>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={img}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border-dark rounded-lg p-6 text-center hover:border-primary transition-colors"
                disabled={formData.images.length >= 9}
              >
                <div className="text-3xl mb-2">📷</div>
                <p className="text-text-muted text-sm">
                  {formData.images.length >= 9
                    ? t('checkin.maxPhotosReached')
                    : t('checkin.clickToUpload')}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  {t('checkin.optional')}: {t('checkin.maxPhotos')}
                </p>
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => navigate(stakeId ? `/calendar/${stakeId}` : '/checkins')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading || !formData.location}
              >
                {!isConnected
                  ? t('common.connectWallet')
                  : loading
                    ? t('checkin.submitting')
                    : t('checkin.submit')}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>

      {/* Tips Card */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-white">{t('checkin.tips')}</h2>
        </Card.Header>
        <Card.Body>
          <div className="space-y-2 text-sm text-text-muted">
            <p>✓ {t('checkin.tip1')}</p>
            <p>✓ {t('checkin.tip2')}</p>
            <p>✓ {t('checkin.tip3')}</p>
            <p>✓ {t('checkin.tip4')}</p>
            <p>✓ {t('checkin.tip5')}</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
