import { getSession } from "@/lib/session";
import Header from "@/components/Header";

export default async function OtzyvyPage() {
  const session = await getSession();
  const user = session.userId
    ? { id: session.userId, name: session.userName || "" }
    : null;
  const isAdmin = session.isAdmin === true;

  return (
    <>
      <Header user={user} isAdmin={isAdmin} />
      <main className="min-h-screen pt-16" style={{ background: "#000000" }}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <h1 style={{ color: "white", fontSize: "32px" }}>Отзывы</h1>
        </div>
      </main>
    </>
  );
}
