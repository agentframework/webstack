import { MongoConnection,  } from '../MongoConnection';
import { MongoDocument } from '../MongoTypes';
import { CreateObjectIdForDocument } from '../MongoUtils';

export function insertOne(client: MongoConnection, db: string, collection: string, doc: MongoDocument): Promise<MongoDocument> {
  
  const _doc = CreateObjectIdForDocument(doc);
  
  return client.runCommand(db, {
    'insert': collection,
    'documents': [_doc],
    'writeConcern': client.writeConcern
  }).then(result => {
    if (result.n) {
      return _doc;
    }
    else {
      return null;
    }
  });
  
}
