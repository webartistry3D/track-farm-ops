import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// In-memory storage for cameras (in production, use database)
let cameras: any[] = [];

export const getCameras = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    
    console.log(` Fetching CCTV cameras for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);

    // In a real implementation, you would:
    // 1. Filter cameras based on user's organization/permissions
    // 2. Query actual CCTV system or database
    // 3. Check real-time status
    
    const cameraList = cameras.map(camera => ({
      ...camera,
      canView: true, // In production, check user permissions
      canControl: currentUser.role === 'OWNER' || currentUser.role === 'MANAGER'
    }));

    console.log(` Found ${cameraList.length} cameras for ${currentUser.role} ${currentUser.name}`);

    res.json(cameraList);
  } catch (error) {
    console.error('Get cameras error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCameraById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    
    console.log(` Fetching camera ${id} for ${currentUser.role} ${currentUser.name}`);

    const cameraId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    const camera = cameras.find(c => c.id === cameraId);
    
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    // Check permissions
    const canView = true; // In production, check user permissions
    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(camera);
  } catch (error) {
    console.error('Get camera by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCameraStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, recording } = req.body;
    const currentUser = req.user!;
    
    console.log(` Updating camera ${id} status for ${currentUser.role} ${currentUser.name}`);

    // Check permissions - only owners and managers can control cameras
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Only owners and managers can control cameras.' });
    }

    const cameraId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    const cameraIndex = cameras.findIndex(c => c.id === cameraId);
    
    if (cameraIndex === -1) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    // Update camera status (in production, this would send commands to actual CCTV system)
    if (status !== undefined) {
      cameras[cameraIndex].status = status;
    }
    if (recording !== undefined) {
      cameras[cameraIndex].recording = recording;
    }
    cameras[cameraIndex].lastActive = new Date();

    console.log(` Camera ${id} updated successfully`);

    res.json(cameras[cameraIndex]);
  } catch (error) {
    console.error('Update camera status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCamera = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, ipAddress, resolution } = req.body;
    const currentUser = req.user!;
    
    console.log(` Creating camera "${name}" for ${currentUser.role} ${currentUser.name}`);

    // Check permissions - only owners and managers can create cameras
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Only owners and managers can create cameras.' });
    }

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    // Create new camera with auto-incrementing ID
    const newId = cameras.length > 0 ? Math.max(...cameras.map(c => c.id)) + 1 : 1;
    const newCamera = {
      id: newId,
      name,
      location,
      ipAddress: ipAddress || `192.168.1.${100 + newId}`,
      resolution: resolution || '1080p',
      status: 'offline',
      recording: false,
      lastActive: new Date(),
      createdAt: new Date()
    };

    cameras.push(newCamera);

    console.log(` Camera "${name}" created successfully with ID: ${newId}`);

    res.status(201).json(newCamera);
  } catch (error) {
    console.error('Create camera error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCamera = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    
    console.log(` Deleting camera ${id} for ${currentUser.role} ${currentUser.name}`);

    // Check permissions - only owners and managers can delete cameras
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied. Only owners and managers can delete cameras.' });
    }

    const cameraId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    const cameraIndex = cameras.findIndex(c => c.id === cameraId);
    
    if (cameraIndex === -1) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    const deletedCamera = cameras[cameraIndex];
    cameras.splice(cameraIndex, 1);

    console.log(` Camera "${deletedCamera.name}" deleted successfully`);

    res.json({ message: 'Camera deleted successfully', deletedCamera });
  } catch (error) {
    console.error('Delete camera error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCameraSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    
    console.log(` Fetching snapshot for camera ${id} for ${currentUser.role} ${currentUser.name}`);

    const cameraId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    const camera = cameras.find(c => c.id === cameraId);
    
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    if (camera.status === 'offline') {
      return res.status(400).json({ error: 'Camera is offline' });
    }

    // In production, this would:
    // 1. Connect to actual CCTV system
    // 2. Capture current frame
    // 3. Return image data or URL
    
    // Mock response - return a placeholder image URL
    const snapshot = {
      cameraId: camera.id,
      timestamp: new Date(),
      imageUrl: `https://picsum.photos/seed/camera-${camera.id}-${Date.now()}/1920/1080.jpg`,
      thumbnailUrl: `https://picsum.photos/seed/camera-${camera.id}-${Date.now()}/320/180.jpg`
    };

    res.json(snapshot);
  } catch (error) {
    console.error('Get camera snapshot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
