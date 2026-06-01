import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { 
  Camera, 
  CameraOff, 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Settings, 
  AlertTriangle,
  Eye,
  EyeOff,
  Maximize2,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  MapPin,
  Battery,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';
import { CCTVSkeleton } from './EnhancedSkeletons';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'recording' | 'motion';
  quality: 'HD' | 'Full HD' | '4K';
  lastActivity: string;
  batteryLevel?: number;
  signalStrength?: 'strong' | 'medium' | 'weak';
  nightVision: boolean;
  audioEnabled: boolean;
  motionDetection: boolean;
  recordingEnabled: boolean;
  ipAddress?: string;
}

const CCTV = () => {
  const { user } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cameras from API
  const fetchCameras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/cctv/cameras');
      const camerasData = response.data || [];
      
      // Transform API data to match Camera interface
      const transformedCameras = camerasData.map((cam: any) => ({
        id: cam.id.toString(),
        name: cam.name || `Camera ${cam.id}`,
        location: cam.location || 'Unknown Location',
        status: cam.status || 'offline',
        quality: cam.quality || 'HD',
        lastActivity: cam.lastActivity || 'Unknown',
        batteryLevel: cam.batteryLevel,
        signalStrength: cam.signalStrength,
        nightVision: cam.nightVision || false,
        audioEnabled: cam.audioEnabled || false,
        motionDetection: cam.motionDetection || false,
        recordingEnabled: cam.recordingEnabled || false,
        ipAddress: cam.ipAddress
      }));
      
      setCameras(transformedCameras);
      console.log(`✅ Loaded ${transformedCameras.length} cameras from API`);
    } catch (err: any) {
      console.error('❌ Failed to fetch cameras:', err);
      setError(err.response?.data?.error || 'Failed to load cameras');
      
      // Start with empty camera list for production
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cameras on component mount
  useEffect(() => {
    fetchCameras();
  }, []);

  // Add new camera
  const addCamera = async (cameraData: Partial<Camera>) => {
    try {
      const response = await api.post('/cctv/cameras', cameraData);
      const newCamera = response.data;
      
      // Transform and add to local state
      const transformedCamera = {
        id: newCamera.id.toString(),
        name: newCamera.name || `Camera ${newCamera.id}`,
        location: newCamera.location || 'Unknown Location',
        status: 'offline' as const,
        quality: newCamera.quality || 'HD',
        lastActivity: 'Never connected',
        batteryLevel: newCamera.batteryLevel,
        signalStrength: newCamera.signalStrength,
        nightVision: newCamera.nightVision || false,
        audioEnabled: newCamera.audioEnabled || false,
        motionDetection: newCamera.motionDetection || false,
        recordingEnabled: newCamera.recordingEnabled || false,
        ipAddress: newCamera.ipAddress || ''
      };
      
      setCameras(prev => [...prev, transformedCamera]);
      console.log(`✅ Added new camera: ${transformedCamera.name}`);
      return transformedCamera;
    } catch (err: any) {
      console.error('❌ Failed to add camera:', err);
      
      // Fallback to local creation for demo
      const newId = `CAM${Date.now()}`;
      const newCamera: Camera = {
        id: newId,
        name: cameraData.name || 'New Camera',
        location: cameraData.location || 'Unknown Location',
        status: 'offline',
        quality: cameraData.quality || 'HD',
        lastActivity: 'Never connected',
        batteryLevel: cameraData.batteryLevel,
        signalStrength: cameraData.signalStrength,
        nightVision: cameraData.nightVision || false,
        audioEnabled: cameraData.audioEnabled || false,
        motionDetection: cameraData.motionDetection || false,
        recordingEnabled: cameraData.recordingEnabled || false,
        ipAddress: cameraData.ipAddress || ''
      };
      
      setCameras(prev => [...prev, newCamera]);
      console.log(`✅ Added camera locally: ${newCamera.name}`);
      return newCamera;
    }
  };

  // Show add camera dialog
  const [showAddCamera, setShowAddCamera] = useState(false);

  // Update camera configuration
  const updateCameraConfig = async (cameraId: string, updates: Partial<Camera>) => {
    try {
      await api.put(`/cctv/cameras/${cameraId}`, updates);
      
      // Update local state
      setCameras(prev => prev.map(cam => 
        cam.id === cameraId ? { ...cam, ...updates } : cam
      ));
      
      console.log(`✅ Updated camera ${cameraId} configuration`);
    } catch (err: any) {
      console.error('❌ Failed to update camera:', err);
      // Still update local state for better UX
      setCameras(prev => prev.map(cam => 
        cam.id === cameraId ? { ...cam, ...updates } : cam
      ));
    }
  };

  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [volume, setVolume] = useState<{ [key: string]: boolean }>({});
  const [, setFullscreen] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState<{ [key: string]: boolean }>({});
  const [showSettings, setShowSettings] = useState(false);

  // Check if user has appropriate role
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">Please log in to view CCTV feeds.</div>
        </div>
      </div>
    );
  }

  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER';

  if (!isOwner) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">Access Restricted</h3>
        <p className="text-yellow-700 dark:text-yellow-300">
          CCTV monitoring is only available to farm owners and managers.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: Camera['status']) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'offline': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'recording': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'motion': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSignalIcon = (strength: string) => {
    switch (strength) {
      case 'strong': return <Wifi className="h-4 w-4 text-green-500" />;
      case 'medium': return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'weak': return <WifiOff className="h-4 w-4 text-red-500" />;
      default: return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const togglePlayback = (cameraId: string) => {
    setIsPlaying(prev => ({ ...prev, [cameraId]: !prev[cameraId] }));
  };

  const getLiveFeedUrl = (camera: Camera) => {
    if (!camera.ipAddress) {
      return null;
    }
    
    // Support different camera URL formats
    const ip = camera.ipAddress;
    
    // If it already includes protocol, return as-is
    if (ip.startsWith('http://') || ip.startsWith('https://') || ip.startsWith('rtsp://')) {
      return ip;
    }
    
    // Default to HTTP MJPEG stream format
    return `http://${ip}/mjpg/video.mjpg`;
  };

  const connectToCamera = (camera: Camera) => {
    const feedUrl = getLiveFeedUrl(camera);
    if (!feedUrl) {
      console.log(`No IP address configured for camera ${camera.name}`);
      return;
    }
    
    console.log(`Connecting to camera ${camera.name} at ${feedUrl}`);
    // In a real implementation, you would establish WebRTC or HTTP stream connection here
  };

  // Update camera IP address
  const updateCameraIpAddress = (cameraId: string, ipAddress: string) => {
    updateCameraConfig(cameraId, { ipAddress });
  };

  // Toggle camera features
  const toggleCameraFeature = (cameraId: string, feature: keyof Camera) => {
    const camera = cameras.find(cam => cam.id === cameraId);
    if (camera) {
      const currentValue = camera[feature] as boolean;
      updateCameraConfig(cameraId, { [feature]: !currentValue });
      
      // Update selected camera if in settings modal
      if (selectedCamera?.id === cameraId) {
        setSelectedCamera(prev => prev ? { ...prev, [feature]: !currentValue } : null);
      }
    }
  };

  const toggleVolume = (cameraId: string) => {
    setVolume(prev => ({ ...prev, [cameraId]: !prev[cameraId] }));
  };

  const refreshCamera = async (cameraId: string) => {
    setRefreshing(prev => ({ ...prev, [cameraId]: true }));
    
    // Simulate camera refresh with timeout
    setTimeout(() => {
      // Update last activity timestamp
      setCameras(prev => prev.map(camera => 
        camera.id === cameraId 
          ? { ...camera, lastActivity: 'Just now' }
          : camera
      ));
      setRefreshing(prev => ({ ...prev, [cameraId]: false }));
      console.log(`Camera ${cameraId} refreshed`);
    }, 1500);
  };

  const downloadRecording = (cameraId: string, cameraName: string) => {
    // Simulate download functionality
    const link = document.createElement('a');
    link.href = '#'; // In real app, this would be the actual video URL
    link.download = `${cameraName.replace(/\s+/g, '_')}_recording_${Date.now()}.mp4`;
    link.click();
    console.log(`Downloading recording from camera ${cameraId}`);
  };

  const toggleFullscreen = async (cameraId: string) => {
    const element = document.getElementById(`camera-feed-${cameraId}`);
    
    if (!document.fullscreenElement) {
      try {
        await element?.requestFullscreen();
        setFullscreen(prev => ({ ...prev, [cameraId]: true }));
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setFullscreen(prev => ({ ...prev, [cameraId]: false }));
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  const openSettings = (camera: Camera) => {
    setSelectedCamera(camera);
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
    setSelectedCamera(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/*<div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                CCTV Camera Feeds
              </h1>
            </div>*/}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddCamera(true)}
                className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Camera
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'focus' : 'grid')}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {viewMode === 'grid' ? <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Camera Grid */}
        {loading ? (
          <CCTVSkeleton />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Camera Feed */}
                <div id={`camera-feed-${camera.id}`} className="relative aspect-video bg-gray-900 dark:bg-black">
                  {camera.ipAddress ? (
                    <img
                      src={getLiveFeedUrl(camera) || ''}
                      alt={`${camera.name} Live Feed`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Failed to load camera feed for ${camera.name}:`, e);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                      onLoad={() => {
                        console.log(`Camera feed loaded for ${camera.name}`);
                        connectToCamera(camera);
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback/Placeholder */}
                  <div className={`absolute inset-0 flex items-center justify-center ${camera.ipAddress ? 'hidden' : ''}`}>
                    {camera.status === 'offline' ? (
                      <CameraOff className="h-12 w-12 text-gray-500" />
                    ) : camera.ipAddress ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-gray-500 text-sm">Connecting...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm">Configure IP Address</p>
                        <button
                          onClick={() => openSettings(camera)}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Settings
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(camera.status)}`}>
                    {camera.status.toUpperCase()}
                  </div>
                  
                  {/* Recording Indicator */}
                  {camera.status === 'recording' && (
                    <div className="absolute top-2 left-2 flex items-center">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="ml-1 text-xs text-red-600 font-medium">REC</span>
                    </div>
                  )}
                  
                  {/* Motion Alert */}
                  {camera.status === 'motion' && (
                    <div className="absolute top-2 left-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="ml-1 text-xs text-orange-600 font-medium">MOTION</span>
                    </div>
                  )}
                </div>

                {/* Camera Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{camera.name}</h3>
                    <div className="flex items-center space-x-2">
                      {getSignalIcon(camera.signalStrength || 'medium')}
                      {camera.batteryLevel && (
                        <div className="flex items-center">
                          <Battery className={`h-4 w-4 ${getBatteryColor(camera.batteryLevel)}`} />
                          <span className={`text-xs ml-1 ${getBatteryColor(camera.batteryLevel)}`}>{camera.batteryLevel}%</span>
                        </div>
                      )}
                      <button
                        onClick={() => openSettings(camera)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{camera.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{camera.lastActivity}</span>
                        </div>
                      </div>
                      <span>Quality: {camera.quality}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePlayback(camera.id)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {isPlaying[camera.id] ? <Pause className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <Play className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      </button>
                      <button
                        onClick={() => toggleVolume(camera.id)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {volume[camera.id] ? <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <VolumeX className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => refreshCamera(camera.id)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        disabled={refreshing[camera.id]}
                      >
                        <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${refreshing[camera.id] ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => toggleFullscreen(camera.id)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        onClick={() => downloadRecording(camera.id, camera.name)}
                        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cameras Found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error ? 'Failed to load cameras from server.' : 'No cameras have been configured yet.'}
            </p>
            <button
              onClick={fetchCameras}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {error ? 'Retry' : 'Refresh'}
            </button>
          </div>
        ) : (
          /* Focus View */
          <div className="space-y-6">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Large Camera Feed */}
                  <div className="lg:col-span-2">
                    <div className="relative aspect-video bg-gray-900 dark:bg-black rounded-lg overflow-hidden" id={`camera-feed-${camera.id}`}>
                      {camera.ipAddress ? (
                        <img
                          src={getLiveFeedUrl(camera) || ''}
                          alt={`${camera.name} Live Feed`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load camera feed for ${camera.name}:`, e);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                          onLoad={() => {
                            console.log(`Camera feed loaded for ${camera.name}`);
                            connectToCamera(camera);
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback/Placeholder */}
                      <div className={`absolute inset-0 flex items-center justify-center ${camera.ipAddress ? 'hidden' : ''}`}>
                        {camera.status === 'offline' ? (
                          <CameraOff className="h-16 w-16 text-gray-500" />
                        ) : camera.ipAddress ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                            <p className="text-gray-500">Connecting...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Camera className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-gray-500">Configure IP Address</p>
                            <button
                              onClick={() => openSettings(camera)}
                              className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Configure Settings
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Status Indicators */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(camera.status)}`}>
                        {camera.status.toUpperCase()}
                      </div>
                      
                      {camera.status === 'recording' && (
                        <div className="absolute top-4 left-4 flex items-center">
                          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                          <span className="ml-2 text-sm text-red-600 font-medium">RECORDING</span>
                        </div>
                      )}
                      
                      {camera.status === 'motion' && (
                        <div className="absolute top-4 left-4 flex items-center">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <span className="ml-2 text-sm text-orange-600 font-medium">MOTION DETECTED</span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex items-center justify-center space-x-4 mt-4">
                      <button
                        onClick={() => togglePlayback(camera.id)}
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {isPlaying[camera.id] ? <Pause className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <Play className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                      </button>
                      <button
                        onClick={() => toggleVolume(camera.id)}
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {volume[camera.id] ? <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <VolumeX className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                      </button>
                      <button
                        onClick={() => refreshCamera(camera.id)}
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        disabled={refreshing[camera.id]}
                      >
                        <RefreshCw className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${refreshing[camera.id] ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => toggleFullscreen(camera.id)}
                        className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        onClick={() => downloadRecording(camera.id, camera.name)}
                        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Camera Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{camera.name}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-3" />
                          <span>{camera.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-3" />
                          <span>{camera.lastActivity}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Monitor className="h-4 w-4 mr-3" />
                          <span>Quality: {camera.quality}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Details */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Status Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Signal</span>
                          <div className="flex items-center">
                            {getSignalIcon(camera.signalStrength || 'medium')}
                            <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">{camera.signalStrength}</span>
                          </div>
                        </div>
                        {camera.batteryLevel && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Battery</span>
                            <div className="flex items-center">
                              <Battery className={`h-4 w-4 mr-2 ${getBatteryColor(camera.batteryLevel)}`} />
                              <span className={`text-sm font-medium ${getBatteryColor(camera.batteryLevel)}`}>{camera.batteryLevel}%</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Night Vision</span>
                          <div className="flex items-center">
                            {camera.nightVision ? <Eye className="h-4 w-4 text-blue-500" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">{camera.nightVision ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Audio</span>
                          <div className="flex items-center">
                            {camera.audioEnabled ? <Volume2 className="h-4 w-4 text-green-500" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">{camera.audioEnabled ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Motion Detection</span>
                          <div className="flex items-center">
                            {camera.motionDetection ? <Zap className="h-4 w-4 text-orange-500" /> : <Square className="h-4 w-4 text-gray-400" />}
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">{camera.motionDetection ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Recording</span>
                          <div className="flex items-center">
                            {camera.recordingEnabled ? <Square className="h-4 w-4 text-red-500" /> : <Square className="h-4 w-4 text-gray-400" />}
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">{camera.recordingEnabled ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 py-8">
          {/* First Row: Total Cameras and Online */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{cameras.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {cameras.filter(c => c.status === 'online' || c.status === 'recording').length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Second Row: Offline and Motion Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <EyeOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {cameras.filter(c => c.status === 'offline').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Motion</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {cameras.filter(c => c.status === 'motion').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Modal */}
        {showSettings && selectedCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Camera Settings - {selectedCamera.name}
                  </h2>
                  <button
                    onClick={closeSettings}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Camera ID</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedCamera.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedCamera.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quality</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{selectedCamera.quality}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IP Address</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCamera.ipAddress || 'Not configured'}
                      </span>
                      <button
                        onClick={() => {
                          const newIp = prompt('Enter IP camera address (e.g., 192.168.1.100:8080):', selectedCamera.ipAddress || '');
                          if (newIp !== null) {
                            updateCameraIpAddress(selectedCamera.id, newIp);
                            setSelectedCamera(prev => prev ? { ...prev, ipAddress: newIp } : null);
                          }
                        }}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Toggle Features</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Night Vision</span>
                        <button
                          onClick={() => {
                            toggleCameraFeature(selectedCamera.id, 'nightVision');
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedCamera.nightVision ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedCamera.nightVision ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Audio</span>
                        <button
                          onClick={() => {
                            toggleCameraFeature(selectedCamera.id, 'audioEnabled');
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedCamera.audioEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedCamera.audioEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Motion Detection</span>
                        <button
                          onClick={() => {
                            toggleCameraFeature(selectedCamera.id, 'motionDetection');
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedCamera.motionDetection ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedCamera.motionDetection ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Recording</span>
                        <button
                          onClick={() => {
                            toggleCameraFeature(selectedCamera.id, 'recordingEnabled');
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            selectedCamera.recordingEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedCamera.recordingEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeSettings}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Camera Modal */}
        {showAddCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New Camera
                  </h2>
                  <button
                    onClick={() => setShowAddCamera(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Camera Name
                    </label>
                    <input
                      type="text"
                      id="cameraName"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Main Entrance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="cameraLocation"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Front Gate"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IP Address (Optional)
                    </label>
                    <input
                      type="text"
                      id="cameraIP"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 192.168.1.100:8080"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quality
                    </label>
                    <select
                      id="cameraQuality"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="HD">HD</option>
                      <option value="Full HD">Full HD</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddCamera(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const name = (document.getElementById('cameraName') as HTMLInputElement)?.value;
                      const location = (document.getElementById('cameraLocation') as HTMLInputElement)?.value;
                      const ipAddress = (document.getElementById('cameraIP') as HTMLInputElement)?.value;
                      const quality = (document.getElementById('cameraQuality') as HTMLSelectElement)?.value as 'HD' | 'Full HD' | '4K';
                      
                      if (name && location) {
                        addCamera({
                          name,
                          location,
                          ipAddress,
                          quality,
                          status: 'offline',
                          lastActivity: 'Never connected',
                          nightVision: false,
                          audioEnabled: false,
                          motionDetection: false,
                          recordingEnabled: false
                        });
                        setShowAddCamera(false);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Camera
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CCTV;
