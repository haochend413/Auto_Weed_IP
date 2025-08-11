"use client";
import React, {useRef, useState} from "react";
import dynamic from 'next/dynamic';
import Konva from "konva";
import "./style.css";
import useDataStore from "@/app/_store/data";
import useServerStore from "@/app/_store/server"
import useImageStore from "@/app/_store/img"
import useCanvasStore from "@/app/_store/canvas"
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";
import BorderList from "./BordersList";
// Import the Download component
import { Download } from "./Download";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { 
  Download as DownloadIcon,
  Save,
  Maximize2,
  Layers,
  Image as ImageIcon,
  Scissors,
  Square,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings
} from "lucide-react";
import { setFitCanvas } from "./utils";

// Preserved original function (as requested)
const handleDownload = (stage: Konva.Stage | null) => { 
  if (stage) {
      console.log("Clicked");
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = dataURL;
    link.click(); 
  }
}; 

const Wrap =  () => {
  const imageUrl = useImageStore((s) => s.imageUrl)
  const baseServerURL = useServerStore((s) => s.baseServerURL)
  const width = useCanvasStore((s) => s.width);
  const height = useCanvasStore((s) => s.height);
  const regions = useCanvasStore((s) => s.regions);
  const borders = useCanvasStore((s) => s.borders);
  const stageRef = useRef<Konva.Stage | null>(null); 
  const[focusName, setFocusName] = useState<string>('region')
  const imageLayerRef = useRef<Konva.Layer | null>(null);
  const regionLayerRef = useRef<Konva.Layer | null>(null); 
  const borderLayerRef = useRef<Konva.Layer | null>(null); 
  const origScale = useCanvasStore((s) => s.origScale); 
  const [focusLayer, setFocusLayer] = useState<Konva.Layer | null>(null)

  // Enhanced state for UI improvements
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    region: true,
    border: true,
    'base image': true
  });
  const [showStats, setShowStats] = useState<boolean>(true);

  const layerRefs: Record<string, React.RefObject<Konva.Layer | null>> = {
    "region": regionLayerRef,
    "base image": imageLayerRef,
    "border": borderLayerRef,
  };

  // Enhanced layer configuration
  const layerConfig: Record<string, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
  }> = {
    "region": {
      label: "Segmentations",
      icon: Scissors,
      color: "#10b981",
      description: "AI-generated segmentation masks"
    },
    "base image": {
      label: "Base Image",
      icon: ImageIcon,
      color: "#6366f1",
      description: "Original image layer"
    },
    "border": {
      label: "Detections",
      icon: Square,
      color: "#f59e0b",
      description: "Object detection bounding boxes"
    }
  };

  // Enhanced statistics
  const stats = React.useMemo(() => {
    const totalRegions = regions?.length || 0;
    const totalBorders = borders?.length || 0;
    const totalAnnotations = totalRegions + totalBorders;
    
    return {
      totalRegions,
      totalBorders,
      totalAnnotations,
      imageLoaded: Boolean(imageUrl)
    };
  }, [regions, borders, imageUrl]);

  // Preserved original function (as requested)
  const switchFocus = (name: string) => {
    setFocusName(name);
    Object.entries(layerRefs).forEach(([key, ref]) => {
      ref.current?.listening(key === name);
    });
    setFocusLayer(layerRefs[name]?.current ?? null);
  };

  // Enhanced save function with status feedback
  const saveAnnotations = async (): Promise<void> => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const updateInfo = {
        img_path: imageUrl,
        regions: regions, 
        boxes: borders, 
      }

      const response = await fetch(baseServerURL + "/db/editImage", {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateInfo), 
      });
      
      if (!response.ok) {
        throw new Error("Failed to save annotations");
      }
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Error saving annotations:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced download function with loading state
  const handleEnhancedDownload = async (stage: Konva.Stage | null): Promise<void> => {
    if (!stage) return;
    
    setIsDownloading(true);
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      handleDownload(stage);
    } finally {
      setIsDownloading(false);
    }
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerName: string): void => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
    
    const layerRef = layerRefs[layerName];
    if (layerRef?.current) {
      layerRef.current.visible(!layerVisibility[layerName]);
    }
  };

  // Enhanced fit canvas function
  const handleFitCanvas = (): void => {
    setFitCanvas(
      stageRef.current,
      [imageLayerRef.current, regionLayerRef.current, borderLayerRef.current],
      imageLayerRef.current,
      origScale,
    );
  };

  return (
    <TooltipProvider>
      <ResizablePanelGroup direction="vertical" className="h-full w-full bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        {/* Enhanced Top Panel: Canvas with overlay controls */}
        <ResizablePanel defaultSize={95} minSize={60} className="relative flex flex-col items-center justify-center overflow-hidden">
          {/* Floating Control Panel */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {showStats && (
              <Card className="border border-white/10 bg-black/20 backdrop-blur-md">
                <CardContent className="p-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Scissors className="h-3 w-3 text-green-400" />
                      <span className="text-white">{stats.totalRegions} regions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-3 w-3 text-orange-400" />
                      <span className="text-white">{stats.totalBorders} boxes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Floating Zoom Controls */}
          <div className="absolute top-4 right-4 z-10">
            <Card className="border border-white/10 bg-black/20 backdrop-blur-md">
              <CardContent className="p-1.5">
                <div className="flex flex-col gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFitCanvas}
                        className="h-6 w-6 p-0 text-white hover:bg-white/10"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Fit to canvas</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStats(!showStats)}
                        className="h-6 w-6 p-0 text-white hover:bg-white/10"
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle stats</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas Area */}
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Canvas
              stageRef={stageRef}
              focusLayer={focusLayer}
              setFocusLayer={setFocusLayer}
              imageLayerRef={imageLayerRef}
              regionLayerRef={regionLayerRef}
              focusName={focusName}
              setFocusName={setFocusName}
              borderLayerRef={borderLayerRef}
            />
          </div>

          {/* Canvas Loading Overlay */}
          {!stats.imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card>
                <CardContent className="p-8 text-center">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Image Loaded</h3>
                  <p className="text-sm text-muted-foreground">
                    Open the gallery to select an image for annotation
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle className="custom-resize-handle bg-white/10 hover:bg-white/20 transition-colors" />

        {/* Compact Bottom Panel with tabs */}
        <ResizablePanel defaultSize={5} minSize={5} maxSize={20} className="flex flex-col !overflow-visible !p-0 bg-gradient-to-b from-slate-800 to-slate-900 border-t border-white/10">
          {/* Compact Tabbed Interface */}
          <div className="w-full h-full flex items-center">
            <div className="flex-1 flex items-center justify-between px-3 py-2 overflow-x-auto">
              {/* Left side - Status and Layer Toggles */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${stats.imageLoaded ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-medium text-white whitespace-nowrap">
                    {stats.totalAnnotations} annotations
                  </span>
                </div>

                <div className="h-4 w-px bg-white/20"></div>

                {/* Layer Toggle Buttons */}
                <div className="flex items-center gap-1">
                  {Object.entries(layerConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = focusName === key;
                    const isVisible = layerVisibility[key] ?? true;
                    
                    return (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            onClick={() => switchFocus(key)}
                            className={`h-6 px-1.5 text-[10px] flex items-center gap-1 ${
                              isActive 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'hover:bg-white/10 text-gray-300'
                            }`}
                          >
                            <Icon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            {config.label}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerVisibility(key);
                              }}
                              className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
                            >
                              {isVisible ? 
                                <Eye className="h-2.5 w-2.5 text-gray-300" /> : 
                                <EyeOff className="h-2.5 w-2.5 text-gray-500" />
                              }
                            </Button>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {config.description}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
              
              {/* Right side - Action Buttons */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFitCanvas}
                      className="h-6 px-1.5 text-[10px] border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Maximize2 className="h-3 w-3 mr-1" />
                      Fit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Reset canvas zoom and position</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleEnhancedDownload(stageRef.current)}
                      disabled={isDownloading}
                      className="h-6 px-1.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isDownloading ? 
                        <Loader2 className="h-3 w-3 animate-spin" /> : 
                        <DownloadIcon className="h-3 w-3 mr-1" />
                      }
                      {isDownloading ? '' : 'Download'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Download the annotated image</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        // Direct implementation of CV2 download
                        const handleCV2Download = async () => {
                          const regionsPayload = regions.map(region =>
                            region.points.map(pt => [pt.x / origScale, pt.y / origScale])
                          );
                          
                          const bordersPayload = borders.map(border => [
                            [border.x / origScale, border.y / origScale],
                            [border.x / origScale + border.width / origScale, border.y / origScale + border.height / origScale]
                          ]);
                          
                          const payload = {
                            regions: regionsPayload,
                            boxes: bordersPayload
                          };
                          
                          const response = await fetch(baseServerURL + "/gui/download_p", {
                            method: "POST", 
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                          });
                          
                          if (!response.ok) return;
                          
                          // Download the file
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "processed.jpg";
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        };
                        
                        handleCV2Download();
                      }}
                      disabled={!stats.imageLoaded}
                      className="h-6 px-1.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <DownloadIcon className="h-3 w-3 mr-1" />
                      CV2
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Download CV2 annotated image</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={saveAnnotations}
                      disabled={isSaving || !stats.imageLoaded}
                      className="h-6 px-1.5 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? 
                        <Loader2 className="h-3 w-3 animate-spin" /> : 
                        <Save className="h-3 w-3 mr-1" />
                      }
                      {isSaving ? '' : 'Save'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Save annotations to database</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          
          {/* Success/Error toast */}
          {saveStatus !== 'idle' && (
            <div className="absolute bottom-10 right-4 z-50">
              <Alert className={`w-64 ${saveStatus === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                {saveStatus === 'success' ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <AlertDescription className={`text-xs ${saveStatus === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                  {saveStatus === 'success' ? 'Saved successfully!' : 'Failed to save. Try again.'}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default Wrap;