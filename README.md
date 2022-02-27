# RTP Ogg/Opus Tools Examples

TypeScript examples for the [rtp-ogg-opus](https://github.com/libersys/rtp-ogg-opus.git) module.

## Installation

```
yarn install
yarn build
```

## Usage

### Example #1

Shows how to send and receive Opus streams through RTP using **OggOpusToRtp** and **RtpOpusToPcm** transform stream classes from **rtp-ogg-opus**.

OpusPlayer class uses **OggOpusToRtp** to encode an opus audio stream into RTP packets. The opus encoded audio is read from a music file and send to port 4440. The OpusListener class listens on port 4440 and uses **RtpOpusToPcm** to decode the received RTP packets, convert them to Linear PCM and play them back using node-speaker.

```
yarn run example1
```

### Example #2

Shows how to send and receive Linear PCM streams through RTP using **RtpEncoder** and **RtpDecoder** transform stream classes from **rtp-ogg-opus**.

Slin16Player class uses **RtpEncoder** to encode a PCM audio stream into RTP packets. The PCM encoded audio is read from a file and send to port 4440. The Slin16Listener class listens on port 4440 and uses **RtpDecoder** to decode the received RTP packets and play them back using node-speaker.

```
yarn run example2
```

### Debugging

Set DEBUG environment variable to "rtp-ogg-opus" if you want to see what is going on.

On Windows

```
SET DEBUG=rtp-ogg-opus
```

On Linux

```
export DEBUG=rtp-ogg-opus
```

### Music examples from [Bensound.com](https://www.bensound.com)
