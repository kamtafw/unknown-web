import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophoneAlt } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';

interface MicButtonProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onRecordingPause?: () => void;
  onRecordingResume?: () => void;
  onRecordingStateChange?: (isRecording: boolean, isPaused: boolean, recordingTime: number) => void;
  forceStop?: boolean;
  disabled?: boolean;
  className?: string;
  showRecordingInterface?: boolean;
  onShowRecordingInterface?: (show: boolean) => void;
}

export function MicButton({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onRecordingPause,
  onRecordingResume,
  onRecordingStateChange,
  forceStop = false,
  disabled = false,
  className = "",
  showRecordingInterface = false,
  onShowRecordingInterface,
}: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pausedChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle forced stop from parent
  useEffect(() => {
    if (forceStop && (isRecording || isPaused)) {
      stopRecording();
    }
  }, [forceStop]);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Notify parent of recording state changes
  useEffect(() => {
    onRecordingStateChange?.(isRecording, isPaused, recordingTime);
  }, [isRecording, isPaused, recordingTime, onRecordingStateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(permissionStatus.state === 'granted');
      
      permissionStatus.onchange = () => {
        setHasPermission(permissionStatus.state === 'granted');
      };
    } catch (error) {
      console.warn('Permission API not supported, will request on first use');
      setHasPermission(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      if (!isPaused) {
        chunksRef.current = [];
        pausedChunksRef.current = [];
        setRecordingTime(0);
        setAudioBlob(null);
        onShowRecordingInterface?.(true);
      } else {
        chunksRef.current = [];
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const allChunks = [...pausedChunksRef.current, ...chunksRef.current];
        const audioBlob = new Blob(allChunks, { type: 'audio/wav' });
        
        setAudioBlob(audioBlob);
        
        if (!isPaused) {
          onRecordingComplete?.(audioBlob);
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      if (!isPaused) {
        onRecordingStart?.();
      } else {
        onRecordingResume?.();
      }

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
      alert('Microphone access denied or not available');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      setTimeout(() => {
        pausedChunksRef.current = [...pausedChunksRef.current, ...chunksRef.current];
      }, 100);
      
      setIsRecording(false);
      setIsPaused(true);
      onRecordingPause?.();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (isPaused) {
      startRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      if (isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      setIsPaused(false);
      onRecordingStop?.();

      setTimeout(() => {
        pausedChunksRef.current = [];
        setRecordingTime(0);
        setAudioBlob(null);
        onShowRecordingInterface?.(false);
      }, 100);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioBlob) return;

    if (isPlaying) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsPlaying(false);
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      
      const url = audioUrl || URL.createObjectURL(audioBlob);
      if (!audioUrl) {
        setAudioUrl(url);
      }
      
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        currentAudioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        currentAudioRef.current = null;
      };
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setIsPlaying(false);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    pausedChunksRef.current = [];
    chunksRef.current = [];
    
    onShowRecordingInterface?.(false);
  };

  const handleSendRecording = () => {
    if (audioBlob) {
      onRecordingComplete?.(audioBlob);
      handleCancelRecording();
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (isRecording) {
      pauseRecording();
    } else if (isPaused) {
      resumeRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateWaveform = (isAnimated = false, color = 'bg-blue-500') => {
    return [...Array(25)].map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full ${color} ${isAnimated ? 'animate-pulse' : ''}`}
        style={{
          height: `${8 + Math.sin(i * 0.5) * 8 + (isAnimated ? Math.random() * 8 : 0)}px`,
          animationDelay: isAnimated ? `${i * 0.1}s` : '0s',
        }}
      />
    ));
  };

  // If showing recording interface, render the full WhatsApp-style interface
  if (showRecordingInterface && (isRecording || isPaused || audioBlob)) {
    return (
      <div className="flex items-center gap-3 w-full">
        {/* Delete Button */}
        <button
          onClick={handleCancelRecording}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
          title="Delete recording"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14c0 1.1-.9 2-2 2H7c-.9 0-2-.9-2-2V6M8 6V4c0-1.1.9-2 2-2h4c.9 0 2 .9 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>

        {/* Recording Waveform Area */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-full">
          {/* Mic Icon */}
          <div className={`p-2 rounded-full ${
            isRecording ? 'bg-red-500' : 
            isPaused ? 'bg-orange-500' : 
            'bg-gray-500'
          }`}>
            <FaMicrophoneAlt className="text-white text-sm" />
          </div>

          {/* Waveform */}
          <div className="flex items-center gap-0.5 flex-1">
            {isRecording ? (
              generateWaveform(true, 'bg-red-500')
            ) : isPaused ? (
              generateWaveform(false, 'bg-orange-400')
            ) : audioBlob ? (
              generateWaveform(false, 'bg-blue-500')
            ) : (
              generateWaveform(false, 'bg-gray-400')
            )}
          </div>

          {/* Time Display */}
          <span className={`font-mono text-sm ${
            isRecording ? 'text-red-600' : 
            isPaused ? 'text-orange-600' : 
            'text-gray-600'
          }`}>
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button (show when paused or recording complete) */}
          {(isPaused || (!isRecording && audioBlob)) && (
            <button
              onClick={handlePlayPause}
              className="p-3 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
              title={isPlaying ? "Pause playback" : "Play recording"}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          )}

          {/* Record/Pause Button */}
          <button
            onClick={handleClick}
            disabled={disabled}
            className={`p-3 rounded-full transition-colors ${
              disabled ? 'bg-gray-200 cursor-not-allowed' :
              isRecording ? 'bg-red-500 hover:bg-red-600' : 
              isPaused ? 'bg-orange-500 hover:bg-orange-600' : 
              'bg-gray-500 hover:bg-gray-600'
            } ${className}`}
            title={
              isRecording ? "Pause recording" : 
              isPaused ? "Resume recording" : 
              "Start recording"
            }
          >
            {isRecording ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : isPaused ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <FaMicrophoneAlt className={`text-xl ${disabled ? 'text-gray-400' : 'text-white'}`} />
            )}
          </button>

          {/* Send Button (show when recording is complete) */}
          {!isRecording && !isPaused && audioBlob && (
            <button
              onClick={handleSendRecording}
              className="p-3 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
              title="Send recording"
            >
              <IoSend className="text-white text-xl" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default mic button when not in recording interface mode
  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center relative ${
        disabled ? 'bg-gray-200 cursor-not-allowed' :
        isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' :
        isPaused ? 'bg-orange-500 hover:bg-orange-600' :
        'hover:bg-gray-100'
      } ${className}`}
      aria-label={
        isRecording ? "Pause recording" : 
        isPaused ? "Resume recording" : 
        "Start recording"
      }
      title={
        hasPermission === false ? "Microphone access denied" : 
        isRecording ? "Pause recording" : 
        isPaused ? "Resume recording" :
        "Start voice recording"
      }
    >
      {isRecording ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      ) : isPaused ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      ) : (
        <FaMicrophoneAlt 
          className={`text-xl ${
            disabled ? "text-gray-400" : 
            hasPermission === false ? "text-red-500" : 
            "text-gray-600"
          }`} 
        />
      )}
      
      {(isRecording || isPaused) && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          isRecording ? 'bg-red-600 animate-ping' : 'bg-orange-600'
        }`} />
      )}
    </button>
  );
}
