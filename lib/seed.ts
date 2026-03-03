import dbConnect from './db';
import Admin from './models/Admin';

async function seed() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@quickprofile.com' });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      name: 'Admin',
      email: 'admin@quickprofile.com',
      password: 'password123',
    });

    await admin.save();
    console.log('Default admin created successfully');
    console.log('Email: admin@quickprofile.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
