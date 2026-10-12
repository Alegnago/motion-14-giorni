// Segnaposto: le demo arrivano come componenti nella fase 4 della migrazione.
// Finché non c'è, il punto del testo dove andrà resta segnato.
export function DemoSlot({ id }: { id: string }) {
  return (
    <section className="demo" data-demo={id}>
      <header className="demo-head">
        <span className="demo-tag">Esempio live</span>
        <span className="demo-title">{id}</span>
      </header>
      <p className="demo-note">Demo in migrazione. Intanto la trovi nella versione Artifact del corso.</p>
    </section>
  );
}
