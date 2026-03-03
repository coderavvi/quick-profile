import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';

// GET /api/clients - List all clients or get by slug
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Check for slug query parameter (public access for profile viewer)
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Public endpoint - no authentication required for slug lookup
      // Only show active clients
      const client = await Client.findOne({ 
        slug: slug.toLowerCase(),
        isActive: true
      });
      
      if (!client) {
        return NextResponse.json([]);
      }

      return NextResponse.json([client.toObject ? client.toObject() : JSON.parse(JSON.stringify(client))]);
    }

    // List all clients
    const clients = await Client.find().sort({ createdAt: -1 });
    const clientObjects = clients.map(c => c.toObject ? c.toObject() : JSON.parse(JSON.stringify(c)));

    return NextResponse.json(clientObjects);
  } catch (error) {
    console.error('GET /api/clients - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    const { clientName, companyName, slug, fileUrl } = data;

    if (!clientName || !companyName || !slug || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingClient = await Client.findOne({ slug: slug.toLowerCase() });
    if (existingClient) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug.toLowerCase())) {
      return NextResponse.json(
        { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const client = new Client({
      clientName,
      companyName,
      slug: slug.toLowerCase(),
      fileUrl,
      isActive: true,
    });

    await client.save();

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
