import './App.scss';

import { Routes, Route } from 'react-router-dom';
import MainScreen from './screens/MainScreen';
import IntroductionScreen from './screens/IntroductionScreens';
import { UserContextProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import { AdaptionContextProvider } from './context/AdaptionContext';
import { useState, useEffect } from 'react';
import SurveyScreen from './screens/SurveyScreen';
import EndScreen from './screens/EndScreen';
import ExperimentSurveyScreen from './screens/ExperimentSurveyScreen';
import ConsentScreen from './screens/ConsentScreen';
import { GeolocationProvider } from './context/GeolocationContext';
import { CameraProvider } from './context/CameraContext';

function App() {
  const [isExperimentStarted, setIsExperimentStarted] = useState(false);

  const startExperiment = () => { 
    setIsExperimentStarted(true);
  }

  const stopExperiment = () => { 
    setIsExperimentStarted(false);
  }

  return (
    <UserContextProvider>
      <SocketProvider>
        <AdaptionContextProvider isExperimentStarted={isExperimentStarted} >
          <GeolocationProvider>
            <CameraProvider>
              <Routes>
                <Route path="/" element={<IntroductionScreen />} />
                <Route path="/consent" element={<ConsentScreen />} />
                <Route path="/main" element={<MainScreen
                  startExperiment={startExperiment}
                  stopExperiment={stopExperiment}
                />} />
                <Route path="/experiment-survey" element={<ExperimentSurveyScreen />} />
                <Route path="/survey" element={<SurveyScreen />} />
                <Route path="/end" element={<EndScreen />} />
              </Routes>
            </CameraProvider>
          </GeolocationProvider>
        </AdaptionContextProvider>
      </SocketProvider>
    </UserContextProvider>
  );
}

export default App;
