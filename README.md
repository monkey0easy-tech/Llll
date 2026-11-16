# Lecture hall cartoon

A 42-second cartoon of a sleepy morning lecture, drawn in the style of 1980s Soviet cel animation. Every frame is drawn by code (pycairo), so nothing here comes from a video generator.

- `out/lecture_hall.mp4`: the finished video, 1280×720, 24 fps, with sound
- `src/ink.py`: the "hand-inked" line kit. Outlines wobble every frame to imitate line boil.
- `src/people.py`: heads, hair, glasses, clothes and poses
- `src/cast.py`: the cast and what each student does
- `src/film.py`: the hall, the camera moves, paper texture and colour grade, export
- `src/audio.py`: the synthesised tune, wind, tumbleweed and cricket

To rebuild (needs `pip install pycairo numpy pillow` and ffmpeg):

```
python3 src/audio.py out/audio.wav
cd src && python3 film.py ../out/video_silent.mp4 && cd ..
ffmpeg -i out/video_silent.mp4 -i out/audio.wav -c:v libx264 -crf 26 -tune grain -pix_fmt yuv420p -c:a aac -shortest out/lecture_hall.mp4
```
