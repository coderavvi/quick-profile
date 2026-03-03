import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Define the client schema inline
const clientSchema = new mongoose.Schema({
  clientName: String,
  companyName: String,
  slug: String,
  fileUrl: String,
  fileType: String,
  isActive: { type: Boolean, default: true },
  createdAt: Date,
});

const Client = mongoose.model('Client', clientSchema);

async function addIsActiveField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Find all clients without isActive field
    const clientsWithoutIsActive = await Client.find({
      isActive: { $exists: false }
    });

    if (clientsWithoutIsActive.length === 0) {
      console.log('✓ All clients already have isActive field');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`Found ${clientsWithoutIsActive.length} clients without isActive field`);

    // Update all clients to have isActive: true
    const result = await Client.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(`✓ Updated ${result.modifiedCount} clients with isActive: true`);

    // Verify
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ isActive: true });
    const inactiveClients = await Client.countDocuments({ isActive: false });

    console.log('\n📊 Client Status Summary:');
    console.log(`   Total clients: ${totalClients}`);
    console.log(`   Active: ${activeClients}`);
    console.log(`   Inactive: ${inactiveClients}`);

    await mongoose.connection.close();
    console.log('\n✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addIsActiveField();
