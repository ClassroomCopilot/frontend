export function formatEmailForDatabase(email: string): string {
    // Convert to lowercase and replace special characters
    const sanitized = email.toLowerCase()
      .replace('@', 'at')
      .replace(/\./g, 'dot')
      .replace(/_/g, 'underscore')
      .replace(/-/g, 'dash');
      
    // Add prefix and ensure no consecutive dashes
    return `${sanitized}`;
  }