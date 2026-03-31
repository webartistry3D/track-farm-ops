import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Edit2 } from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';
import api from '../lib/api';

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  organization?: {
    name: string;
  };
  createdAt: string;
  lastPasswordChange?: string;
  passwordChangeCount?: number;
  profileImageUrl?: string;
}

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/auth/profile');
      setProfileData(response.data);
      setEditForm({
        name: response.data.name,
        phone: response.data.phone || ''
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaveLoading(true);
      setError(null);

      await api.put('/auth/profile', editForm);
      
      if (profileData) {
        setProfileData({
          ...profileData,
          name: editForm.name,
          phone: editForm.phone
        });
      }

      setIsEditingProfile(false);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    console.log('Password changed successfully');
    fetchProfileData();
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploadLoading(true);
      setError(null); // Clear any previous errors
      
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Upload to backend
      const response = await api.post('/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update profile data with new image URL
      if (profileData) {
        setProfileData({
          ...profileData,
          profileImageUrl: response.data.profileImageUrl
        });
      }
      
      console.log('Profile image uploaded successfully:', response.data);
      
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload profile image';
      setError(errorMessage);
      // Revert to previous image on error
      setProfileImage(null);
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      case 'manager': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'worker': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'superuser': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">{error || 'Profile data not available'}</p>
          <button 
            onClick={fetchProfileData}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Simple Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-lg font-medium text-gray-700 dark:text-gray-300">
            {profileData.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-medium text-gray-900 dark:text-white">{profileData.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(profileData.role)}`}>
                {profileData.role}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Member since {formatDate(profileData.createdAt)}
              </span>
            </div>
          </div>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'security'
                ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Profile Image */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Photo</h3>
                  
                  <div className="flex flex-col items-center space-y-4">
                    {/* Profile Image */}
                    <div className="relative group">
                      <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {(profileImage || profileData?.profileImageUrl) ? (
                          <img 
                            src={profileImage || profileData?.profileImageUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : profileData.name ? (
                          <div className="text-4xl font-bold text-gray-600 dark:text-gray-300">
                            {profileData.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                        )}
                      </div>
                      
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <label htmlFor="profile-upload" className="cursor-pointer">
                          <div className="text-white text-center">
                            {imageUploadLoading ? (
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                            ) : (
                              <>
                                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-xs">Change Photo</p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {/* Hidden File Input */}
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={imageUploadLoading}
                    />
                    
                    {/* Upload Button */}
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <div className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        imageUploadLoading 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>
                        {imageUploadLoading ? 'Uploading...' : 'Upload New Photo'}
                      </div>
                    </label>
                    
                    {/* Profile Actions */}
                    <div className="flex gap-3 w-full">
                      <button 
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={imageUploadLoading}
                      >
                        Save Changes
                      </button>
                      <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={imageUploadLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Profile Stats */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(profileData.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Role</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(profileData.role)}`}>
                        {profileData.role}
                      </span>
                    </div>
                    {profileData.lastPasswordChange && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Password Change</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(profileData.lastPasswordChange)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column - User Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                    </div>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-5">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <User className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        Full Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-all duration-200">
                          <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                              {profileData.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">{profileData.name}</span>
                          <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(profileData.role)}`}>
                            {profileData.role}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Mail className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        Email Address
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-all duration-200">
                        <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-900 dark:text-white font-medium block">{profileData.email}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">Email cannot be changed</span>
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Phone className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        Phone Number
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                          placeholder="Add phone number"
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-all duration-200">
                          <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {profileData.phone || 'Not added'}
                          </span>
                          {!profileData.phone && (
                            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Optional</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Building className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        Organization
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-all duration-200">
                        <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {profileData.organization?.name || 'None'}
                        </span>
                        {!profileData.organization && (
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">No organization assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Actions */}
                {isEditingProfile && (
                  <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={saveLoading}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {saveLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditForm({
                          name: profileData.name,
                          phone: profileData.phone || ''
                        });
                      }}
                      disabled={saveLoading}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <PasswordChangeForm
            onSuccess={handlePasswordChangeSuccess}
            userEmail={profileData.email}
            showTitle={false}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
