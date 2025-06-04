
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Camera, Video, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CameraCaptureProps {
  onImageCapture: (dataUri: string) => void;
}

export function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null: initializing, false: denied/error, true: granted
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [initializationMessage, setInitializationMessage] = useState<string | null>("Initializing Camera...");


  useEffect(() => {
    const getCameraPermission = async () => {
      setHasCameraPermission(null);
      setInitializationMessage("Initializing Camera...");

      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Your browser does not support camera access. Please use image upload.';
        setHasCameraPermission(false);
        setInitializationMessage(errorMsg);
        toast({ variant: 'destructive', title: 'Camera Not Supported', description: errorMsg });
        return;
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(cameraStream);
        setHasCameraPermission(true);
        setInitializationMessage(null); 
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        let description = 'Could not access the camera. Please ensure it is not in use by another application and that you have granted permission.';
        if (error instanceof Error) {
            if (error.name === "NotAllowedError") {
                description = "Camera access was denied. Please enable it in your browser settings and refresh the page.";
            } else if (error.name === "NotFoundError") {
                description = "No camera was found on your device. Please connect a camera or use image upload.";
            } else {
                 description = `Error: ${error.message}. Try refreshing or checking browser permissions.`;
            }
        }
        setHasCameraPermission(false);
        setInitializationMessage(description);
        // The Alert component will display the message if hasCameraPermission is false.
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        if(videoRef.current) videoRef.current.srcObject = null;
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !stream || !hasCameraPermission) {
      toast({ title: "Cannot Capture", description: "Camera is not ready or permission denied.", variant: "destructive" });
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
          Use your device camera to capture an image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full aspect-video rounded-md bg-muted overflow-hidden relative flex items-center justify-center">
          {/* Video element is always rendered as per guideline */}
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            playsInline 
          />
          {/* Overlay message when video is not active or there are permission issues */}
          {hasCameraPermission !== true && initializationMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 p-4 text-center backdrop-blur-sm">
              {hasCameraPermission === null && <Loader2 className="h-8 w-8 animate-spin mb-2 text-muted-foreground" />}
              {hasCameraPermission === false && <AlertTriangle className="h-8 w-8 mb-2 text-destructive" />}
              <p className="text-sm text-muted-foreground">{initializationMessage}</p>
            </div>
          )}
        </div>

        {/* Alert displayed if permission is explicitly false, as per guideline */}
        { hasCameraPermission === false && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    {initializationMessage || "Please allow camera access to use this feature. You might need to refresh the page after granting permission."}
                </AlertDescription>
            </Alert>
        )}

        {hasCameraPermission === true && (
          <Button onClick={handleCapture} disabled={isCapturing || !stream} className="w-full">
            {isCapturing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            Capture Photo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
