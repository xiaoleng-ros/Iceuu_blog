export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface SiteFormData {
  footer_text: string;
  github_url: string;
  gitee_url: string;
  qq_url: string;
  wechat_url: string;
  douyin_url: string;
  home_background_url: string;
}

export interface ProfileData {
  fullName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  site_start_date: string;
}

export interface BackgroundSectionProps {
  formData: { home_background_url: string };
  uploading: boolean;
  handleRemoveBackground: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface ProfileSectionProps {
  profileData: ProfileData;
  profileErrors: Record<string, string>;
  profileSaving: boolean;
  uploadingAvatar: boolean;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  profileFileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface SocialLinksSectionProps {
  formData: SiteFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FooterSettingsSectionProps {
  formData: SiteFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}
