
"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Video, AlertTriangle, Loader2, SwitchCamera, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CameraCaptureProps {
  onImageCapture: (dataUri: string) => void;
}

type FacingMode = "user" | "environment";

export function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [initializationMessage, setInitializationMessage] = useState<string | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<FacingMode>("environment");
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // New state to control camera activation

  const stopCurrentStream = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setHasCameraPermission(null); // Reset permission status when stream stops
    setInitializationMessage(null);
  }, [currentStream]);

  const startCameraStream = useCallback(async (facingMode: FacingMode) => {
    if (!isCameraOpen) return; // Only start if explicitly opened

    stopCurrentStream();
    setIsSwitchingCamera(true);
    setInitializationMessage(`Initializing ${facingMode === 'user' ? 'Front' : 'Rear'} Camera...`);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'Your browser does not support camera access. Please use image upload.';
      setHasCameraPermission(false);
      setInitializationMessage(errorMsg);
      toast({ variant: 'destructive', title: 'Camera Not Supported', description: errorMsg });
      setIsSwitchingCamera(false);
      setIsCameraOpen(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
      setCurrentStream(stream);
      setHasCameraPermission(true);
      setInitializationMessage(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let description = 'Could not access the camera. Please ensure it is not in use by another application and that you have granted permission.';
      let nextFacingMode: FacingMode | null = null;

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          description = "Camera access was denied. Please enable it in your browser settings and refresh the page.";
           setIsCameraOpen(false); // Keep camera closed if denied
        } else if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
          description = `Could not find a camera with mode: ${facingMode}. Attempting to switch.`;
          nextFacingMode = facingMode === "environment" ? "user" : "environment";
        } else {
          description = `Error: ${error.message}. Try refreshing or checking browser permissions.`;
        }
      }
      setHasCameraPermission(false);
      setInitializationMessage(description);
      if (nextFacingMode) {
        setCurrentFacingMode(nextFacingMode); // This will trigger useEffect to try again
      } else {
        setIsCameraOpen(false); // Failed to get any camera
      }
    } finally {
      setIsSwitchingCamera(false);
    }
  }, [isCameraOpen, stopCurrentStream, toast]);

  useEffect(() => {
    if (isCameraOpen) {
      startCameraStream(currentFacingMode);
    } else {
      stopCurrentStream();
    }
    // Cleanup function to stop stream when component unmounts or isCameraOpen changes to false
    return () => {
      stopCurrentStream();
    };
  }, [isCameraOpen, currentFacingMode, startCameraStream, stopCurrentStream]);

  const handleToggleFacingMode = () => {
    if (isSwitchingCamera) return;
    setCurrentFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  };
  
  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
    stopCurrentStream();
  };

  const handleCapture = () => {
    if (!videoRef.current || !currentStream || !hasCameraPermission || isCapturing || !isCameraOpen) {
      toast({ title: "Cannot Capture", description: "Camera is not ready, open, or permission denied.", variant: "destructive" });
      return;
    }
    setIsCapturing(true);
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      onImageCapture(dataUri);
      toast({ title: "Image Captured!", description: "The photo has been loaded for analysis.", className: "bg-green-500 text-white" });
      handleCloseCamera(); // Close camera after capture
    } else {
      toast({ title: "Capture Failed", description: "Could not process the image.", variant: "destructive" });
    }
    setIsCapturing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Video className="h-6 w-6 text-primary" />
          Take a Photo
        </CardTitle>
        <CardDescription>
          {isCameraOpen ? `Current: ${currentFacingMode === 'user' ? 'Front Camera' : 'Rear Camera'}` : "Activate your camera to capture an image."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCameraOpen ? (
          <Button onClick={handleOpenCamera} className="w-full">
            <Camera className="mr-2 h-4 w-4" /> Open Camera
          </Button>
        ) : (
          <>
            <div className="w-full aspect-video rounded-md bg-muted overflow-hidden relative flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              {(hasCameraPermission !== true || isSwitchingCamera) && initializationMessage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 p-4 text-center backdrop-blur-sm">
                  {(hasCameraPermission === null || isSwitchingCamera) && <Loader2 className="h-8 w-8 animate-spin mb-2 text-muted-foreground" />}
                  {hasCameraPermission === false && !isSwitchingCamera && <AlertTriangle className="h-8 w-8 mb-2 text-destructive" />}
                  <p className="text-sm text-muted-foreground">{initializationMessage}</p>
                </div>
              )}
            </div>

            {hasCameraPermission === false && !isSwitchingCamera && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Issue</AlertTitle>
                <AlertDescription>
                  {initializationMessage || "Please allow camera access to use this feature. You might need to refresh the page after granting permission."}
                </AlertDescription>
              </Alert>
            )}

            {hasCameraPermission === true && !isSwitchingCamera && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCapture} disabled={isCapturing || !currentStream} className="w-full flex-grow">
                  {isCapturing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  Capture Photo
                </Button>
                <Button onClick={handleToggleFacingMode} variant="outline" disabled={isSwitchingCamera} className="w-full sm:w-auto">
                  {isSwitchingCamera ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SwitchCamera className="mr-2 h-4 w-4" />
                  )}
                  Switch Camera
                </Button>
              </div>
            )}
            {isSwitchingCamera && hasCameraPermission === true && (
                <Button disabled className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing Camera...
                </Button>
            )}
             <Button onClick={handleCloseCamera} variant="outline" className="w-full">
                <Power className="mr-2 h-4 w-4" /> Close Camera
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
