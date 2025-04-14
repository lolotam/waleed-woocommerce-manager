
/**
 * Claude (Anthropic) API Integration
 * 
 * This file re-exports all Claude API functionality from the modularized structure.
 * It's maintained for backward compatibility.
 */

export { 
  generateWithClaude,
  testClaudeConnection,
  processBatchWithClaude
} from './claude/index';
