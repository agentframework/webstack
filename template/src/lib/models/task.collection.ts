import { Task } from './task.model';
import { MongoCollection, MongoDatabase } from 'agentstack-mongodb';

export class TaskCollection extends MongoCollection<Task> {
  
  constructor(db: MongoDatabase) {
    super(db, Task);
  }
  
  
}

