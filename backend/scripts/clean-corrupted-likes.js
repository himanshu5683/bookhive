// backend/scripts/clean-corrupted-likes.js
// Script to clean up corrupted likes data in the database

import mongoose from 'mongoose';
import Story from '../models/Story.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanCorruptedLikes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookhive');
    console.log('Connected to MongoDB');

    // Find and update stories with corrupted likes data
    const result = await Story.updateMany(
      { 
        $or: [
          { 'likes': { $in: [0, '0', '[ 0 ]', ['0'], [0]] } },
          { 'likes': { $type: 'string' } },
          { 'likes': { $elemMatch: { $in: [0, '0', '[ 0 ]'] } } }
        ]
      },
      { $set: { likes: [] } }
    );

    console.log(`Cleaned up ${result.modifiedCount} stories with corrupted likes data`);

    // Also clean up any comments that might have primitive values
    const commentsResult = await Story.updateMany(
      {
        $or: [
          { 'comments': { $elemMatch: { $type: 'number' } } },
          { 'comments': { $elemMatch: { $type: 'string' } } },
          { 'comments': { $in: [0, '0', ['0'], [0]] } }
        ]
      },
      { $set: { comments: [] } }
    );

    console.log(`Cleaned up ${commentsResult.modifiedCount} stories with corrupted comments data`);

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning corrupted data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanCorruptedLikes();
}

export default cleanCorruptedLikes;