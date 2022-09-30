import "./MainScreen.scss";

import { useContext, useEffect, useState } from "react";
import Recording from "../components/Recording";
import EventModal from "../components/EventModal";
import CameraComponent from "../components/CameraComponent";
import { AdaptionContext } from "../context/AdaptionContext";
import GoogleMap from "../components/GoogleMap";
import { ColorThemes, DialogVisibility, FontSizes } from "../common/Enums";
import { CameraContext } from "../context/CameraContext";
import { SocketContext } from './../context/SocketContext';
import { ExperimentCounterService } from './../services/ExperimentCounterService';

interface MainScreenProps {
  startExperiment: () => void,
  stopExperiment: () => void,
}

const MainScreen = (props: MainScreenProps) => { 
  const [isEventModalVisible, setIsEventModalVisible] = useState(true);
  const [eventModalMessage, setEventModalMessage] = useState(`Hurry up! You need to get to your destination quickly!`);
  const [colorTheme, setColorTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const adaptionContext = useContext(AdaptionContext);
  const cameraContext = useContext(CameraContext);
  const socketContext = useContext(SocketContext);

  useEffect(() => {
    if (localStorage.getItem('@user_id') === null || localStorage.getItem('experimentCount') === null) {
      window.location.href = "/";
    }

    cameraContext.updateIsRecording(true);
    socketContext.socket?.emit('experiment-started', {
      experimentNumber: ExperimentCounterService.getExperimentCount() + 1,
      expeirmentName: ExperimentCounterService.getExperimentName(),
      experimentType: ExperimentCounterService.getExperimentType(),
      timestamp: +new Date()
    });
  }, []);

  useEffect(() => {
    if (cameraContext.isRecording) {
      props.startExperiment();
    } else {
      props.stopExperiment();
    }
  }, [cameraContext.isRecording, props]);

  useEffect(() => {
    switch (adaptionContext.uiState.colorTheme) {
      case ColorThemes.LIGHT:
        setColorTheme("light");
        break;
      case ColorThemes.DARK:
        setColorTheme("dark");
        break;
    }
  }, [
    adaptionContext.uiState.colorTheme,
  ]);

  useEffect(() => {
    switch (adaptionContext.uiState.fontSize) {
      case FontSizes.MEDIUM:
        setFontSize("medium");
        break;
      case FontSizes.LARGE:
        setFontSize("large");
        break;
    }
  }, [
    adaptionContext.uiState.fontSize,
  ]);

  useEffect(() => {
    switch (adaptionContext.uiState.dialogVisibility) {
      case DialogVisibility.HIDDEN:
        setIsEventModalVisible(false);
        break;
      case DialogVisibility.VISIBLE:
        setIsEventModalVisible(true);
        break;
    }
  }, [
    adaptionContext.uiState.dialogVisibility,
  ]);

  const hideEventModal = () => { 
    setIsEventModalVisible(false);
  }

  return (
    <div className={`mainscreen-container ${colorTheme} ${fontSize}`}>
      <GoogleMap />
      <CameraComponent />
      <Recording />
      <EventModal 
        isVisible={isEventModalVisible} 
        message={eventModalMessage} 
        onClose={() => hideEventModal()}
      />
    </div>
  )
}

export default MainScreen;
