import Header from "@/components/Header";

export default function OtzyvyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen" style={{ background: "#000000" }}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <h1 style={{ color: "white", fontSize: "32px" }}>Отзывы</h1>
        </div>
      </main>
    </>
  );
}
