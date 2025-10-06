import { getProviders, signIn } from "next-auth/react";

export default function SignIn({ providers }) {
  return (
    <div style={{ padding: "4rem", fontFamily: "sans-serif" }}>
      <h1>Anmelden</h1>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>
            Mit {provider.name} anmelden
          </button>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
