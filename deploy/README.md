# Product video worker

Install FFmpeg/FFprobe once, then use
`deploy-shreenathji-trade-links.sh` as `/usr/local/sbin/deploy-shreenathji-trade-links`.
It applies migrations and refreshes the worker service on every release. The
worker only writes to `var/media-processing` and `public/media/uploads`.
