from pathlib import Path
import argparse

import torch
import torchaudio

from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models" / "xtts_v2"


def main():
    parser = argparse.ArgumentParser(description="Generate speech using XTTS")

    parser.add_argument(
        "--text",
        required=True,
        help="Text to speak",
    )

    parser.add_argument(
        "--voice",
        default="nova.wav",
        help="Voice wav file inside voices/",
    )

    parser.add_argument(
        "--output",
        default="output.wav",
        help="Output filename inside outputs/",
    )

    parser.add_argument(
        "--language",
        default="en",
        help="Language code",
    )

    args = parser.parse_args()

    voice_path = BASE_DIR / "voices" / args.voice
    output_path = BASE_DIR / "outputs" / args.output

    print("Loading XTTS...")

    config = XttsConfig()
    config.load_json(str(MODEL_DIR / "config.json"))

    model = Xtts.init_from_config(config)

    model.load_checkpoint(
        config,
        checkpoint_dir=str(MODEL_DIR),
        eval=True,
    )

    model.cuda()

    print("Computing speaker embedding...")

    gpt_cond_latent, speaker_embedding = model.get_conditioning_latents(
        audio_path=str(voice_path)
    )

    print("Generating speech...")

    out = model.inference(
        args.text,
        args.language,
        gpt_cond_latent,
        speaker_embedding,
    )

    torchaudio.save(
        str(output_path),
        torch.tensor(out["wav"]).unsqueeze(0),
        24000,
    )

    print(f"Done! Saved to {output_path}")


if __name__ == "__main__":
    main()