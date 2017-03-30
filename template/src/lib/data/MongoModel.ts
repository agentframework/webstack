import { Reflection } from 'agentframework';
import { ModelAttribute } from './MongoModelDecorators';
import { ObjectId, MongoDocumentLike, MongoDocument, AggregationQuery } from './MongoTypes';
import { MongoClient } from './MongoClient';
import {
  CreateObjectIdForDocument, ConvertObjectIdToString, CreateObjectId, GetTotalCount,
  MarkTotalCount, MarkUpdateExisting, IsUpdateExisting
} from './MongoUtils';

const model_collection_key = Symbol.for('agent.model.collection');

export class MongoModel implements MongoDocument {
  
  _id?: ObjectId;
  
  constructor(collection: MongoCollection<MongoModel>) {
    this[model_collection_key] = collection;
  }
  
  save(): Promise<MongoModel|null> {
    return this[model_collection_key].updateOne(this);
  }
  
}

export class MongoCollection<T extends MongoModel> {
  
  module: string;
  moduleType: any;
  
  constructor(private db: MongoDatabase, type: any) {
    
    const reflection = Reflection.getInstance(type);
    const attributes = reflection.getAttributes<ModelAttribute>(ModelAttribute);
    
    if (!attributes.length) {
      throw new TypeError(`${type} is not a model`);
    }
    
    this.module = attributes[0].collection;
    this.moduleType = type;
  }
  
  createOne(): T {
    return Reflect.construct(this.moduleType, [this]);
  }
  
  createOneWithSequenceId(sparse: boolean = false): Promise<T> {
    const newObject = this.createOne();
    return this.nextSequenceId(sparse).then(id => {
      newObject['id'] = id;
      return newObject;
    });
  }
  
  nextSequenceId(sparse: boolean = false): Promise<number> {
    return this.db.client
      .nextSequenceId(this.db.account, this.module, sparse);
  }
  
  insertOne(document: MongoDocumentLike): Promise<T | null> {
    return this.db.client
      .insertOne(this.db.account, this.module, document)
      .then(doc => this.wrap(doc));
  }
  
  insertMany(documents: Array<MongoDocumentLike>): Promise<Array<T>> {
    return this.db.client
      .insertMany(this.db.account, this.module, documents)
      .then(docs => docs.map(doc => this.wrap(doc)));
  }
  
  upsertOne(document: MongoDocumentLike): Promise<T | null> {
    
    const doc = CreateObjectIdForDocument(document);
    
    const docToUpsert = Object.assign({}, doc);
    delete docToUpsert._id;
    
    return this.db.client
      .findAndModify(this.db.account, this.module, { _id: doc._id }, {
        'update': docToUpsert,
        'upsert': true
      })
      .then(doc => this.wrap(doc));
  }
  
  updateOneById(id: string | ObjectId, document: MongoDocumentLike): Promise<T | null> {
    
    const docToUpdate = Object.assign({}, document);
    delete docToUpdate._id;
    
    return this.db.client
      .findAndModify(this.db.account, this.module, { _id: CreateObjectId(id) }, {
        'update': docToUpdate
      })
      .then(doc => this.wrap(doc));
  }
  
  updateOne(document: MongoDocumentLike): Promise<T | null> {
    
    if (!Reflect.has(document, '_id')) {
      throw new TypeError(`Missing '_id' field which is mandatory for update document`);
    }
    
    const docToUpdate = Object.assign({}, document);
    delete docToUpdate._id;
    
    return this.db.client
      .findAndModify(this.db.account, this.module, { _id: document._id }, {
        'update': docToUpdate
      })
      .then(doc => this.wrap(doc));
  }
  
  findAndUpsert(filter: any, update: any, fields: any = {}, sort: any = {}): Promise<T | null> {
    return this.db.client
      .findAndModify(this.db.account, this.module, filter, { update, fields, sort, upsert: true})
      .then(doc => this.wrap(doc));
  }
  
  findAndUpdate(filter: any, update: any, fields: any = {}, sort: any = {}): Promise<T | null> {
    return this.db.client
      .findAndModify(this.db.account, this.module, filter, { update, fields, sort})
      .then(doc => this.wrap(doc));
  }
  
  findOneById(id: string | ObjectId, projection: any = {}): Promise<T | null> {
    return this.findOne({ _id: CreateObjectId(id) }, projection);
  }
  
  findOne(filter: any, projection: any = {}, sort: any = {}): Promise<T | null> {
    return this.db.client
      .findOne(this.db.account, this.module, filter, { projection, sort })
      .then(doc => this.wrap(doc));
  }
  
  find(filter?: any, projection?: any, sort?: any, skip?: number, limit?: number): Promise<Array<T>> {
    return this.db.client
      .find(this.db.account, this.module, filter, projection, sort, skip, limit)
      .then(doc => this.wrapArray(doc));
  }
  
  aggregation(query: AggregationQuery): Promise<Array<T>> {
    return this.db.client
      .aggregation(this.db.account, this.module, query)
      .then(doc => this.wrapArray(doc));
  }
  
  deleteOneById(id: string | ObjectId): Promise<T | null> {
    return this.deleteOne({ _id: CreateObjectId(id) });
  }
  
  deleteOne(filter: any): Promise<T | null> {
    return this.db.client
      .findAndModify(this.db.account, this.module, filter, {
        'remove': true,
        'new': false
      })
      .then(doc => this.wrap(doc));
  }
  
  private wrap<T extends MongoModel>(doc: MongoDocument | null): T | null {
    if (doc != null) {
      const upsert = IsUpdateExisting(doc);
      return MarkUpdateExisting(Object.assign(Reflect.construct(this.moduleType, [this]), doc), upsert, false);
    }
    else {
      return null;
    }
  }
  
  private wrapArray<T extends MongoModel>(docs: Array<MongoDocument>): Array<T> {
    if (docs && docs.length) {
      const total = GetTotalCount(docs);
      const models = docs.map(doc => {
        return Object.assign(Reflect.construct(this.moduleType, [this]), doc);
      });
      return MarkTotalCount(models, total);
    }
    else {
      return [];
    }
  }
  
}

export class MongoDatabase {
  
  client: MongoClient;
  account: string;
  
  constructor(shell: MongoClient, account: string) {
    this.client = shell;
    this.account = account;
  }
  
}
