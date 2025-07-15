let isFramed = false;
let isFramedCached = false;

export function isFramed(): boolean {
  if (isFramedCached) {
    return isFramed;
  } else {
    try {
      isFramed = window.self !== window.top;
    } catch (e) {
      // If accessing window.top throws an error, assume it's in an iframe
      isFramed = true;
    }
    isFramedCached = true;
    return isFramed;
  }
}
