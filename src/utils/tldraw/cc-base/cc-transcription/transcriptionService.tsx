import logger from '../../../../debugConfig';

export interface TranscriptionConfig {
  language?: string;
  task?: string;
  modelSize?: string;
  useVad?: boolean;
}

export class TranscriptionService {
  private socket: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private selectedDeviceId: string = '';
  private onTranscriptionUpdate: ((text: string, isFinal: boolean, metadata: { start: number, end: number }) => void) | null = null;

  constructor(deviceId: string = '') {
    this.selectedDeviceId = deviceId;
  }

  setTranscriptionCallback(callback: (text: string, isFinal: boolean, metadata: { start: number, end: number }) => void) {
    this.onTranscriptionUpdate = callback;
  }

  async startTranscription(config: TranscriptionConfig = {}) {
    console.log('🎙️ Starting transcription service...');
    
    try {
      // Get default audio device if none selected
      if (!this.selectedDeviceId) {
        console.log('No device selected, getting default device...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevice = devices.find(device => device.kind === 'audioinput');
        if (audioDevice) {
          this.selectedDeviceId = audioDevice.deviceId;
          console.log('Found default audio device:', audioDevice.label);
        }
      }

      if (!this.selectedDeviceId) {
        logger.error('transcription-service', '⚠️ No audio device available');
        return;
      }

      logger.info('transcription-service', '🔊 Accessing user media...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: this.selectedDeviceId },
      });
      console.log('Got audio stream');

      const uuid = crypto.randomUUID();
      const wsUrl = import.meta.env.VITE_SITE_URL.startsWith('http')
        ? `wss://${import.meta.env.VITE_SITE_URL.replace(/^https?:\/\//, '')}/whisperlive`
        : `wss://${import.meta.env.VITE_SITE_URL}/whisperlive`;
      console.log('Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);
      this.socket = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          logger.error('transcription-service', '⏰ WebSocket connection timed out');
          ws.close();
        }
      }, 20000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        logger.info('transcription-service', '✅ WebSocket connected');
        
        // Send initial configuration message
        const message = JSON.stringify({
          uid: uuid,
          language: config.language || 'en',
          task: config.task || 'transcribe',
          model: config.modelSize || 'small',
          use_vad: config.useVad ?? true,
        });
        
        ws.send(message);
        this.setupAudioProcessing();
      };

      ws.onerror = (error) => {
        logger.error('transcription-service', '❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        logger.info('transcription-service', '🔌 WebSocket closed');
        this.cleanup();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.uid !== uuid) {
          return;
        }

        if (data.status === 'WAIT') {
          logger.info('transcription-service', `⏳ Wait time: ${Math.round(data.message)} minutes`);
          this.cleanup();
          return;
        }

        if (data.message === 'DISCONNECT') {
          logger.info('transcription-service', '🔕 Server requested disconnection');
          this.cleanup();
          return;
        }

        if (this.onTranscriptionUpdate && data.segments) {
          // Get the last segment which is the current one being updated
          const lastSegment = data.segments[data.segments.length - 1];
          
          // Process completed segments
          let lastCompletedText = '';
          for (let i = 0; i < data.segments.length - 1; i++) {
            const segment = data.segments[i];
            // Only send update if this segment is different from the last one
            if (segment.text.trim() !== lastCompletedText.trim()) {
              this.onTranscriptionUpdate(
                segment.text,
                segment.completed ?? true, // Server marks completed segments
                {
                  start: parseFloat(segment.start),
                  end: parseFloat(segment.end)
                }
              );
              lastCompletedText = segment.text;
            }
          }

          // Update the current (incomplete) segment only if it's different from the last completed one
          if (lastSegment && lastSegment.text.trim() !== lastCompletedText.trim()) {
            this.onTranscriptionUpdate(
              lastSegment.text,
              lastSegment.completed ?? false, // Last segment is typically incomplete unless marked otherwise
              {
                start: parseFloat(lastSegment.start),
                end: parseFloat(lastSegment.end)
              }
            );
          }
        }
      };
    } catch (error) {
      logger.error('transcription-service', '❌ Error starting transcription:', error);
      this.cleanup();
    }
  }

  private async setupAudioProcessing() {
    if (!this.stream || !this.socket) {
      return;
    }

    try {
      this.audioContext = new AudioContext();
      
      // Load and register the audio worklet
      await this.audioContext.audioWorklet.addModule('/audioWorklet.js');
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');

      // Handle audio data from the worklet
      this.workletNode.port.onmessage = (event) => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          const resampledData = this.resampleTo16kHZ(event.data, this.audioContext!.sampleRate);
          this.socket.send(resampledData);
        }
      };

      this.mediaStreamSource.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error setting up audio processing:', error);
    }
  }

  private resampleTo16kHZ(audioData: Float32Array, origSampleRate: number): Float32Array {
    const ratio = origSampleRate / 16000;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const pos = i * ratio;
      const leftPos = Math.floor(pos);
      const rightPos = Math.ceil(pos);
      const weight = pos - leftPos;
      result[i] = audioData[leftPos] * (1 - weight) + (audioData[rightPos] || 0) * weight;
    }
    
    return result;
  }

  stopTranscription() {
    this.cleanup();
  }

  private cleanup() {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
