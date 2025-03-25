document.addEventListener('DOMContentLoaded', function() {
    const backgroundVideo = document.getElementById('backgroundVideo');
    const content = document.getElementById('content');
    backgroundVideo.play();

    backgroundVideo.addEventListener('ended', function() {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 0;
    });

    setTimeout(() => {
        content.classList.add('visible');
    }, 4850); // 5 seconds delay
});