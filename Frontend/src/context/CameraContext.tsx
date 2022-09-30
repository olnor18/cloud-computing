import * as tf from '@tensorflow/tfjs';
import { nets } from "@vladmandic/face-api";
import React, { createContext, useState } from "react";

const defaultState: { hasPermission: boolean, isRecording: boolean, cameraStream: MediaStream | null, getPermission: () => Promise<void>, updateIsRecording: (isRecording: boolean) => void } = {
  hasPermission: false,
  isRecording: false,
  cameraStream: null,
  getPermission: async () => {},
  updateIsRecording: (isRecording: boolean) => {},
}

type CameraContextProviderProps = {
  children: React.ReactNode
}

export const CameraContext = createContext(defaultState);

export const CameraProvider = ({children}: CameraContextProviderProps) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Get permission to use the camera from the browser
  const getPermission = async () => {
    const setupModels = async () => {
      await nets.tinyFaceDetector.loadFromUri('/models');
      await nets.faceLandmark68Net.loadFromUri('/models');
      await nets.faceRecognitionNet.loadFromUri('/models');
      await nets.faceExpressionNet.loadFromUri('/models');
    }

    await setupModels();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const initializeCamera = async () => { 
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: 
            { 
              aspectRatio: 1/1, 
              facingMode: 'user',
              width: { min: 360, ideal: 720, max: 720 },
              height: { min: 360, ideal: 720, max: 720 },
              deviceId: undefined
            }  
          });

          if (stream) {
            setCameraStream(stream);
            setHasPermission(true);
          } else {
            setHasPermission(false);
            alert('Unable to access camera: Please check if you have granted permission to use the camera and if you are connected via HTTPS.');
          }
        } catch (error) {
          alert('Unable to access camera: Please check if you have granted permission to use the camera and if you are connected via HTTPS.');
        }
      };

      await initializeCamera();
    } else {
      alert("Your browser does not support camera access.\n Is your phone's camera enabled?");
    }
  }

  const updateIsRecording = (isRecording: boolean) => {
    setIsRecording(isRecording);
  }

  return (
    <CameraContext.Provider value={{
      hasPermission,
      isRecording,
      cameraStream,
      getPermission,
      updateIsRecording
    }}>
      {children}
    </CameraContext.Provider>
  );
};
