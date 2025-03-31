# **LCS Verify Face**  
*A Lightweight Face Verification Library for Web Applications*

`lcs_verify_face` is a **JavaScript library** that enables **browser-based face verification** using the camera. It utilizes [FaceAPI.js](https://github.com/justadudewhohacks/face-api.js) for **face detection and blink recognition**. The library also **records verification sessions**, allowing developers to **store and analyze** captured video and images.

## **🔹 Features**
✔ **Face Detection** – Identifies a face in real-time using a webcam.  
✔ **Blink Detection** – Verifies human presence through blink detection.  
✔ **Video Recording** – Records the verification process for later use.  
✔ **Image Extraction** – Captures a frame from the verification session.  
✔ **Customizable Callbacks** – Allows handling of success, failure, and no-detection events.  
✔ **Auto Modal Creation** – Dynamically creates a verification modal.  
✔ **Optimized Performance** – Uses a lightweight detection model for faster processing.

---

## **📥 Installation**
### **Via NPM**
```bash
npm install lcs_verify_face
```

### **CDN (for direct browser use)**
Include the script in your HTML file:
```html
<script src="https://cdn.jsdelivr.net/npm/lcs_verify_face@latest/dist/lcs_verify_face.min.js"></script>
```

---

## **📌 Usage Guide**
### **🔹 Importing the Library**
For ES modules:
```javascript
import { lcsStartFaceVerification } from 'lcs_verify_face';
```
For browser-based usage (CDN):
```html
<script>
    lcsStartFaceVerification({...});
</script>
```

---

## **🔹 Basic Implementation**
This example **initiates face verification**, displays results, and allows access to **recorded video & image**.

```javascript
lcsStartFaceVerification({
    container: document.body, // The container for the verification modal
    successCallback: () => {
        console.log("✅ Face verification successful!");
        console.log(window.faceVerificationData.file.video); // Recorded video
        console.log(window.faceVerificationData.file.image); // Captured image
    },
    failureCallback: () => {
        console.warn("❌ Face verification failed!");
    },
    noDetectionCallback: () => {
        console.warn("⚠ No face detected. Please try again.");
    }
});
```

---

## **🔹 Advanced Usage**
Customize the modal container and integrate verification into an existing UI.
```javascript
const customContainer = document.getElementById("customModalContainer");

lcsStartFaceVerification({
    container: customContainer,
    successCallback: () => {
        alert("🎉 Verification successful!");
    },
    failureCallback: () => {
        alert("⚠ Verification failed. Please retry.");
    },
    noDetectionCallback: () => {
        alert("⚠ No face detected. Ensure proper positioning.");
    }
});
```

---

## **🛠 API Reference**
### **🔹 `lcsStartFaceVerification(config)`**
Starts the face verification process.

#### **📌 Parameters**
| Parameter           | Type        | Description |
|---------------------|------------|-------------|
| `config`           | `Object`    | Configuration object |
| `container`        | `HTMLElement` _(optional)_ | Element where the modal is displayed. Defaults to `document.body`. |
| `successCallback`  | `Function` _(optional)_ | Called on successful verification. |
| `failureCallback`  | `Function` _(optional)_ | Called when verification fails after maximum attempts. |
| `noDetectionCallback` | `Function` _(optional)_ | Called when no face is detected but attempts are ongoing. |

#### **🔄 Returns**
- `Promise<void>` – Resolves when the process completes.

---

## **🌍 Global Variables**
`window.faceVerificationData` stores the **recorded verification data**, which can be accessed after a successful verification.

| Property              | Type     | Description |
|-----------------------|---------|-------------|
| `file.video`         | `Blob`  | The recorded verification video (WebM format). |
| `file.image`         | `Blob`  | A still image captured from the verification session. |

**Example Usage:**
```javascript
console.log(window.faceVerificationData.file.video); // Access recorded video
console.log(window.faceVerificationData.file.image); // Access captured image
```

---

## **🔗 Server Integration (Upload Recorded Data)**
Use `FormData` to send the **recorded verification video and image** to a server.

### **🔹 Client-Side Upload Example**
```javascript
function uploadVerificationData() {
    const formData = new FormData();
    formData.append("verification_video", window.faceVerificationData.file.video);
    formData.append("verification_image", window.faceVerificationData.file.image);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => console.log("✅ Upload successful!", data))
    .catch(error => console.error("❌ Upload failed!", error));
}
```

### **🔹 Server-Side PHP Handling (`upload.php`)**
```php
<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $videoPath = "uploads/" . uniqid("verification_") . ".webm";
    $imagePath = "uploads/" . uniqid("verification_") . ".png";

    if (isset($_FILES["verification_video"])) {
        move_uploaded_file($_FILES["verification_video"]["tmp_name"], $videoPath);
    }

    if (isset($_FILES["verification_image"])) {
        move_uploaded_file($_FILES["verification_image"]["tmp_name"], $imagePath);
    }

    echo json_encode([
        "status" => "success",
        "video_url" => $videoPath,
        "image_url" => $imagePath
    ]);
}
?>
```

---

## **📋 Requirements**
- A **modern browser** supporting:
  - `MediaDevices.getUserMedia`
  - `MediaRecorder`
  - `HTMLCanvasElement`
- **Internet access** for loading FaceAPI models.

---

## **⚠ Limitations**
- Works best with **good lighting and a clear camera view**.
- Blink detection may **fail for extremely fast or slow blinks**.
- **Relies on external FaceAPI models**, requiring an internet connection.

---

## **🚀 Development**
### **🔹 Clone & Setup**
```bash
git clone https://github.com/lcsnigeria/lcs_verify_face.git
cd lcs_verify_face
npm install
```

### **🔹 Build the Library**
```bash
npm run build
```

### **🔹 Run Tests**
```bash
npm test
```

---

## **🤝 Contributing**
We welcome contributions! Follow these steps:

1. **Fork the repository**  
2. **Create a feature branch**  
3. **Commit and push your changes**  
4. **Submit a pull request**  

---

## **📜 License**
This library is licensed under the **[MIT License](LICENSE)**.

---

## **🙌 Acknowledgments**
- **[FaceAPI.js](https://github.com/justadudewhohacks/face-api.js)** for facial recognition features.
- **[JSDelivr](https://www.jsdelivr.com/)** for CDN hosting of the FaceAPI models.

---

## **💡 Support & Contact**
For issues, feature requests, or questions, open an issue on **[GitHub](https://github.com/lcsnigeria/lcs_verify_face/issues)**.

📧 **Email:** [justicefrewen@gmail.com](mailto:justicefrewen@gmail.com)  
🌐 **Website:** [LCS Nigeria](https://lcs.ng)

---

### **🎯 Final Thoughts**
The **LCS Verify Face** library offers a **lightweight, customizable, and accurate** solution for **web-based face verification**.  
Its **flexibility** makes it suitable for applications like **user authentication, identity verification, and fraud prevention**.

🚀 **Start integrating it into your projects today!** 🚀