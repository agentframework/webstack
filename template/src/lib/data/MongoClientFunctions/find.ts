import { MongoDocument } from '../MongoTypes';
import { MongoConnection } from '../MongoConnection';
import { MarkTotalCount } from '../MongoUtils';


export function find(client: MongoConnection, db: string, collection: string, filter?: any, projection?: any, sort?: any, skip?: number, limit?: number): Promise<Array<MongoDocument>> {
  
  const countCmd = {
    'count': collection,
    'query': filter || {}
  };
  
  const findCmd = {
    'find': collection,
    'batchSize': limit || 100,
    'filter': filter || {},
    'sort': sort || {},
    'projection': projection || {},
    'skip': skip || 0,
    'limit': limit || 100
  };
  
  return client.runCommand(db, countCmd).then(countResult => {
    // console.log('countResult', countResult);
    if (countResult.n) {
      return client.runCommand(db, findCmd).then(findResult => {
        // console.log('findResult', findResult);
        const docs = findResult.cursor.firstBatch;
        return MarkTotalCount(docs, countResult.n);
      });
    }
    else {
      return MarkTotalCount([], 0);
    }
  });
  
}
