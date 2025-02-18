"use client";

import { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { Button, Container, Typography, Box } from "@mui/material";
import ReactPlayer from "react-player";

// Увеличиваем память для FFmpeg
const ffmpeg = new FFmpeg({ log: true, memory: 512 });

const WebMTrailerCreator = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // Для превью
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0); // Длительность видео
  const playerRef = useRef<ReactPlayer | null>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpeg.loaded) {
        try {
          console.log("Loading FFmpeg...");
          await ffmpeg.load();
          console.log("FFmpeg loaded successfully.");
        } catch (error) {
          console.error("Error loading FFmpeg:", error);
        }
      }
    };
    loadFFmpeg();
  }, []);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log("Video file uploaded:", file.name);
      setVideo(file);
      setVideoURL(URL.createObjectURL(file));

      // Получаем длительность видео для дальнейшего выбора времени
      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(file);
      videoElement.onloadedmetadata = () => {
        setDuration(videoElement.duration);
      };
    } else {
      console.error("No video file selected.");
    }
  };

  const createVideoPreview = async () => {
    if (!video) {
      console.error("No video selected.");
      return;
    }

    const inputFile = "input.mp4";
    const outputFile = "preview.webm"; // Выходной файл тизера
    const previewDuration = 3; // Длительность тизера в 3 секунды

    try {
      console.log("Writing video file...");
      await ffmpeg.writeFile(inputFile, await fetchFile(video));
      console.log("Video file written successfully.");
    } catch (error) {
      console.error("Error writing video file:", error);
      return;
    }

    try {
      console.log("Executing FFmpeg command to create preview...");
      // Конвертируем часть видео в тизер
      await ffmpeg.exec([
        "-i",
        inputFile,
        "-ss",
        selectedTime.toString(),
        "-t",
        previewDuration.toString(), // Устанавливаем длительность тизера в 3 секунды
        "-vcodec",
        "libvpx", // WebM кодек
        "-acodec",
        "libvorbis", // WebM аудио кодек
        outputFile,
      ]);
      console.log("FFmpeg command executed successfully.");
    } catch (error) {
      console.error("Error executing FFmpeg command:", error);
      return;
    }

    let data;
    try {
      console.log("Reading output file...");
      data = await ffmpeg.readFile(outputFile);
      console.log("Output file read successfully.");
    } catch (error) {
      console.error("Error reading output file:", error);
      return;
    }

    const webMBlob = new Blob([data], { type: "video/webm" });
    setPreview(URL.createObjectURL(webMBlob));
    console.log("Video preview generated successfully.");
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        WebM Video Preview (Teaser) Creator
      </Typography>

      <Button variant="contained" component="label">
        Upload Video
        <input
          type="file"
          accept="video/*"
          hidden
          onChange={handleVideoUpload}
        />
      </Button>

      {videoURL && (
        <Box mt={2}>
          <ReactPlayer
            ref={(player) => (playerRef.current = player)}
            url={videoURL}
            controls
            width="100%"
            onProgress={({ playedSeconds }) => setSelectedTime(playedSeconds)}
          />
          <Typography variant="body1">Video duration: {duration}s</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={createVideoPreview}
          >
            Create Video Preview (Teaser)
          </Button>
        </Box>
      )}

      {preview && (
        <Box mt={2}>
          <Typography>Generated Video Preview</Typography>
          <video src={preview} controls width="100%" />
          <Button
            variant="contained"
            component="a"
            href={preview}
            download="video-preview.webm"
          >
            Download Video Preview (Teaser)
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default WebMTrailerCreator;
