import "./GoogleMap.scss";

import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { ReactElement, useContext, useLayoutEffect, useRef, useState } from 'react';
import { AdaptionContext } from '../context/AdaptionContext';
import { useEffect } from 'react';
import { ColorThemes, MapType } from "../common/Enums";
import { GeolocationContext } from "../context/GeolocationContext";
import { CameraContext } from './../context/CameraContext';
import { UserContext } from "../context/UserContext";
import { ExperimentCounterService } from "../services/ExperimentCounterService";
import { SocketContext } from "../context/SocketContext";

const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) return <h3>{status} ..</h3>;
  if (status === Status.FAILURE) return <h3>{status} ...</h3>;
  return <h3>{status}</h3>;
};

const MapComponent = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const geocoder = new google.maps.Geocoder();

  const adaptionContext = useContext(AdaptionContext);
  const geolocationContext = useContext(GeolocationContext);
  const cameraContext = useContext(CameraContext);
  const userContext = useContext(UserContext);
  const socketContext = useContext(SocketContext);

  const [destinationLocation, setDestinationLocation] = useState<{ lat: number, lng: number } | undefined>(undefined);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | undefined>(undefined);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | undefined>(undefined);
  const [mapObject, setMapObject] = useState<google.maps.Map | undefined>(undefined);
  const [locationMarker, setLocationMarker] = useState<google.maps.Marker | undefined>(undefined);
  const [destinationMarker, setDestinationMarker] = useState<google.maps.Marker | undefined>(undefined);
  const [firstLegPolyLine, setFirstLegPolyLine] = useState<google.maps.Polyline | undefined>(undefined);

  let locationUpdateInterval: NodeJS.Timer | undefined;

  const updateUserLocation = async () => {
    geolocationContext.getLocation(() => {});
  }

  const calculateDestination = () => {
    if (!geolocationContext.currentLocation) return;

    const startLocation = {
      lat: geolocationContext.currentLocation.latitude,
      lng: geolocationContext.currentLocation.longitude
    }

    const distance = 0.125; // Distance in Km

    const R: number = 6371 // Radius of the Earth
    const bearing = ( // Direction
      Math.floor(Math.random() * (360 - 1 + 1) + 1) * // Get random bearing between 1-360
      (Math.PI / 180) // Convert to radians
    );

    const lat1: number = startLocation.lat * (Math.PI / 180) // Current lat point converted to radians
    const lon1: number = startLocation.lng * (Math.PI / 180) // Current long point converted to radians

    let lat2: number = Math.asin(
      Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearing)
    );
    let lon2: number = lon1 + Math.atan2(
      Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

    
    lat2 = lat2 * (180 / Math.PI);
    lon2 = lon2 * (180 / Math.PI);
    
    setDestinationLocation({
      lat: lat2,
      lng: lon2
    });

    geolocationContext.updateDestination({
      latitude: lat2,
      longitude: lon2
    });
  }

  const initMap = () => {
    if (!mapElement.current) return;

    setDirectionsService(new google.maps.DirectionsService());
    setDirectionsRenderer(new google.maps.DirectionsRenderer({
      preserveViewport: true,
      suppressMarkers: true
    }));

    updateUserLocation();
    locationUpdateInterval = setInterval(updateUserLocation, 5000);
  }

  const selectMap = () => {
    if (adaptionContext.uiState.mapType === MapType.TERRAIN) {
      updateMap(undefined, adaptionContext.uiState.colorTheme === ColorThemes.DARK ? "df8bee2c01acfbbc" : "8171b9413b7fa18a")
    } else {
      updateMap(google.maps.MapTypeId.SATELLITE, undefined);
    }
  }

  useEffect(() => {
    initMap();

    return () => {
      clearInterval(locationUpdateInterval);
    }
  }, []);

  useEffect(() => {
    const currentLocation = geolocationContext.currentLocation;
    if (currentLocation === null || currentLocation === undefined || destinationLocation === undefined) return;
    
    const checkIfUserReachedDestination = async () => {
      const distanceToDestination = geolocationContext.getDistanceToDestination();

      if (distanceToDestination != null && distanceToDestination < 0.01) {
        cameraContext.updateIsRecording(false);
        socketContext.socket?.emit('experiment-ended', {
          userId: userContext.id,
          experimentNumber: ExperimentCounterService.getExperimentCount() + 1,
          timestamp: +new Date(),
          taskCompleted: true,
          distanceToDestination: distanceToDestination
        });

        const areAdaptionsUploaded = await adaptionContext.utility.emitAdaptions();
        window.location.href = "/experiment-survey";
      }
    }

    checkIfUserReachedDestination();
    calcRoute(destinationLocation);
  }, [geolocationContext.currentLocation, destinationLocation]);

  useLayoutEffect(() => {
    if (
      geolocationContext.currentLocation?.latitude &&
      geolocationContext.currentLocation.longitude &&
      !destinationLocation  
    ) {
      calculateDestination();
      selectMap();
    }
  }, [geolocationContext.currentLocation]);
  
  useLayoutEffect(() => {
    if (!mapElement.current) return;

    selectMap();
  }, [adaptionContext.uiState.colorTheme, adaptionContext.uiState.mapType]);

  const calcRoute = (destination: { lat: number, lng: number }) => {
    if (directionsService && directionsRenderer) {
      if (geolocationContext.currentLocation != null) {
        const request: google.maps.DirectionsRequest = {
          origin: {
            lat: geolocationContext.currentLocation.latitude,
            lng: geolocationContext.currentLocation.longitude
          },
          destination: destination,
          travelMode: google.maps.TravelMode.WALKING,
        };
    
        directionsService.route(request, function(result, status) {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            geocoder.geocode({
              placeId: result?.geocoded_waypoints?.[0].place_id
            }).then(( { results: userGeodata } ) => {
              if (userGeodata?.[0] && result) {
                placeLocationMarker(userGeodata);
                placeDestinationMarker(result);
                drawPolylineToFirstWaypoint(userGeodata, result);

                if (mapObject) {
                  locationMarker?.setMap(mapObject);
                  destinationMarker?.setMap(mapObject);
                  firstLegPolyLine?.setMap(mapObject);
                }
              }
            });
          }
        });
      }
    }
  }

  const placeLocationMarker = (userGeodata: google.maps.GeocoderResult[]) => {
    if (locationMarker) {
        locationMarker.setPosition(userGeodata[0].geometry.location);
      } else {
        setLocationMarker(new google.maps.Marker({
          position: userGeodata?.[0].geometry.location,
          map: mapObject,
          icon: {
            url: '/icons/user-location.png',
            scaledSize: new google.maps.Size(48, 48)
          }
        }));
      }
  }

  const placeDestinationMarker = (directionsResult: google.maps.DirectionsResult) => {
    if (destinationMarker) {
      destinationMarker.setPosition({
        lat: directionsResult?.routes[0].legs[0].end_location.lat() as number,
        lng: directionsResult?.routes[0].legs[0].end_location.lng() as number
      });
    } else {
      setDestinationMarker(new google.maps.Marker({
        position: {
          lat: directionsResult?.routes[0].legs[0].end_location.lat() as number,
          lng: directionsResult?.routes[0].legs[0].end_location.lng() as number
        },
        map: mapObject,
        icon: {
          url: '/icons/finish-line.png',
          scaledSize: new google.maps.Size(48, 48)
        }
      }));
    }
  }

  const drawPolylineToFirstWaypoint = (userGeodata: google.maps.GeocoderResult[], directionsResult: google.maps.DirectionsResult) => {
    const path = [
      { 
        lat: directionsResult.routes[0].legs[0].start_location.lat() as number,
        lng: directionsResult.routes[0].legs[0].start_location.lng() as number 
      },
      { 
        lat: userGeodata[0].geometry.location.lat() as number,
        lng: userGeodata[0].geometry.location.lng() as number
      }
    ];
  
    if (firstLegPolyLine) {
      firstLegPolyLine.setPath(path);
    } else {
      setFirstLegPolyLine(new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#73B9FF',
        strokeOpacity: 1,
        strokeWeight: 6,
        map: mapObject
      }));
    }
  }

  const updateMap = (maptypeId: google.maps.MapTypeId | undefined, mapId: string | undefined) => {
    if (!mapElement.current) return;

    const map = new window.google.maps.Map(mapElement.current, {
      center: {
        lat: geolocationContext.currentLocation?.latitude || 55.367288,
        lng: geolocationContext.currentLocation?.longitude || 10.433372
      },
      zoom: 17,
      mapId: mapId,
      mapTypeId: maptypeId,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      tilt: 45,
      heading: geolocationContext.heading || 0,
    });
    
    setMapObject(map);
    directionsRenderer?.setMap(map);
  }

  return <div ref={mapElement} id="map" />;
}

const GoogleMap = () => {
  return (
    <Wrapper apiKey={"AIzaSyCChKUNk6sDibr2TbKa98Kw6AaFSvCqJZU"} render={render}>
      <MapComponent />
    </Wrapper>
  );
}

export default GoogleMap;
