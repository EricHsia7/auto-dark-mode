export function isFramed(): boolean {
  let isFramed = false;
  try {
    isFramed = window.self !== window.top;
  } catch (e) {
    // If accessing window.top throws an error, assume it's in an iframe
    isFramed = true;
  }
  return isFramed;
}
