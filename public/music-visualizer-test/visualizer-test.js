(() => {
  const iframe = document.querySelector('[data-visualizer-player]');
  const visualizer = document.querySelector('[data-visualizer]');
  if (!iframe || !visualizer) return;

  const columns = [];
  const segmentCount = 12;
  const renderColumn = (segments, level) => segments.forEach((segment, index) => {
    segment.classList.toggle('is-lit', index < level);
  });
  for (let i = 0; i < 30; i += 1) {
    const column = document.createElement('span');
    column.className = 'test__visualizer-column';
    const segments = Array.from({ length: segmentCount }, () => {
      const segment = document.createElement('i');
      segment.className = 'test__visualizer-segment';
      column.append(segment);
      return segment;
    });
    columns.push(segments);
    renderColumn(segments, 1 + Math.round(Math.abs(Math.sin(i * 0.48)) * 3));
    visualizer.append(column);
  }

  const embedUrl = new URL(iframe.src);
  embedUrl.searchParams.set('enablejsapi', '1');
  embedUrl.searchParams.set('origin', window.location.origin);
  iframe.src = embedUrl.href;

  let motionTimer = null;
  let frame = 0;
  const stopMotion = () => {
    if (motionTimer !== null) window.clearInterval(motionTimer);
    motionTimer = null;
  };
  const startMotion = () => {
    stopMotion();
    motionTimer = window.setInterval(() => {
      frame += 1;
      const beat = frame % 5 === 0 ? 3 : 0;
      columns.forEach((segments, index) => {
        const envelope = Math.abs(Math.sin((frame * 0.72) + (index * 0.42)));
        const variation = Math.random() * 4;
        const level = Math.max(1, Math.min(segmentCount, Math.round(1 + envelope * 6 + variation + beat)));
        renderColumn(segments, level);
      });
    }, 75);
  };

  window.onYouTubeIframeAPIReady = () => {
    new window.YT.Player(iframe, {
      events: {
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) startMotion();
          else stopMotion();
        }
      }
    });
  };
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.head.append(script);

})();
