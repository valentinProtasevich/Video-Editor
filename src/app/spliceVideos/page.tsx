"use client";

import { useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import {
  Button,
  Container,
  Typography,
  List,
  ListItem,
  Box,
} from "@mui/material";

const ffmpeg = new FFmpeg();

export default function SpliceVideos() {
  const [videos, setVideos] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);

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
      setVideos((prev) => [...prev, ...Array.from(event.target.files)]);
    }
  };

  const handleMerge = async () => {
    if (videos.length < 2) return alert("Upload at least two videos");

    setProcessing(true);
    const listFile = "file_list.txt";
    const outputFile = "output.mp4";

    // Записываем все видео в виртуальную ФС
    let fileListContent = "";
    for (let i = 0; i < videos.length; i++) {
      const fileName = `video${i}.mp4`;
      await ffmpeg.writeFile(fileName, await fetchFile(videos[i]));
      fileListContent += `file '${fileName}'\n`;
    }
    await ffmpeg.writeFile(listFile, new TextEncoder().encode(fileListContent));

    // Выполняем команду FFmpeg для склейки видео
    await ffmpeg.exec([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-c:a",
      "copy",
      outputFile,
    ]);

    // Получаем готовое видео
    const data = await ffmpeg.readFile(outputFile);
    const videoBlob = new Blob([data], { type: "video/mp4" });
    setOutputVideo(URL.createObjectURL(videoBlob));
    setProcessing(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Video Merger
      </Typography>

      <Button variant="contained" component="label">
        Upload Videos
        <input
          type="file"
          accept="video/*"
          hidden
          multiple
          onChange={handleVideoUpload}
        />
      </Button>

      {videos.length > 0 && (
        <List>
          {videos.map((video, index) => (
            <ListItem key={index}>{video.name}</ListItem>
          ))}
        </List>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleMerge}
        disabled={processing || videos.length < 2}
      >
        {processing ? "Processing..." : "Merge Videos"}
      </Button>

      {outputVideo && (
        <Box mt={2}>
          <Typography>Final Merged Video</Typography>
          <video src={outputVideo} controls width="100%" />
          <Button
            variant="contained"
            component="a"
            href={outputVideo}
            download="merged-video.mp4"
          >
            Download
          </Button>
        </Box>
      )}
    </Container>
  );
}
