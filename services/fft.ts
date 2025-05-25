
import { ComplexNumber } from '../types';

// Helper to check if a number is a power of two
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// Cooley-Tukey FFT Algorithm (Radix-2 Dit)
// Input: array of real numbers. Output: array of complex numbers.
// The length of input array must be a power of two.
export function fft(input: number[]): ComplexNumber[] {
  const N = input.length;
  if (!isPowerOfTwo(N)) {
    // For simplicity, this implementation requires N to be a power of two.
    // In a real app, you might pad with zeros or use a more general algorithm.
    console.warn(`FFT input length ${N} is not a power of two. Results might be inaccurate or errors may occur. Padding or truncating to nearest power of two is recommended.`);
    // Fallback or error handling can be more sophisticated.
    // For now, let's try to proceed if possible or return empty.
    // A simple approach: truncate/pad to nearest power of 2.
    // Or, for this educational tool, just proceed and let it potentially fail for non-power-of-2 to illustrate the requirement.
    // Let's make it robust by returning empty or throwing specific error
    // For now, we'll proceed, but this is a known limitation of simple radix-2.
  }

  // Create complex numbers from input (imaginary part is 0)
  const X: ComplexNumber[] = input.map(val => ({ re: val, im: 0 }));

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    while (j >= bit) {
      j -= bit;
      bit >>= 1;
    }
    j += bit;
    if (i < j) {
      [X[i], X[j]] = [X[j], X[i]]; // Swap
    }
  }

  // Iterative FFT computation
  for (let len = 2; len <= N; len <<= 1) {
    const halfLen = len >> 1;
    const angleStep = -2 * Math.PI / len;
    for (let i = 0; i < N; i += len) {
      let wRe = 1.0;
      let wIm = 0.0;
      for (let j = 0; j < halfLen; j++) {
        const uRe = X[i + j].re;
        const uIm = X[i + j].im;
        const vRe = X[i + j + halfLen].re * wRe - X[i + j + halfLen].im * wIm;
        const vIm = X[i + j + halfLen].re * wIm + X[i + j + halfLen].im * wRe;

        X[i + j].re = uRe + vRe;
        X[i + j].im = uIm + vIm;
        X[i + j + halfLen].re = uRe - vRe;
        X[i + j + halfLen].im = uIm - vIm;

        // Update twiddle factor
        const nextWRe = wRe * Math.cos(angleStep) - wIm * Math.sin(angleStep);
        wIm = wRe * Math.sin(angleStep) + wIm * Math.cos(angleStep);
        wRe = nextWRe;
      }
    }
  }
  return X;
}

export function getMagnitudes(complexSignal: ComplexNumber[], samplingRate: number): { magnitudes: Array<{ x: number, y: number }>, maxFrequency: number } {
  const N = complexSignal.length;
  if (N === 0) return { magnitudes: [], maxFrequency: 0 };

  const magnitudes = complexSignal.slice(0, N / 2).map((c, i) => {
    const magnitude = Math.sqrt(c.re * c.re + c.im * c.im) / N; // Normalize by N
    // For display, sometimes 2/N for non-DC/Nyquist, 1/N for DC/Nyquist components.
    // Using N for now for simplicity, or N/2 for amplitudes.
    // A common scaling for amplitude spectrum is 2 * magnitude / N for k > 0 and k < N/2.
    // And 1 * magnitude / N for k = 0 (DC) and k = N/2 (Nyquist, if N is even).
    // Let's use a simpler scaling suitable for visualization of relative strengths:
    let scaledMagnitude = (Math.sqrt(c.re * c.re + c.im * c.im) / N) * 2;
    if (i === 0 || (N % 2 === 0 && i === N / 2 -1) ) { // DC component or Nyquist
        scaledMagnitude = (Math.sqrt(c.re * c.re + c.im * c.im) / N);
    }

    return {
      x: (i * samplingRate) / N, // Frequency bin
      y: scaledMagnitude,
    };
  });
  const maxFrequency = samplingRate / 2;
  return { magnitudes, maxFrequency };
}


// Inverse FFT (IFFT) - can be implemented similarly if needed
// For now, focusing on FFT for visualization.

export function padSignalToPowerOfTwo(signal: number[]): number[] {
    const currentLength = signal.length;
    if (currentLength === 0) return [];
    if (isPowerOfTwo(currentLength)) return signal;

    const newLength = Math.pow(2, Math.ceil(Math.log2(currentLength)));
    const paddedSignal = [...signal];
    for (let i = currentLength; i < newLength; i++) {
        paddedSignal.push(0); // Pad with zeros
    }
    return paddedSignal;
}
