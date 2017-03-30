import { EventEmitter } from 'events';

export interface ObjectId {
  
  /**
   * Return the ObjectID id as a 24 byte hex string representation
   */
  toHexString(): string;
  /**
   * Converts the id into a 24 byte hex string for printing
   */
  toString(format?: string): string;
  
  /**
   * Compares the equality of this ObjectID with `otherID`.
   * @param otherID
   */
  equals(otherID: ObjectId): boolean
  
  /**
   * Returns the generation date (accurate up to the second) that this ID was generated.
   */
  getTimestamp(): Date;
  
}

export type MongoDocumentLike = MongoDocument | any;

export interface MongoDocument {
  
  _id?: ObjectId
  
}

export interface MongoCommandResult {
  ok: number,
  n?: number,
  [key: string]: any;
}

export interface MongoCommandCallbackHandler {
  (name: Error, result?: MongoCommandResult): void;
}

export interface Connection extends EventEmitter {
  name: string;
  connect(options?: any): void;
  isConnected(): boolean;
  destroy(options?: any): void;
  isDestroyed(): boolean;
  command(ns: string, cmd: any, options: any, callback: MongoCommandCallbackHandler): any;
  //insert(ns: string, ops, options, callback: CallbackHandler): any;
  //update(ns: string, ops, options, callback: CallbackHandler): any;
  //remove(ns: string, ops, options, callback: CallbackHandler): any;
  //cursor(ns: string, cmd, cursorOptions): Cursor;
}

export interface MongoServer {
  name: string
  host: string
  port: number
}

// export interface Cursor {
//   bufferedCount(): number;
//   clone(): Cursor;
//   isDead(): boolean;
//   isKilled(): boolean;
//   isNotified(): boolean;
//   kill(callback: CallbackHandler);
//   next(callback: CallbackHandler);
//   readBufferedDocuments(count: number): Array<any>;
//   rewind(): void;
// }
//
// export interface FindQuery {
//   filter?: any,
//   sort?: any,
//   projection?: any,
//   hint?: any,
//   skip?: number,
//   limit?: number,
//   batchSize?: number,
//   singleBatch?: boolean,
//   comment?: string,
//   maxScan?: number,
//   maxTimeMS?: number,
//   readConcern?: any,
//   max?: any,
//   min?: any,
//   returnKey?: boolean,
//   showRecordId?: boolean,
//   snapshot?: boolean,
//   tailable?: boolean,
//   oplogReplay?: boolean,
//   noCursorTimeout?: boolean,
//   awaitData?: boolean,
//   allowPartialResults?: boolean
// }
//
// export interface AggregationQuery {
//   filter?: any,
//   group?: any,
//   projection?: any,
//   lookup?: any,
//   formula?: any,
//   graph?: any,
//   sort?: any,
//   skip?: number,
//   limit?: number
// }

export interface AggregationQuery {
  filter?: any;
  group?: any;
  projection?: any;
  lookup?: any;
  formula?: any;
  graph?: any;
  sort?: any;
  skip?: number;
  limit?: number;
}
