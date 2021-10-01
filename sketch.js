const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const videoCanvas = document.getElementById('video_frames');
const canvasCtx = canvasElement.getContext('2d');
const videoFramesCtx = videoCanvas.getContext('2d');

function onResults(results) {
  videoFramesCtx.clearRect(0, 0, canvasElement.width, canvasElement.width*0.5625);
  videoFramesCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.width*0.5625);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
          // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
          //                {color: '#C0C0C070', lineWidth: 1});
      const frame = videoFramesCtx.getImageData(0,0,videoCanvas.width,videoCanvas.width*0.5625);
      length = frame.data.length;
      const data = frame.data;
      console.log(landmarks);
      console.log(data);
      for (let i = 0; i < length; i += 4) {
        const red = frame.data[i + 0];
        const green = data[i + 1];
        const blue = data[i + 2];
        if (green > 100 && red > 100 && blue < 43) {
          data[i + 3] = 0;
        }
      }
      canvasCtx.putImageData(frame, 0, 0);
    }
  }
  //canvasCtx.restore();
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();
 