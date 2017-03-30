import { MongoConnection } from '../MongoConnection';
import { IsUpdateExisting } from '../MongoUtils';
import { findAndModify } from './findAndModify';

export function nextSequenceId(client: MongoConnection, db: string, name: string): Promise<number> {
  
  return findAndModify(client, db, 'sys.ids', { _id: name }, {
    'update': {
      $inc: { sequence: 1 },
      $currentDate: { lastModified: { $type: "date" } }
    },
    'upsert': true,
    'new': true
  }).then(result => result.sequence);
  
}

export function nextSparseId(client: MongoConnection, db: string, name: string): Promise<number> {
  
  const increment = Math.floor(Math.random() * 50 + 1); // 1 to 50
  
  return findAndModify(client, db, 'sys.ids', { _id: name }, {
    'update': {
      $inc: { sparse: increment },
      $currentDate: { lastModified: { $type: "date" } }
    },
    'upsert': false,
    'new': true
  }).then(updateResult => {
    
    if (updateResult) {
      return updateResult.sparse;
    }
    else {
      
      // in order to have an init value (1102000). we need add another findAndModify here
      return findAndModify(client, db, 'sys.ids', { _id: name }, {
        'update': {
          $setOnInsert: { sparse: 1102000 + increment, createdAt: new Date() },
          $currentDate: { lastModified: { $type: "date" } }
        },
        'upsert': true,
        'new': true
      }).then(insertResult => {
        if (!IsUpdateExisting(insertResult)) {
          console.log('sparseId is not new', insertResult);
        }
        return insertResult.sparse;
      })
      
    }
  });
  
}
