import { MongoCollection, MongoDatabase } from '../../data/MongoModel';
import { ObjectId, MongoDocument } from '../../data/MongoTypes';
import { User } from './user.model';

export class UserCollection extends MongoCollection<User> {
  
  constructor(db: MongoDatabase) {
    super(db, User);
  }
  
  
}

