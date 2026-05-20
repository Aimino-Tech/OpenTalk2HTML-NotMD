export interface DocumentSection {
  id: string
  entities: string[]
}

export interface DocumentState {
  sections: DocumentSection[]
  lastEdit: number
  consistencyScore: number
  dependencies: string[]
}

export interface SessionState {
  documents: Map<string, DocumentState>
  lastIntent: string | null
  lastMessage: string | null
}

export class DocumentStateManager {
  private sessions = new Map<string, SessionState>()

  init(sessionId: string): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        documents: new Map(),
        lastIntent: null,
        lastMessage: null,
      })
    }
  }

  trackChanges(sessionId: string): void {
    const state = this.sessions.get(sessionId)
    if (!state) return
  }

  cleanup(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  getContext(sessionId: string): string {
    const state = this.sessions.get(sessionId)
    if (!state || state.documents.size === 0) return ""

    const parts = [`Open documents (${state.documents.size}):`]
    for (const [path, doc] of state.documents) {
      parts.push(`  ${path}: ${doc.sections.length} sections, score ${doc.consistencyScore}`)
    }
    return parts.join("\n")
  }

  recordEdit(sessionId: string, path: string): void {
    const state = this.sessions.get(sessionId)
    if (!state) return
    const existing = state.documents.get(path)
    const doc: DocumentState = existing || {
      sections: [],
      lastEdit: 0,
      consistencyScore: 1.0,
      dependencies: [],
    }
    doc.lastEdit = Date.now()
    state.documents.set(path, doc)
  }

  setIntent(sessionId: string, intent: string | null): void {
    const state = this.sessions.get(sessionId)
    if (!state) return
    state.lastIntent = intent
  }

  getIntent(sessionId: string): string | null {
    const state = this.sessions.get(sessionId)
    return state?.lastIntent ?? null
  }

  setLastMessage(sessionId: string, text: string): void {
    const state = this.sessions.get(sessionId)
    if (!state) return
    state.lastMessage = text
  }

  getLastMessage(sessionId: string): string | null {
    const state = this.sessions.get(sessionId)
    return state?.lastMessage ?? null
  }
}
