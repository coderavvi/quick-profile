const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://iamtabson:blvckl0tus@cluster0.mgt2wsq.mongodb.net/quickprofile?appName=Cluster0';

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get all indexes on clients collection
    console.log('\n📋 Current indexes on clients collection:');
    const indexList = await db.collection('clients').listIndexes().toArray();
    console.log(JSON.stringify(indexList, null, 2));

    // Drop the problematic uniqueUrl index if it exists
    const hasUniqueUrlIndex = indexList.find(idx => 
      idx.name && idx.name.includes('uniqueUrl')
    );
    
    if (hasUniqueUrlIndex) {
      console.log(`\n🔧 Dropping index: ${hasUniqueUrlIndex.name}`);
      await db.collection('clients').dropIndex(hasUniqueUrlIndex.name);
      console.log('✓ Index dropped successfully');
    } else {
      console.log('\n✓ No uniqueUrl index found (already clean)');
    }

    // Drop any fileUrl unique index if it exists (these can also cause null conflicts)
    const hasFileUrlIndex = indexList.find(idx => 
      idx.name && idx.name.includes('fileUrl') && idx.unique
    );

    if (hasFileUrlIndex) {
      console.log(`\n🔧 Dropping fileUrl index: ${hasFileUrlIndex.name}`);
      await db.collection('clients').dropIndex(hasFileUrlIndex.name);
      console.log('✓ fileUrl index dropped successfully');
    }

    // Verify remaining indexes
    console.log('\n📋 Indexes after cleanup:');
    const newIndexList = await db.collection('clients').listIndexes().toArray();
    console.log(JSON.stringify(newIndexList, null, 2));

    console.log('\n✅ Database index cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixIndex();
