import sys
import speech_recognition as sr

def recognize(file_path):
    r = sr.Recognizer()
    try:
        with sr.AudioFile(file_path) as source:
            audio = r.record(source)
        text = r.recognize_google(audio)
        print(text)
    except sr.UnknownValueError:
        print("")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python stt_helper.py <audio_file>")
        sys.exit(1)
    recognize(sys.argv[1])
