import { MongoConnection } from '../MongoConnection';
import { MarkUpdateExisting } from '../MongoUtils';
import { MongoDocument, MongoCommandResult } from '../MongoTypes';

export interface FindAndModifyErrorObject {
  updatedExisting: boolean
  n: number
  upsert: boolean
}

export interface FindAndModifyCommandResult extends MongoCommandResult {
  ok: number,
  lastErrorObject: FindAndModifyErrorObject
  value: MongoDocument | any | null
}

export function findAndModify(client: MongoConnection, db: string, collection: string, filter: any, options: any = {}): Promise<MongoDocument | any | null> {
  
  return client.runCommand(db, Object.assign({
    'findAndModify': collection,
    'query': filter,
    'writeConcern': client.writeConcern,
    'new': true
  }, options)).then((result: FindAndModifyCommandResult) => {
    if (result.lastErrorObject.updatedExisting) {
      return MarkUpdateExisting(result.value);
    }
    return result.value;
  });
  
}
