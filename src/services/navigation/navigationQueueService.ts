import { logger } from '../../debugConfig';

interface NavigationOperation {
  id: string;
  execute: () => Promise<void>;
  description: string;
}

export class NavigationQueueService {
  private static instance: NavigationQueueService;
  private isProcessing: boolean = false;
  private currentOperation: NavigationOperation | null = null;
  private operationQueue: NavigationOperation[] = [];

  private constructor() {}

  static getInstance(): NavigationQueueService {
    if (!NavigationQueueService.instance) {
      NavigationQueueService.instance = new NavigationQueueService();
    }
    return NavigationQueueService.instance;
  }

  private generateOperationId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async enqueueOperation(operation: () => Promise<void>, description: string): Promise<void> {
    const operationId = this.generateOperationId();
    
    // Create a new operation
    const navigationOperation: NavigationOperation = {
      id: operationId,
      execute: operation,
      description
    };

    // Log the enqueueing
    logger.debug('navigation-queue-service', '📥 Enqueuing navigation operation', {
      operationId,
      description,
      queueLength: this.operationQueue.length
    });

    // Add to queue
    this.operationQueue.push(navigationOperation);

    // Start processing if not already processing
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.operationQueue.length > 0) {
        // Get the next operation
        this.currentOperation = this.operationQueue[0];
        
        logger.debug('navigation-queue-service', '🔄 Processing navigation operation', {
          operationId: this.currentOperation.id,
          description: this.currentOperation.description,
          remainingOperations: this.operationQueue.length - 1
        });

        try {
          await this.currentOperation.execute();
          logger.debug('navigation-queue-service', '✅ Navigation operation completed', {
            operationId: this.currentOperation.id,
            description: this.currentOperation.description
          });
        } catch (error) {
          logger.error('navigation-queue-service', '❌ Navigation operation failed', {
            operationId: this.currentOperation.id,
            description: this.currentOperation.description,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Remove the completed/failed operation
        this.operationQueue.shift();
        this.currentOperation = null;
      }
    } finally {
      this.isProcessing = false;
      this.currentOperation = null;
    }
  }

  clearQueue(): void {
    logger.debug('navigation-queue-service', '🧹 Clearing navigation queue', {
      queueLength: this.operationQueue.length,
      currentOperation: this.currentOperation?.description
    });
    
    this.operationQueue = [];
    // Note: We don't cancel the current operation as it might leave the system in an inconsistent state
  }

  getCurrentOperation(): NavigationOperation | null {
    return this.currentOperation;
  }

  getQueueLength(): number {
    return this.operationQueue.length;
  }
} 