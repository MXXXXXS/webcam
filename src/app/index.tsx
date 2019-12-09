import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

const socket = io();

function App() {
  const [rawVideoWH] = useState([640, 360]);
  const [videoWH, setVideoWH] = useState([320, 180]);
  const [paused, toggleVideo] = useState(false);
  const videoRef = useRef();
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      })
      .then(function(stream) {
        const video: HTMLVideoElement = videoRef.current;
        console.log(video);
        video.srcObject = stream;
        video.play();
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
  }, []);
  console.log("rendered", videoRef);
  const canPlay = () => {
    // const video: HTMLVideoElement = videoRef.current
    // if (video) {
    //   const displayWidth = 500;
    //   const displayHeight = video.videoHeight / (video.videoWidth / displayWidth);
    //   setVideoWH([displayWidth, displayHeight]);
    // }
  };
  return (
    <>
      Hello world!
      <input type="text" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          console.log('input change', e.currentTarget.value)
          socket.emit('hi', e.currentTarget.value)
        }
      }}></input>
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
          const video: HTMLVideoElement = videoRef.current;
          if (paused && video) {
            video.play();
            toggleVideo(false);
          } else if (video) {
            video.pause();
            toggleVideo(true);
          }
        }}
      >
        {paused ? "继续视频" : "暂停视频"}
      </button>
      <video
        ref={videoRef}
        width={videoWH[0]}
        height={videoWH[1]}
        onCanPlay={canPlay}
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
