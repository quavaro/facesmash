const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const videoCanvas = document.getElementById('video_frames');
const canvasCtx = canvasElement.getContext('2d');
const videoFramesCtx = videoCanvas.getContext('2d');
let shake = false;
let shakeCheck = 0;
let lastShakeCheck;

function abnormalize(normX, normY){
  const width = videoCanvas.width;
  const height = videoCanvas.height;
  let newX = 4*parseInt(normX*width);
  let newY = 4*parseInt(normY*height);
  return {x: newX, y: newY};
}

function swapPixels(pixel1, pixel2, frame){
        //hold onto the value of the current pixel
        const temp = frame.data[pixel1];

        //switch pixels
        frame.data[pixel1] = frame.data[pixel2]
        frame.data[pixel2] = temp;
}

function onResults(results) {

  videoFramesCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
  videoFramesCtx.drawImage(videoElement, 0, 0, videoCanvas.width, videoCanvas.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
          // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
          //                {color: '#C0C0C070', lineWidth: 1});
      const frame = videoFramesCtx.getImageData(0,0,videoCanvas.width,videoCanvas.height);

        lastShakeCheck = shakeCheck;
        shakeCheck = landmarks[1].x;
      if(Math.abs(shakeCheck-lastShakeCheck)>0.05){
        shake=true;
        setTimeout(() => {shake=false}, 2000);
      }
      if(shake){
        //iterate through landmarks and put their values in a random spot in randomLandmarks
        for( const landmark of landmarks) {
          //get non-normalized pixel value
          const landmark1 = abnormalize(landmark.x, landmark.y);
          
          //random index btw 0-467
          randomIndex = Math.floor(Math.random()*landmarks.length);
          const landmark2 = abnormalize(landmarks[randomIndex].x, landmarks[randomIndex].y);
          //get the video frame pixel index of current face pixel and random face pixel
          pixelIndex = videoCanvas.width*(landmark1.y-1)+landmark1.x;
          randomPixelIndex = videoCanvas.width*(landmark2.y-1)+landmark2.x;


          //swap a block of 100x100px
          for(let j = 0; j<100; j++){
            k=j*videoCanvas.width;
            for(let i=0; i<100; i=i+4){  
              swapPixels(k+i+pixelIndex, k+i+randomPixelIndex, frame);
              swapPixels(k+i+pixelIndex+1, k+i+randomPixelIndex+1, frame);
              swapPixels(k+i+pixelIndex+2, k+i+randomPixelIndex+2, frame);
              swapPixels(k+i+pixelIndex+3, k+i+randomPixelIndex+3, frame);
            }       
          }
          
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
 
