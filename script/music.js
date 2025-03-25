document.addEventListener('DOMContentLoaded', function() {
    const backgroundVideo = document.getElementById('backgroundVideo');
    const content = document.getElementById('content');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');

    backgroundVideo.play();

    backgroundVideo.addEventListener('ended', function() {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 0;
    });

    setTimeout(() => {
        content.classList.add('visible');
    }, 4000); // 4 seconds delay

    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', function() {
            audioSource.src = this.getAttribute('data-src');
            audioPlayer.load();
            audioPlayer.play();
        });
    });
});