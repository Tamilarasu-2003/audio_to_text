import ffmpeg
import whisper
import sys
import os

file_path = sys.argv[1]

output_path = f'uploads/{os.path.splitext(os.path.basename(file_path))[0]}_converted.wav'

try:
    ffmpeg.input(file_path).output(output_path, ac=1, ar='16000').run(overwrite_output=True)
except ffmpeg.Error as e:
    print(f"FFmpeg error: {e.stderr.decode()}")
    sys.exit(1)

model = whisper.load_model("medium")

try:
    result = model.transcribe(output_path)
    transcript = result['text'] 
    print(transcript) 
except Exception as e:
    print(f"Error during transcription: {str(e)}")
    sys.exit(1)
finally:
    os.remove(output_path)
