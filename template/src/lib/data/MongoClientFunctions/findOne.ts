import { MongoDocument } from '../MongoTypes';
import { MongoConnection } from '../MongoConnection';


export function findOne(client: MongoConnection, db: string, collection: string, filter: any, options: any = {}): Promise<MongoDocument | null> {
  
  return client
    .runCommand(db, Object.assign({
      'find': collection,
      'filter': filter,
      'limit': 1
    }, options))
    .then(result => {
        if (result.cursor.firstBatch.length) {
          return result.cursor.firstBatch[0];
        }
        else {
          return null
        }
      });
  
}

