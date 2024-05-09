// inspired by https://www.a1k0n.net/2011/07/20/donut-math.html
// Loading 3D Cube
let A = 0, B = 0, C = 0;

let cubeWidth = 10;
let width =50; let height = 20;
let zBuffer = Array(width * height).fill(0);
let buffer =  Array(width * height);
let backgroundASCIICode = ' ';
let distanceFromCam = 80;
let K1 = 40;

let incrementSpeed = 0.8;

let x = 0, y = 0, z = 0;
let ooz = 0;
let xp = 0, yp = 0;
let idx = 0;

const memset = (array, val, size) => {
  for (var i = 0; i < size; ++i) {
    array[i] = val;
  }
} 

const calX = (i, j, k) => {
  let sA = Math.sin(A), sB = Math.sin(B), sC = Math.sin(C), cA = Math.cos(A), cB = Math.cos(B), cC = Math.cos(C);
  return j * sA * sB * cC - k * cA * sB * cC + 
    j * cA * sC + k * sA * sC + i * cB * cC;
}

const calY = (i, j, k) => {
  let sA = Math.sin(A), sB = Math.sin(B), sC = Math.sin(C), cA = Math.cos(A), cB = Math.cos(B), cC = Math.cos(C);
  return j * cA * cC + k * sA * cC - 
    j * sA * sB * sC + k * cA * sB * sC - 
    i * cB * sC;
}

const calZ = (i, j, k) => {
  let sA = Math.sin(A), sB = Math.sin(B), cA = Math.cos(A), cB = Math.cos(B);
  return k * cA * cB - j * sA * cB + i * sB;
}

const calSurf = (cubeX, cubeY, cubeZ, ch) => {
  x = calX(cubeX, cubeY, cubeZ);
  y = calY(cubeX, cubeY, cubeZ);
  z = calZ(cubeX, cubeY, cubeZ) + distanceFromCam;

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
  let face = [];
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