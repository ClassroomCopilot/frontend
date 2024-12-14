import {
    StateNode,
    TLEventHandlers,
    TLShapeId,
    TLShapePartial,
    TLTextShape,
} from '@tldraw/tldraw';
import { IMicrophoneShape, ITranscriptionTextShape } from './microphone-shape-types';
import logger from '../../../debugConfig';

class MicrophoneStateTool extends StateNode {
    static id = 'microphone';
    static initial = 'idle';
    static children = () => [Idle, Pointing, Dragging, HoveringButton];

    private socket: WebSocket | null = null;
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
    private recorder: ScriptProcessorNode | null = null;
    private selectedDeviceId: string = '';
    private language: string = 'en';
    private task: string = 'transcribe';
    private modelSize: string = 'small';
    private useVad: boolean = true;

    constructor(props: any) {
        super(props);
        this.initializeAudioDevices();
    }

    toggleTranscription = async (isOn: boolean) => {
        logger.info(
            'microphone-state-tool',
            `🎙️ Transcription ${isOn ? 'starting' : 'stopping'}...`
        );
        if (isOn) {
            await this.startTranscription();
        } else {
            this.stopTranscription();
        }
    };

    startTranscription = async () => {
        if (!this.selectedDeviceId) {
            logger.error('microphone-state-tool', '⚠️ No audio device selected. Cannot start transcription.');
            return;
        }

        try {
            logger.info('microphone-state-tool', '🔊 Accessing user media...');
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: this.selectedDeviceId },
            });

            const uuid = this.generateUUID();
            const wsUrl = `wss://${import.meta.env.VITE_SITE_URL}/whisperlive`;
            logger.info('microphone-state-tool', `🌐 Connecting to WebSocket: ${wsUrl}`);

            const ws = new WebSocket(wsUrl);
            this.socket = ws;

            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    logger.error('microphone-state-tool', '⏰ WebSocket connection timed out.');
                    ws.close();
                }
            }, 20000);

            ws.onopen = () => {
                clearTimeout(connectionTimeout);
                logger.info('microphone-state-tool', '✅ WebSocket connection established.');
                const message = JSON.stringify({
                    uid: uuid,
                    language: this.language,
                    task: this.task,
                    model: this.modelSize,
                    use_vad: this.useVad,
                });
                logger.info('microphone-state-tool', `📤 Sending configuration to WebSocket: ${message}`);
                ws.send(message);
            };

            ws.onerror = (error) => {
                logger.error('microphone-state-tool', '❌ WebSocket encountered an error.', error);
            };

            ws.onclose = (event) => {
                logger.info('microphone-state-tool', `🔌 WebSocket closed. Code: ${event.code}`);
            };

            ws.onmessage = (event) => {
                logger.info('microphone-state-tool', `📨 Received message: ${event.data}`);
                const data = JSON.parse(event.data);
                if (data.uid !== uuid) return;

                if (data.status === 'WAIT') {
                    logger.info(
                        'microphone-state-tool',
                        `⏳ Wait time: ${Math.round(data.message)} minutes. Disconnecting.`
                    );
                    this.stopTranscription();
                    return;
                }

                if (data.message === 'DISCONNECT') {
                    logger.info('microphone-state-tool', '🔕 Server requested disconnection.');
                    this.stopTranscription();
                    return;
                }

                if (data.segments) {
                    logger.info('microphone-state-tool', `📝 Received transcription segments: ${JSON.stringify(data.segments)}`);
                    data.segments.forEach((segment: any, index: number) => {
                        const sentenceId = index + 1;
                        const isComplete = index < data.segments.length - 1;
                        this.addOrUpdateTranscriptionTextShape(segment, sentenceId, isComplete);
                    });
                }
            };

            this.audioContext = new AudioContext();
            this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
            this.recorder = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.recorder.onaudioprocess = (event) => {
                if (!this.audioContext || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
                const inputData = event.inputBuffer.getChannelData(0);
                const audioData16kHz = this.resampleTo16kHZ(inputData, this.audioContext.sampleRate);
                this.socket.send(audioData16kHz);
            };

            this.mediaStreamSource.connect(this.recorder);
            this.recorder.connect(this.audioContext.destination);
        } catch (error) {
            logger.error('microphone-state-tool', '❌ Error during transcription start.', error);
        }
    };

    stopTranscription = () => {
        logger.info('microphone-state-tool', '🛑 Stopping transcription...');
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (this.recorder) {
            this.recorder.disconnect();
            this.recorder = null;
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
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
        logger.info('microphone-state-tool', '✅ Transcription stopped successfully.');
    };

    generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    private resampleTo16kHZ = (audioData: Float32Array, origSampleRate: number = 44100): Float32Array => {
        const data = new Float32Array(audioData);
        const targetLength = Math.round(data.length * (16000 / origSampleRate));
        const resampledData = new Float32Array(targetLength);
        const springFactor = (data.length - 1) / (targetLength - 1);
        resampledData[0] = data[0];
        resampledData[targetLength - 1] = data[data.length - 1];

        for (let i = 1; i < targetLength - 1; i++) {
            const index = i * springFactor;
            const leftIndex = Math.floor(index);
            const rightIndex = Math.ceil(index);
            const fraction = index - leftIndex;
            resampledData[i] = data[leftIndex] + (data[rightIndex] - data[leftIndex]) * fraction;
        }

        logger.info('microphone-state-tool', '🎵 Audio resampled to 16kHz.');
        return resampledData;
    };

    private async initializeAudioDevices() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                logger.error('microphone-state-tool', '🚫 Media devices API not available. (hack with browser://flags/#unsafely-treat-insecure-origin-as-secure)');
                return;
            }
            logger.info('microphone-state-tool', '🎧 Initializing audio devices...');
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter((device) => device.kind === 'audioinput');
            if (audioDevices.length > 0) {
                this.selectedDeviceId = audioDevices[0].deviceId;
                logger.info('microphone-state-tool', `🎤 Default audio device selected: ${this.selectedDeviceId}`);
            } else {
                logger.error('microphone-state-tool', '⚠️ No audio input devices found.');
            }
        } catch (error) {
            logger.error('microphone-state-tool', '❌ Error initializing audio devices.', error);
        }
    }

    private addOrUpdateTranscriptionTextShape = (segment: any, sentenceId: number, isComplete: boolean) => {
        const shapeId = `shape:transcriptionText-${sentenceId}`;
        const existingShape = this.editor.getShape(shapeId as TLShapeId);

        const shapeProps: ITranscriptionTextShape['props'] = {
            text: `(${sentenceId}) ${segment.start}-${segment.end}: ${segment.text}`,
            w: 1000,
            h: 30,
            sentenceId: sentenceId.toString(),
            isComplete: isComplete,
        };

        if (existingShape) {
            logger.info(
                'microphone-state-tool',
                `✏️ Updating transcription shape: ${shapeId} with new segment: ${segment.text}`
            );
            this.editor.updateShape({
                id: shapeId as TLShapeId,
                type: 'transcriptionText',
                props: shapeProps,
            });
        } else {
            logger.info(
                'microphone-state-tool',
                `➕ Creating new transcription shape: ${shapeId} with segment: ${segment.text}`
            );
            this.editor.createShape({
                id: shapeId as TLShapeId,
                type: 'transcriptionText',
                x: 20,
                y: 20 + 20 * sentenceId,
                props: shapeProps,
            });
        }
    };

    override onExit = () => {
        if (this.socket) {
            logger.info('microphone-state-tool', '🔌 Cleaning up: Closing WebSocket connection.');
            this.socket.close();
        }
    };
}

