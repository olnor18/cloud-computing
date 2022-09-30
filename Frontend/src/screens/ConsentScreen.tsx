import './IntroductionScreens.scss';
import { useContext } from 'react';
import { GeolocationContext } from '../context/GeolocationContext';
import { CameraContext } from '../context/CameraContext';
import { useState } from 'react';
import { useEffect } from 'react';
import { PermissionChecker } from '../services/PermissionsChecker';

const ConsentScreen = () => {
  const geolocationContext = useContext(GeolocationContext);
  const cameraContext = useContext(CameraContext);
  const [isContinueButtonDisabled, setIsContinueButtonDisabled] = useState<boolean>(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(false);
  const [isGeolocationEnabled, setIsGeolocationEnabled] = useState<boolean>(false);
  const [isCameraButtonDisabled, setIsCameraButtonDisabled] = useState<boolean>(false);
  const [isGeolocationButtonDisabled, setIsGeolocationButtonDisabled] = useState<boolean>(false);

  const onEnableLocationClicked = () => {
    const getPermission = async () => {
      geolocationContext.getLocation((isPermissionGranted: boolean) => {
        setIsGeolocationEnabled(isPermissionGranted);
        setIsGeolocationButtonDisabled(isPermissionGranted);
      });
    }

    getPermission();
  }

  const onEnableCameraClicked = () => {    
    const checkPermission = async () => {
      return await PermissionChecker.isCameraGranted()
    }

    const getPermission = async () => {
      await cameraContext.getPermission();
      setIsCameraEnabled(await checkPermission());
      setIsCameraButtonDisabled(await checkPermission());
    }

    getPermission();
  }

  useEffect(() => {
    const checkPermissions = async () => {
      const areBothServicesEnabled = await PermissionChecker.isGeolocationGranted() && await PermissionChecker.isCameraGranted();
      
      setIsCameraButtonDisabled(await PermissionChecker.isCameraGranted());
      setIsGeolocationButtonDisabled(await PermissionChecker.isGeolocationGranted());
      setIsContinueButtonDisabled(!areBothServicesEnabled);
    }

    checkPermissions();
  }, [])

  useEffect(() => {
    if (isCameraEnabled && isGeolocationEnabled) {
      setIsContinueButtonDisabled(false);
    }
  }, [isCameraEnabled, isGeolocationEnabled]);

  const handleOnConsent = () => {
    window.location.href = "/main";
  }
 
  return (
    <div className="container">
      <h1>Consent</h1>

      <div className='paragraphs'>
        <p>
          This app needs your consent to access your location and your phone's camera.
          Please make sure your location service is enabled in your settings.
        </p>
        <p>
         Click the green buttons below to grant access to your location and camera: 
        </p>
        <div className='access-buttons'>
          <button onClick={onEnableLocationClicked} disabled={isGeolocationButtonDisabled}>Enable Location</button>
          <button onClick={onEnableCameraClicked} disabled={isCameraButtonDisabled}>Enable Camera</button>
        </div>
        <p>
          When you are ready to start the first experiment, click the blue button below.
        </p>
      </div>
      
      <button className='button' onClick={handleOnConsent} disabled={isContinueButtonDisabled}>
        I Consent
      </button>
    </div>
  )
}

export default ConsentScreen;
