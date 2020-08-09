# RTP Ogg/Opus Tools Examples

TypeScript examples for the [rtp-ogg-opus](https://github.com/libersys/rtp-ogg-opus.git) module.

## Installation

```
npm install
npm run build
```

## Usage

### Example #1

Shows how to use **OggOpusToRtp** and **RtpOpusToPcm** transform stream classes from **rtp-ogg-opus** module to send and receive Opus streams through RTP.

OpusPlayer class uses the **OggOpusToRtp** transform stream to convert to RTP packets, the opus encoded audio read from a sample music file, and send them to port 4440. The OpusListener listens on port 4440, and uses **RtpOpusToPcm** to decode the received RTP packets, convert them to Linear PCM and playback the audio using node-speaker.

```
npm run example1
```

### Music examples from [Bensound.com](https://www.bensound.com)
