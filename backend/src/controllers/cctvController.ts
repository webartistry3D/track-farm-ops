import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCameras = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    
    console.log(` Fetching CCTV cameras for ${currentUser.role} ${currentUser.name} (ID: ${currentUser.id})`);

    // Query cameras from database, filtered by organization
    let whereClause: any = {};
    
    if (currentUser.organizationId) {
      whereClause.organizationId = currentUser.organizationId;
    }

    const cameras = await prisma.cctvCamera.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add permission flags
    const cameraList = cameras.map(camera => ({
      ...camera,
      canView: true,
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
    
    let whereClause: any = { id: cameraId };
    
    if (currentUser.organizationId) {
      whereClause.organizationId = currentUser.organizationId;
    }

    const camera = await prisma.cctvCamera.findFirst({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    // Check permissions
    const canView = true; // In production, check user permissions
    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      ...camera,
      canView: true,
      canControl: currentUser.role === 'OWNER' || currentUser.role === 'MANAGER'
    });
  } catch (error) {
    console.error('Get camera by ID error:', error);
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

    // Create new camera in database
    const newCamera = await prisma.cctvCamera.create({
      data: {
        name,
        location,
        ipAddress: ipAddress || null,
        resolution: resolution || '1080p',
        status: 'offline',
        recording: false,
        organizationId: currentUser.organizationId || null,
        createdBy: currentUser.id
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(` Camera "${name}" created successfully with ID: ${newCamera.id}`);

    res.status(201).json({
      ...newCamera,
      canView: true,
      canControl: true
    });
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
    
    // Find camera first to check organization access
    const existingCamera = await prisma.cctvCamera.findFirst({
      where: {
        id: cameraId,
        ...(currentUser.organizationId && { organizationId: currentUser.organizationId })
      }
    });
    
    if (!existingCamera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    // Delete the camera
    await prisma.cctvCamera.delete({
      where: { id: cameraId }
    });

    console.log(` Camera "${existingCamera.name}" deleted successfully`);

    res.json({ message: 'Camera deleted successfully', deletedCamera: existingCamera });
  } catch (error) {
    console.error('Delete camera error:', error);
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
    
    // Find and update camera
    const updatedCamera = await prisma.cctvCamera.updateMany({
      where: {
        id: cameraId,
        ...(currentUser.organizationId && { organizationId: currentUser.organizationId })
      },
      data: {
        ...(status !== undefined && { status }),
        ...(recording !== undefined && { recording }),
        lastActive: new Date()
      }
    });
    
    if (updatedCamera.count === 0) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    // Get the updated camera
    const camera = await prisma.cctvCamera.findFirst({
      where: { id: cameraId },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(` Camera ${id} updated successfully`);

    res.json({
      ...camera,
      canView: true,
      canControl: true
    });
  } catch (error) {
    console.error('Update camera status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCameraSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    
    console.log(` Fetching snapshot for camera ${id} for ${currentUser.role} ${currentUser.name}`);

    const cameraId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
    
    let whereClause: any = { id: cameraId };
    
    if (currentUser.organizationId) {
      whereClause.organizationId = currentUser.organizationId;
    }

    const camera = await prisma.cctvCamera.findFirst({
      where: whereClause
    });
    
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    if (camera.status === 'offline') {
      return res.status(400).json({ error: 'Camera is offline' });
    }

    // In production, this would:
    // 1. Connect to actual CCTV system via IP address
    // 2. Capture current frame from camera
    // 3. Return image data or streaming URL
    
    // For now, return a placeholder response
    const snapshot = {
      cameraId: camera.id,
      cameraName: camera.name,
      timestamp: new Date(),
      imageUrl: `https://picsum.photos/seed/camera-${camera.id}-${Date.now()}/1920/1080.jpg`,
      thumbnailUrl: `https://picsum.photos/seed/camera-${camera.id}-${Date.now()}/320/180.jpg`,
      streamingUrl: camera.ipAddress ? `rtsp://${camera.ipAddress}/stream` : null,
      status: 'success'
    };

    res.json(snapshot);
  } catch (error) {
    console.error('Get camera snapshot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
