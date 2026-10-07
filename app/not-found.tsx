import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#1e293b' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem' }}>Page Not Found</p>
      <Link href="/dashboard" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0284c7', color: '#ffffff', borderRadius: '0.5rem', textDecoration: 'none' }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
