"use client";
import { useState, useRef, useEffect } from "react";

export default function CameraTest() {
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [cameraFound, setCameraFound] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const videoRef = useRef(null);
  const camerasRef = useRef([]);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );
        camerasRef.current = cameras;
        setCameraFound(cameras.length > 0);
        if (cameras.length > 0) {
          setSelectedDeviceId(cameras[0].deviceId);
        }
      } catch (err) {
        console.error("Error checking camera:", err);
      }
    };

    checkCamera();
  }, []);

  const handleDeviceChange = (deviceId) => {
    setSelectedDeviceId(deviceId);
  };

  useEffect(() => {
    if (permissionGranted && cameraFound && selectedDeviceId) {
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: selectedDeviceId },
          });
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }, 100);
        } catch (err) {
          console.error("Error starting stream:", err);
        }
      };

      startStream();
    }
  }, [permissionGranted, cameraFound, selectedDeviceId]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Camera Test</h1>
      {!permissionGranted && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          Camera permission is not granted. Please allow access and try again.
        </div>
      )}
      {permissionGranted && !cameraFound && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
          No camera found. Please connect a camera and try again.
        </div>
      )}
      {permissionGranted && cameraFound && (
        <div className="flex justify-center items-center mb-4">
          <select
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="p-2 border rounded"
          >
            {camerasRef.current.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${camera.deviceId}`}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mt-4 rounded-xl max-w-[455px] object-cover h-[306px] w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-xl max-w-[455px] object-cover h-[306px] w-full"
        ></video>
      </div>
    </div>
  );
}
