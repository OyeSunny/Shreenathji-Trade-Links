# Product video worker

Install FFmpeg/FFprobe, apply Prisma migrations, then install and enable
`systemd/shreenathji-product-video-worker.service`. The worker needs read/write
access only to `var/media-processing` and `public/media/uploads`.
