# Local AI Lab

A collection of privacy-first AI applications exploring practical uses of modern open-source speech and language models.

The first project in the lab is a **fully local Text-to-Speech Reader** built with **XTTS v2**, **FastAPI**, **Next.js**, and **TypeScript**. It generates natural-sounding speech from arbitrary text using cloned voices without relying on cloud AI services.

---

## Features

- 🧠 Fully local AI inference (XTTS v2)
- 🎤 Voice cloning using reference audio samples
- ⚡ Persistent GPU model loaded once at startup
- 📄 Long-document support with automatic text chunking
- 📊 Live generation progress and ETA
- ⏯ Playback controls
  - Seek
  - Rewind / Fast-forward
  - Playback speed
- 📚 Read-along mode with synchronized sentence highlighting
- 🎙 Multiple narrator selection
- 🗂 Saved recordings library
- ⏳ Queued generation for safe processing of multiple requests
- 🔒 Offline-first architecture (no cloud APIs)

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI

### AI

- XTTS v2
- PyTorch
- Torchaudio

### Infrastructure

- CUDA GPU acceleration

---

## Architecture

```text
                +----------------------+
                |   Next.js Frontend   |
                +----------+-----------+
                           |
                     HTTP / REST API
                           |
                           ▼
                +----------------------+
                |     FastAPI Server   |
                +----------+-----------+
                           |
                      Job Queue
                           |
                           ▼
                    XTTS v2 Model
                           |
             +-------------+--------------+
             |                            |
             ▼                            ▼
        Audio (.wav)              Timing Metadata
             |                            |
             +-------------+--------------+
                           |
                           ▼
                 Read-Along Player
```

---

## Why I Built This

I frequently listen to technical documentation, AI course notes, and long-form reading while walking or driving.

Most commercial text-to-speech solutions require uploading documents to cloud services or charge recurring subscription fees.

This project explores how modern open-source AI models can deliver a comparable experience entirely offline while remaining extensible for future AI experiments.

---

## Technical Highlights

- Asynchronous job processing for long-running AI inference
- Persistent GPU model loading to minimize generation latency
- Automatic document chunking for long-form content
- Sentence-level timing metadata for synchronized read-along playback
- Offline-first architecture with no external AI APIs

---

## Future Ideas

- Chapter support
- Audiobook mode
- MP3 export
- Transcript export
- Mobile-friendly interface
- Improved synchronization accuracy
- Voice management UI
- Bookmarking
- Searchable transcripts

---

## License

MIT
