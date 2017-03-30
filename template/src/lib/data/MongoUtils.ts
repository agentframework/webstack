import { MongoDocument, ObjectId } from './MongoTypes';
import * as mongodb from 'mongodb-core';

const metakey = Symbol.for('mongo.metakey');
const metadata = new WeakMap<any, any>();

export function AddMetadata(target: any, key: string, value: any): void {
  if (!Reflect.has(target, metakey)) {
    Reflect.set(target, metakey, new Map<string, any>());
  }
  const map = Reflect.get(target, metakey) as Map<string, any>;
  map.set(key, value);
}

export function HasMetadata(target: any, key: string): boolean {
  if (!Reflect.has(target, metakey)) {
    return false;
  }
  const map = Reflect.get(target, metakey) as Map<string, any>;
  return map.has(key);
}

export function GetMetadata(target: any, key: string, defaults?: any): any {
  if (!Reflect.has(target, metakey)) {
    return defaults;
  }
  const map = Reflect.get(target, metakey) as Map<string, any>;
  return map.has(key);
}

export function CreateIdString(): string {
  return mongodb.BSON.ObjectID.createPk().toString()
}

export function CreateObjectId(id?: ObjectId | string | number | Date): ObjectId {
  return new mongodb.BSON.ObjectID(id);
}

export function CreateObjectIdForDocument(document: MongoDocument): MongoDocument {
  if (!Reflect.has(document, '_id')) {
    document._id = CreateObjectId();
  }
  return document;
}

export function ConvertObjectIdToString(id: ObjectId): string {
  if (IsValidObjectId(id) && id.toString) {
    return id.toString();
  }
  else {
    throw new TypeError(`${id} is not a valid ObjectId`);
  }
}

export function IsValidUpdateDocument(document: MongoDocument): MongoDocument {
  if (!Reflect.has(document, '_id')) {
    throw new TypeError(`_id is missing`);
  }
  return document;
}


export function IsValidObjectId(id: any) {
  return mongodb.BSON.ObjectID.isValid(id)
}

export function IsObjectIdExpired(id: any, durationMs: number): boolean {
  return (CreateObjectId(id).getTimestamp().getTime() + durationMs) < Date.now();
}

export function MarkUpdateExisting(document: any, upsert: boolean = true, clone: boolean = true): any {
  const doc = clone ? Object.assign({}, document) : document;
  AddMetadata(doc, 'upsert', upsert);
  return doc;
}

export function IsUpdateExisting(document: MongoDocument): boolean {
  return HasMetadata(document, 'upsert');
}

export function MarkTotalCount(target: any, total: number): any {
  AddMetadata(target, 'total', total);
  return target;
}

export function GetTotalCount(target: any): number {
  return GetMetadata(target, 'total', 0);
}
