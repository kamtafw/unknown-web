# AppsCombo Web: Events Experience

## 1. What has been accomplished

The Events experience has gone through four major implementation passes, covering the core event experience and live-session functionality.

### A. Event management and general experience

The foundational Events experience has been implemented, including:

- Events listing and discovery.
- Event creation and management.
- Event details and associated information.
- Event-related guest functionality.
- Event resources and links.
- Event comments and interactions.
- Supporting API integration and data management.

The implementation follows the existing AppsCombo web architecture and available Figma designs.

### B. Event participation

The event participation functionality has been implemented, including joining and leaving events.

The leave-event functionality was specifically revisited and tested.

**Verified behaviour:**

- A participant can leave an event they have joined.
- The interface handles unsuccessful leave requests during network interruptions.
- A user who never joined an event does not get a leave button.

**Remaining concern:**

- The host does not currently get a Leave Event option.
- Whether the host should be able to leave independently, or whether ending the event/session is the intended behaviour, remains a product clarification.

### C. Live sessions and audio

This was one of the most substantial parts of the implementation.

The web application now supports:

- Live-session creation and lifecycle management.
- Starting and ending live sessions.
- Host microphone publishing through LiveKit.
- Participants listening to live audio.
- Microphone mute and unmute.
- Disconnecting and reconnecting.
- Session-ending updates that remove participants and disable unavailable controls.

The web host was successfully tested against another client/mobile listener. Audio delivery worked as expected.

The temporary LiveKit testing interface was retired after the actual Events experience became capable of hosting and receiving audio.

### D. Real-time Events infrastructure

Events has its own independent Socket.IO connection, separate from other features.

This includes:

- Independent connection management.
- Authentication.
- Reconnection handling.
- Account-scoped connection lifecycle.
- Cleanup and lifecycle protections.
- Real-time session updates.

The infrastructure was also extended to support live comments and reactions.

### E. Live comments and reactions

This functionality received successful manual testing.

**Comments:**

- Comments are delivered to other participants in real time.
- A newly submitted comment returns the expected backend response.
- The comment appears only once, avoiding duplicate rendering.

**Reactions:**

- Reactions are delivered in real time.
- Reaction counts remain consistent across participants.
- The initial reaction-count problem discovered after a hard reload has been addressed by implementing an additional room-summary read.
- The new implementation retrieves authoritative reaction counts from the existing backend endpoint.

---

## 2. What is not fully completed

There are a few things worth distinguishing from functionality that is already working.

### A. Participant State

This area was deliberately put aside pending clarification from the PM.

The remaining concern is understanding exactly what the expected participant experience should be.

Although the underlying participant data work was implemented and validated, the overall participant-state experience can not be represented as fully accepted.

**Status: Parked pending clarification.**

### B. Host leaving an event

The host currently does not get the Leave Event option.

We need a product decision on whether a host should be able to leave an event without ending it, or whether the host's responsibility is to end the event/session.

**Status: Requires clarification.**

### C. Waiting-session and microphone UX

Two UX improvements were deliberately parked:

- Better distinction between muting a microphone and disconnecting from the audio session.
- Further refinement of the waiting-session creation experience.

These are improvements rather than confirmed blockers to the existing live-audio functionality.

---

## 3. Overall implementation status

| Area                                  | Status                                 |
| ------------------------------------- | -------------------------------------- |
| Foundational Events experience        | Implemented                            |
| Event management                      | Implemented                            |
| Event details                         | Implemented                            |
| Guest functionality                   | Implemented                            |
| Event resources                       | Implemented                            |
| Event comments                        | Implemented                            |
| Event participation / joining         | Implemented                            |
| Leave event                           | Implemented, host behaviour unresolved |
| Live-session lifecycle                | Implemented and tested                 |
| Live audio publishing                 | Working and manually verified          |
| Live audio listening                  | Working and manually verified          |
| Independent Events socket             | Implemented                            |
| Real-time comments                    | Working and verified                   |
| Real-time reactions                   | Working and verified                   |
| Initial reaction counts               | Implemented; browser re-test pending   |
| Participant State                     | Parked pending clarification           |
| Personal-room notification dependency | Unresolved                             |
| Microphone UX polish                  | Parked                                 |
| Waiting-session UX polish             | Parked                                 |

---

## 5. Final assessment

The Events experience has progressed considerably beyond a basic event listing and details interface.

It now includes event management, participation, guest-related functionality, resources, comments, live audio sessions and real-time interactions.

The most technically demanding work was getting the live-session experience working properly on the web, particularly LiveKit publishing, independent socket infrastructure, and real-time comments and reactions.

There are still outstanding items, especially around participant-state expectations and some backend dependencies. These have been identified rather than silently treated as completed.
