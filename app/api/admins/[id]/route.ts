import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import { Types } from 'mongoose';
import bcryptjs from 'bcryptjs';

// PUT /api/admins/[id] - Update admin (password change)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const data = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    const admin = await Admin.findById(id).select('+password');

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // If password is being changed
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        );
      }

      const isPasswordValid = await admin.matchPassword(data.currentPassword);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      admin.password = data.newPassword;
    }

    await admin.save();

    const adminObj = admin.toObject();
    delete (adminObj as any).password;

    return NextResponse.json(adminObj);
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admins/[id] - Delete an admin
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    // Check if admin is trying to delete themselves
    if ((session.user as any)?.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
