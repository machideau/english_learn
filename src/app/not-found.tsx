import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-100 px-4 text-center text-brown-600">
      <h1 className="text-6xl font-bold tracking-tight text-brown-800">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page introuvable</h2>
      <p className="mt-2 text-sm text-brown-500">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
