import React, { createContext, useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { SocketContext } from './SocketContext';

const defaultState: { 
  hasPermission: boolean,
  currentLocation: Location | null,
  currentDestination: Location | null, 
  heading: number | null, 
  getLocation: (callback: (isPermissionGranted: boolean) => void) => void,
  updateDestination: (destination: Location) => void,
  getDistanceToDestination: () => number | null
} = {
  hasPermission: false,
  currentLocation: null,
  currentDestination: null,
  heading: null,
  getLocation: () => {},
  updateDestination: () => {},
  getDistanceToDestination: () => null
}

type GeolocationContextProviderProps = {
  children: React.ReactNode
}

export type Location = {
  latitude: number,
  longitude: number
}

export const GeolocationContext = createContext(defaultState);

export const GeolocationProvider = ({children}: GeolocationContextProviderProps) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [currentDestination, setCurrentDestination] = useState<Location | null>(null);
  const [heading, setHeading] = useState<number | null>(null);

  const userContext = useContext(UserContext);
  const socketContext = useContext(SocketContext);

  // Get permission to use geolocation from the browser
  const getLocation = (callback: (isPermissionGranted: boolean) => void) => {
    if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(
      (position) => { 
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setHeading(position.coords.heading);
        setHasPermission(true);
        callback(true);
      },
      (error) => {
        //console.log("Location error: " + error.message);
        callback(false);
      },
      {
        enableHighAccuracy: true,
      }
    );
    } else {
      alert("Your browser does not support geolocation.\n Is your phone's location service enabled?");
      callback(false);
    }
  }

  const updateDestination = (destination: Location) => {
    setCurrentDestination(destination);
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);  // deg2rad below
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  const getDistanceToDestination = () => {
    if (!currentLocation || !currentDestination) return null;
    
    return calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      currentDestination.latitude,
      currentDestination.longitude
    );
  }

  return (
    <GeolocationContext.Provider value={{
      hasPermission,
      currentLocation,
      currentDestination,
      heading,
      getLocation,
      updateDestination,
      getDistanceToDestination
    }}>
      {children}
    </GeolocationContext.Provider>
  );
};
