const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://iamtabson:blvckl0tus@cluster0.mgt2wsq.mongodb.net/quickprofile?appName=Cluster0';

async function verifyAndCreateIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get current indexes
    console.log('\n📋 Current indexes:');
    const indexList = await db.collection('clients').listIndexes().toArray();
    console.log(JSON.stringify(indexList, null, 2));

    // Check if slug index exists
    const hasSlugIndex = indexList.find(idx => 
      idx.key && idx.key.slug === 1 && idx.unique
    );

    if (!hasSlugIndex) {
      console.log('\n🔧 Creating missing slug unique index...');
      await db.collection('clients').createIndex({ slug: 1 }, { unique: true });
      console.log('✓ Slug index created successfully');
    } else {
      console.log('\n✓ Slug index exists');
    }

    // Drop any remaining bad indexes
    const badIndexes = indexList.filter(idx => 
      idx.name && (idx.name.includes('uniqueUrl') || idx.name.includes('fileUrl'))
    );

    if (badIndexes.length > 0) {
      console.log('\n🔧 Removing bad indexes:');
      for (const idx of badIndexes) {
        console.log(`  - Dropping ${idx.name}`);
        await db.collection('clients').dropIndex(idx.name);
      }
    }

    // Final verification
    console.log('\n📋 Final indexes:');
    const finalIndexes = await db.collection('clients').listIndexes().toArray();
    console.log(JSON.stringify(finalIndexes, null, 2));

    // Test creating a document
    console.log('\n🧪 Testing document creation...');
    const testDoc = {
      clientName: 'Test User',
      companyName: 'Test Company',
      slug: `test-${Date.now()}`,
      fileUrl: 'https://example.com/test.pdf',
      fileType: 'pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('clients').insertOne(testDoc);
    console.log('✓ Test document created successfully:', result.insertedId);

    // Clean up test document
    await db.collection('clients').deleteOne({ _id: result.insertedId });
    console.log('✓ Test document deleted');

    console.log('\n✅ Database verification and cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAndCreateIndexes();
