import { model, key } from '../../data/MongoModelDecorators';
import { MongoModel } from '../../data/MongoModel';
import { ObjectId } from '../../data/MongoTypes';

@model('session')
export class Session extends MongoModel {
  
  device: string;
  user: ObjectId;
  
  token: string;
  tokens: Array<any>;
  
  expires: Date;
  exited: boolean;
  blocked: boolean;
  
  previous?: ObjectId;
  
}
