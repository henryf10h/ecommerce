import { describe, expect, it } from 'vitest';
import { isScraperUserAgent } from './bot-detection';

describe('isScraperUserAgent', () => {
  it('detects GPTBot', () => {
    expect(isScraperUserAgent('Mozilla/5.0 GPTBot 1.0')).toBe(true);
  });

  it('detects ClaudeBot', () => {
    expect(isScraperUserAgent('ClaudeBot 1.0')).toBe(true);
  });

  it('detects ChatGPT-User', () => {
    expect(isScraperUserAgent('ChatGPT-User 1.0')).toBe(true);
  });

  it('detects PerplexityBot', () => {
    expect(isScraperUserAgent('PerplexityBot 1.0')).toBe(true);
  });

  it('detects generic Bot user-agent', () => {
    expect(isScraperUserAgent('SomeRandomBot/2.0')).toBe(true);
  });

  it('does not flag Chrome browser', () => {
    expect(
      isScraperUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      ),
    ).toBe(false);
  });

  it('does not flag Firefox browser', () => {
    expect(
      isScraperUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      ),
    ).toBe(false);
  });
});
