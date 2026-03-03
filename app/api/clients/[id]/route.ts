import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';
import { Types } from 'mongoose';

// GET /api/clients/[id] - Get a single client
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client.toObject ? client.toObject() : JSON.parse(JSON.stringify(client)));
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
        slug: { $regex: `^${data.slug}$`, $options: 'i' },
        _id: { $ne: id }
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
      const slugRegex = /^[a-zA-Z0-9\-_.~]+$/;
      if (!slugRegex.test(data.slug)) {
        return NextResponse.json(
          { error: 'Slug can only contain letters, numbers, hyphens (-), underscores (_), periods (.), and tildes (~)' },
          { status: 400 }
        );
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updatedClient.toObject ? updatedClient.toObject() : JSON.parse(JSON.stringify(updatedClient)));
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

// PATCH /api/clients/[id] - Toggle active status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id } = await params;
    console.log('PATCH request - Client ID:', id);

    if (!Types.ObjectId.isValid(id)) {
      console.log('PATCH request - Invalid client ID');
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const client = await Client.findById(id);
    console.log('PATCH request - Client found:', client ? 'yes' : 'no');

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Toggle isActive status
    const oldStatus = client.isActive;
    client.isActive = !client.isActive;
    await client.save();
    console.log(`PATCH request - Toggled client status from ${oldStatus} to ${client.isActive}`);

    return NextResponse.json(client.toObject ? client.toObject() : JSON.parse(JSON.stringify(client)));
  } catch (error) {
    console.error('Error toggling client status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
