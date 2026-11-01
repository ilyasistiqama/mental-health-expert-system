// Pintu masuk gabungan untuk fungsi publik mesin pakar.
// Untuk mempelajari alur, mulai dari consultationSession.js dan docs/code-guide.md.
export { NO_TENDENCY_CODE, DURATION_OPTIONS, CONDITIONS, SYMPTOMS, SYMPTOM_LIST, REFERENCES, REFERENCE_LIST, RULES, loadKnowledgeBase, isValidCondition, listConditions } from "./knowledgeBase.js";
export { deriveFacts, getCrisisAnswers } from "./rules.js";
export { runForwardInference } from "./forwardChaining.js";
export { createSession, getNextStep, answerQuestion, undoAnswer, getDurationQuestion, listAnswers } from "./consultationSession.js";
export { loadProgress, reloadSession, getSavedSession, areSessionsEqual, saveSession, deleteSession, onSessionChange } from "./consultationProgress.js";
export { latestResult, createResult } from "./consultationResult.js";
export { formatDate, formatDuration, METHOD_INFO, getMethodName, getMethodRoute, getResultTitle } from "./consultationDisplay.js";
