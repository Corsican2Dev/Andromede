document.addEventListener('DOMContentLoaded', function() {
    const backgroundVideo = document.getElementById('backgroundVideo');
    const content = document.getElementById('content');
    backgroundVideo.play();
    backgroundVideo.muted = false; // Active l'audio de la vidéo

    backgroundVideo.addEventListener('ended', function() {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 0;
    });

    setTimeout(() => {
        content.classList.add('visible');
    }, 4000); // 4 seconds delay
});