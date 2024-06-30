"use client";
import { useState, useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDeviceId } from "@/features/device/deviceSlice";

export default function MicrophoneTest() {
  const dispatch = useDispatch();
  const { selectedDeviceId } = useSelector((state) => state.Device);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audioDevices, setAudioDevices] = useState([]);
  const [inputLevel, setInputLevel] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(true); // Default to true initially
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Function to request microphone permission
    const requestMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setPermissionGranted(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setPermissionGranted(false);
      }
    };

    // Check if permission is granted
    if (!navigator.permissions || !navigator.permissions.query) {
      console.warn("Browser does not support navigator.permissions.query.");
    } else {
      navigator.permissions
        .query({ name: "microphone" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            setPermissionGranted(true);
          } else if (permissionStatus.state === "prompt") {
            // Request permission if not granted or denied
            requestMicrophonePermission();
          } else {
            setPermissionGranted(false);
          }
        })
        .catch((err) => {
          console.error("Error querying microphone permission:", err);
          setPermissionGranted(false);
        });
    }
  }, []);

  useEffect(() => {
    // Fetch audio devices when component mounts
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const audioInputs = devices.filter(
          (device) => device.kind === "audioinput"
        );
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0) {
          dispatch(
            setSelectedDeviceId({ microphone: audioInputs[0].deviceId })
          );
        }
      })
      .catch((err) => {
        console.error("Error fetching devices:", err);
      });
  }, []);

  const startRecording = async () => {
    if (!permissionGranted) {
      // Request permission if not granted
      await requestMicrophonePermission();
      return;
    }

    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL("");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId.microphone
            ? { exact: selectedDeviceId.microphone }
            : undefined,
        },
      });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current);
        const newAudioURL = URL.createObjectURL(audioBlob);
        setAudioURL(newAudioURL);
        audioChunksRef.current = [];
        if (audioRef.current) {
          audioRef.current.play();
        }
      };

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Increased fftSize for better resolution
      analyserRef.current = analyser;
      source.connect(analyser);

      const pcmData = new Float32Array(analyser.fftSize);

      const updateInputLevel = () => {
        analyser.getFloatTimeDomainData(pcmData);
        let sumSquares = 0.0;
        for (const amplitude of pcmData) {
          sumSquares += amplitude * amplitude;
        }
        const volume = Math.sqrt(sumSquares / pcmData.length);
        setInputLevel(volume); // Directly use volume as a percentage
        animationFrameRef.current = requestAnimationFrame(updateInputLevel);
      };

      setIsRecording(true);
      mediaRecorderRef.current.start();
      updateInputLevel();
    } catch (err) {
      console.error("Permission denied:", err);
      setPermissionGranted(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach((track) => track.stop());
    cancelAnimationFrame(animationFrameRef.current);
    setIsRecording(false);
  };

  useEffect(() => {
    console.log(audioURL);
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  }, [audioURL]);

  const renderBars = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      bars.push(
        <div
          key={i}
          className="w-4 h-8 mx-1 bg-background rounded-lg transition-opacity duration-100"
          style={{
            opacity: inputLevel * 10 > i / 20 ? 1 : 0.2,
          }}
        ></div>
      );
    }
    return bars;
  };

  return (
    <div className="mt-4 h-full flex flex-col items-center justify-center p-4">
      <div className=" flex justify-center items-center space-x-4 mb-4">
        <FaMicrophone className="h-6 w-6 text-foreground" />
        <select
          className="p-2 border rounded"
          value={selectedDeviceId.microphone}
          onChange={(e) =>
            dispatch(
              setSelectedDeviceId({
                microphone: e.target.value,
              })
            )
          }
        >
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      {!permissionGranted && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          Microphone permission is not granted. Please allow access and try
          again.
        </div>
      )}
      {permissionGranted && (
        <div className="mt-5 flex flex-col justify-center items-center p-6 rounded-xl border border-foreground">
          <h1 className="text-2xl font-bold text-foreground text-center w-[500px]">
            Speak and pause to check your Microphone; you will then hear your
            voice.
          </h1>
          <div className="mt-10 bg-foreground border border-black/20 p-7 shadow-lg rounded-xl flex flex-col items-center justify-center gap-5">
            <h1 className="text-xl font-bold text-background">Input level</h1>
            <div className="flex justify-center items-center">
              {renderBars()}
            </div>
          </div>

          <button
            className={`mt-10 p-4 rounded-full w-[150px] ${
              isRecording
                ? "bg-red-500 hover:bg-red-700"
                : "bg-green-500 hover:bg-green-700"
            } text-white`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "Stop" : "Speak"}
          </button>
        </div>
      )}
    </div>
  );
}
