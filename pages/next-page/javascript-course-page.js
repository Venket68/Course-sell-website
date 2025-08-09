 // --------- Video Data (Edit your YouTube embed links here) ---------
    // To add your own videos, replace the src and title below.
    // Use the YouTube embed link format: https://www.youtube.com/embed/VIDEO_ID
    const videos = [
        {
          title: "Introduction to HTML & CSS",
          src: "https://www.youtube.com/embed/UB1O30fR-EE"
        },
        {
          title: "JavaScript Basics",
          src: "https://www.youtube.com/embed/W6NZfCO5SIk"
        },
        {
          title: "Responsive Web Design",
          src: "https://www.youtube.com/embed/srvUrASNj0s"
        },
        {
          title: "Advanced CSS Animations",
          src: "https://www.youtube.com/embed/1Rs2ND1ryYc"
        },
        {
          title: "Flexbox & Grid Mastery",
          src: "https://www.youtube.com/embed/JJSoEo8JSnc"
        },
        {
          title: "React JS Crash Course",
          src: "https://www.youtube.com/embed/bMknfKXIFA8"
        },
        {
          title: "Node.js & Express Basics",
          src: "https://www.youtube.com/embed/Oe421EPjeBE"
        },
        {
          title: "MongoDB for Beginners",
          src: "https://www.youtube.com/embed/4yqu8YF29cU"
        },
        {
          title: "Deploying Web Apps",
          src: "https://www.youtube.com/embed/nhBVL41-_Cw"
        },
        {
          title: "Final Project Walkthrough",
          src: "https://www.youtube.com/embed/Ke90Tje7VS0"
        }
      ];
      // --------- End Video Data ---------
  
      // --------- State ---------
      let currentVideoIndex = 0;
      let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
      let comments = JSON.parse(localStorage.getItem('comments') || '{}'); // { videoIndex: [ {text, time, id} ] }
  
      // --------- DOM Elements ---------
      const mainVideo = document.getElementById('mainVideo');
      const videoTitle = document.getElementById('videoTitle');
      const videoList = document.getElementById('videoList');
      const nextVideoBtn = document.getElementById('nextVideoBtn');
      const playPauseBtn = document.getElementById('playPauseBtn');
      const skipBackBtn = document.getElementById('skipBackBtn');
      const skipForwardBtn = document.getElementById('skipForwardBtn');
      const fullscreenBtn = document.getElementById('fullscreenBtn');
      const volumeSlider = document.getElementById('volumeSlider');
      const progressBar = document.getElementById('progressBar');
      const progress = document.getElementById('progress');
      const currentTimeLabel = document.getElementById('currentTime');
      const durationLabel = document.getElementById('duration');
      const commentList = document.getElementById('commentList');
      const commentForm = document.getElementById('commentForm');
      const commentInput = document.getElementById('commentInput');
  
      // --------- Video Player Logic ---------
      function loadVideo(index) {
        currentVideoIndex = index;
        mainVideo.src = videos[index].src + "?enablejsapi=1&rel=0&modestbranding=1";
        videoTitle.textContent = videos[index].title;
        updateVideoList();
        updateComments();
        setTimeout(() => {
          // Mark as watched after 2 seconds of play
          if (!watchedVideos.includes(index)) {
            watchedVideos.push(index);
            localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
            updateVideoList();
          }
        }, 2000);
      }
  
      function updateVideoList() {
        videoList.innerHTML = '';
        videos.forEach((video, idx) => {
          const item = document.createElement('div');
          item.className = 'video-item' + (idx === currentVideoIndex ? ' active' : '') + (watchedVideos.includes(idx) ? ' watched' : '');
          item.innerHTML = `
            ${watchedVideos.includes(idx) ? '<span class="watched-dot"></span>' : ''}
            <span class="video-index">${idx + 1}.</span>
            <span class="video-title">${video.title}</span>
          `;
          item.onclick = () => {
            if (currentVideoIndex !== idx) {
              loadVideo(idx);
              pauseVideo();
            }
          };
          videoList.appendChild(item);
        });
        // Scroll to active video
        const active = videoList.querySelector('.active');
        if (active) {
          active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
  
      // --------- YouTube Iframe API for Play/Pause/Seek ---------
      let player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('mainVideo', {
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
      function onPlayerReady(event) {
        setVolume(volumeSlider.value);
        updateTime();
      }
      function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
          // Mark as watched
          if (!watchedVideos.includes(currentVideoIndex)) {
            watchedVideos.push(currentVideoIndex);
            localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
            updateVideoList();
          }
        }
      }
      function playVideo() {
        if (player && player.playVideo) player.playVideo();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }
      function pauseVideo() {
        if (player && player.pauseVideo) player.pauseVideo();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
      function togglePlayPause() {
        if (!player) return;
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
          pauseVideo();
        } else {
          playVideo();
        }
      }
      function skip(seconds) {
        if (player && player.getCurrentTime) {
          player.seekTo(player.getCurrentTime() + seconds, true);
        }
      }
      function setVolume(val) {
        if (player && player.setVolume) player.setVolume(val);
      }
      function setFullscreen() {
        const iframe = mainVideo;
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen();
        } else if (iframe.mozRequestFullScreen) {
          iframe.mozRequestFullScreen();
        } else if (iframe.webkitRequestFullscreen) {
          iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
          iframe.msRequestFullscreen();
        }
      }
      function updateTime() {
        if (player && player.getCurrentTime && player.getDuration) {
          const cur = player.getCurrentTime();
          const dur = player.getDuration();
          currentTimeLabel.textContent = formatTime(cur);
          durationLabel.textContent = formatTime(dur);
          progress.style.width = dur ? (cur / dur * 100) + '%' : '0%';
        }
        requestAnimationFrame(updateTime);
      }
      function formatTime(sec) {
        sec = Math.floor(sec);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      }
      progressBar.addEventListener('click', function(e) {
        if (!player || !player.getDuration) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        player.seekTo(percent * player.getDuration(), true);
      });
  
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