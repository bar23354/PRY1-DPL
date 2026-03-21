export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--color-background)] px-6 text-center text-slate-100">
      <div className="max-w-xl rounded-3xl border border-white/5 bg-[rgba(26,28,30,0.88)] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-primary)]">Error 404</p>
        <h1 className="mt-3 font-headline text-3xl font-bold">Pagina no encontrada</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          La ruta solicitada no forma parte de la interfaz integrada del proyecto.
        </p>
      </div>
    </main>
  );
}
