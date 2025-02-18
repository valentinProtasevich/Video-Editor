"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Container, Box, Slider } from "@mui/material";
import ReactPlayer from "react-player";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import SpeedIcon from "@mui/icons-material/Speed";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

const CustomVideoPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true); // Состояние для отображения консоли управления
  const playerRef = useRef<ReactPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Таймер для отслеживания движения мыши

  const togglePlay = () => {
    setPlaying((prev) => !prev);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideoUrl(videoURL);
      setPlaying(true); // Автоматически начинаем воспроизведение после загрузки
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
  };

  const handleSpeedChange = (
    event: React.ChangeEvent<{ value: unknown }>,
    newValue: number | number[]
  ) => {
    setPlaybackSpeed(newValue as number);
  };

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!isFullscreen) {
        if (playerContainerRef.current.requestFullscreen) {
          playerContainerRef.current.requestFullscreen();
        } else if (playerContainerRef.current.mozRequestFullScreen) {
          // Для Firefox
          playerContainerRef.current.mozRequestFullScreen();
        } else if (playerContainerRef.current.webkitRequestFullscreen) {
          // Для Safari
          playerContainerRef.current.webkitRequestFullscreen();
        } else if (playerContainerRef.current.msRequestFullscreen) {
          // Для IE/Edge
          playerContainerRef.current.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          // Для Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          // Для Safari
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          // Для IE/Edge
          document.msExitFullscreen();
        }
      }
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleMouseMove = () => {
    // Если мышь двигается, показываем консоль управления и сбрасываем таймер
    setShowControls(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setShowControls(false); // Скрыть консоль через 1,5 секунды
    }, 1500); // Таймер на 1,5 секунды
  };

  useEffect(() => {
    // Добавляем обработчик для движения мыши
    window.addEventListener("mousemove", handleMouseMove);

    // Убираем обработчик, когда компонент размонтируется
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <Button
        variant="contained"
        component="label"
        sx={{ backgroundColor: "#556B2F" }}
      >
        Upload Video
        <input
          type="file"
          accept="video/*"
          hidden
          onChange={handleVideoUpload}
        />
      </Button>

      {videoUrl && (
        <Box
          ref={playerContainerRef}
          sx={{
            position: "relative",
            width: "120%", // Увеличиваем плеер на 20%
            maxWidth: "960px", // Ограничиваем максимальную ширину плеера
            height: isFullscreen ? "100vh" : "auto", // Если полноэкранный, то высота 100vh
            display: "flex",
            flexDirection: "column",
            borderRadius: "15px", // Закругляем углы
            border: "5px solid #0047AB", // Рамка кобальтового цвета
            overflow: "hidden", // Скрываем элементы, выходящие за пределы
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", // Добавляем тень для плеера
          }}
        >
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={playing}
            volume={volume}
            playbackRate={playbackSpeed}
            width="100%"
            height={isFullscreen ? "100%" : "auto"}
            style={{
              borderRadius: "15px", // Закругляем углы плеера
            }}
          />

          {/* Панель управления */}
          {showControls && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                backgroundColor: "#2F4F4F", // Цвет хаки
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px", // Уменьшаем отступы
                borderRadius: "0 0 15px 15px", // Сглаживаем углы панели
                fontSize: "0.9rem", // Уменьшаем размер шрифта для панели
                boxSizing: "border-box", // Чтобы панель не перекрывала плеер
              }}
            >
              {/* Play/Pause Button */}
              <Button
                variant="contained"
                color="success"
                onClick={togglePlay}
                sx={{
                  backgroundColor: "#556B2F",
                  ":hover": { backgroundColor: "#3A4B2A" },
                  fontSize: "0.8rem", // Уменьшаем размер кнопки
                  padding: "5px 10px", // Уменьшаем отступы в кнопке
                }}
              >
                {playing ? <PauseIcon /> : <PlayArrowIcon />}
              </Button>

              {/* Volume Control */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {volume === 0 ? (
                  <VolumeOffIcon sx={{ color: "#fff", fontSize: "1.2rem" }} />
                ) : (
                  <VolumeUpIcon sx={{ color: "#fff", fontSize: "1.2rem" }} />
                )}
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  step={0.01}
                  min={0}
                  max={1}
                  sx={{
                    color: "#8F9779",
                    height: "5px", // Уменьшаем высоту ползунка
                    width: "100px",
                  }}
                />
              </Box>

              {/* Speed Control */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SpeedIcon sx={{ color: "#fff", fontSize: "1.2rem" }} />
                <Slider
                  value={playbackSpeed}
                  onChange={handleSpeedChange}
                  step={0.25}
                  min={0.5}
                  max={2}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}x`}
                  sx={{
                    color: "#8F9779",
                    height: "5px", // Уменьшаем высоту ползунка
                    width: "100px",
                  }}
                />
              </Box>

              {/* Fullscreen Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={toggleFullscreen}
                sx={{
                  backgroundColor: "#8F9779",
                  ":hover": { backgroundColor: "#6D7A56" },
                  fontSize: "0.8rem", // Уменьшаем размер кнопки
                  padding: "5px 10px", // Уменьшаем отступы в кнопке
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default CustomVideoPlayer;
