import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

const socket = io();

const streamAndRecorderPromise = navigator.mediaDevices
  .getUserMedia({
    video: {
      facingMode: "environment"
    },
    audio: false
  })
  .then(stream => {
    return { stream, recorder: new MediaRecorder(stream) };
  })
  .catch(function(err) {
    console.log("An error occurred: " + err);
  });

socket.on("connect", () => {
  console.log("connected");
});
socket.on("hi", data => {
  console.log(data);
});

let chunks = [];
const rawVideoWH = [640, 360];

function App() {
  const [streamAndRecorder, setStreamAndRecorder] = useState(
    {} as {
      stream: MediaStream;
      recorder: MediaRecorder;
    }
  );
  const [videoWH, setVideoWH] = useState([320, 180]);
  const [paused, togglePaused] = useState(false);
  const [recording, toggleRecording] = useState(false);
  const videoSrc = useRef();
  const videoRec = useRef();

  useEffect(() => {
    const { stream, recorder } = streamAndRecorder;
    if (!(stream && recorder)) {
      streamAndRecorderPromise.then(streamAndRecorder => {
        if (streamAndRecorder) {
          setStreamAndRecorder(streamAndRecorder);
        }
      });
    } else if (videoSrc.current && videoRec.current) {
      const video: HTMLVideoElement = videoSrc.current;
      video.srcObject = stream;
      video.play();

      recorder.ondataavailable = e => {
        chunks.push(e.data);
        console.log(e.data.type);
      };
      recorder.onstop = e => {
        const videoRecEl: HTMLVideoElement = videoRec.current;
        const videoSrcEl: HTMLVideoElement = videoSrc.current;
        if (videoRecEl) {
          const blob = new Blob(chunks, {
            type: "video/x-matroska;codecs=avc1"
          });
          chunks = [];
          const videoObjectURL = window.URL.createObjectURL(blob);
          videoRecEl.src = videoObjectURL;
          socket.emit("video", blob);
        }
      };
    }
  }, [videoSrc.current, videoRec.current]);

  console.log("rendered", videoSrc);
  return (
    <>
      Hello world!
      <input
        type="text"
        onKeyDown={e => {
          if (e.key === "Enter") {
            console.log("input change", e.currentTarget.value);
            socket.emit("hi", e.currentTarget.value);
          }
        }}
      ></input>
      <input
        type="range"
        max="100"
        min="20"
        step="5"
        onChange={e => {
          const scale = parseInt(e.target.value) * 0.01;
          setVideoWH([rawVideoWH[0] * scale, rawVideoWH[1] * scale]);
        }}
      />
      <button
        onClick={() => {
          const video: HTMLVideoElement = videoSrc.current;
          if (video && video.paused) {
            video.play();
            togglePaused(false);
          } else if (video) {
            video.pause();
            togglePaused(true);
          }
        }}
      >
        {paused ? "继续视频" : "暂停视频"}
      </button>
      <button
        onClick={() => {
          const videoRecEl: HTMLVideoElement = videoRec.current;
          const videoSrcEl: HTMLVideoElement = videoSrc.current;
          if (recording && videoRecEl) {
            videoSrcEl.pause();
            togglePaused(true);
            
            streamAndRecorder.recorder.stop();
            toggleRecording(false);
          } else if (videoRecEl) {
            videoSrcEl.play();
            togglePaused(false);

            streamAndRecorder.recorder.start();
            toggleRecording(true);
          }
        }}
      >
        {recording ? "停止录制" : "开始录制"}
      </button>
      <video ref={videoSrc} width={videoWH[0]} height={videoWH[1]}></video>
      <video
        ref={videoRec}
        width={videoWH[0]}
        height={videoWH[1]}
        onClick={e => {
          e.currentTarget.play();
        }}
      ></video>
      <canvas></canvas>
      <style jsx>{`
        button {
          display: block;
        }
      `}</style>
    </>
  );
}

ReactDOM.render(<App />, document.querySelector("#root"));
