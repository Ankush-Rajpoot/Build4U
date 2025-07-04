import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from '../models/Client.js';
import Worker from '../models/Worker.js';
import ServiceRequest from '../models/ServiceRequest.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Client.deleteMany();
    await Worker.deleteMany();
    await ServiceRequest.deleteMany();

    // Create sample clients
    const clients = await Client.create([
      {
        name: 'Jordan Martinez',
        email: 'jordan@example.com',
        password: 'password123',
        phone: '+1234567890',
        location: {
          city: 'Seattle',
          state: 'WA',
          address: '123 Main St'
        }
      },
      {
        name: 'Casey Edwards',
        email: 'casey@example.com',
        password: 'password123',
        phone: '+1234567891',
        location: {
          city: 'Portland',
          state: 'OR',
          address: '456 Oak Ave'
        }
      },
      {
        name: 'Morgan Chen',
        email: 'morgan@example.com',
        password: 'password123',
        phone: '+1234567892',
        location: {
          city: 'San Francisco',
          state: 'CA',
          address: '789 Pine St'
        }
      }
    ]);

    // Create sample workers
    const workers = await Worker.create([
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'password123',
        phone: '+1234567893',
        skills: ['Plumbing', 'Electrical', 'Carpentry'],
        experience: 5,
        hourlyRate: 75,
        rating: { average: 4.8, count: 47 },
        completedJobs: 47,
        location: {
          city: 'Seattle',
          state: 'WA'
        }
      },
      {
        name: 'Sam Rodriguez',
        email: 'sam@example.com',
        password: 'password123',
        phone: '+1234567894',
        skills: ['Roofing', 'Painting', 'Flooring'],
        experience: 3,
        hourlyRate: 65,
        rating: { average: 4.6, count: 31 },
        completedJobs: 31,
        location: {
          city: 'Portland',
          state: 'OR'
        }
      },
      {
        name: 'Taylor Wright',
        email: 'taylor@example.com',
        password: 'password123',
        phone: '+1234567895',
        skills: ['Landscaping', 'Gardening', 'Fencing'],
        experience: 8,
        hourlyRate: 85,
        rating: { average: 4.9, count: 68 },
        completedJobs: 68,
        location: {
          city: 'San Francisco',
          state: 'CA'
        }
      }
    ]);

    // Create sample service requests
    await ServiceRequest.create([
      {
        title: 'Bathroom Renovation',
        description: 'Need to completely renovate a master bathroom, including new tile, fixtures, and lighting.',
        client: clients[0]._id,
        status: 'pending',
        category: 'Renovation',
        budget: 5000,
        location: {
          city: 'Seattle',
          state: 'WA',
          address: '123 Main St'
        }
      },
      {
        title: 'Backyard Landscaping',
        description: 'Looking for someone to redesign my backyard with new plants, paths, and a small water feature.',
        client: clients[1]._id,
        worker: workers[2]._id,
        status: 'accepted',
        category: 'Landscaping',
        budget: 3500,
        location: {
          city: 'Portland',
          state: 'OR',
          address: '456 Oak Ave'
        }
      },
      {
        title: 'Kitchen Cabinet Installation',
        description: 'Need new kitchen cabinets installed. Cabinets are already purchased and on-site.',
        client: clients[2]._id,
        worker: workers[0]._id,
        status: 'in-progress',
        category: 'Installation',
        budget: 1800,
        location: {
          city: 'San Francisco',
          state: 'CA',
          address: '789 Pine St'
        }
      },
      {
        title: 'Roof Repair',
        description: 'Have a leak in the roof that needs to be fixed before the rainy season.',
        client: clients[0]._id,
        worker: workers[1]._id,
        status: 'completed',
        category: 'Repair',
        budget: 1200,
        completedDate: new Date('2025-03-10'),
        location: {
          city: 'Seattle',
          state: 'WA',
          address: '123 Main St'
        }
      },
      {
        title: 'House Painting',
        description: 'Need the exterior of my house painted. It\'s a two-story, 3-bedroom home.',
        client: clients[1]._id,
        status: 'pending',
        category: 'Painting',
        budget: 4000,
        location: {
          city: 'Portland',
          state: 'OR',
          address: '456 Oak Ave'
        }
      }
    ]);

    console.log('Sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();