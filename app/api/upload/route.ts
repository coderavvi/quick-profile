import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse FormData from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - only accept images
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files (JPG, PNG, GIF, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const tempDir = path.join('/tmp');
    const tempFile = path.join(tempDir, `upload-${Date.now()}-${file.name}`);

    // Write buffer to temporary file
    await fs.writeFile(tempFile, Buffer.from(buffer));

    try {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(tempFile, {
        folder: 'quickprofile',
        resource_type: 'image',
        type: 'upload',
      });

      await fs.unlink(tempFile);

      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (uploadError) {
      // Clean up temporary file
      try {
        await fs.unlink(tempFile);
      } catch {
        // File might not exist
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during upload' },
      { status: 500 }
    );
  }
}
