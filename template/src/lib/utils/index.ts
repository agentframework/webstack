
export function forEach<T>(target: any, callback: (value: T, key: string) => void) {
  Object.keys(target).forEach(key => {
    if (target.hasOwnProperty(key)) {
      // console.log('>>> ', key);
      callback(target[key], key);
    }
  });
}