class Idle extends StateNode {
    static override id = 'idle';

    override onEnter = () => {
        this.editor.setCursor({ type: 'cross' });
        logger.info('microphone-state-tool', '🎯 Idle state entered: Cursor set to cross.');
    };

    override onPointerDown: TLEventHandlers['onPointerDown'] = (info) => {
        const { editor } = this;
        switch (info.target) {
            case 'canvas': {
                const hitMicrophoneShape = editor.getShapeAtPoint(editor.inputs.currentPagePoint);
                if (hitMicrophoneShape) {
                    this.onPointerDown({
                        ...info,
                        shape: hitMicrophoneShape,
                        target: 'shape',
                    });
                    logger.info('microphone-state-tool', '📌 Pointer down on canvas: Transitioning to shape interaction.');
                    return;
                }
                this.parent.transition('pointing', { shape: null });
                logger.info('microphone-state-tool', '📍 Pointer down on canvas: Transitioning to pointing state.');
                break;
            }
            case 'shape': {
                if (editor.inputs.shiftKey) {
                    logger.info('microphone-state-tool', `🔀 Shift-click detected on shape: ${info.shape}.`);
                } else {
                    this.parent.transition('pointing', { shape: info.shape });
                    logger.info('microphone-state-tool', `➡️ Pointer down on shape: Transitioning to pointing state. Shape: ${info.shape}.`);
                }
                break;
            }
        }
    };

