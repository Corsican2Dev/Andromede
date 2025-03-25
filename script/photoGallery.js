document.addEventListener('DOMContentLoaded', function() {
    const backgroundVideo = document.getElementById('backgroundVideo');
    const content = document.getElementById('content');
    backgroundVideo.play();

    backgroundVideo.addEventListener('ended', function() {
        backgroundVideo.pause();
        backgroundVideo.currentTime = 5;
    });

    setTimeout(() => {
        content.classList.add('visible');
    }, 4000); // 4 seconds delay

    document.querySelectorAll('.img-fluid').forEach(img => {
        img.addEventListener('click', function(event) {
            event.stopPropagation();
            this.classList.toggle('zoomed');
        });
    });

    document.addEventListener('click', function(event) {
        document.querySelectorAll('.img-fluid.zoomed').forEach(img => {
            img.classList.remove('zoomed');
        });
    });
});