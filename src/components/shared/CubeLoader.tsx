// inspired by https://www.a1k0n.net/2011/07/20/donut-math.html
// Loading 3D Cube
// eslint-disable-next-line react-refresh/only-export-components, prefer-const
let A = 0, B = 0, C = 0;

const cubeWidth = 10;
const width =50; const height = 20;
const zBuffer = Array(width * height).fill(0);
const buffer =  Array(width * height);
const backgroundASCIICode = ' ';
const distanceFromCam = 80;
const K1 = 40;

const incrementSpeed = 0.8;

let x = 0, y = 0, z = 0;
let ooz = 0;
let xp = 0, yp = 0;
let idx = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memset = (array: any[], val: any, size: number): void => {
  for (let i = 0; i < size; ++i) {
    array[i] = val;
  }
}

interface CubeParams {
  cubeX: number;
  cubeY: number;
  cubeZ: number;
}

const calX = ({ cubeX, cubeY, cubeZ }: CubeParams): number => {
  const sA: number = Math.sin(A), sB: number = Math.sin(B), sC: number = Math.sin(C);
  const cA: number = Math.cos(A), cB: number = Math.cos(B), cC: number = Math.cos(C);
  return cubeY * sA * sB * cC - cubeZ * cA * sB * cC +
  cubeY * cA * sC + cubeZ * sA * sC + cubeX * cB * cC;
}

const calY = ({ cubeX, cubeY, cubeZ }: CubeParams) => {
  const sA = Math.sin(A), sB = Math.sin(B), sC = Math.sin(C), cA = Math.cos(A), cB = Math.cos(B), cC = Math.cos(C);
  return cubeY * cA * cC + cubeZ * sA * cC - 
  cubeY * sA * sB * sC + cubeZ * cA * sB * sC - 
    cubeX * cB * sC;
}

const calZ = ({ cubeX, cubeY, cubeZ }: CubeParams) => {
  const sA = Math.sin(A), sB = Math.sin(B), cA = Math.cos(A), cB = Math.cos(B);
  return cubeZ * cA * cB - cubeY * sA * cB + cubeX * sB;
}

const calSurf = (cubeX: number, cubeY: number, cubeZ: number, ch: string) => {
  x = calX({cubeX, cubeY, cubeZ});
  y = calY({cubeX, cubeY, cubeZ});
  z = calZ({cubeX, cubeY, cubeZ}) + distanceFromCam;

  ooz = 1 / z;

  xp = Math.round((width / 2 + K1 * ooz * x * 2));
  yp = Math.round((height / 2 + K1 * ooz * y));

  idx = xp + yp * width;


  if (idx >= 0 && idx < width * height) {
    if (ooz > zBuffer[idx]) {
      zBuffer[idx] = ooz;
      buffer[idx] = ch;
    }
  }

}

export const asciiFrame = () => {
  const face = [];
  A += 0.005;
  B += 0.005;
  memset(buffer, backgroundASCIICode, width * height);
  memset(zBuffer, 0, width * height * 4);
  for (let cubeX = -cubeWidth; cubeX < cubeWidth; cubeX += incrementSpeed) {
    for (let cubeY = -cubeWidth; cubeY < cubeWidth; cubeY+= incrementSpeed) {
      calSurf(cubeX, cubeY, -cubeWidth, "M");
      calSurf(cubeWidth, cubeY, cubeX, "™");
      calSurf(-cubeWidth, cubeY, -cubeX, "†");
      calSurf(-cubeX, cubeY, cubeWidth, ":");
      calSurf(cubeX, -cubeWidth, cubeY, "$");
      calSurf(cubeX, cubeWidth, cubeY, ".");
    }
  }
  for (let k = 0; k < width * height; k++) {
    face.push(k % width ? buffer[k] : "\n")
  }
  return face.join("");
};

// Default export for backward compatibility
const CubeLoader = () => {
  return asciiFrame();
};

export default CubeLoader;