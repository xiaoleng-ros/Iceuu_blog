'use client';

import { useState, useCallback } from 'react';

export interface ProfileFormData {
  fullName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  site_start_date: string;
}

export function useProfileForm() {
  const [profileData, setProfileData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    bio: '',
    avatarUrl: '',
    site_start_date: '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value || '' }));
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [profileErrors]);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!profileData.fullName.trim()) errors.fullName = '名称不能为空';
    if (!profileData.email.trim()) errors.email = '邮箱不能为空';
    if (!profileData.bio.trim()) errors.bio = '介绍不能为空';
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  }, [profileData]);

  const setData = useCallback((data: Partial<ProfileFormData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  }, []);

  return {
    profileData,
    profileErrors,
    updateField,
    setProfileData: setData,
    validate,
    setProfileErrors
  };
}
