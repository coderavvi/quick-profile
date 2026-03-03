const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://iamtabson:blvckl0tus@cluster0.mgt2wsq.mongodb.net/quickprofile?appName=Cluster0';

async function cleanupAndFixData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('clients');

    // Find documents with missing or null slug
    console.log('\n🔍 Finding documents with null or missing slug...');
    const badDocs = await collection.find({
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' }
      ]
    }).toArray();

    console.log(`Found ${badDocs.length} documents with null/missing slug`);

    if (badDocs.length > 0) {
      console.log('\n📋 Documents with null slug:');
      badDocs.forEach(doc => {
        console.log(`  - ${doc._id}: ${doc.clientName} (${doc.companyName})`);
      });

      console.log('\n🗑️  Deleting documents with null slug...');
      const result = await collection.deleteMany({
        $or: [
          { slug: null },
          { slug: undefined },
          { slug: '' }
        ]
      });
      console.log(`✓ Deleted ${result.deletedCount} documents`);
    }

    // Verify all remaining documents have valid slugs
    console.log('\n✅ Verifying remaining documents...');
    const allDocs = await collection.find({}).toArray();
    console.log(`Total documents: ${allDocs.length}`);
    
    const validDocs = await collection.find({
      slug: { $exists: true, $ne: null, $ne: '' }
    }).toArray();
    console.log(`Valid documents with slug: ${validDocs.length}`);

    if (allDocs.length !== validDocs.length) {
      console.log('⚠️  Warning: Some documents still have issues');
      const invalidDocs = allDocs.filter(doc => !doc.slug);
      console.log('Invalid documents:');
      invalidDocs.forEach(doc => {
        console.log(`  - ${doc._id}: ${doc.clientName}`);
      });
    }

    // Create the unique index
    console.log('\n🔧 Creating slug unique index...');
    try {
      await collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
      console.log('✓ Slug index created successfully');
    } catch (indexError) {
      console.error('❌ Index creation failed:', indexError.message);
      throw indexError;
    }

    // Verify indexes
    console.log('\n📋 Final indexes:');
    const indexes = await collection.listIndexes().toArray();
    console.log(JSON.stringify(indexes, null, 2));

    console.log('\n✅ Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupAndFixData();
