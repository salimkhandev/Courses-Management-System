const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/courses-db';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await mongoose.connection.collection('users').findOne({ email: 'admin@gmail.com' });
  if (existing) {
    console.log('Admin already exists — skipping.');
    process.exit(0);
  }

  const hash = await bcrypt.hash('Admin@1234', 10);
  await mongoose.connection.collection('users').insertOne({
    name: 'Admin',
    email: 'admin@gmail.com',
    passwordHash: hash,
    role: 'admin',
    status: 'paid',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Admin user created!');
  console.log('  Email:    admin@gmail.com');
  console.log('  Password: Admin@1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
