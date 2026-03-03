import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';
import { Types } from 'mongoose';

// GET /api/clients/[id] - Get a single client
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
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
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If slug is being changed, check for uniqueness
    if (data.slug && data.slug !== client.slug) {
      const existingClient = await Client.findOne({
        slug: data.slug.toLowerCase(),
      });
      if (existingClient) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Validate slug format if provided
    if (data.slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(data.slug.toLowerCase())) {
        return NextResponse.json(
          { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
          { status: 400 }
        );
      }
      data.slug = data.slug.toLowerCase();
    }

    const updatedClient = await Client.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
