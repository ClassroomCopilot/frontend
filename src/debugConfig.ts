export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'
export type LogCategory = 
    | 'app'
    | 'header'
    | 'not-found'
    | 'routing'
    | 'neo4j-service'
    | 'site-page'
    | 'supabase-client'
    | 'user-page'
    | 'auth-page'
    | 'supabase-profile-service'
    | 'email-signup-form'
    | 'routes'
    | 'super-admin-section'
    | 'tldraw-context'
    | 'user-context'
    | 'super-admin-auth-route'
    | 'admin-page'
    | 'neo4j-context'
    | 'auth-context'
    | 'neo-user-context'
    | 'neo-institute-context'
    | 'auth-service'
    | 'graph-service'
    | 'registration-service'
    | 'snapshot-service'
    | 'shared-store-service'
    | 'sync-service'
    | 'state-management'
    | 'local-store-service'
    | 'storage-service'
    | 'school-service'
    | 'timetable-service'
    | 'local-storage'
    | 'single-player-page'
    | 'multiplayer-page'
    | 'login-page'
    | 'signup-page'
    | 'login-form'
    | 'dev-page'
    | 'axios'
    | 'tldraw-events'
    | 'user-toolbar'
    | 'snapshot-toolbar'
    | 'microphone-state-tool'
    | 'graph-shape'
    | 'graph-panel'
    | 'graph-shape-shared'  // For shared graph shape functionality
    | 'graph-shape-user'    // For user node specific functionality
    | 'graph-shape-teacher' // For teacher node specific functionality
    | 'graph-shape-student' // For student node specific functionality
    | 'calendar-shape'
    | 'calendar'
    | 'supabase'
    | 'binding' 
    | 'translation' 
    | 'position' 
    | 'array' 
    | 'shape'
    | 'baseNodeShapeUtil'
    | 'general' 
    | 'system'
    | 'slides-panel'
    | 'graphStateUtil'
    | 'navigation'    // For slide navigation
    | 'presentation' // For presentation mode
    | 'selection'    // For slide/slideshow selection
    | 'camera'       // For camera movements
    | 'tldraw-service' // For tldraw related logs
    | 'store-service' // For store related logs
    | 'morphic-page' // For Morphic page related logs
    | 'share-handler' // For share handler related logs
    | 'transcription-service' // For transcription service related logs
    | 'slideshow-helpers' // For slideshow helpers related logs
    | 'slide-shape' // For slide shape util related logs
    | 'cc-base-shape-util' // For cc base shape util related logs
    | 'cc-user-node-shape-util' // For cc user node shape util related logs
    | 'node-canvas' // For node canvas related logs
    | 'navigation-service' // For navigation service related logs
    | 'autosave' // For autosave service related logs
    | 'cc-exam-marker' // For cc exam marker related logs
    | 'cc-search' // For cc search related logs
    | 'cc-web-browser' // For cc web browser related logs
    | 'cc-node-snapshot-panel' // For cc node snapshot related logs
    | 'user-neo-db'
    | 'navigation-queue-service' // For navigation queue service related logs

interface LogConfig {
    enabled: boolean        // Master switch to turn logging on/off
    level: LogLevel        // Current log level
    categories: LogCategory[]  // Which categories to show
}

const LOG_LEVELS: Record<LogLevel, number> = {
    error: 0,  // Always shown if enabled
    warn: 1,   // Shows warns and errors
    info: 2,   // Shows info, warns, and errors
    debug: 3,  // Shows debug and above
    trace: 4   // Shows everything
}

class DebugLogger {
    private config: LogConfig = {
        enabled: true,
        level: 'debug',
        categories: ['system', 'navigation', 'presentation', 'selection', 'camera', 'binding', 'shape', 'tldraw-service']
    }

    setConfig(config: Partial<LogConfig>) {
        this.config = { ...this.config, ...config }
    }

    private shouldLog(level: LogLevel, category: LogCategory): boolean {
        return (
            this.config.enabled &&
            LOG_LEVELS[level] <= LOG_LEVELS[this.config.level] &&
            this.config.categories.includes(category)
        )
    }

    log(level: LogLevel, category: LogCategory, message: string, data?: unknown) {
        if (!this.shouldLog(level, category)) {
          return
        }

        const levelEmojis: Record<LogLevel, string> = {
            error: '🔴',  // Red circle for errors
            warn: '⚠️',   // Warning symbol
            info: 'ℹ️',   // Information symbol
            debug: '🔧',  // Wrench for debug
            trace: '🔍'   // Magnifying glass for trace
        }

        const prefix = `${levelEmojis[level]} [${category}]`

        if (data) {
            console.log(`${prefix} ${message}`, data)
        } else {
            console.log(`${prefix} ${message}`)
        }
    }

    // Convenience methods
    error(category: LogCategory, message: string, data?: unknown) {
        this.log('error', category, message, data)
    }

    warn(category: LogCategory, message: string, data?: unknown) {
        this.log('warn', category, message, data)
    }

    info(category: LogCategory, message: string, data?: unknown) {
        this.log('info', category, message, data)
    }

    debug(category: LogCategory, message: string, data?: unknown) {
        this.log('debug', category, message, data)
    }

    trace(category: LogCategory, message: string, data?: unknown) {
        this.log('trace', category, message, data)
    }
}

export const logger = new DebugLogger()

logger.setConfig({
    enabled: true,
    level: 'debug',
    categories: ['app', 'header', 'routing', 'neo4j-context', 'auth-context', 'auth-service', 'state-management', 'local-storage', 'axios', 'system', 'navigation', 'calendar', 'presentation', 'selection', 'camera', 'binding', 'shape', 'tldraw-service', 'tldraw-events', 'signup-page', 'timetable-service', 'dev-page', 'super-admin-auth-route', 'admin-page', 'storage-service', 'user-context', 'login-form', 'super-admin-section', 'routes', 'neo4j-service', 'supabase-client', 'user-page', 'site-page', 'auth-page', 'email-signup-form', 'supabase-profile-service', 'multiplayer-page', 'snapshot-service', 'sync-service', 'slides-panel', 'local-store-service', 'shared-store-service', 'single-player-page', 'user-toolbar', 'registration-service', 'graph-service', 'graph-shape', 'calendar-shape', 'snapshot-toolbar', 'graphStateUtil', 'baseNodeShapeUtil', 'school-service', 'microphone-state-tool', 'store-service', 'morphic-page', 'not-found', 'share-handler', 'transcription-service', 'slideshow-helpers', 'slide-shape', 'graph-panel', 'cc-user-node-shape-util',  'cc-base-shape-util', 'node-canvas', 'navigation-service', 'autosave', 'cc-exam-marker', 'cc-search', 'cc-web-browser', 'neo-user-context', 'neo-institute-context', 'cc-node-snapshot-panel', 'user-neo-db', 'navigation-queue-service']
})

export default logger