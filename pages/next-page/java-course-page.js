//javascrip-page code
// --------- Video Data (Edit your YouTube embed links here) ---------
// To add your own videos, replace the src and title below.
// Use the YouTube embed link format: https://www.youtube.com/embed/VIDEO_ID
// You can change the video/side list size by editing --video-width, --video-height, --side-list-width in the :root CSS above.
const videos = [
    {
      title: "Java Full Course - Introduction",
      src: "https://www.youtube.com/embed/eIrMbAQSU34"
    },
    {
      title: "Java Variables and Data Types",
      src: "https://www.youtube.com/embed/hlGoQC332VM"
    },
    {
      title: "Java Operators and Expressions",
      src: "https://www.youtube.com/embed/UmnCZ7-9yDY"
    },
    {
      title: "Java Control Statements",
      src: "https://www.youtube.com/embed/8cm1x4bC610"
    },
    {
      title: "Java Methods and Recursion",
      src: "https://www.youtube.com/embed/GoXwIVyNvX0"
    },
    {
      title: "Java Object Oriented Programming",
      src: "https://www.youtube.com/embed/3u1fu6f8Hto"
    },
    {
      title: "Java Arrays and Collections",
      src: "https://www.youtube.com/embed/1uFY60CESlM"
    },
    {
      title: "Java Exception Handling",
      src: "https://www.youtube.com/embed/3GRSbr0EYYU"
    },
    {
      title: "Java File I/O",
      src: "https://www.youtube.com/embed/3u1fu6f8Hto"
    },
    {
      title: "Java Multithreading",
      src: "https://www.youtube.com/embed/0hvmK5K3d3k"
    }
  ];
  
  // --------- State ---------
  let currentVideoIndex = 0;
  let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
  let comments = JSON.parse(localStorage.getItem('comments') || '{}');
  let player;
  let isPlaying = false;
  let progressInterval = null;
  
  // --------- DOM Elements ---------
  const mainVideo = document.getElementById('mainVideo');
  const videoTitle = document.getElementById('videoTitle');
  const videoList = document.getElementById('videoList');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const skipBackBtn = document.getElementById('skipBackBtn');
  const skipForwardBtn = document.getElementById('skipForwardBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const nextVideoBtn = document.getElementById('nextVideoBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const progressBar = document.getElementById('progressBar');
  const progress = document.getElementById('progress');
  const currentTimeLabel = document.getElementById('currentTime');
  const durationLabel = document.getElementById('duration');
  const commentList = document.getElementById('commentList');
  const commentForm = document.getElementById('commentForm');
  const commentInput = document.getElementById('commentInput');
  
  // --------- YouTube Iframe API ---------
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('mainVideo', {
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }
  function onPlayerReady() {
    setVolume(volumeSlider.value);
    updateProgress();
  }
  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      startProgressInterval();
    } else {
      isPlaying = false;
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      stopProgressInterval();
    }
    // Mark as watched if video started
    if (event.data === YT.PlayerState.PLAYING) {
      if (!watchedVideos.includes(currentVideoIndex)) {
        watchedVideos.push(currentVideoIndex);
        localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
        updateVideoList();
      }
    }
  }
  
  // --------- Video Controls ---------
  function loadVideo(index) {
    currentVideoIndex = index;
    videoTitle.textContent = videos[index].title;
    if (player && player.loadVideoByUrl) {
      player.loadVideoByUrl(videos[index].src);
    } else {
      mainVideo.src = videos[index].src + "?enablejsapi=1&rel=0";
    }
    updateVideoList();
    updateComments();
    setTimeout(updateProgress, 500);
  }
  function playVideo() {
    if (player && player.playVideo) player.playVideo();
    else mainVideo.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
  }
  function pauseVideo() {
    if (player && player.pauseVideo) player.pauseVideo();
    else mainVideo.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
  function togglePlayPause() {
    if (isPlaying) pauseVideo();
    else playVideo();
  }
  function skip(seconds) {
    if (player && player.getCurrentTime && player.seekTo) {
      let t = player.getCurrentTime() + seconds;
      player.seekTo(Math.max(0, t), true);
    }
  }
  function setVolume(val) {
    if (player && player.setVolume) player.setVolume(val);
  }
  function setFullscreen() {
    if (mainVideo.requestFullscreen) mainVideo.requestFullscreen();
    else if (mainVideo.webkitRequestFullscreen) mainVideo.webkitRequestFullscreen();
    else if (mainVideo.msRequestFullscreen) mainVideo.msRequestFullscreen();
  }
  function startProgressInterval() {
    stopProgressInterval();
    progressInterval = setInterval(updateProgress, 500);
  }
  function stopProgressInterval() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = null;
  }
  function updateProgress() {
    if (player && player.getCurrentTime && player.getDuration) {
      let cur = player.getCurrentTime();
      let dur = player.getDuration();
      if (!isNaN(cur) && !isNaN(dur) && dur > 0) {
        progress.style.width = (cur / dur * 100) + "%";
        currentTimeLabel.textContent = formatTime(cur);
        durationLabel.textContent = formatTime(dur);
      }
    }
  }
  function formatTime(sec) {
    sec = Math.floor(sec);
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  progressBar.onclick = function(e) {
    if (player && player.getDuration && player.seekTo) {
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const dur = player.getDuration();
      player.seekTo(dur * percent, true);
    }
  };
  
  // --------- Video List ---------
  function updateVideoList() {
    videoList.innerHTML = '';
    videos.forEach((v, idx) => {
      const item = document.createElement('div');
      item.className = 'video-item';
      if (idx === currentVideoIndex) item.classList.add('active');
      if (watchedVideos.includes(idx)) item.classList.add('watched');
      item.onclick = () => {
        loadVideo(idx);
        pauseVideo();
      };
      if (watchedVideos.includes(idx)) {
        const dot = document.createElement('span');
        dot.className = 'watched-dot';
        item.appendChild(dot);
      }
      const indexSpan = document.createElement('span');
      indexSpan.className = 'video-index';
      indexSpan.textContent = idx + 1 + '.';
      item.appendChild(indexSpan);
  
      const titleSpan = document.createElement('span');
      titleSpan.className = 'video-title';
      titleSpan.textContent = v.title;
      item.appendChild(titleSpan);
  
      videoList.appendChild(item);
    });
  }
  
  // --------- Controls Events ---------
  playPauseBtn.onclick = togglePlayPause;
  skipBackBtn.onclick = () => skip(-10);
  skipForwardBtn.onclick = () => skip(10);
  nextVideoBtn.onclick = () => {
    if (currentVideoIndex < videos.length - 1) {
      loadVideo(currentVideoIndex + 1);
      pauseVideo();
    }
  };
  fullscreenBtn.onclick = setFullscreen;
  volumeSlider.oninput = (e) => setVolume(e.target.value);
  
  // --------- Comments Logic ---------
  function updateComments() {
    const vidKey = currentVideoIndex;
    commentList.innerHTML = '';
    const vidComments = comments[vidKey] || [];
    vidComments.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <span>${c.text} <span class="comment-time">${c.time}</span></span>
        <button class="delete-btn" title="Delete" data-idx="${idx}"><i class="fas fa-trash"></i></button>
      `;
      item.querySelector('.delete-btn').onclick = function() {
        if (confirm('Delete this comment?')) {
          vidComments.splice(idx, 1);
          comments[vidKey] = vidComments;
          localStorage.setItem('comments', JSON.stringify(comments));
          updateComments();
        }
      };
      commentList.appendChild(item);
    });
  }
  commentForm.onsubmit = function(e) {
    e.preventDefault();
    const text = commentInput.value.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleString();
    const vidKey = currentVideoIndex;
    if (!comments[vidKey]) comments[vidKey] = [];
    comments[vidKey].push({ text, time, id: Date.now() });
    localStorage.setItem('comments', JSON.stringify(comments));
    commentInput.value = '';
    updateComments();
  };
  
  // --------- Initial Load ---------
  function init() {
    updateVideoList();
    loadVideo(0);
    // Load YouTube Iframe API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  }
  window.onload = init;