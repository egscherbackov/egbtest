import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";
import Logo from "@/components/Logo";
import Link from "next/link";
import { ShoppingBag, CreditCard, Package, CheckCircle2, RefreshCw, MessageCircle, type LucideIcon } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  const user = session.userId
    ? { id: session.userId, name: session.userName || "" }
    : null;
  const isAdmin = session.isAdmin === true;

  const settings = await prisma.siteSettings.findUnique({ where: { id: "1" } });
  const totalOrders = settings?.totalOrders ?? 1394;

  return (
    <>
      <Header user={user} isAdmin={isAdmin} />

      <main style={{ background: "#060b14" }}>
        {/* Hero with Prism WebGL */}
        <HomeHero user={user} totalOrders={totalOrders} />

        {/* Services Section */}
        <section id="services" className="py-24 px-4 sm:px-6" style={{ background: "#060b14" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="font-display mb-4"
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 500,
                  letterSpacing: "-0.8px",
                  color: "white",
                }}
              >
                Наши услуги
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>
                Всё что нужно для удобной покупки за рубежом
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="p-6 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <s.Icon size={20} style={{ color: "var(--color-cofounder-blue)" }} />
                  </div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "white", fontSize: "16px" }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="py-24 px-4 sm:px-6"
          style={{ background: "#080e18" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="font-display mb-4"
                style={{
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 500,
                  letterSpacing: "-0.8px",
                  color: "white",
                }}
              >
                Как это работает
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-start">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mb-4"
                    style={{ background: "var(--color-cofounder-blue)" }}
                  >
                    {i + 1}
                  </div>
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "white", fontSize: "15px" }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6" style={{ background: "#060b14" }}>
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="rounded-3xl p-12"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <h2
                className="font-display text-white mb-4"
                style={{
                  fontSize: "clamp(24px, 4vw, 40px)",
                  fontWeight: 400,
                  letterSpacing: "-0.8px",
                }}
              >
                Готовы начать?
              </h2>
              <p className="text-white/60 mb-8" style={{ fontSize: "16px" }}>
                Свяжитесь с нами в Telegram или войдите в личный кабинет
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://t.me/egor6p"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 text-base font-medium transition-all hover:opacity-90"
                  style={{
                    background: "var(--color-cofounder-blue)",
                    color: "white",
                    borderRadius: "4px",
                  }}
                >
                  Написать в Telegram
                </a>
                {!user && (
                  <Link
                    href="/login"
                    className="px-6 py-3 text-base font-medium transition-all hover:bg-white/10"
                    style={{
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.8)",
                      borderRadius: "4px",
                    }}
                  >
                    Войти
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="py-8 px-4 sm:px-6"
          style={{
            background: "#060b14",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" inverted />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
              © 2024 EGORBUYER.COM. Все права защищены.
            </p>
            <a
              href="https://t.me/egor6p"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-action-azure)" }}
            >
              @egor6p
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}

const services: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: ShoppingBag, title: "Покупка товаров", desc: "Покупаем любые товары с Amazon, eBay, Taobao, Farfetch и других платформ." },
  { Icon: CreditCard, title: "Оплата картой", desc: "Принимаем оплату картой, криптовалютой и переводом." },
  { Icon: Package, title: "Доставка", desc: "Организуем доставку до вашего адреса в удобное время." },
  { Icon: CheckCircle2, title: "Проверка товара", desc: "Проверяем товар перед отправкой — фото и видео отчёт." },
  { Icon: RefreshCw, title: "Возврат", desc: "Помогаем с возвратом товара продавцу при необходимости." },
  { Icon: MessageCircle, title: "Поддержка", desc: "Отвечаем в Telegram 7 дней в неделю." },
];

const steps = [
  {
    title: "Найдите товар",
    desc: "Скопируйте ссылку на нужный товар с любого магазина.",
  },
  {
    title: "Напишите нам",
    desc: "Отправьте ссылку и желаемые параметры в Telegram.",
  },
  {
    title: "Оплатите",
    desc: "Мы рассчитаем стоимость и вы оплачиваете удобным способом.",
  },
  {
    title: "Получите",
    desc: "Товар будет куплен и доставлен в указанный срок.",
  },
];
