/**
 * Chat interaction logging
 * Currently disabled - can be re-enabled with a database if needed
 */
export async function logChatInteraction(
  userFingerprint: string,
  userInput: string,
  systemOutput: string
) {
  // Chat logging disabled - database removed
  // Can be re-enabled with a database solution if needed
  console.log('Chat interaction logged (logging disabled):', {
    fingerprint: userFingerprint.substring(0, 20) + '...',
    inputLength: userInput.length,
    outputLength: systemOutput.length
  });
}


