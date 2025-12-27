"use client";

import type { IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useHistoryStore } from "@/store/history";
import {
  Bot,
  Camera,
  FlipHorizontal,
  Loader2,
  Send,
  Sparkles,
  Sprout,
  Upload,
  Video,
} from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

type IdentificationResult = IdentifyPlantFromImageOutput;

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export default function HomePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [facingMode, setFacingMode] = useState("environment");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();
  const addHistoryItem = useHistoryStore((state) => state.addHistoryItem);

  useEffect(() => {
    let stream: MediaStream;
    const getCameraPermission = async () => {
      if (!showCamera) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings to use this app.",
        });
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera, toast, facingMode]);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileIdentification(file);
    }
  };

  const handleFileIdentification = async (file: File) => {
    setResult(null);
    setAnswer("");
    setQuestion("");
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setIsLoading(true);
    try {
      const photoDataUri = await toBase64(file);
      
      const response = await fetch("/api/identify-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoDataUri }),
      });

      if (!response.ok) {
        throw new Error("Failed to identify plant");
      }

      const identificationResult = await response.json();
      setResult(identificationResult);
      addHistoryItem({ ...identificationResult, imageUrl: photoDataUri });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Identification Failed",
        description: "Could not identify the plant. Please try another image.",
      });
    } finally {
      setIsLoading(false);
      setShowCamera(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !result) return;

    setIsAnswering(true);
    setAnswer("");
    try {
      const response = await fetch("/api/answer-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plantName: result.plantName,
          organName: result.organName,
          speciesName: result.speciesName,
          plantHealth: result.healthStatus,
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const { answer } = await response.json();
      setAnswer(answer);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get an answer. Please try again.",
      });
    } finally {
      setIsAnswering(false);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            handleFileIdentification(
              new File([blob], "capture.jpg", { type: "image/jpeg" })
            );
          }
        }, "image/jpeg");
      }
    }
  };

  const resetState = () => {
    setImagePreview(null);
    setResult(null);
    setAnswer("");
    setQuestion("");
    setShowCamera(false);
  };

  const renderInitialState = () => (
    <div className="text-center px-0 py-4 flex flex-col items-center justify-center h-full">
      <Card className="w-full border-dashed border-2 hover:border-primary transition-colors duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Sprout className="w-12 h-12 text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">
              Identify a Plant
            </h2>
            <div className="flex items-center gap-4 mt-8">
              <Button onClick={() => setShowCamera(true)} className="flex-1">
                <Video className="mr-2" /> Use Camera
              </Button>
              <Button
                onClick={triggerFileSelect}
                variant="secondary"
                className="flex-1"
              >
                <Upload className="mr-2" /> Upload Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        // capture="environment"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );

  const renderCameraView = () => (
    <div className="p-4 flex flex-col items-center justify-center h-full relative">
      <video
        ref={videoRef}
        className="w-full aspect-[3/4] h-full rounded-md object-cover"
        autoPlay
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="hidden" />
      {hasCameraPermission === false && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access to use this feature.
          </AlertDescription>
        </Alert>
      )}
      <div className="mt-4 flex justify-center gap-4 w-full">
        <Button
          onClick={handleCapture}
          disabled={!hasCameraPermission}
          size="lg"
          className="rounded-full w-20 h-20"
        >
          <Camera />
        </Button>
        <Button
          onClick={() =>
            setFacingMode((p) => (p === "user" ? "environment" : "user"))
          }
          variant="outline"
          size="icon"
          className="absolute top-6 right-6"
        >
          <FlipHorizontal />
        </Button>
      </div>
      <Button
        onClick={() => setShowCamera(false)}
        variant="ghost"
        className="mt-4"
      >
        Cancel
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center p-8 h-full">
      {imagePreview && (
        <Image
          src={imagePreview}
          alt="Plant preview"
          width={300}
          height={300}
          className="rounded-lg object-cover aspect-square mb-4"
        />
      )}
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-2 text-muted-foreground">Identifying...</p>
    </div>
  );

  const renderResult = () =>
    result && (
      <div className="p-4 animate-in fade-in duration-500">
        {!result.isPlant ? (
          <div className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertTitle>No Plant Detected</AlertTitle>
              <AlertDescription>
                The image does not appear to contain a plant or flower. Please
                try again with a clear image of a plant.
              </AlertDescription>
            </Alert>
            <Button onClick={resetState} className="w-full" variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold font-headline mb-4 text-center">
              Identification Complete
            </h1>
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Identified plant"
                width={360}
                height={360}
                className="rounded-lg object-cover aspect-square w-full mb-4 shadow-lg"
                data-ai-hint="plant leaf"
              />
            )}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <ResultItem
                  label="Plant Name"
                  value={result.plantName}
                  confidence={result.confidenceScores?.plantName}
                />
                <ResultItem
                  label="Species"
                  value={result.speciesName}
                  confidence={result.confidenceScores?.speciesName}
                />
                <ResultItem
                  label="Organ"
                  value={result.organName}
                  confidence={result.confidenceScores?.organName}
                />
                <ResultItem
                  label="Health Status"
                  value={result.healthStatus}
                  confidence={result.confidenceScores?.healthStatus}
                />
                {result.disease &&
                  result.disease !== "None" &&
                  result.disease !== "N/A" && (
                    <ResultItem label="Disease" value={result.disease} />
                  )}
                <ResultItem
                  label="Edibility"
                  value={result.isEdible ? "Yes" : "No"}
                />
                {result.edibilityDetails &&
                  result.edibilityDetails !== "N/A" && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground block">
                        Edibility Details
                      </span>
                      <p className="text-muted-foreground">
                        {result.edibilityDetails}
                      </p>
                    </div>
                  )}
                {result.medicinalUses &&
                  result.medicinalUses !== "None" &&
                  result.medicinalUses !== "N/A" && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground block">
                        Medicinal Uses
                      </span>
                      <p className="text-muted-foreground">
                        {result.medicinalUses}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  Ask about this plant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleAskQuestion}
                  className="flex items-start gap-2"
                >
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., How often should I water it?"
                    className="flex-1"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isAnswering || !question}
                  >
                    {isAnswering ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send />
                    )}
                  </Button>
                </form>
                {isAnswering && (
                  <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Thinking...</span>
                  </div>
                )}
                {answer && (
                  <div className="mt-4 text-sm p-3 bg-secondary rounded-lg">
                    {answer}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={resetState}
              className="w-full mt-4"
              variant="outline"
            >
              Identify Another Plant
            </Button>
          </>
        )}
      </div>
    );

  const ResultItem = ({
    label,
    value,
    confidence,
  }: {
    label: string;
    value: string;
    confidence?: number;
  }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      {confidence !== undefined && (
        <div className="flex items-center gap-2">
          <Progress
            value={confidence * 100}
            className="w-full h-2 bg-gray-200"
          />
          <span className="text-xs text-muted-foreground w-12 text-right">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (showCamera) return renderCameraView();
    if (imagePreview && result) return renderResult();
    return renderInitialState();
  };

  return <div>{renderContent()}</div>;
}
