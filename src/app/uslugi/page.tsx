import { getSession } from "@/lib/session";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function UslugiPage() {
  const session = await getSession();
  const user = session.userId
    ? { id: session.userId, name: session.userName || "" }
    : null;
  const isAdmin = session.isAdmin === true;

  return (
    <>
      <Header user={user} isAdmin={isAdmin} />
      <main className="min-h-screen pt-16" style={{ background: "#000000" }}>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 style={{ color: "white", fontSize: "32px", marginBottom: "20px" }}>Услуги</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px" }}>В разработке...</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