    override onDoubleClick: TLEventHandlers['onDoubleClick'] = (info) => {
        const { editor } = this;
        if (info.phase !== 'up') return;

        switch (info.target) {
            case 'canvas': {
                const hitShape = editor.getShapeAtPoint(editor.inputs.currentPagePoint);
                if (hitShape) {
                    this.onDoubleClick({
                        ...info,
                        shape: hitShape,
                        target: 'shape',
                    });
                    logger.info('microphone-state-tool', `🔄 Double-click on canvas: Shape interaction handled for shape: ${hitShape}.`);
                    return;
                }
                const { currentPagePoint } = editor.inputs;
                editor.createShape({
                    type: 'microphone',
                    x: currentPagePoint.x,
                    y: currentPagePoint.y,
                    props: {
                        w: 100,
                        h: 200,
                        isOn: false,
                        color: 'red',
                        buttonX: 37.5,
                        buttonY: 50,
                        buttonWidth: 25,
                        buttonHeight: 25,
                    },
                });
                logger.info('microphone-state-tool', '➕ Double-click on canvas: New microphone shape created.');
                break;
            }
            case 'shape': {
                editor.deleteShapes([info.shape.id]);
                logger.info('microphone-state-tool', `🗑️ Double-click on shape: Shape deleted. Shape ID: ${info.shape.id}.`);
                break;
            }
        }
    };

    override onPointerMove: TLEventHandlers['onPointerMove'] = () => {
        const { editor } = this;
        const hitShape = editor.getShapeAtPoint(editor.inputs.currentPagePoint);
        if (hitShape && hitShape.type === 'microphone') {
            const microphoneShape = hitShape as IMicrophoneShape;
            const bounds = editor.getShapeGeometry(microphoneShape).bounds;
            const buttonBounds = {
                minX: microphoneShape.x + (bounds.width * microphoneShape.props.buttonX) / 100,
                minY: microphoneShape.y + (bounds.height * microphoneShape.props.buttonY) / 100,
                maxX: microphoneShape.x + (bounds.width * (microphoneShape.props.buttonX + microphoneShape.props.buttonWidth)) / 100,
                maxY: microphoneShape.y + (bounds.height * (microphoneShape.props.buttonY + microphoneShape.props.buttonHeight)) / 100,
            };
            const isWithinBounds = editor.inputs.currentPagePoint.x >= buttonBounds.minX &&
                editor.inputs.currentPagePoint.x <= buttonBounds.maxX &&
                editor.inputs.currentPagePoint.y >= buttonBounds.minY &&
                editor.inputs.currentPagePoint.y <= buttonBounds.maxY;
            if (isWithinBounds) {
                this.parent.transition('hovering_button', { shape: microphoneShape });
                logger.info('microphone-state-tool', '👆 Cursor moved over button: Transitioning to hovering_button state.');
            }
        }
    };
}

