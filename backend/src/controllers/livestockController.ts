import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createActivityNotification, NotificationActivityType, formatNotificationMessage } from '../utils/notificationHelper';

const prisma = new PrismaClient();

// Get all livestock for the organization
export const getLivestock = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const livestock = await prisma.livestock.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(livestock);
  } catch (error: any) {
    console.error('Error fetching livestock:', error);
    res.status(500).json({ error: 'Failed to fetch livestock' });
  }
};

// Create new livestock
export const createLivestock = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const {
      name,
      tagId,
      species,
      breed,
      dateOfBirth,
      gender,
      weight,
      location,
      healthStatus,
      notes
    } = req.body;

    // Check if tag ID is unique within organization
    const existingLivestock = await prisma.livestock.findFirst({
      where: {
        tagId,
        organizationId
      }
    });

    if (existingLivestock) {
      return res.status(400).json({ error: 'Tag ID already exists in this organization' });
    }

    const livestock = await prisma.livestock.create({
      data: {
        name,
        tagId,
        species: species.toUpperCase(),
        breed,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender.toUpperCase(),
        weight: parseFloat(weight),
        location,
        healthStatus: healthStatus ? healthStatus.toUpperCase() : 'HEALTHY',
        notes,
        organizationId,
        lastCheckup: new Date()
      }
    });

    // Send notification to owner/managers
    await createActivityNotification(
      NotificationActivityType.LIVESTOCK_CREATED,
      user.id,
      organizationId,
      {
        title: 'New Livestock Added',
        message: formatNotificationMessage(NotificationActivityType.LIVESTOCK_CREATED, user.name, name),
        relatedEntity: 'livestock',
        relatedEntityId: livestock.id,
        metadata: { species, breed, tagId }
      }
    );

    res.status(201).json(livestock);
  } catch (error: any) {
    console.error('Error creating livestock:', error);
    res.status(500).json({ error: 'Failed to create livestock' });
  }
};

// Update livestock
export const updateLivestock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const livestockId = Array.isArray(id) ? id[0] : id;
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const {
      name,
      tagId,
      species,
      breed,
      dateOfBirth,
      gender,
      weight,
      location,
      healthStatus,
      notes
    } = req.body;

    // Verify livestock belongs to organization
    const existingLivestock = await prisma.livestock.findFirst({
      where: {
        id: parseInt(livestockId),
        organizationId
      }
    });

    if (!existingLivestock) {
      return res.status(404).json({ error: 'Livestock not found' });
    }

    // If tag ID is being changed, check uniqueness
    if (tagId && tagId !== existingLivestock.tagId) {
      const tagExists = await prisma.livestock.findFirst({
        where: {
          tagId,
          organizationId,
          id: { not: parseInt(livestockId) }
        }
      });

      if (tagExists) {
        return res.status(400).json({ error: 'Tag ID already exists in this organization' });
      }
    }

    const livestock = await prisma.livestock.update({
      where: { id: parseInt(livestockId) },
      data: {
        ...(name && { name }),
        ...(tagId && { tagId }),
        ...(species && { species: species.toUpperCase() }),
        ...(breed && { breed }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender: gender.toUpperCase() }),
        ...(weight && { weight: parseFloat(weight) }),
        ...(location && { location }),
        ...(healthStatus && { healthStatus: healthStatus.toUpperCase() }),
        ...(notes !== undefined && { notes })
      }
    });

    // Send notification to owner/managers
    await createActivityNotification(
      NotificationActivityType.LIVESTOCK_UPDATED,
      user.id,
      organizationId,
      {
        title: 'Livestock Updated',
        message: formatNotificationMessage(NotificationActivityType.LIVESTOCK_UPDATED, user.name, livestock.name),
        relatedEntity: 'livestock',
        relatedEntityId: livestock.id,
        metadata: { species: livestock.species, breed: livestock.breed, tagId: livestock.tagId }
      }
    );

    res.json(livestock);
  } catch (error: any) {
    console.error('Error updating livestock:', error);
    res.status(500).json({ error: 'Failed to update livestock' });
  }
};

