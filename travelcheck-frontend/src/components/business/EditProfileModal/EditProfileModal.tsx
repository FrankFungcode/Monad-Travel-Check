/**
 * @file EditProfileModal Component
 * @description Modal for editing user profile
 */

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { type UserProfile, saveProfile, imageToBase64 } from "@/services/db.service";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nickname: "",
    bio: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState("");

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        nickname: profile.nickname || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "",
      });
      setPreviewAvatar(profile.avatar || "");
    }
  }, [isOpen, profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert(t("editProfile.invalidImageType"));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t("editProfile.imageTooLarge"));
      return;
    }

    try {
      const base64 = await imageToBase64(file);
      setFormData((prev) => ({ ...prev, avatar: base64 }));
      setPreviewAvatar(base64);
    } catch (error) {
      console.error("Failed to convert image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        nickname: formData.nickname.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
        updatedAt: Date.now(),
      };

      await saveProfile(updatedProfile);
      onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert(t("editProfile.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  // Generate default avatar URL based on wallet address
  const defaultAvatarUrl = profile?.walletAddress
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.walletAddress}`
    : "";

  const displayAvatar = previewAvatar || defaultAvatarUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("editProfile.title")}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div
            className="relative cursor-pointer group"
            onClick={handleAvatarClick}
          >
            <img
              src={displayAvatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-primary object-cover"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-text-muted mt-2">
            {t("editProfile.clickToChangeAvatar")}
          </p>
        </div>

        {/* Nickname */}
        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("editProfile.nickname")}
          </label>
          <Input
            id="nickname"
            type="text"
            placeholder={t("editProfile.nicknamePlaceholder")}
            value={formData.nickname}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nickname: e.target.value }))
            }
            maxLength={20}
          />
          <p className="text-xs text-text-muted mt-1">
            {formData.nickname.length}/20
          </p>
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-white mb-2"
          >
            {t("editProfile.bio")}
          </label>
          <textarea
            id="bio"
            placeholder={t("editProfile.bioPlaceholder")}
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            maxLength={200}
            rows={3}
            className="w-full px-4 py-3 bg-background-darker border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
          <p className="text-xs text-text-muted mt-1">
            {formData.bio.length}/200
          </p>
        </div>

        {/* Wallet Address (read-only) */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            {t("editProfile.walletAddress")}
          </label>
          <div className="px-4 py-3 bg-background-darker/50 border border-white/5 rounded-xl text-text-muted font-mono text-sm break-all">
            {profile?.walletAddress}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="flex-1"
          >
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;
