import { User } from '@supabase/supabase-js';

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface GithubConfigData {
  github_token: string;
  github_owner: string;
  github_repo: string;
  github_branch: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GithubSectionProps {
  githubData: GithubConfigData;
  githubSaving: boolean;
  showGithubToken: boolean;
  setShowGithubToken: (show: boolean) => void;
  handleGithubChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveGithub: (e: React.FormEvent) => void;
}

export interface AccountSecuritySectionProps {
  user: User | null;
  passwordData: PasswordData;
  passwordSaving: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  passwordErrors: Record<string, string>;
  setShowCurrentPassword: (show: boolean) => void;
  setShowNewPassword: (show: boolean) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSavePassword: (e: React.FormEvent) => void;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}
