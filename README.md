# rtp-ogg-opus-examples

TypeScript examples for [RTP Ogg/Opus Tools for NodeJS](https://github.com/libersys/rtp-ogg-opus.git) module.

## Installation

```
npm install
npm run build
```

## Usage

### Example #1

Shows how to use **OggOpusToRtp** and **RtpOpusToPcm** transform stream classes from rtp-ogg-opus to send and receive Opus streams through RTP.

OpusPlayer class uses the **OggOpusToRtp** transform stream class to convert to RTP packets the opus stream read from a sample music file, and send them to port 4440. The OpusListener class uses **RtpOpusToPcm** to decode these RTP packets, convert them to Linear PCM and play them using **node-speaker**.

```
npm run example1
```

### Music examples from [Bensound.com](https://www.bensound.com)