// Delete livestock
export const deleteLivestock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const livestockId = Array.isArray(id) ? id[0] : id;
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Verify livestock belongs to organization
    const existingLivestock = await prisma.livestock.findFirst({
      where: {
        id: parseInt(livestockId),
        organizationId
      }
    });

    if (!existingLivestock) {
      return res.status(404).json({ error: 'Livestock not found' });
    }

    await prisma.livestock.delete({
      where: { id: parseInt(livestockId) }
    });

    res.json({ message: 'Livestock deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting livestock:', error);
    res.status(500).json({ error: 'Failed to delete livestock' });
  }
};

// Get health records for the organization
export const getHealthRecords = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where: { organizationId },
      include: {
        livestock: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(healthRecords);
  } catch (error: any) {
    console.error('Error fetching health records:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
};

// Create health record
export const createHealthRecord = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const {
      livestockId,
      recordType,
      date,
      veterinarian,
      diagnosis,
      treatment,
      medications,
      notes,
      followUpDate,
      status
    } = req.body;

    // Verify livestock belongs to organization
    const livestock = await prisma.livestock.findFirst({
      where: {
        id: parseInt(livestockId),
        organizationId
      }
    });

    if (!livestock) {
      return res.status(404).json({ error: 'Livestock not found' });
    }

    const healthRecord = await prisma.healthRecord.create({
      data: {
        livestockId: parseInt(livestockId),
        recordType: recordType.toUpperCase(),
        date: new Date(date),
        veterinarian,
        diagnosis,
        treatment,
        medications,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        status: status ? status.toUpperCase() : 'SCHEDULED',
        organizationId,
        userId: user.id
      }
    });

    // Update livestock last checkup if it's a checkup
    if (recordType.toUpperCase() === 'CHECKUP') {
      await prisma.livestock.update({
        where: { id: parseInt(livestockId) },
        data: { lastCheckup: new Date(date) }
      });
    }

    // Send notification to owner/managers
    await createActivityNotification(
      NotificationActivityType.HEALTH_RECORD_CREATED,
      user.id,
      organizationId,
      {
        title: 'Health Record Created',
        message: formatNotificationMessage(NotificationActivityType.HEALTH_RECORD_CREATED, user.name, livestock.name),
        relatedEntity: 'health_record',
        relatedEntityId: healthRecord.id,
        metadata: { recordType, veterinarian, livestockId: parseInt(livestockId) }
      }
    );

    res.status(201).json(healthRecord);
  } catch (error: any) {
    console.error('Error creating health record:', error);
    res.status(500).json({ error: 'Failed to create health record' });
  }
};

// Get vaccinations for the organization
export const getVaccinations = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const vaccinations = await prisma.vaccination.findMany({
      where: { organizationId },
      include: {
        livestock: true
      },
      orderBy: { administrationDate: 'desc' }
    });

    res.json(vaccinations);
  } catch (error: any) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({ error: 'Failed to fetch vaccinations' });
  }
};

// Create vaccination
export const createVaccination = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organizationId = user.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const {
      livestockId,
      vaccineName,
      vaccineType,
      administrationDate,
      nextDueDate,
      veterinarian,
      batchNumber,
      notes
    } = req.body;

    // Verify livestock belongs to organization
    const livestock = await prisma.livestock.findFirst({
      where: {
        id: parseInt(livestockId),
        organizationId
      }
    });

    if (!livestock) {
      return res.status(404).json({ error: 'Livestock not found' });
    }

    const vaccination = await prisma.vaccination.create({
      data: {
        livestockId: parseInt(livestockId),
        vaccineName,
        vaccineType,
        administrationDate: new Date(administrationDate),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        veterinarian,
        batchNumber,
        notes,
        organizationId
      }
    });

    // Send notification to owner/managers
    await createActivityNotification(
      NotificationActivityType.VACCINATION_CREATED,
      user.id,
      organizationId,
      {
        title: 'Vaccination Recorded',
        message: formatNotificationMessage(NotificationActivityType.VACCINATION_CREATED, user.name, livestock.name),
        relatedEntity: 'vaccination',
        relatedEntityId: vaccination.id,
        metadata: { vaccineName, vaccineType, veterinarian, livestockId: parseInt(livestockId) }
      }
    );

    res.status(201).json(vaccination);
  } catch (error: any) {
    console.error('Error creating vaccination:', error);
    res.status(500).json({ error: 'Failed to create vaccination' });
  }
};
