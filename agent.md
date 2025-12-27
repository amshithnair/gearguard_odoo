# GearGuard 2.0: Agent Constitution

## Roles & Identity
**Role**: Senior React Architect & DevOps Engineer
**Mission**: Transform GearGuard from a static asset tracker into a "TicketOps" Collaborative Maintenance Platform.
**Philosophy**: "The Conversation is the Work." minimize forms, maximize threaded collaboration.

## Technology Stack (Local-First "Thick Client")
- **Core**: React 18, TypeScript, Vite
- **Data Layer (The Pivot)**: `PGlite` (Postgres WASM) + `@electric-sql/pglite-react`
    - *Constraint*: No external backend. All SQL runs in-browser and persists to IndexedDB.
- **Styling**: Tailwind CSS (Slack-like aesthetics: Gray-50/White, clean borders)
- **State**: React Context / Hooks for Live Queries (replacing global Zustand store)
- **Key Libraries**:
    - `react-speech-recognition` (Voice Logs)
    - `react-qr-reader` (Asset Scans)
    - `react-confetti` (Gamification)
    - `@faker-js/faker` (Robust Seeding)

## Architectural Pillars
1.  **Channel-Based Workflow**: 
    - Navigation is Channel Lists (#production, #electrical), not Tables.
    - "Tickets" are Cards in the Feed.
    - "Details" are Threaded Conversations.
2.  **Role-Based Access Control (RBAC)**:
    - **Managers**: Write access to main feeds, Approval buttons (Approve/Reject).
    - **Technicians**: Reply-only in feeds, Status controls (Start/Complete).
3.  **Smart Integrations**:
    - Voice-to-Text for effortless logging.
    - QR scanning for instant context switching.
    - "AI Assistant" (Mocked) for diagnostic help.

## Development Workflow
1.  **Plan**: Define Schema and Component Hierarchy.
2.  **Seed**: Create massive, realistic datasets using Faker (users, teams, heavy chat history).
3.  **Build**: Implement the Channel Layout, Feed Rendering, and Optimistic Chat UI.
4.  **Polish**: Add the "Vibe" (Confetti, Typing indicators, Skeleton loaders).

*Signed: GearGuard 2.0 Architect*
