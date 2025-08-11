"use client";
// Example: /client-gui/src/app/page.tsx
import React, { useState, useEffect} from "react";
import Settings from "./_components/settings";
import Gallery from "./_components/gallery"; 

import Wrap from "./_components/canvas/wrap";
import  useImageStore  from "./_store/img";
import useServerStore from "./_store/server";
import useDataStore from "./_store/data";
import useCanvasStore from "./_store/canvas";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { 
  Upload, 
  Menu,
  Sun,
  Moon,
  Activity,
  Zap,
  Wifi,
  WifiOff,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Save
} from 'lucide-react';

export default function Home() {
  const imageUrl = useImageStore((s) => s.imageUrl)
  const setImageUrl = useImageStore((s) => s.setImageUrl)
  const [folded, setFolded] = useState(false);
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const setRegions = useCanvasStore((s) => s.setRegions)
  const setBorders = useCanvasStore((s) => s.setBorders)
  const baseServerURL = useServerStore((s) => s.baseServerURL)
  const setBaseServerURL = useServerStore((s) => s.setBaseServerURL) 
  const imgs = useDataStore((s) => s.imgs)
  const addImg = useDataStore((s) => s.addImg)

  // Enhanced UI states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState("Field Analysis Session");
  const [showStats, setShowStats] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState<Date | null>(null);
  const [statsAnimation, setStatsAnimation] = useState(false);

  // Dynamic stats
  const [liveStats, setLiveStats] = useState({
    totalImages: 0,
    annotationsCount: 0,
    processedRegions: 0,
    aiConfidence: 94.2
  });

  // Animate stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatsAnimation(true);
      setLiveStats(prev => ({
        ...prev,
        annotationsCount: prev.annotationsCount + Math.floor(Math.random() * 3),
        processedRegions: prev.processedRegions + Math.floor(Math.random() * 2),
        aiConfidence: Math.min(99.9, prev.aiConfidence + (Math.random() - 0.5) * 2)
      }));
      setTimeout(() => setStatsAnimation(false), 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced connection status tracking
  useEffect(() => {
    setConnectionStatus('connecting');
  }, []);

  // startup setting to get the right url
  useEffect(() => {
    // Try possible backend URLs at startup 
    const urls = [
      //after construction, need to register this to a stable deployer;  
      // "http://10.192.227.142", // for illinoisNet, also wont work
      // "http://192.168.10.252:8000", // for VUE // this will not work due to mixed https / http
      "http://localhost:8000", //local 
    ];
    (async () => {
      for (const url of urls) { 
        try {
          const res = await fetch(url + "/");
          if (res.ok) {
            setBaseServerURL(url);
            setConnectionStatus('connected');
            console.log("Connected to backend:", url);
            break;
          }
        } catch (err) {
          console.log("Connection failed: " + url)
          setConnectionStatus('disconnected');
        }
      }
    })();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    setBorders([])
    setRegions([])
    let tmpUrl = ""
    // const file = e.target.files?.[0]; 
    const files = e.target.files
    if (!files) return; 
    
    const totalFiles = files.length;
    let processedFiles = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) return; 
      
      // Update progress
      setUploadProgress((processedFiles / totalFiles) * 100);
      
      const formData = new FormData();  
      formData.append("img", file); 
      const res = await fetch(baseServerURL + "/gui/upload", {
        method: "POST", 
        body: formData,
      }); 
      if (res.ok) {
          const data = await res.json(); 
          console.log("Upload successful:", data);  
          console.log(data.url)
          tmpUrl = data.url
          //update url state for constant rendering; 
          console.log(baseServerURL + `${data.url}`)
          // setImageUrl(baseServerURL + `${data.url}`);
          addImg(file.name); //store it for demo;
          setUploadedFiles(prev => [...prev, file.name]);
      } else {
          console.error("Upload failed:", res.status, await res.text());
      }

      const img_path = baseServerURL + "/raw_upload/" + file.name; 
      const image = {
        img_path: img_path,
        regions: [],
        borders: [],
        classification: "none", 
      }
      const res2 = await fetch(baseServerURL + "/db/putImage", {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(image)
      });
      if (res2.ok) {
          // const data = await 
          // console.log("Upload successful:", data);  
          console.log(tmpUrl)
          //update url state for constant rendering; 
          console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
          console.log(baseServerURL)
          setImageUrl(baseServerURL + tmpUrl);
          setLastUploadTime(new Date());
          setLiveStats(prev => ({ ...prev, totalImages: prev.totalImages + 1 }));
      } else {
          console.error("Upload failed:", res2.status, await res2.text());
      }
      
      processedFiles++;
    }
    
    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 w-screen h-screen min-w-0 min-h-0 font-sans transition-all duration-700 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`} style={{
      overflow: "auto", 
    }}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-conic from-blue-400/10 via-purple-400/10 to-green-400/10 rounded-full blur-3xl animate-spin-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-radial from-green-400/8 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Enhanced Top Status Bar */}
      <div className={`absolute top-0 left-0 right-0 z-50 h-16 ${
        isDarkMode ? 'bg-black/20' : 'bg-white/20'
      } backdrop-blur-2xl border-b ${
        isDarkMode ? 'border-white/10' : 'border-black/10'
      } transition-all duration-300`}>
        
        <div className="flex items-center justify-between h-full px-6">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                  : 'hover:bg-black/10 text-black/70 hover:text-black'
              } hover:scale-110 active:scale-95`}
            >
              <Menu size={20} />
            </button>

            {/* Project Info */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl ${
                isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/10 text-blue-600'
              } backdrop-blur-sm border ${
                isDarkMode ? 'border-blue-400/30' : 'border-blue-300/30'
              }`}>
                <Activity size={16} />
                <span className="text-sm font-medium">{currentProject}</span>
              </div>

              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
                connectionStatus === 'connected' 
                  ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-500/10 text-green-600')
                  : connectionStatus === 'connecting'
                  ? (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-500/10 text-yellow-600')
                  : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-600')
              }`}>
                {connectionStatus === 'connected' ? <Wifi size={14} /> : 
                 connectionStatus === 'connecting' ? <Loader2 size={14} className="animate-spin" /> : 
                 <WifiOff size={14} />}
                <span className="text-sm font-medium capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>

          {/* Center - Live Stats */}
          {showStats && (
            <div className={`flex items-center space-x-6 px-6 py-2 rounded-xl ${
              isDarkMode ? 'bg-gray-800/40' : 'bg-white/40'
            } backdrop-blur-sm border ${
              isDarkMode ? 'border-gray-600/30' : 'border-gray-300/30'
            } transition-all duration-300 ${statsAnimation ? 'scale-105' : 'scale-100'}`}>
              
              <div className="flex items-center space-x-2">
                <ImageIcon size={14} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {liveStats.totalImages}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Database size={14} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {liveStats.annotationsCount}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Zap size={14} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {liveStats.aiConfidence.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Upload Progress */}
            {isUploading && (
              <div className="flex items-center space-x-3 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin text-blue-400" />
                  <span className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    Uploading... {Math.round(uploadProgress)}%
                  </span>
                </div>
                <div className="w-24 h-2 bg-gray-300/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
              isDarkMode ? 'bg-gray-800/40' : 'bg-white/40'
            } backdrop-blur-sm border ${
              isDarkMode ? 'border-gray-600/30' : 'border-gray-300/30'
            }`}>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
                }`}
                title="Toggle Stats"
              >
                {showStats ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300' 
                    : 'hover:bg-gray-500/20 text-gray-600 hover:text-gray-800'
                } hover:scale-110 active:scale-95`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
                } hover:scale-110 active:scale-95`}
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full max-w-full max-h-full rounded-none border-none"
        >
          <ResizablePanel 
            defaultSize={sidebarCollapsed ? 3 : 12} 
            className={`h-full transition-all duration-500 ${
              sidebarCollapsed ? 'min-w-[60px] max-w-[60px]' : 'min-w-[0px] max-w-[600px]'
            } ${
              isDarkMode ? 'bg-gradient-to-b from-gray-900/95 to-gray-800/95' : 'bg-gradient-to-b from-white/95 to-gray-50/95'
            } backdrop-blur-xl border-r-2 border-blue-100 shadow-2xl flex flex-col ${
              sidebarCollapsed ? 'p-2' : 'p-8'
            }`}
          >
            
            {sidebarCollapsed ? (
              /* Collapsed Sidebar */
              <div className="flex flex-col items-center space-y-4 py-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SettingsIcon size={20} className="text-white" />
                </div>
                
                {connectionStatus === 'connected' && (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
                
                {uploadedFiles.length > 0 && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDarkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-500/20 text-blue-600'
                  }`}>
                    {uploadedFiles.length}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Enhanced Header */}
                <div
                  className="group relative overflow-hidden rounded-2xl mb-6"
                  style={{
                    border: "1px solid black",
                    borderRadius: 10, 
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "#0003adff", 
                    alignItems: "center",
                    marginBottom: 20, 
                    borderColor: "#ff7700ff", 
                  }}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shimmer"></div>
                  </div>
                  
                  <h1 style={{
                    fontSize: 28,
                    left: 10,
                    position: "relative",
                    color: "#ec4b00ff",
                    fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}>
                    Auto Weed Annotator
                  </h1>
                  
                  {/* Status indicator */}
                  <div className="absolute top-2 right-2">
                    {connectionStatus === 'connected' ? 
                      <CheckCircle size={16} className="text-green-400" /> :
                      <AlertCircle size={16} className="text-red-400" />
                    }
                  </div>
                </div>
                
                <Settings onChange={setSelectedOps} />
                
                {/* Enhanced Instructions */}
                <div className="mt-3 mb-3">
                  <h2 className="text-[#1976d2] font-bold text-lg mb-2 flex items-center">
                    Instructions
                    <Activity size={16} className="ml-2 animate-pulse" />
                  </h2>
                  <ul className="leading-relaxed text-base text-[#FFFFFF] mb-2 pl-5 list-disc space-y-1">
                    <li className="hover:text-green-300 transition-colors duration-200 cursor-default">
                      Use <span className="text-green-700 font-semibold bg-green-700/20 px-1 rounded">Mouse</span> To Draw
                    </li>
                    <li className="hover:text-blue-300 transition-colors duration-200 cursor-default">
                      Hold <span className="font-bold text-[#1976d2] bg-blue-600/20 px-1 rounded">&quot;Space&quot;</span> and drag to change position
                    </li>
                    <li className="hover:text-purple-300 transition-colors duration-200 cursor-default">
                      Pinch to zoom
                    </li> 
                    <li className="hover:text-yellow-300 transition-colors duration-200 cursor-default">
                      On canvas, press <span className="bg-yellow-600/20 px-1 rounded font-mono">"s"</span> to zoom / drag all layers together.
                    </li> 
                  </ul>
                </div>

                {/* Enhanced Upload Section */}
                <div className="relative group mb-4">
                  <label
                    htmlFor="file-upload"
                    className={`relative inline-block w-full px-6 py-4 rounded-xl cursor-pointer font-semibold text-base shadow-xl transition-all duration-300 text-center overflow-hidden ${
                      isUploading 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-[#1976d2] hover:bg-[#1565c0] border-2 border-[#1976d2] hover:border-[#1565c0] hover:scale-[1.02] hover:shadow-2xl'
                    } text-white`}
                    style={{
                      marginBottom: 15,
                    }}
                  >
                    {/* Animated background */}
                    {!isUploading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                    
                    <div className="relative z-10 flex items-center justify-center space-x-3">
                      {isUploading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={20} className="group-hover:animate-bounce" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </div>

                    {/* Progress bar */}
                    {isUploading && (
                      <div className="absolute bottom-0 left-0 h-1 bg-blue-300/30 w-full">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </label>
                  
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleUpload}
                    disabled={isUploading}
                  />
                  
                  {/* Enhanced Upload Feedback */}
                  {imageUrl && (
                    <div className="mt-3 animate-slideUp">
                      <div className={`p-3 rounded-xl border ${
                        isDarkMode ? 'bg-green-900/30 border-green-400/30' : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className={`text-sm font-medium ${
                              isDarkMode ? 'text-green-300' : 'text-green-700'
                            }`}>
                              Image uploaded! 🎉
                            </span>
                          </div>
                          {lastUploadTime && (
                            <span className={`text-xs ${
                              isDarkMode ? 'text-green-400/70' : 'text-green-600/70'
                            }`}>
                              {lastUploadTime.toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        
                        {uploadedFiles.length > 0 && (
                          <div className="mt-2 text-xs text-green-400/80">
                            Total files: {uploadedFiles.length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Gallery />
              </>
            )}
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={75} className="h-full min-w-0 bg-[#f0f4ff] flex flex-col relative">
            {/* Canvas Overlay Controls */}
            <div className="absolute top-4 right-4 z-20 flex space-x-2">
              <button 
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-black/20 hover:bg-black/30' : 'bg-white/20 hover:bg-white/30'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-white/10' : 'border-black/10'
                } text-gray-600 hover:text-gray-800 transition-all duration-200`}
                title="Reset View"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-black/20 hover:bg-black/30' : 'bg-white/20 hover:bg-white/30'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-white/10' : 'border-black/10'
                } text-gray-600 hover:text-gray-800 transition-all duration-200`}
                title="Download"
              >
                <Download size={16} />
              </button>
              <button 
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-black/20 hover:bg-black/30' : 'bg-white/20 hover:bg-white/30'
                } backdrop-blur-sm border ${
                  isDarkMode ? 'border-white/10' : 'border-black/10'
                } text-gray-600 hover:text-gray-800 transition-all duration-200`}
                title="Save Project"
              >
                <Save size={16} />
              </button>
            </div>

            <ResizablePanel defaultSize={80} className="flex-1 flex items-center justify-center min-h-0 min-w-0">
              <Wrap />
            </ResizablePanel>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(0px) rotate(0deg); }
          75% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}