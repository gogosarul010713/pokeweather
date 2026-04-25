const fs = require('fs');

const content = fs.readFileSync('./src/assets/icons/clima.svg', 'utf-8');

// Extraer todos los números de los paths
const numbers = [];
const regex = /d="([^"]+)"/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const pathData = match[1];
  const coords = pathData.match(/[\d.]+/g) || [];
  coords.forEach(coord => {
    numbers.push(parseFloat(coord));
  });
}

if (numbers.length === 0) {
  console.log('No coordinates found');
  process.exit(1);
}

const xCoords = numbers.filter((_, i) => i % 2 === 0);
const yCoords = numbers.filter((_, i) => i % 2 === 1);

const minX = Math.min(...xCoords);
const maxX = Math.max(...xCoords);
const minY = Math.min(...yCoords);
const maxY = Math.max(...yCoords);

console.log('Bounds:', { minX, maxX, minY, maxY });

// Calcular nuevo viewBox con 1% margen
const width = maxX - minX;
const height = maxY - minY;
const marginX = width * 0.01;
const marginY = height * 0.01;

const newMinX = minX - marginX;
const newMinY = minY - marginY;
const newWidth = width + (marginX * 2);
const newHeight = height + (marginY * 2);

const newViewBox = `${newMinX.toFixed(1)} ${newMinY.toFixed(1)} ${newWidth.toFixed(1)} ${newHeight.toFixed(1)}`;
console.log('New viewBox:', newViewBox);
