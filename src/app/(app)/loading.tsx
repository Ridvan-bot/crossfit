export default function AppLoading() {
  return (
    <main
      className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10"
      aria-busy="true"
      aria-label="Laddar sida"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="ui-card h-44 animate-pulse p-5" />
        <div className="ui-card h-44 animate-pulse p-5" />
      </div>
    </main>
  );
}
