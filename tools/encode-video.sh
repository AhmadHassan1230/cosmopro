#!/bin/zsh
# Grade, seamlessly loop (0.8 s end-to-start crossfade) and compress a Flow clip for the site.
# usage: tools/encode-video.sh in.mp4 assets/video/name.mp4 1280 720 26 "$GRADE"
# Lilac grade used (pass "" for none):
#   GRADE="colorbalance=rs=-0.02:gs=-0.04:bs=0.03:gm=-0.035:bm=0.035:gh=-0.02:bh=0.025,"
# Half strength (hair colour):
#   GRADE="colorbalance=rs=-0.01:gs=-0.02:bs=0.015:gm=-0.018:bm=0.018:gh=-0.01:bh=0.012,"
# Sizes: hero 1920 1080 crf 25 · hero-mobile 720 1280 crf 26 · categories 1280 720 crf 26
in="$1"; out="$2"; W="$3"; H="$4"; CRF="$5"; G="$6"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
F=0.8
OFF=$(echo "$D - 2*$F" | bc -l)
ffmpeg -v error -y -i "$in" -filter_complex "[0:v]${G}scale=${W}:${H}:flags=lanczos,fps=24,split[a][b];[a]trim=start=${F},setpts=PTS-STARTPTS[m];[b]trim=0:${F},setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=${F}:offset=${OFF},format=yuv420p[v]" -map "[v]" -an -c:v libx264 -preset slow -crf "$CRF" -profile:v high -movflags +faststart "$out"
echo "$(basename $out) $(du -h "$out" | cut -f1) $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")s"
