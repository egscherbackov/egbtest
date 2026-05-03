import { getSession } from "@/lib/session";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 style={{ color: "white", fontSize: "32px", marginBottom: "20px" }}>Отзывы</h1>
          <img
            src="/uploads/dancing-rat-fixed.gif"
            alt="В разработке"
            className="w-48 h-48 md:w-64 md:h-64 mb-6 rounded-lg"
            loading="lazy"
          />
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px" }}>В разработке...</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
