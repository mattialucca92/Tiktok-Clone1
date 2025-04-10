let userInteracted = false;
let isVolumeEnabled = true;

const handleUserInteraction = () => {
  if (!userInteracted) {
    userInteracted = true;
    const firstVideo = document.querySelector("video");
    if (firstVideo) {
      firstVideo
        .play()
        .catch((error) => console.error("Errore autoplay:", error));
    }

    document.removeEventListener("click", handleUserInteraction);
  }
};

document.addEventListener("click", handleUserInteraction);

function setupVideoEvents() {
  const appContainerEl = document.querySelector("#app-container");
  const videosEls = document.querySelectorAll("video");
  const halfScreenHeight = window.innerHeight / 2;
  const audioIconsEls = document.querySelectorAll(".volume");

  const checkVisibleVideos = () => {
    videosEls.forEach((video) => {
      const videoRect = video.getBoundingClientRect();
      const isVisible = videoRect.top >= 0 && videoRect.top <= halfScreenHeight;

      if (isVisible) {
        video.play().catch((error) => console.error("Errore autoplay:", error));
      } else {
        video.pause();
      }
    });
  };

  checkVisibleVideos();

  appContainerEl.addEventListener("scroll", checkVisibleVideos);

  audioIconsEls.forEach((audioIcon) => {
    audioIcon.addEventListener("click", () => {
      isVolumeEnabled = !isVolumeEnabled;
      videosEls.forEach((video) => {
        video.muted = !isVolumeEnabled;
      });

      audioIconsEls.forEach((audioIcon) => {
        audioIcon.className = isVolumeEnabled
          ? "fa-solid fa-volume-high volume"
          : "fa-solid fa-volume-xmark volume";
      });
    });
  });
}

async function loadVideos() {
  try {
    const response = await fetch(
      "https://api.pexels.com/videos/search?query=night&per_page=5",
      {
        headers: {
          Authorization:
            "CfiN1q5SqnDKvQa3dRjGLvBJDfC7Yk5aq6iRNkrf4muOrGyU1fhKKURK",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const data = await response.json();
    const appContainer = document.getElementById("app-container");

    data.videos.forEach((video) => {
      const videoUrl = video.video_files.find(
        (file) => file.quality === "sd"
      )?.link;
      if (videoUrl) {
        const videoHTML = `
          <div class="screen">
            <video src="${videoUrl}" playsinline loop autoplay ${
          isVolumeEnabled ? "" : "muted"
        }></video>
            <div class="controls">
              <i class="fa-solid ${
                isVolumeEnabled ? "fa-volume-high" : "fa-volume-xmark"
              } volume"></i>
              <i class="fa-solid fa-heart"></i>
              <i class="fa-solid fa-comment"></i>
            </div>
            <div class="info">
              <h4 class="username">@${video.user.name}</h4>
              <p class="description">${video.url}</p>
              <p class="audio"><i class="fa-solid fa-music"></i> Pexels Video</p>
            </div>
          </div>
        `;
        appContainer.insertAdjacentHTML("beforeend", videoHTML);
      }
    });

    setupVideoEvents();
  } catch (error) {
    console.error("Errore nel caricamento dei video:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const introImage = document.getElementById("intro-image");

  setTimeout(() => {
    introImage.style.opacity = 1;
  }, 500);

  introImage.addEventListener("animationend", () => {
    loadVideos();
  });
});