class Pointing extends StateNode {
    static override id = 'pointing';
    private shape: TLTextShape | null = null;

    override onEnter = (info: { shape: TLTextShape | null }) => {
        this.shape = info.shape;
        logger.info('microphone-state-tool', `🎯 Pointing state entered: Shape set to ${info.shape ? info.shape.id : 'none'}.`);
    };

    override onPointerUp: TLEventHandlers['onPointerUp'] = () => {
        this.parent.transition('idle');
        logger.info('microphone-state-tool', '🔚 Pointer released: Transitioning to idle state.');
    };

    override onPointerMove: TLEventHandlers['onPointerMove'] = () => {
        if (this.editor.inputs.isDragging) {
            this.parent.transition('dragging', { shape: this.shape });
            logger.info('microphone-state-tool', `📦 Pointer moved while dragging: Transitioning to dragging state.`);
        } else {
            logger.info('microphone-state-tool', '🚶 Pointer moved: No dragging detected.');
        }
    };
}

class Dragging extends StateNode {
    static override id = 'dragging';
    private shape: TLShapePartial | null = null;

    override onEnter = (info: { shape: TLShapePartial }) => {
        if (info.shape) {
            this.shape = info.shape;
            logger.info('microphone-state-tool', `🔄 Dragging state entered: Dragging shape ${info.shape.id}.`);
        } else {
            logger.info('microphone-state-tool', '🔄 Dragging state entered: No shape being dragged.');
        }
    };

    override onPointerUp: TLEventHandlers['onPointerUp'] = () => {
        this.parent.transition('idle');
        logger.info('microphone-state-tool', '🔚 Pointer released: Transitioning to idle state.');
    };

    override onPointerMove: TLEventHandlers['onPointerMove'] = () => {
        if (this.shape) {
            logger.info('microphone-state-tool', `📦 Shape dragged: ${this.shape.id}.`);
        } else {
            logger.info('microphone-state-tool', '🖼️ Dragging blank canvas.');
        }
    };
}

class HoveringButton extends StateNode {
    static override id = 'hovering_button';
    private shape: IMicrophoneShape | null = null;

    override onEnter = (info: { shape: IMicrophoneShape }) => {
        this.shape = info.shape;
        this.editor.setCursor({ type: 'pointer' });
        logger.info('microphone-state-tool', `👆 Hovering over button: Shape ID ${info.shape.id}.`);
    };

    override onPointerDown: TLEventHandlers['onPointerDown'] = () => {
        if (this.shape) {
            this.toggleMicrophone(this.shape);
        }
        this.parent.transition('idle');
        logger.info('microphone-state-tool', '🔘 Button clicked: Transitioning to idle state.');
    };

    override onPointerUp: TLEventHandlers['onPointerUp'] = () => {
        this.parent.transition('idle');
        logger.info('microphone-state-tool', '☝️ Pointer released: Transitioning to idle state.');
    };

    override onPointerMove: TLEventHandlers['onPointerMove'] = () => {
        const { editor } = this;
        const hitShape = editor.getShapeAtPoint(editor.inputs.currentPagePoint);
        if (hitShape && hitShape.type === 'microphone' && hitShape.id === this.shape?.id) {
            logger.info('microphone-state-tool', '👆 Cursor still within button bounds.');
        } else {
            this.parent.transition('idle');
            logger.info('microphone-state-tool', '❌ Cursor left button bounds: Transitioning to idle state.');
        }
    };

    private toggleMicrophone(shape: IMicrophoneShape) {
        const { id, props } = shape;
        const newIsOn = !props.isOn;
        this.editor.updateShape<IMicrophoneShape>({
            id,
            type: 'microphone',
            props: { ...props, isOn: newIsOn },
        });
        logger.info('microphone-state-tool', `🔄 Toggle microphone: Shape ID ${id}, new state: ${newIsOn ? 'ON' : 'OFF'}.`);
        const parentTool = this.parent as MicrophoneStateTool;
        parentTool.toggleTranscription(newIsOn);
    }
}

export default MicrophoneStateTool;