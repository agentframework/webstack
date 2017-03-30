import { inspect } from 'util';

export class ServerError extends Error {
  
  name: string = 'ServerError';
  code: string;
  cause: Error;
  context: any;
  
  static custom(code?: string, message?: string) {
    return new ServerError(null, null, code, message);
  }
  
  constructor(cause: Error, context?: any, code?: string, message?: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.cause = cause;
    this.context = context;
    this.code = code;
    
    const oldStackDescriptor = Object.getOwnPropertyDescriptor(this, 'stack');
    const stackDescriptor = buildStackDescriptor(oldStackDescriptor, this.cause);
    Object.defineProperty(this, 'stack', stackDescriptor);
  };
  
  
  toString() {
    let result = super.toString();
  
    if (this.code != null) {
      result = `[${this.code}] ${result}`;
    }
    
    if (this.cause['context'] != null) {
      result += '\n    with ' + inspect(this.cause['context']);
    }
    
    return result;
  }
  
}


function buildStackDescriptor(oldStackDescriptor: PropertyDescriptor, cause: Error) {
  if (oldStackDescriptor.get) {
    return {
      get: function () {
        const stack = oldStackDescriptor.get.call(this);
        return buildCombinedStacks(stack, this.cause);
      }
    };
  }
  else {
    const stack = oldStackDescriptor.value;
    return {
      value: buildCombinedStacks(stack, cause)
    };
  }
}

function buildCombinedStacks(stack: string, cause: Error) {
  if (cause) {
    stack += '\nCaused By -> ' + cause.stack;
  }
  return stack;
}


