// Catch emphasis that the parser leaves as plain text, before publishing a build.
// Code and explicitly escaped symbols are intentional literals and remain valid.
export function validateMarkdown(marked, markdown, pageLabel) {
  const tokens = marked.lexer(markdown, { gfm: true });
  marked.walkTokens(tokens, token => {
    if (token.type === 'text' && !token.tokens && /(?<!\\)\*\*\S[^\n]*?\*\*/u.test(token.raw || '')) {
      throw new Error(`Unrendered bold in ${pageLabel}: ${token.raw.slice(0, 160)}`);
    }
  });
}
