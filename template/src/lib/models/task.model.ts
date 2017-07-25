
import { key, model, MongoModel } from 'agentstack-mongodb';

@model('task')
export class Task extends MongoModel {
  title: string;
  done: boolean;
}
