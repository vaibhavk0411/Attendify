import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Scan,
  Camera,
  CheckCircle,
  Video,
  VideoOff,
  AlertCircle,
} from "lucide-react";
import Webcam from "react-webcam";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { useAuth } from "react-oidc-context";

const REGION = "ap-south-1";
const BUCKET_NAME = "attendify-user-uploads";
const IDENTITY_POOL_ID = "ap-south-1:21ea20d3-e20c-43f9-b400-a592f5ac4801";
const USER_POOL_ID = "ap-south-1_98vEDqTTf";

const S3Upload = () => {
  const auth = useAuth();
  const idToken = auth?.user?.id_token;
  const webcamRef = useRef<Webcam>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });
      setStream(mediaStream);
      setIsWebcamActive(true);
    } catch (error) {
      alert("Webcam access denied. Please allow camera access.");
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);
  };

  const capturePhoto = async () => {
    if (!webcamRef.current || !canvasRef.current) {
      alert("Unable to capture photo. Please try again.");
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Image capture failed.");
      return;
    }
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context?.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
    await handleUpload(imageSrc);
  };

  const handleUpload = async (imageSrc: string) => {
    setIsProcessing(true);
    setUploadSuccess(false);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const fileName = `attendance/${Date.now()}.jpg`;

      const credentials = fromCognitoIdentityPool({
        identityPoolId: IDENTITY_POOL_ID,
        clientConfig: { region: REGION },
        logins: {
          [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken || "",
        },
      });

      const s3 = new S3Client({
        region: REGION,
        credentials,
      });

      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: uint8Array,
        ContentType: "image/jpeg",
      };

      await s3.send(new PutObjectCommand(uploadParams));
      console.log("✅ Uploaded to S3:", fileName);

      const verifyResponse = await fetch(
        "https://mv26cx5baa.execute-api.ap-south-1.amazonaws.com/sample/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ key: fileName }),
        }
      );

      const result = await verifyResponse.json();
      console.log("🎯 Lambda response:", result);

      const now = new Date();
      let parsedBody = result;

      if (typeof result.body === "string") {
        parsedBody = { ...result, ...JSON.parse(result.body) };
      }

      if (parsedBody.success && parsedBody.match && parsedBody.match.name) {
        const { name, timestamp, status } = parsedBody.match;
        setAttendanceData({
          name,
          date: new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: status || "Recognized",
        });
      } else {
        setAttendanceData({
          name: "Unknown",
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          status: "Not Recognized",
        });
      }

      setUploadSuccess(true);
      stopWebcam();
    } catch (error: any) {
      console.error("Upload or verification failed:", error);
      alert("Upload or verification failed: " + (error?.message || error?.toString?.()));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadSuccess(false);
    setAttendanceData(null);
    setIsWebcamActive(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const statusColor =
    attendanceData?.status === "Present"
      ? "text-green-600"
      : attendanceData?.status === "Already Marked"
      ? "text-yellow-600"
      : "text-red-600";

  const statusIcon =
    attendanceData?.status === "Present" || attendanceData?.status === "Already Marked"
      ? <CheckCircle className={`w-5 h-5 mr-2 ${statusColor}`} />
      : <AlertCircle className={`w-5 h-5 mr-2 ${statusColor}`} />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Mark Your Attendance</h1>
      {!uploadSuccess ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Live Camera</CardTitle>
              <CardDescription>Position your face in the camera view</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                {isWebcamActive ? (
                  <Webcam
                    ref={webcamRef}
                    className="w-full h-64 object-cover bg-black"
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Camera not active</p>
                      <p className="text-sm text-gray-500">Click start camera to begin</p>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
              <div className="space-y-3">
                {!isWebcamActive ? (
                  <Button
                    onClick={startWebcam}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={capturePhoto}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" />
                          Capture & Upload
                        </>
                      )}
                    </Button>
                    <Button onClick={stopWebcam} variant="outline" className="w-full">
                      <VideoOff className="w-5 h-5 mr-2" />
                      Stop Camera
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="hidden md:block">
            <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <Scan className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-blue-700 font-medium">Ready to scan</p>
                <p className="text-sm text-blue-600 mt-2">Position your face clearly in the camera</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {attendanceData?.name || "User"}
              </h2>
              <div className="flex items-center justify-center mt-2">
                {statusIcon}
                <span className={`font-medium ${statusColor}`}>
                  {attendanceData?.status}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{attendanceData?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{attendanceData?.time}</span>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" className="mt-6">
              Mark Another Attendance
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default S3Upload;
