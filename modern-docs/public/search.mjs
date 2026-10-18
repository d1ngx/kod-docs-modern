// Shared lexical retrieval. Intl.Segmenter handles Chinese without a remote service.
export function terms(query) {
  const normalized = query.toLocaleLowerCase().trim();
  const segments = [...new Intl.Segmenter('zh', { granularity: 'word' }).segment(normalized.replace(/可道云/g, ' '))]
    .filter(s => s.isWordLike).map(s => s.segment);
  const stop = new Set(['如何','怎么','怎样','什么','使用','进行','可以','需要','请问','的','了','吗','呢','是','我','你','可道','可道云','云']);
  return [...new Set([normalized, ...segments.filter(term=>!stop.has(term))].filter(Boolean))];
}
export function search(documents, query, limit = 20) {
  const tokens = terms(query);
  if (!tokens.length) return [];
  return documents.map(doc => {
    const title = doc.title.toLocaleLowerCase();
    const body = (doc.text || '').toLocaleLowerCase();
    let score = 0;
    for (const term of tokens) {
      if (doc.url.split('/').filter(Boolean).at(-1)?.toLocaleLowerCase() === term) score += 16;
      if (title.includes(term)) score += term === tokens[0] ? 30 : 12;
      if ((doc.description || '').toLocaleLowerCase().includes(term)) score += 6;
      let position = -1, count = 0;
      while ((position = body.indexOf(term, position + 1)) !== -1 && count < 8) count++;
      score += count * (term === tokens[0] ? 4 : 1);
    }
    const first = tokens.map(t => body.indexOf(t)).filter(p => p >= 0).sort((a,b) => a-b)[0] || 0;
    return { ...doc, score, excerpt: (doc.text || '').slice(Math.max(0, first - 65), first + 170) };
  }).filter(doc => doc.score > 0).sort((a,b) => b.score - a.score || a.url.localeCompare(b.url)).slice(0, limit);
}
