/**
 * Maximum allowed face verification attempts.
 * @type {number}
 */
let faceVerificationTrials = 0;
const maxTrials = 5;

// Global storage for recorded verification data
window.faceVerificationData = { file: { video: null, image: null } };

/**
 * Starts the face verification process, handling video modal, camera, recording, and face detection.
 * @param {Object} data - Configuration object.
 * @param {HTMLElement} [data.container=null] - The container element for the modal.
 * @param {Function} [data.successCallback=null] - Called when face verification succeeds.
 * @param {Function} [data.failureCallback=null] - Called when verification fails after max trials.
 * @param {Function} [data.noDetectionCallback=null] - Called when no face is detected but trials are ongoing.
 * @returns {Promise<void>}
 */
async function lcsStartFaceVerification(data = { container: null, successCallback: null, failureCallback: null, noDetectionCallback: null }) {
    await lcsCreateVideoStreamModal(data.container);
    await lcsInitializeFaceVerificationAPI();

    // Start the camera and get the media stream
    const stream = await lcsStartCameraForFaceVerification();
    if (!stream) return;

    const FaceVerificationVideoStream = document.getElementById("lcsFaceVerificationVideoStream");
    const FaceVerificationStatus = document.getElementById("lcsFaceVerificationStatus");

    FaceVerificationStatus.innerText = "Verifying...";
    faceVerificationTrials++;

    let faceDetected = false;
    let blinkDetected = false;
    let initialEyes = null;

    // Setup MediaRecorder to record video
    const recordedChunks = [];
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => recordedChunks.push(event.data);
    mediaRecorder.start(); // Start recording

    const faceVerificationInterval = setInterval(async () => {
        const detections = await faceapi.detectSingleFace(FaceVerificationVideoStream, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

        if (detections) {
            if (!faceDetected) {
                FaceVerificationStatus.innerText = "Face detected! Please blink.";
                faceDetected = true;
            }

            const eyeDistance = detections.landmarks.getLeftEye()[0]._y - detections.landmarks.getLeftEye()[3]._y;

            if (initialEyes === null) {
                initialEyes = eyeDistance;
            } else if (eyeDistance < initialEyes * 0.7) {
                blinkDetected = true;
            }

            if (blinkDetected) {
                clearInterval(faceVerificationInterval);
                FaceVerificationStatus.innerText = "Human verified!";

                // Stop recording
                mediaRecorder.stop();
                mediaRecorder.onstop = async () => {
                    const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
                    window.faceVerificationData.file.video = videoBlob;

                    // Extract an image frame from the recorded video
                    const imageBlob = await lcsExtractImageFromVideoFFV(videoBlob);
                    window.faceVerificationData.file.image = imageBlob;

                    if (typeof data.successCallback === "function") {
                        data.successCallback();
                    }
                };
            }
        } else {
            if (faceVerificationTrials >= maxTrials) {
                FaceVerificationStatus.innerText = "Face verification failed! Please try again later with a clearer camera.";
                clearInterval(faceVerificationInterval);
                mediaRecorder.stop(); // Stop recording on failure

                if (typeof data.failureCallback === "function") {
                    data.failureCallback();
                }
            } else {
                FaceVerificationStatus.innerText = "No face detected! Please align your face to fit into the camera.";

                if (typeof data.noDetectionCallback === "function") {
                    data.noDetectionCallback();
                }
            }
            faceDetected = false;
            initialEyes = null;
        }
    }, 500);
}

/**
 * Loads and initializes the FaceAPI library for facial recognition.
 * @returns {Promise<boolean>}
 */
async function lcsInitializeFaceVerificationAPI() {
    return new Promise(async (resolve, reject) => {
        const url = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js';

        const script = document.createElement('script');
        script.defer = true;
        script.src = url;
        script.async = true;

        script.onload = async function () {
            const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

            document.getElementById("lcsFaceVerificationStatus").innerText = "FaceAPI loaded. Ready!";
            resolve(true);
        };

        script.onerror = function () {
            console.error('Failed to load script:', url);
            reject(new Error(`Failed to load script: ${url}`));
        };

        document.body.appendChild(script);
    });
}

/**
 * Creates a modal for video stream display.
 * @param {HTMLElement} [container=null] - The container element for the modal.
 * @returns {Promise<boolean>}
 */
async function lcsCreateVideoStreamModal(container = null) {
    return new Promise((resolve, reject) => {
        if (!container) container = document.body;
        if (!(container instanceof HTMLElement)) {
            return reject(new Error("Invalid container element provided."));
        }

        // Create modal
        const modal = document.createElement("div");
        Object.assign(modal.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "350px",
            zIndex: "1000"
        });

        // Modal title
        const header = document.createElement("h2");
        header.textContent = "Face Verification";
        header.style.textAlign = "center";
        header.style.marginBottom = "10px";

        // Close button
        const closeButton = document.createElement("button");
        closeButton.textContent = "✖";
        Object.assign(closeButton.style, {
            position: "absolute",
            top: "10px",
            right: "10px",
            border: "none",
            background: "transparent",
            fontSize: "18px",
            cursor: "pointer"
        });

        closeButton.onclick = () => {
            modal.remove();
            resolve(false);
        };

        // Video container
        const videoWrapper = document.createElement("div");
        Object.assign(videoWrapper.style, {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
        });

        // Video element
        const video = document.createElement("video");
        video.id = "lcsFaceVerificationVideoStream";
        Object.assign(video.style, {
            width: "280px",
            height: "380px",
            objectFit: "cover",
            borderRadius: "50%",
            border: "3px solid #000"
        });
        video.autoplay = true;

        // Status text
        const statusText = document.createElement("p");
        statusText.id = "lcsFaceVerificationStatus";
        statusText.textContent = "Initializing...";
        Object.assign(statusText.style, {
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
            margin: "10px 0"
        });

        // Append elements
        videoWrapper.append(video, statusText);
        modal.append(closeButton, header, videoWrapper);
        container.append(modal);

        resolve(true);
    });
}

/**
 * Starts the camera for face verification and returns the media stream.
 * @returns {Promise<MediaStream | null>}
 */
async function lcsStartCameraForFaceVerification() {
    return new Promise(async (resolve, reject) => {
        try {
            const videoElement = document.getElementById("lcsFaceVerificationVideoStream");
            const statusElement = document.getElementById("lcsFaceVerificationStatus");

            if (!videoElement || !statusElement) {
                return reject(new Error("Video or status element not found."));
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;

            statusElement.innerText = "Camera ready. Please align your face.";

            let countdown = 3;
            const countdownInterval = setInterval(() => {
                statusElement.innerText = `Starting in ${countdown}...`;
                countdown--;

                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    resolve(stream);
                }
            }, 1000);
        } catch (err) {
            const statusElement = document.getElementById("lcsFaceVerificationStatus");
            if (statusElement) statusElement.innerText = "Camera access denied!";

            console.error("Camera error:", err);
            reject(new Error("Camera access denied or unavailable."));
        }
    });
}

/**
 * Extracts a single image frame from a recorded video.
 * @param {Blob} videoBlob - The recorded video Blob.
 * @returns {Promise<Blob>} - The extracted image Blob.
 */
async function lcsExtractImageFromVideoFFV(videoBlob) {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(videoBlob);
        video.crossOrigin = "anonymous";
        video.autoplay = false;
        video.muted = true;
        video.play();

        video.onloadeddata = () => {
            video.pause();

            // Draw the first frame onto a canvas
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => resolve(blob), "image/png");
        };
    });
}