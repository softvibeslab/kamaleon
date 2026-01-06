// ════════════════════════════════════════════════════════════════
//                    Manifest Service
//                    Dashboard Backend
// ════════════════════════════════════════════════════════════════

import { PrismaClient, ManifestStatus } from '@prisma/client';
import { AppError } from '../middleware/error.js';

const prisma = new PrismaClient();

export const manifestService = {
  async list(tenantId: string, options: {
    status?: ManifestStatus;
    page?: number;
    limit?: number;
  } = {}) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(status && { status }),
    };

    const [manifests, total] = await Promise.all([
      prisma.manifest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.manifest.count({ where }),
    ]);

    return {
      data: manifests,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string, tenantId: string) {
    const manifest = await prisma.manifest.findFirst({
      where: { id, tenantId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!manifest) {
      throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
    }

    return manifest;
  },

  async create(tenantId: string, authorId: string, data: {
    name: string;
    description?: string;
    tags?: string[];
    screens: any[];
  }) {
    const manifest = await prisma.manifest.create({
      data: {
        tenantId,
        authorId,
        name: data.name,
        description: data.description,
        tags: data.tags || [],
        data: { screens: data.screens },
        status: 'draft',
      },
    });

    // Create initial version
    await prisma.manifestVersion.create({
      data: {
        manifestId: manifest.id,
        version: '1.0.0',
        data: { screens: data.screens },
      },
    });

    return manifest;
  },

  async update(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    tags?: string[];
    screens?: any[];
  }) {
    const existing = await prisma.manifest.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
    }

    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.tags && { tags: data.tags }),
    };

    if (data.screens) {
      updateData.data = { screens: data.screens };

      // Increment version
      const parts = existing.version.split('.');
      parts[2] = String(parseInt(parts[2]) + 1);
      updateData.version = parts.join('.');

      // Create version snapshot
      await prisma.manifestVersion.create({
        data: {
          manifestId: id,
          version: updateData.version,
          data: { screens: data.screens },
        },
      });
    }

    return prisma.manifest.update({
      where: { id },
      data: updateData,
    });
  },

  async publish(id: string, tenantId: string) {
    const manifest = await prisma.manifest.findFirst({
      where: { id, tenantId },
    });

    if (!manifest) {
      throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
    }

    if (manifest.status === 'published') {
      throw new AppError(400, 'ALREADY_PUBLISHED', 'Manifest is already published');
    }

    return prisma.manifest.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  },

  async archive(id: string, tenantId: string) {
    const manifest = await prisma.manifest.findFirst({
      where: { id, tenantId },
    });

    if (!manifest) {
      throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
    }

    return prisma.manifest.update({
      where: { id },
      data: { status: 'archived' },
    });
  },

  async rollback(id: string, tenantId: string, targetVersion: string) {
    const manifest = await prisma.manifest.findFirst({
      where: { id, tenantId },
      include: { versions: true },
    });

    if (!manifest) {
      throw new AppError(404, 'NOT_FOUND', 'Manifest not found');
    }

    const version = manifest.versions.find(v => v.version === targetVersion);
    if (!version) {
      throw new AppError(404, 'VERSION_NOT_FOUND', 'Version not found');
    }

    // Create new version with rollback data
    const parts = manifest.version.split('.');
    parts[2] = String(parseInt(parts[2]) + 1);
    const newVersion = parts.join('.');

    await prisma.manifestVersion.create({
      data: {
        manifestId: id,
        version: newVersion,
        data: version.data,
      },
    });

    return prisma.manifest.update({
      where: { id },
      data: {
        version: newVersion,
        data: version.data,
      },
    });
  },

  // Get published manifests for mobile sync
  async getPublishedForSync(tenantId: string, since?: string) {
    const where: any = {
      tenantId,
      status: 'published',
    };

    if (since) {
      where.updatedAt = { gt: new Date(since) };
    }

    return prisma.manifest.findMany({
      where,
      select: {
        id: true,
        name: true,
        version: true,
        data: true,
        updatedAt: true,
      },
    });
  },
};
