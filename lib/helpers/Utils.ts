export function processPromisesInSeqence(promises: Array<any>) {
  const sequence: Promise<any> = Promise.resolve();
  promises.forEach((promise) => {
    sequence.then(promise);
  });
  return sequence;
}
