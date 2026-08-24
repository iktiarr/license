export function normalizeDomain(rawDomain: string | null | undefined): string {
  if (!rawDomain) return 'localhost';
  let d = rawDomain.trim().toLowerCase();
  // Remove protocol
  d = d.replace(/^https?:\/\//, '');
  // Remove path
  d = d.split('/')[0];
  // Remove port
  d = d.split(':')[0];
  // Remove www.
  d = d.replace(/^www\./, '');
  return d || 'localhost';
}

export function isDomainMatch(projectDomain: string, requestDomain: string): boolean {
  const normProject = normalizeDomain(projectDomain);
  const normReq = normalizeDomain(requestDomain);

  if (normProject === normReq) return true;

  // Localhost aliases (for local testing with file://, 127.0.0.1, localhost)
  const localAliases = ['localhost', '127.0.0.1', '0.0.0.0', 'localhost-test', ''];
  if (localAliases.includes(normProject) && localAliases.includes(normReq)) {
    return true;
  }

  // Exact root domain or subdomain match
  if (normReq.endsWith('.' + normProject) || normProject.endsWith('.' + normReq)) {
    return true;
  }

  return false;
}
