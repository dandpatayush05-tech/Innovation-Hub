import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User';
import Business from './src/models/Business';
import Destination from './src/models/Destination';
import Hotel from './src/models/Hotel';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tourease';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Business.deleteMany({});
    await Destination.deleteMany({});
    await Hotel.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create demo traveler
    const salt = await bcrypt.genSalt(10);
    const travelerHash = await bcrypt.hash('password123', salt);
    
    const demoTraveler = await User.create({
      name: 'Alex Traveler',
      email: 'alex@example.com',
      passwordHash: travelerHash,
      role: 'traveler'
    });

    // Create demo business owner
    const businessHash = await bcrypt.hash('password123', salt);
    const demoBusinessUser = await User.create({
      name: 'Sarah Hotelier',
      email: 'sarah@example.com',
      passwordHash: businessHash,
      role: 'business'
    });

    // Create demo business
    const demoBusiness = await Business.create({
      userId: demoBusinessUser.id,
      businessName: 'Vstara Elite Stays',
      businessType: 'hotel',
      description: 'Curated premium stays across the Middle East.',
      contactEmail: 'contact@vstaraelite.com',
      verified: true
    });

    // Create destinations
    const destinations = await Destination.insertMany([
      {
        name: 'Petra',
        country: 'Jordan',
        description: 'The famous Rose City, carved directly into vibrant red, white, pink, and sandstone cliff faces.',
        imageUrl: 'https://images.unsplash.com/photo-1579532536935-619928decd08',
        tags: ['historic', 'desert', 'hiking', 'wonders']
      },
      {
        name: 'Wadi Rum',
        country: 'Jordan',
        description: 'Also known as The Valley of the Moon, featuring spectacular sandstone and granite rock valleys.',
        imageUrl: 'https://images.unsplash.com/photo-1544431526-724128f1cc4e',
        tags: ['desert', 'adventure', 'camping', 'nature']
      },
      {
        name: 'Dead Sea',
        country: 'Jordan',
        description: 'The lowest point on earth, a salt lake with hyper-saline water that makes floating easy.',
        imageUrl: 'https://images.unsplash.com/photo-1582885913251-1b12b5e28e46',
        tags: ['wellness', 'spa', 'nature', 'unique']
      },
      {
        name: 'Amman',
        country: 'Jordan',
        description: 'The modern and ancient capital of Jordan, full of Roman ruins and vibrant street life.',
        imageUrl: 'https://images.unsplash.com/photo-1580838118086-fbdfaf36b132',
        tags: ['city', 'culture', 'food', 'historic']
      },
      {
        name: 'Aqaba',
        country: 'Jordan',
        description: 'A Jordanian port city on the Red Sea\'s Gulf of Aqaba, known for its beach resorts and scuba diving.',
        imageUrl: 'https://images.unsplash.com/photo-1627889988453-6ec037efdb84',
        tags: ['beach', 'diving', 'resort', 'relax']
      }
    ]);

    // Create hotels linked to destinations
    await Hotel.insertMany([
      {
        businessId: demoBusiness.id,
        destinationId: destinations[0].id,
        name: 'Petra Moon Luxury',
        description: 'Stay steps away from the entrance of the ancient city with luxury amenities.',
        pricePerNight: 250,
        amenities: ['Pool', 'Spa', 'Breakfast Included', 'Guided Tours'],
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        rating: 4.8
      },
      {
        businessId: demoBusiness.id,
        destinationId: destinations[1].id,
        name: 'Martian Bubble Camp',
        description: 'Sleep under the stars in Wadi Rum in our panoramic luxury domes.',
        pricePerNight: 300,
        amenities: ['Stargazing', 'Jeep Tours', 'Traditional Dinner'],
        imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
        rating: 4.9
      },
      {
        businessId: demoBusiness.id,
        destinationId: destinations[2].id,
        name: 'Dead Sea Spa Resort',
        description: 'World-class mud treatments and private access to the Dead Sea.',
        pricePerNight: 180,
        amenities: ['Private Beach', 'Mud Baths', 'Multiple Pools'],
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
        rating: 4.6
      }
    ]);

    console.log('✅ Seeding complete!');
    console.log('-------------------------------------------');
    console.log('Demo Traveler Account:');
    console.log('Email: alex@example.com');
    console.log('Password: password123');
    console.log('-------------------------------------------');
    console.log('Demo Business Account:');
    console.log('Email: sarah@example.com');
    console.log('Password: password123');
    console.log('-------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
