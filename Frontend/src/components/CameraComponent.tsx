import * as tf from '@tensorflow/tfjs';
import { detectAllFaces, TinyFaceDetectorOptions } from '@vladmandic/face-api';

import "./CameraComponent.scss";

import { useContext, useEffect, useRef, useState } from "react";
import { AdaptionContext } from '../context/AdaptionContext';
import { CameraContext } from '../context/CameraContext';
import { SocketContext } from '../context/SocketContext';
import { UserContext } from '../context/UserContext';
import { ExperimentCounterService } from '../services/ExperimentCounterService';

const validMimeTypes = [
  "video/webm",
  "video/webm;codecs=vp8",
  "video/webm;codecs=daala",
  "video/webm;codecs=h264",
  "video/mpeg"
];

const getLastAvailableMimeType = () => {
  const availableMimeTypes: string[] = [];

  for (const mimeType of validMimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      availableMimeTypes.push(mimeType);
    }
  }

  return availableMimeTypes[availableMimeTypes.length - 1];
}

const CameraComponent = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const adaptionContext = useContext(AdaptionContext);
  const cameraContext = useContext(CameraContext);
  const socketContext = useContext(SocketContext);
  const userContext = useContext(UserContext); 

  useEffect(() => {
    cameraContext.getPermission();
  }, []);

  useEffect(() => {
    if (videoElementRef.current && cameraContext.cameraStream) {
      videoElementRef.current.srcObject = cameraContext.cameraStream;
      
      const selectedMimeType = getLastAvailableMimeType();
      
      setMediaRecorder(new MediaRecorder(cameraContext.cameraStream, {
        mimeType: selectedMimeType,
      }));
    } 
  }, [cameraContext.cameraStream]);
  
  useEffect(() => {
    if (mediaRecorder && cameraContext.isRecording) {
      const timesliceLength = 1000; // ms
      let timesliceStart = +(new Date());
      let timesliceEmotions: { emotionName: string, intensity: number }[] = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (!videoElementRef.current) return;
        // Detecting emption of user
        const detections = await detectAllFaces(videoElementRef.current, new TinyFaceDetectorOptions()).withFaceExpressions();

        if (detections[0] === undefined) return;
        // If expressions are present
        const expressions = detections[0].expressions;

        adaptionContext.utility.updateEmotions({
          anger: expressions.angry,
          disgust: expressions.disgusted,
          fear: expressions.fearful,
          happiness: expressions.happy,
          sadness: expressions.sad,
          surprise: expressions.surprised,
          neutral: expressions.neutral,
        });
        
        let currentExpression = null;
        let i = 0;
        // Loop over all expressions and find the one with the highest probability
        for (const key in expressions){
          //@ts-ignore
          let value = expressions[key]
          // 90% probability threshold for choosing emotion
          if(value >= 0.90) {
            currentExpression = key;
            break;
          }
          i++;
        }

        if (currentExpression) {
          adaptionContext.utility.updateEmotion(i);

          const currentTime = +(new Date());

          if (currentTime > timesliceStart + timesliceLength) {
            for (const key in expressions) {
              timesliceEmotions.push({
                emotionName: key, // @ts-ignore
                intensity: expressions[key]
              });
            }

            if (socketContext.socket) {
              socketContext.socket.emit('emotion-recorded', {
                userId: userContext.id,
                experimentName: ExperimentCounterService.getExperimentName(),
                experimentType: ExperimentCounterService.getExperimentType(),
                experimentNumber: ExperimentCounterService.getExperimentCount() + 1,
                emotions: timesliceEmotions,
                timesliceStart: timesliceStart,
                timesliceEnd: currentTime
              });
            }
            timesliceEmotions = [];
            timesliceStart = +(new Date());
          }
        }
      }
  
      mediaRecorder.start(200);
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }
  }, [cameraContext.isRecording, mediaRecorder]);

  return (
    <div className="camera-container">
      <video 
        controlsList='nodownload nofullscreen noremoteplayback'
        disablePictureInPicture 
        disableRemotePlayback
        muted 
        preload='none'
        autoPlay 
        ref={videoElementRef} 
      />
    </div>
  );
}

export default CameraComponent;
