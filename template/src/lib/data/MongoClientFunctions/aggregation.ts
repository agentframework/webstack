import { AggregationQuery } from '../MongoTypes';
import { MongoConnection } from '../MongoConnection';
import { MarkTotalCount } from '../MongoUtils';

export function aggregation(client: MongoConnection, db: string, collection: string, query: AggregationQuery): Promise<any> {
  
  query.skip = query.skip || 0;
  query.limit = query.limit || 100;
  
  const countCmd = {
    count: collection,
    query: query.filter || {}
  };
  
  const aggregationCmd = {
    aggregate: collection,
    pipeline: [],
    allowDiskUse: true
  };
  
  // configure pipeline
  if (query.filter && Object.keys(query.filter).length) {
    aggregationCmd.pipeline.push({ $match: query.filter });
  }
  if (query.group && Object.keys(query.group).length) {
    aggregationCmd.pipeline.push({ $group: query.group });
  }
  if (query.sort && Object.keys(query.sort).length) {
    aggregationCmd.pipeline.push({ $sort: query.sort });
  }
  aggregationCmd.pipeline.push({ $skip: query.skip });
  aggregationCmd.pipeline.push({ $limit: query.limit });
  
  if (query.lookup && Object.keys(query.lookup).length) {
    Object.keys(query.lookup).forEach(key => {
      const from = query.lookup[key];
      aggregationCmd.pipeline.push({
        $lookup: {
          from: from,
          localField: key,
          foreignField: '_id',
          as: key
        }
      });
      aggregationCmd.pipeline.push({
        $addFields: {
          [key]: { $arrayElemAt: [`$${key}`, 0] }
        }
      });
    });
  }
  
  if (query.formula && Object.keys(query.formula).length) {
    aggregationCmd.pipeline.push({ $addFields: query.formula });
  }
  
  if (query.graph && Object.keys(query.graph).length) {
    Object.keys(query.graph).forEach(key => {
      const graph = query.graph[key];
      aggregationCmd.pipeline.push({
        $graphLookup: {
          from: collection,
          connectToField: '_id',
          startWith: `$${graph}`,
          connectFromField: graph,
          as: key,
          maxDepth: 10
        }
      });
    });
  }
  
  if (query.projection && Object.keys(query.projection).length) {
    aggregationCmd.pipeline.push({ $project: query.projection });
  }
  // end configure pipeline
  
  return client.runCommand(db, countCmd).then(countResult => {
    // console.log('countResult', countResult);
    if (countResult.n) {
      return client.runCommand(db, aggregationCmd).then(aggregationResult => {
        // console.log('aggregationCmd', aggregationCmd);
        // console.log('aggregationResult', aggregationResult);
        const docs = aggregationResult['result'] || aggregationResult['cursor']['firstBatch'];
        return MarkTotalCount(docs, countResult.n);
      });
    }
    else {
      return MarkTotalCount([], 0);
    }
  });
  
}
