"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiClock, FiMic } from "react-icons/fi";
import "./InterviewPage.css";

export default function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId } = location.state || {};

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const lastFaceTime = useRef(Date.now());
  const lastLookingTime = useRef(Date.now());
  const isLooking = useRef(true);
  const animationIdRef = useRef(null);
  const cocoModelRef = useRef(null);
  const lastAudioLogTime = useRef(0); // To limit audio event frequency

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataArrayRef = useRef(null);
  const audioSourceRef = useRef(null);
  const speakingThreshold = 0.02;

  // State
  const [logs, setLogs] = useState([]);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speakingStatus, setSpeakingStatus] = useState("silent"); // speaking / silent

  // Redirect if no interviewId
  useEffect(() => {
    if (!interviewId) {
      alert("Interview ID is required");
      navigate("/");
    }
  }, [interviewId, navigate]);

  // API base
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Add log helper
  const addLog = useCallback(
    async (eventType, details = {}) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev, { timestamp, event: eventType }]);

      try {
        await fetch(`${apiBase}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId,
            eventType,
            details,
          }),
        });
      } catch (err) {
        console.error("Error saving event:", err);
      }
    },
    [interviewId, apiBase]
  );

  /** Face + Object + Audio detection setup */
  useEffect(() => {
    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5,
      maxNumFaces: 5,
    });

    faceDetection.onResults((results) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.detections.length > 1) {
        addLog("multiple_faces_detected", { count: results.detections.length });
      }

      if (results.detections.length > 0) {
        lastFaceTime.current = Date.now();

        results.detections.forEach((detection, idx) => {
          const box = detection.boundingBox;
          ctx.strokeStyle = idx === 0 ? "#3b82f6" : "#10b981";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);

          const faceCenterX = box.xMin + box.width / 2;
          const faceCenterY = box.yMin + box.height / 2;
          const screenCenterX = canvasRef.current.width / 2;
          const screenCenterY = canvasRef.current.height / 2;
          const offsetX = Math.abs(faceCenterX - screenCenterX);
          const offsetY = Math.abs(faceCenterY - screenCenterY);
          const lookingThreshold = 100;

          if (offsetX < lookingThreshold && offsetY < lookingThreshold) {
            if (!isLooking.current) addLog("looking_again");
            isLooking.current = true;
            lastLookingTime.current = Date.now();
          } else {
            if (
              Date.now() - lastLookingTime.current > 5000 &&
              isLooking.current
            ) {
              addLog("looking_away", { duration: 5 });
              isLooking.current = false;
            }
          }
        });
      } else {
        if (Date.now() - lastFaceTime.current > 10000) {
          addLog("no_face", { duration: 10 });
          lastFaceTime.current = Date.now();
        }
      }
      ctx.restore();
    });

    const setupObjectDetection = async () => {
      const tf = await import("@tensorflow/tfjs");
      await tf.setBackend("webgl");
      await tf.ready();

      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      cocoModelRef.current = await cocoSsd.load();

      setLoading(false);
      detectObjects();
    };

    const detectObjects = async () => {
      if (!videoRef.current || !cocoModelRef.current) {
        animationIdRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationIdRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      const predictions = await cocoModelRef.current.detect(video);
      const filtered = predictions.filter((pred) =>
        ["cell phone", "book", "laptop"].includes(pred.class)
      );

      if (filtered.length > 0) {
        filtered.forEach((pred) => {
          addLog(`${pred.class}_detected`, { confidence: pred.score });
        });
        setDetectedObjects(filtered);
      } else {
        setDetectedObjects([]);
      }

      const ctx = canvasRef.current.getContext("2d");
      filtered.forEach((pred) => {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.strokeRect(...pred.bbox);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#ef4444";
        ctx.fillText(
          `${pred.class} ${(pred.score * 100).toFixed(1)}%`,
          pred.bbox[0],
          pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10
        );
      });

      animationIdRef.current = requestAnimationFrame(detectObjects);
    };

    const setupCameraAndRecorder = async () => {
      try {
        while (!videoRef.current) await new Promise((r) => setTimeout(r, 50));

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;

        // MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
        recordedChunks.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunks.current.push(event.data);
        };
        mediaRecorderRef.current.start();

        const startTime = Date.now();
        const timer = setInterval(() => {
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        mediaRecorderRef.current.onstop = () => clearInterval(timer);

        // Face detection camera
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await faceDetection.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });
        camera.start();

        // Audio detection (log only when speaking)
        audioContextRef.current =
          new (window.AudioContext || window.webkitAudioContext)();
        audioSourceRef.current =
          audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        audioDataArrayRef.current = new Float32Array(analyserRef.current.fftSize);

        audioSourceRef.current.connect(analyserRef.current);

        const detectAudio = () => {
          analyserRef.current.getFloatTimeDomainData(audioDataArrayRef.current);
          const rms = Math.sqrt(
            audioDataArrayRef.current.reduce((sum, val) => sum + val * val, 0) /
              audioDataArrayRef.current.length
          );

          const now = Date.now();
          if (rms > speakingThreshold) {
            setSpeakingStatus("speaking");

            // Log to backend at most every 2 seconds
            if (now - lastAudioLogTime.current > 2000) {
              addLog("user_speaking", { rms: rms.toFixed(3) });
              lastAudioLogTime.current = now;
            }
          } else {
            setSpeakingStatus("silent");
          }

          requestAnimationFrame(detectAudio);
        };

        detectAudio();
      } catch (err) {
        console.error("Error accessing camera/microphone:", err);
      }
    };

    setupObjectDetection().then(() => setupCameraAndRecorder());

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (videoRef.current?.srcObject)
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      )
        mediaRecorderRef.current.stop();
    };
  }, [addLog]);

  /** End Meeting */
  const handleEndMeeting = () => {
    if (!mediaRecorderRef.current) {
      alert("No media recorder available.");
      return Promise.reject("No media recorder");
    }

    if (handleEndMeeting.isEnding) return Promise.resolve();
    handleEndMeeting.isEnding = true;
    setEnding(true);

    return new Promise((resolve, reject) => {
      try {
        mediaRecorderRef.current.onstop = async () => {
          try {
            const blob = new Blob(recordedChunks.current, {
              type: "video/webm",
            });
            const formData = new FormData();
            formData.append("video", blob, "interview.webm");

            const apiUrl =
              import.meta.env.VITE_API_URL || "http://localhost:3000";

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const res = await fetch(
              `${apiUrl}/api/end-interview/${interviewId}`,
              {
                method: "POST",
                body: formData,
                signal: controller.signal,
              }
            );
            clearTimeout(timeoutId);

            if (!res.ok) {
              const text = await res.text().catch(() => null);
              alert("Failed to upload video: " + (text || res.status));
              setEnding(false);
              handleEndMeeting.isEnding = false;
              return reject(new Error("Upload failed"));
            }

            const data = await res.json();
            navigate("/");
            setEnding(false);
            handleEndMeeting.isEnding = false;
            resolve(data.videoUrl);
          } catch (err) {
            console.error("Error uploading video:", err);
            alert("Error ending interview: " + (err?.message || err));
            setEnding(false);
            handleEndMeeting.isEnding = false;
            return reject(err);
          }
        };

        if (
          mediaRecorderRef.current.state === "recording" ||
          mediaRecorderRef.current.state === "paused"
        )
          mediaRecorderRef.current.stop();
        else setTimeout(() => mediaRecorderRef.current.onstop(), 50);
      } catch (err) {
        console.error("Error stopping mediaRecorder:", err);
        setEnding(false);
        handleEndMeeting.isEnding = false;
        return reject(err);
      }
    });
  };

  /** Loading Spinner */
  const LoadingSpinner = ({ label }) => (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <svg
        className="animate-spin h-12 w-12 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={label}
        role="img"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <p className="text-lg font-semibold text-gray-700">{label}</p>
    </div>
  );

  if (loading) return <LoadingSpinner label="Loading interview setup..." />;
  if (ending) return <LoadingSpinner label="Ending meeting... Please wait" />;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col mt-12">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 select-none">
            Interview Dashboard
          </h1>
          <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium gap-3">
            <div className="flex items-center gap-1">
              <FiClock className="mr-1" />
              {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
            </div>
            <div
              className={`flex items-center gap-1 font-semibold ${
                speakingStatus === "speaking" ? "text-green-600" : "text-red-500"
              }`}
            >
              <FiMic />
              {speakingStatus}
            </div>
          </div>
        </div>
        <button
          onClick={handleEndMeeting}
          disabled={ending}
          className={`inline-flex items-center gap-2 px-5 py-3 ${
            ending
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition`}
          aria-label="End Meeting"
          type="button"
        >
          <FiLogOut className="w-5 h-5" />
          End Meeting
        </button>
      </header>

      {/* Main Section */}
      <section className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 flex-1">
        {/* Video + Canvas Card */}
        <div className="relative flex-shrink-0 w-full md:w-[640px] rounded-xl shadow-lg bg-white overflow-hidden">
          <div className="relative w-full h-0" style={{ paddingBottom: "75%" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-0 left-0 w-full h-full object-cover rounded-xl"
              aria-label="Interview video feed"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Panels */}
        <div className="flex flex-col flex-1 space-y-6">
          {/* Event Logs */}
          <section className="bg-white rounded-xl shadow-md p-4 flex-1 overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 sticky top-0 bg-white border-b pb-2">
              Event Logs
            </h2>
            <ul className="space-y-1 text-sm text-gray-700">
              {logs.length === 0 && (
                <li className="italic text-gray-400 select-none">
                  No events logged yet.
                </li>
              )}
              {logs.map((log, idx) => (
                <li
                  key={idx}
                  className="animate-fadeIn transition-opacity duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span className="font-mono text-gray-500 mr-2 select-text">
                    [{log.timestamp}]
                  </span>
                  <span className="select-text">
                    {log.event.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Detected Objects */}
          <section className="bg-white rounded-xl shadow-md p-4 max-h-[200px] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 sticky top-0 bg-white border-b pb-2">
              Detected Objects
            </h2>
            {detectedObjects.length === 0 ? (
              <p className="italic text-gray-500 select-none">
                No restricted objects detected.
              </p>
            ) : (
              <ul className="space-y-1 text-gray-700 text-sm">
                {detectedObjects.map((obj, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center animate-fadeIn transition-opacity duration-500"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <span className="capitalize select-text">{obj.class}</span>
                    <span className="font-mono text-red-600 select-text">
                      {(obj.score * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
