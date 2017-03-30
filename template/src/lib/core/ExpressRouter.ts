import * as Router from 'router';

export interface ExpressRouter extends Router {
  use(fn: Function);
}
