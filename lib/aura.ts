export function triggerAura(delta: number, reason: string, emoji = '⚡') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aura-change', {
        detail: { delta, reason, emoji },
      })
    );
  }
}
