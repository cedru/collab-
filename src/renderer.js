const { ipcRenderer } = require('electron');

const chooseImageBtn = document.getElementById('chooseImageBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coordinatesInfo = document.getElementById('coordinatesInfo');
const copyButton = document.getElementById('copyCoordBtn');

const desiredImageWidth = 750;

canvas.hidden = true;

let isDrawing = false;
let startX, startY, endX, endY;
let img = new Image();
let startXPercent, startYPercent, rectWidthPercent, rectHeightPercent;

chooseImageBtn.addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog');
});

copyButton.addEventListener('click', () => {
  copyContent();
});

canvas.addEventListener('mousedown', (event) => {
  isDrawing = true;
  startX = event.clientX - canvas.getBoundingClientRect().left;
  startY = event.clientY - canvas.getBoundingClientRect().top;
});

canvas.addEventListener('mousemove', (event) => {
  if (!isDrawing) return;

  endX = event.clientX - canvas.getBoundingClientRect().left;
  endY = event.clientY - canvas.getBoundingClientRect().top;

  drawCanvas();
  drawMarquee(startX, startY, endX, endY);
});

canvas.addEventListener('mouseup', () => {
  if (isDrawing) {
    isDrawing = false;
    drawCanvas();
    drawMarquee(startX, startY, endX, endY);

    const rectWidth = Math.abs(endX - startX);
    const rectHeight = Math.abs(endY - startY);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    startXPercent = ((startX / canvasWidth) * 100).toFixed(2);
    startYPercent = ((startY / canvasHeight) * 100).toFixed(2);
    rectWidthPercent = ((rectWidth / canvasWidth) * 100).toFixed(2);
    rectHeightPercent = ((rectHeight / canvasHeight) * 100).toFixed(2);

    coordinatesInfo.innerHTML = `${startXPercent}   ${startYPercent}   ${rectWidthPercent}   ${rectHeightPercent}`;
  }
});

ipcRenderer.on('selected-file', (_, filePath) => {
  canvas.classList.add('hidden');
  img.onload = () => {
    const imgAspectRatio = img.width / img.height;

    let canvasWidth = desiredImageWidth;
    let canvasHeight = canvasWidth / imgAspectRatio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    canvas.hidden = false;
    copyButton.hidden = false;
  };

  img.src = 'file://' + filePath;
});

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function drawMarquee(x1, y1, x2, y2) {
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  const rectWidth = x2 - x1;
  const rectHeight = y2 - y1;

  ctx.fillRect(x1, y1, rectWidth, rectHeight);
  ctx.strokeRect(x1, y1, rectWidth, rectHeight);
}

let copyContent = () => {
  navigator.clipboard.writeText(
    startXPercent + ' ' + startYPercent + ' ' + rectWidthPercent + ' ' + rectHeightPercent
  );
  copyButton.innerText = 'Copied!';

  setTimeout(() => {
    copyButton.innerText = 'Copy coordinates';
  }, 1000);
};

const closeButton = document.getElementById('closeButton');

document.getElementById('closeButton').addEventListener('click', () => {
  ipcRenderer.send('close-me');
});
