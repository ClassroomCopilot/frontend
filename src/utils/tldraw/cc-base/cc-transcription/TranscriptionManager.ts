import { Editor, TLShapeId } from '@tldraw/tldraw';
import { TranscriptionService } from './transcriptionService';
import { CCLiveTranscriptionShapeUtil } from './CCLiveTranscriptionShapeUtil';

export class TranscriptionManager {
  private static instances = new WeakMap<Editor, TranscriptionManager>();
  private transcriptionService?: TranscriptionService;
  private currentShapeId?: TLShapeId;
  private sameOutputCount = 0;
  private lastText = '';
  private readonly SAME_OUTPUT_THRESHOLD = 10;

  constructor(private editor: Editor) {}

  static getManager(editor: Editor): TranscriptionManager {
    let manager = TranscriptionManager.instances.get(editor);
    if (!manager) {
      manager = new TranscriptionManager(editor);
      TranscriptionManager.instances.set(editor, manager);
    }
    return manager;
  }

  startTranscription(shapeId: TLShapeId) {
    console.log('Starting transcription...');
    this.currentShapeId = shapeId;
    this.transcriptionService = new TranscriptionService();

    // Set up callback for transcription updates
    this.transcriptionService.setTranscriptionCallback((text: string, isFinal: boolean, metadata: { start: number, end: number }) => {
      console.log('📝 Transcription update received:', { text, metadata });
      const util = this.editor.getShapeUtil<CCLiveTranscriptionShapeUtil>('cc-live-transcription');
      if (!util) {
        console.warn('❌ Shape util not found');
        return;
      }
      console.log('Found transcription util:', !!util);

      // Check if text is stable (same output multiple times)
      const isStable = text === this.lastText;
      if (isStable) {
        this.sameOutputCount++;
      } else {
        this.sameOutputCount = 0;
        this.lastText = text;
      }

      // Mark as completed if we've seen the same output multiple times or if marked as final
      const isCompleted = isFinal || this.sameOutputCount >= this.SAME_OUTPUT_THRESHOLD;

      util.updateText(
        this.currentShapeId!,
        text,
        isCompleted,
        metadata
      );
    });

    // Start the transcription service
    this.transcriptionService.startTranscription();
  }

  stopTranscription() {
    console.log('Stopping transcription...');
    if (this.transcriptionService) {
      this.transcriptionService.stopTranscription();
      this.transcriptionService = undefined;
    }
    this.currentShapeId = undefined;
    this.sameOutputCount = 0;
    this.lastText = '';
  }
} 