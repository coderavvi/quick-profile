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

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const tempDir = path.join('/tmp');
    const tempFile = path.join(tempDir, `upload-${Date.now()}-${file.name}`);

    // Write buffer to temporary file
    await fs.writeFile(tempFile, Buffer.from(buffer));

    let result;
    let fileType = 'image';

    try {
      // Detect file type based on magic bytes
      const fileBuffer = await fs.readFile(tempFile);
      const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

      if (fileBuffer.slice(0, 4).equals(pdfSignature)) {
        fileType = 'pdf';
        // Upload PDFs as 'auto' for better iframe compatibility
        result = await cloudinary.uploader.upload(tempFile, {
          folder: 'quickprofile',
          resource_type: 'auto',
          type: 'upload',
        });
      } else {
        // Explicitly set resource_type for images
        result = await cloudinary.uploader.upload(tempFile, {
          folder: 'quickprofile',
          resource_type: 'image',
          type: 'upload',
        });
      }

      await fs.unlink(tempFile);

      return NextResponse.json({
        url: result.secure_url,
        fileType,
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
