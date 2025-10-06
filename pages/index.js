import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  // Wenn Session-Daten noch geladen werden:
  if (status === "loading") {
    return <p>Lädt...</p>;
  }

  // Wenn kein User eingeloggt ist:
  if (!session) {
    return (
      <div style={{ padding: "4rem", fontFamily: "sans-serif" }}>
        <h1>Willkommen 👋</h1>
        <p>Bitte melde dich an, um fortzufahren.</p>
        <button onClick={() => signIn()}>Anmelden</button>
      </div>
    );
  }

  // Wenn der User eingeloggt ist:
  return (
    <div style={{ padding: "4rem", fontFamily: "sans-serif" }}>
      <h1>Hallo {session.user?.email}</h1>
      <p>Du bist eingeloggt ✅</p>
      <button onClick={() => signOut()}>Abmelden</button>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} }
}

