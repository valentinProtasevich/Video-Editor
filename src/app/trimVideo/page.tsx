"use client";

import { useEffect, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { Box, Button, Container, Slider, Typography } from "@mui/material";
import ReactPlayer from "react-player";

const ffmpeg = new FFmpeg();

export default function TrimVideo() {
  const [videos, setVideos] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [trimRange, setTrimRange] = useState<number[]>([0, 10]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  console.log(trimRange);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpeg.loaded) {
        await ffmpeg.load();
      }
    };
    loadFFmpeg();
  }, []);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setVideos([file]); // Очищаем предыдущие видео при загрузке нового
      setSelectedVideo(URL.createObjectURL(file));
    }
  };

  const handleTrim = async () => {
    if (!selectedVideo || videos.length === 0) return;

    setProcessing(true);
    const inputFile = videos[0];
    const inputName = "input.mp4";
    const outputName = "output.mp4";

    // Записываем файл в виртуальную файловую систему
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

    // Выполняем команду для обрезки
    await ffmpeg.exec([
      "-ss",
      trimRange[0].toString(), // Начало
      "-i",
      inputName,
      "-t",
      (trimRange[1] - trimRange[0]).toString(), // Длительность
      "-c:v",
      "libx264", // Перекодировать видео
      "-preset",
      "fast", // Ускорить кодирование
      "-crf",
      "23", // Контроль качества
      "-c:a",
      "copy", // Копировать аудио без изменений
      outputName,
    ]);

    // Получаем результат
    const data = await ffmpeg.readFile(outputName);

    // Преобразуем данные в ArrayBuffer и создаем объект URL
    const videoBlob = new Blob([data], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(videoBlob);

    setOutputVideo(videoUrl);
    setProcessing(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Video Editor
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

      {selectedVideo && (
        <Box mt={2}>
          <ReactPlayer
            url={selectedVideo}
            controls
            width="100%"
            onDuration={setDuration} // Устанавливаем продолжительность видео
          />
          <Typography gutterBottom>Trim Video</Typography>
          <Slider
            value={trimRange}
            min={0}
            max={duration}
            step={1}
            onChange={(_, newValue) => setTrimRange(newValue as number[])} // Корректируем обработку изменения диапазона
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}s`}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleTrim}
            disabled={processing}
          >
            {processing ? "Processing..." : "Trim Video"}
          </Button>
        </Box>
      )}

      {outputVideo && (
        <Box mt={2}>
          <Typography>Trimmed Video</Typography>
          <video src={outputVideo} controls width="100%" />
          <Button
            variant="contained"
            component="a"
            href={outputVideo}
            download="trimmed-video.mp4"
          >
            Download
          </Button>
        </Box>
      )}
    </Container>
  );
}
