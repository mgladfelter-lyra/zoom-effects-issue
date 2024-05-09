import ZoomVideo from "@zoom/videosdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function App() {
  const client = useMemo(() => ZoomVideo.createClient(), []);
  const [stream, setStream] = useState(null);
  const localVideoTrack = useRef(null);
  const previewVideoEl = useRef(null);
  const previewCanvasEl = useRef(null);
  const sessionVideoEl = useRef(null);
  const sessionCanvasEl = useRef(null);
  const [isVBEnabled, setIsVBEnabled] = useState(false);
  
  useEffect(() => {
    client
      .init("en-US", "Global", {
        patchJsMedia: true,
        leaveOnPageUnload: true,
        enforceVirtualBackground: true,
      })
      .then(() => setStream(client.getMediaStream()));
  }, [client]);

  const onStartPreview = useCallback(() => {
    localVideoTrack.current = ZoomVideo.createLocalVideoTrack();
    localVideoTrack.current.start(previewVideoEl.current);
  }, []);

  const onBlurPreview = useCallback(async () => {
    await localVideoTrack.current.stop();
    await localVideoTrack.current.start(previewCanvasEl.current, {
      imageUrl: "blur",
    });

    setIsVBEnabled(true);
  }, []);

  const usingVideoEl = useMemo(
    () => stream?.isRenderSelfViewWithVideoElement() ?? false,
    [stream]
  );

  const onJoin = useCallback(async () => {
    localVideoTrack.current?.stop();
    const config = {
      sessionName: "topic",
      userName: "host",
      jwt: 'TOKEN_HERE',
    };

    await client.join(
      config.sessionName,
      config.jwt,
      config.userName,
    );
  }, [client]);

  const onStartVideo = useCallback(async () => {
    await localVideoTrack.current?.stop();
    if (stream.isRenderSelfViewWithVideoElement()) {
      await stream
        .startVideo({
          videoElement: sessionVideoEl.current,
          virtualBackground: { imageUrl: "blur" },
        })
        .catch(console.error);
    } else {
      await stream.startVideo({ virtualBackground: { imageUrl: "blur" } });
      await stream.renderVideo(
        sessionCanvasEl.current,
        client.getCurrentUserInfo().userId,
        1920,
        1080,
        0,
        0
      );
    }
  }, [client, stream]);
  return (
    <div className="App">
      <main style={{ display: "flex", flexDirection: "column" }}>
        <button onClick={onJoin}>Join</button>
        <button onClick={onStartPreview}>Start preview</button>
        <button onClick={onBlurPreview}>Blur bg</button>
        <button onClick={onStartVideo}>Start session video</button>
        <div style={{ width: 480, height: 270, display: "flex" }}>
          <video
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              display: isVBEnabled ? "none" : undefined,
            }}
            ref={previewVideoEl}
            id="preview-video"
            height="1080"
            width="1920"
          />
          <canvas
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              display: !isVBEnabled ? "none" : undefined,
            }}
            ref={previewCanvasEl}
            id="preview-canvas"
            height="1080"
            width="1920"
          />
        </div>

        <div style={{ width: 480, height: 270, display: "flex" }}>
          <video
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              display: !usingVideoEl ? "none" : undefined,
            }}
            ref={sessionVideoEl}
            id="session-video"
            height="1080"
            width="1920"
          />
          <canvas
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              display: usingVideoEl ? "none" : undefined,
            }}
            ref={sessionCanvasEl}
            id="session-canvas"
            height="1080"
            width="1920"
          />
        </div>
      </main>
    </div>
  );
}

export default App;
