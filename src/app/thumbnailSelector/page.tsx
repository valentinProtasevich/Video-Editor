"use client";

import { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { Button, Container, Typography, Box } from "@mui/material";
import ReactPlayer from "react-player";

const ffmpeg = new FFmpeg();

export default function ThumbnailSelector() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const playerRef = useRef<ReactPlayer | null>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpeg.loaded) {
        await ffmpeg.load();
      }
    };
    loadFFmpeg();
  }, []);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setVideo(file);
      setVideoURL(URL.createObjectURL(file));
    }
  };

  const captureThumbnail = async () => {
    if (!video) return;

    const inputFile = "input.mp4";
    const outputImage = "thumbnail.png";

    try {
      await ffmpeg.load(); // Ensure FFmpeg is loaded
      await ffmpeg.writeFile(inputFile, await fetchFile(video));
    } catch (error) {
      console.error("Error writing video file:", error);
      return;
    }

    try {
      await ffmpeg.exec([
        "-i",
        inputFile,
        "-ss",
        selectedTime.toString(),
        "-frames:v",
        "1",
        "-q:v",
        "2",
        outputImage,
      ]);
    } catch (error) {
      console.error("Error executing FFmpeg command:", error);
      return;
    }

    let data;
    try {
      data = await ffmpeg.readFile(outputImage);
    } catch (error) {
      console.error("Error reading output file:", error);
      return;
    }

    const imageBlob = new Blob([data], { type: "image/png" });
    setThumbnail(URL.createObjectURL(imageBlob));

    // Clean up temporary files
    await ffmpeg.deleteFile(inputFile);
    await ffmpeg.deleteFile(outputImage);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Thumbnail Selector
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
          <Button
            variant="contained"
            color="primary"
            onClick={captureThumbnail}
          >
            Capture Thumbnail
          </Button>
        </Box>
      )}

      {thumbnail && (
        <Box mt={2}>
          <Typography>Selected Thumbnail</Typography>
          <img src={thumbnail} alt="Thumbnail" width="100%" />
          <Button
            variant="contained"
            component="a"
            href={thumbnail}
            download="thumbnail.png"
          >
            Download Thumbnail
          </Button>
        </Box>
      )}
    </Container>
  );
}
