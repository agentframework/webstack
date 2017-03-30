import { MongoCollection, MongoDatabase } from '../../data/MongoModel';
import { Session } from './session.model';

export class SessionCollection extends MongoCollection<Session> {
  
  constructor(db: MongoDatabase) {
    super(db, Session);
  }
  
  
}

