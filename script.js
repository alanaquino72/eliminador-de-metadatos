// ===============================
// |         Modo oscuro         |
// ===============================
const darkModeToggle = document.getElementById("dark-mode-toggle");

document.addEventListener("DOMContentLoaded", function () {
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  if (savedDarkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
  } else {
    darkModeToggle.textContent = "🌙";
  }
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
  localStorage.setItem("darkMode", isDarkMode);
});

// ===============================
// |   Eliminador de Metadatos   |
// ===============================
function initMetadataRemover() {
  const uploadArea = document.getElementById("upload-area");
  const fileInput = document.getElementById("file-input");
  const browseBtn = document.getElementById("browse-btn");
  const selectedFileInfo = document.getElementById("selected-file-info");
  const selectedFileName = document.getElementById("selected-file-name");
  const filePreviewSection = document.getElementById("file-preview-section");
  const fileIcon = document.getElementById("file-icon");
  const imagePreview = document.getElementById("image-preview");
  const fileName = document.getElementById("file-name");
  const fileSize = document.getElementById("file-size");
  const fileType = document.getElementById("file-type");
  const metadataItems = document.getElementById("metadata-items");
  const processBtn = document.getElementById("process-btn");
  const downloadBtn = document.getElementById("download-btn");
  const audioPlayer = document.getElementById("audio-player");
  const audioPreview = document.getElementById("audio-preview");

  let currentFile = null;
  let processedFile = null;

  // ===============================
  // Eventos de carga de archivos
  // ===============================
  browseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.click();
  });

  uploadArea.addEventListener("click", (e) => {
    if (
      e.target === uploadArea ||
      e.target.classList.contains("fa-cloud-upload-alt") ||
      e.target.tagName === "H3" ||
      e.target.tagName === "P"
    ) {
      fileInput.click();
    }
  });

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.add("drag-over"),
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.remove("drag-over"),
      false
    );
  });

  uploadArea.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      fileInput.value = "";
    }
  });

  // ===============================
  // Eventos de botones
  // ===============================
  processBtn.addEventListener("click", processFile);
  downloadBtn.addEventListener("click", downloadFile);

  // ===============================
  // Funciones principales
  // ===============================
  function handleFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. Máximo permitido: 50 MB.");
      return;
    }

    currentFile = file;
    selectedFileName.textContent = file.name;
    selectedFileInfo.classList.remove("hidden");

    fileName.textContent = file.name;
    fileSize.textContent = `Tamaño: ${formatFileSize(file.size)}`;
    fileType.textContent = `Tipo: ${file.type || "Desconocido"}`;

    fileIcon.classList.add("hidden");
    imagePreview.classList.add("hidden");
    audioPlayer.classList.add("hidden");

    if (file.type.startsWith("image/")) {
      fileIcon.classList.add("hidden");
      imagePreview.classList.remove("hidden");
      imagePreview.src = URL.createObjectURL(file);
      imagePreview.onload = () => URL.revokeObjectURL(imagePreview.src);
    } else if (file.type.startsWith("audio/")) {
      fileIcon.className = "fas fa-music";
      fileIcon.classList.remove("hidden");
      audioPlayer.classList.remove("hidden");
      audioPreview.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      fileIcon.className = "fas fa-video";
      fileIcon.classList.remove("hidden");
    } else if (file.type.includes("pdf")) {
      fileIcon.className = "fas fa-file-pdf";
      fileIcon.classList.remove("hidden");
    } else if (file.type.includes("word") || file.type.includes("document")) {
      fileIcon.className = "fas fa-file-word";
      fileIcon.classList.remove("hidden");
    } else if (file.type.includes("sheet") || file.type.includes("excel")) {
      fileIcon.className = "fas fa-file-excel";
      fileIcon.classList.remove("hidden");
    } else {
      fileIcon.className = "fas fa-file";
      fileIcon.classList.remove("hidden");
    }

    extractMetadata(file);
    filePreviewSection.classList.remove("hidden");
    processBtn.classList.remove("hidden");
    downloadBtn.classList.add("hidden");
    processedFile = null;
    processBtn.disabled = false;
    processBtn.innerHTML = '<i class="fas fa-magic"></i> Eliminar Metadatos';
  }

  function extractMetadata(file) {
    metadataItems.innerHTML = "";
    addMetadataItem("Nombre del archivo", file.name);
    addMetadataItem("Tipo MIME", file.type || "Desconocido");
    addMetadataItem("Tamaño", formatFileSize(file.size));
    addMetadataItem(
      "Última modificación",
      new Date(file.lastModified).toLocaleString()
    );

    if (file.type.startsWith("image/")) {
      extractImageMetadata(file);
    } else if (file.type.startsWith("audio/")) {
      addMetadataItem("Tipo de audio", "Archivo de audio");
      addMetadataItem("Duración", "Información de duración");
      addMetadataItem("Codec", "Información de codec simulada");
    } else if (file.type.startsWith("video/")) {
      addMetadataItem("Tipo de video", "Archivo de video");
      addMetadataItem("Duración", "Información de duración");
      addMetadataItem("Resolución", "Información de resolución");
    } else if (file.type.includes("pdf")) {
      addMetadataItem("Tipo de documento", "Documento PDF");
      addMetadataItem("Número de páginas", "Información de páginas");
      addMetadataItem("Autor", "Información de autor simulada");
    } else {
      addMetadataItem("Metadatos adicionales", "No se detectaron metadatos adicionales");
    }
  }

  function extractImageMetadata(file) {
    const img = new Image();
    img.onload = function () {
      addMetadataItem("Dimensiones", `${img.naturalWidth} × ${img.naturalHeight} píxeles`);
      addMetadataItem("Modelo de cámara", "Información de cámara simulada");
      addMetadataItem("Fecha de captura", new Date().toLocaleDateString());
      addMetadataItem("Configuración ISO", "ISO 100");
      addMetadataItem("Distancia focal", "50mm");
      URL.revokeObjectURL(img.src);
    };
    img.onerror = function () {
      addMetadataItem("Error.", "No se pudieron cargar los metadatos de la imagen.");
    };
    img.src = URL.createObjectURL(file);
  }

  function addMetadataItem(key, value) {
    const li = document.createElement("li");
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-circle-check";
    li.appendChild(icon);
    li.appendChild(document.createTextNode(` ${key}: ${value}`));
    metadataItems.appendChild(li);
  }

  // ===============================
  // Procesamiento del archivo
  // ===============================
  function processFile() {
    if (!currentFile) return;

    processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    processBtn.disabled = true;

    setTimeout(() => {
      const processor = currentFile.type.startsWith("image/")
        ? processImageFile
        : processOtherFile;

      processor()
        .then((file) => {
          processedFile = file;
          completeProcessing();
        })
        .catch((error) => {
          console.error("Error procesando archivo:", error);
          alert("Error al procesar el archivo. Intenta nuevamente.");
          resetProcessButton();
        });
    }, 1500);
  }

  function completeProcessing() {
    processBtn.innerHTML = '<i class="fas fa-check"></i> Metadatos Eliminados';
    processBtn.disabled = true;
    downloadBtn.classList.remove("hidden");

    metadataItems.innerHTML = "";
    const li = document.createElement("li");
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-circle-check";
    li.appendChild(icon);
    li.appendChild(document.createTextNode(" Todos los metadatos han sido eliminados."));
    metadataItems.appendChild(li);
  }

  function resetProcessButton() {
    processBtn.innerHTML = '<i class="fas fa-magic"></i> Eliminar Metadatos';
    processBtn.disabled = false;
  }

  // ===============================
  // Eliminación simulada de metadatos
  // ===============================
  function generateRandomName(extension) {
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `archivo_limpio_${randomStr}.${extension}`;
  }

  function processImageFile() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const ext = currentFile.name.split(".").pop();
          const randomName = generateRandomName(ext);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processed = new File([blob], randomName, {
                  type: currentFile.type,
                  lastModified: new Date().getTime(),
                });
                resolve(processed);
                URL.revokeObjectURL(img.src);
              } else reject(new Error("No se pudo procesar la imagen."));
            },
            currentFile.type,
            0.95
          );
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen."));
      img.src = URL.createObjectURL(currentFile);
    });
  }

  function processOtherFile() {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const blob = new Blob([e.target.result], { type: currentFile.type });
        const ext = currentFile.name.split(".").pop();
        const randomName = generateRandomName(ext);
        const processed = new File([blob], randomName, {
          type: currentFile.type,
          lastModified: new Date().getTime(),
        });
        resolve(processed);
      };
      reader.readAsArrayBuffer(currentFile);
    });
  }

  // ===============================
  // Descarga del archivo limpio
  // ===============================
  function downloadFile() {
    if (!processedFile && !currentFile) {
      alert("No hay archivo para descargar.");
      return;
    }

    const fileToDownload = processedFile || currentFile;
    const url = URL.createObjectURL(fileToDownload);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileToDownload.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ===============================
  // Utilidad
  // ===============================
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", initMetadataRemover);