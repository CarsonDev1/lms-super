// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('lms-database');

// Create collections
db.createCollection('users');
db.createCollection('courses');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.courses.createIndex({ instructor: 1 });
db.courses.createIndex({ category: 1 });
db.courses.createIndex({ isPublished: 1 });

// Create admin user (optional - comment out if not needed)
// db.users.insertOne({
//   name: 'Admin User',
//   email: 'admin@lms.com',
//   password: '$2b$10$XdGKjHJ8p9RqXqXqXqXqXe', // This is a hashed password
//   role: 'admin',
//   isEmailVerified: true,
//   isActive: true,
//   createdAt: new Date(),
//   updatedAt: new Date()
// });

print('✅ Database initialized successfully');
print('📊 Collections created: users, courses');
print('🔍 Indexes created for optimized queries');
