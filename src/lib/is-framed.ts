let framed = false;
let cached = false;

export function isFramed(): boolean {
  if (cached) {
    return framed;
  } else {
    try {
      framed = window.self !== window.top;
    } catch (e) {
      // If accessing window.top throws an error, assume it's in an iframe
      framed = true;
    }
    cached = true;
    return framed;
  }
}
