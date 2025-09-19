import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';
import connectDB from '../config/database.js';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createDefaultAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB...');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Default admin already exists!');
      console.log('Username: admin');
      console.log('Use the existing admin account to login.');
      process.exit(0);
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: 'admin',
      email: 'abhraayan@gmail.com',
      password: 'abhra123', // This will be hashed automatically by the pre-save hook
      role: 'super_admin'
    });

    await defaultAdmin.save();
    
    console.log('✅ Default admin created successfully!');
    console.log('📧 Email: admin@company.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: abhra123');
    console.log('');
    console.log('⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createDefaultAdmin();
