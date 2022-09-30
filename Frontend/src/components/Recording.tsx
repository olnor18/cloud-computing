import "./Recording.scss";

import { useContext, useEffect, useRef, useState } from "react";
import { CameraContext } from "../context/CameraContext";
import { AdaptionContext } from './../context/AdaptionContext';
import { ColorThemes, FontSizes } from "../common/Enums";
import { GeolocationContext } from "../context/GeolocationContext";
import { UserContext } from "../context/UserContext";
import { ExperimentCounterService } from "../services/ExperimentCounterService";
import { SocketContext } from "../context/SocketContext";

const Recording = () => {
  const seconds = useRef<HTMLSpanElement>(null);
  const minutes = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(FontSizes.MEDIUM);
  const [colorTheme, setColorTheme] = useState(ColorThemes.LIGHT);
  const [isTimerExpired, setIsTimerExpired] = useState<boolean>(false);
  
  const cameraContext = useContext(CameraContext);
  const adaptionContext = useContext(AdaptionContext);
  const geolocationContext = useContext(GeolocationContext);
  const socketContext = useContext(SocketContext);
  const userContext = useContext(UserContext);

  useEffect(() => {
    setFontSize(adaptionContext.uiState.fontSize);
  }, [adaptionContext.uiState.fontSize]);

  useEffect(() => {
    setColorTheme(adaptionContext.uiState.colorTheme);
  }, [adaptionContext.uiState.colorTheme]);

  useEffect(() => {
    const finishExperiment = async () => {
      const distanceToDestination = geolocationContext.getDistanceToDestination();

      cameraContext.updateIsRecording(false);
      socketContext.socket?.emit('experiment-ended', {
        userId: userContext.id,
        experimentNumber: ExperimentCounterService.getExperimentCount() + 1,
        timestamp: +new Date(),
        taskCompleted: (distanceToDestination && distanceToDestination < 0.01),
        distanceToDestination: distanceToDestination ? distanceToDestination : "Not registered"
      });
      
      const areAdaptionsUploaded = await adaptionContext.utility.emitAdaptions();

      window.location.href = "/experiment-survey";
    }

    if (isTimerExpired) finishExperiment();
  }, [isTimerExpired])

  useEffect(() => {

    const runTimer = async () => {
      if (cameraContext.isRecording) {
        const interval = setInterval(async () => {
            if (!seconds.current || !minutes.current) return;
  
            const currentSeconds = parseInt(seconds.current.innerHTML);
            const currentMinutes = parseInt(minutes.current.innerHTML);

            if (currentSeconds <= 0) {
              if (currentMinutes <= 0) {
                clearInterval(interval);
                setIsTimerExpired(true);
              } else {
                minutes.current.innerHTML = (currentMinutes - 1).toString().padStart(2, "0");
                seconds.current.innerHTML = "59";
              }
            } else {
              seconds.current.innerHTML = (currentSeconds - 1).toString().padStart(2, "0");
            }
          }, 1000);
      } else {
  
      }
    }

    runTimer();
  }, [cameraContext.isRecording]);

  return (
    <div className={`recording-container ${colorTheme === ColorThemes.LIGHT ? "light" : "dark"}`}>
      <>
        {cameraContext.isRecording &&
          <div className={`timer ${fontSize === FontSizes.MEDIUM ? "medium" : "large"}`}> 
            <span>
              <span ref={minutes}>
                02
              </span>
              :
              <span ref={seconds}>
                00
              </span>
            </span>
          </div>
        }
      </>
    </div>
  );
}

export default Recording;
