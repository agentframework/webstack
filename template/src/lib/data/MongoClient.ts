import { MongoConnection } from './MongoConnection';
import { MongoDocument, AggregationQuery } from './MongoTypes';

import { nextSequenceId, nextSparseId } from './MongoClientFunctions/nextSequenceId';
import { insertOne } from './MongoClientFunctions/insertOne';
import { find } from './MongoClientFunctions/find';
import { findOne } from './MongoClientFunctions/findOne';
import { findAndModify } from './MongoClientFunctions/findAndModify';
import { aggregation } from './MongoClientFunctions/aggregation';
import { agent } from 'agentframework';
import { insertMany } from './MongoClientFunctions/insertMany';


@agent()
export class MongoClient extends MongoConnection {
  
  public nextSequenceId(db: string, name: string, sparse: boolean): Promise<number> {
    return Reflect.apply(sparse ? nextSparseId : nextSequenceId, this, [this, db, name]);
  }
  
  public insertOne(db: string, collection: string, doc: MongoDocument): Promise<MongoDocument> {
    return Reflect.apply(insertOne, this, [this, db, collection, doc]);
  }
  
  public insertMany(db: string, collection: string, docs: Array<MongoDocument>) {
    return Reflect.apply(insertMany, this, [this, db, collection, docs]);
  }
  
  public find(db: string, collection: string, filter?: any, projection?: any, sort?: any, skip?: number, limit?: number): Promise<Array<MongoDocument>> {
    return Reflect.apply(find, this, [this, db, collection, filter, projection, sort, skip, limit]);
  }
  
  public findOne(db: string, collection: string, filter: any, options: any = {}): Promise<MongoDocument | null> {
    return Reflect.apply(findOne, this, [this, db, collection, filter, options]);
  }
  
  public findAndModify(db: string, collection: string, filter: any, options: any = {}) : Promise<MongoDocument | null> {
    return Reflect.apply(findAndModify, this, [this, db, collection, filter, options]);
  }
  
  public aggregation(db: string, collection: string, query: AggregationQuery) : Promise<Array<MongoDocument>> {
    return Reflect.apply(aggregation, this, [this, db, collection, query]);
  }
  
}


