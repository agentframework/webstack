import { MongoConnection, } from '../MongoConnection';
import { MongoDocument } from '../MongoTypes';
import { CreateObjectIdForDocument } from '../MongoUtils';

export function insertMany(client: MongoConnection, db: string, collection: string, docs: Array<MongoDocument>): Promise<MongoDocument> {
  
  const _docs = docs.map(CreateObjectIdForDocument);
  
  return client.runCommand(db, {
    'insert': collection,
    'documents': _docs,
    'writeConcern': client.writeConcern,
    'ordered': false
  }).then(result => {
    if (!result.n) {
      return [];
    }
    else if (result.n < _docs.length) {
      const inserted = [];
      const map = [];
      map.length = result.writeErrors.length;
      for (let e = 0; e < result.writeErrors.length; e++) {
        map[result.writeErrors[e].index] = 1;
      }
      // only return the inserted records
      for (let d = 0; d < _docs.length; d++) {
        if (!map[d]) {
          inserted.push(_docs[d]);
        }
      }
      return inserted;
    }
    else {
      return _docs;
    }
  });
  
}
