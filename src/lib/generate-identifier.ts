export function generateIdentifier(): string {
  const chars = [
    [48, 10], // 0-9: 48 - 57
    [97, 26], // a-z: 97 - 122
    [65, 26] // A-Z: 65 - 90
  ];

  let randomNumber1 = (Math.random() * 0x10000000) | 0;
  let randomNumber2 = (Math.random() * 0x10000000) | 0;

  const result = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    const n = randomNumber2 % 3;
    const range = chars[n];
    const code = range[0] + (randomNumber1 % range[1]);
    result[i] = code;
    randomNumber1 >>>= 1;
    randomNumber2 >>>= 1;
  }

  return String.fromCharCode.apply(null, result);
}
