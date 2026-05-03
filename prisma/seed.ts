import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });

  const topupCategory = await prisma.instructionCategory.upsert({
    where: { slug: "topup" },
    update: {},
    create: {
      title: "Пополнение",
      slug: "topup",
      description: "Как пополнить баланс на EGORBUYER.COM",
      sortOrder: 1,
    },
  });

  const steps = [
    {
      title: "Открой страницу пополнения",
      description:
        'Перейди в личный кабинет и нажми кнопку "Пополнить баланс" в разделе финансов.',
      stepOrder: 1,
    },
    {
      title: "Выбери способ оплаты",
      description:
        "Выбери удобный способ: криптовалюта, карта или другой доступный метод.",
      stepOrder: 2,
    },
    {
      title: "Введи сумму",
      description:
        "Укажи сумму пополнения. Минимальная сумма и комиссия отображаются на экране.",
      stepOrder: 3,
    },
    {
      title: "Подтверди платёж",
      description:
        "Следуй инструкциям на экране для завершения платежа. После успешной оплаты баланс обновится автоматически.",
      stepOrder: 4,
    },
    {
      title: "Проверь баланс",
      description:
        "Вернись в личный кабинет и убедись, что баланс обновился. При проблемах — свяжись с администратором.",
      stepOrder: 5,
    },
  ];

  for (const step of steps) {
    const existing = await prisma.instructionStep.findFirst({
      where: { categoryId: topupCategory.id, stepOrder: step.stepOrder },
    });
    if (!existing) {
      await prisma.instructionStep.create({
        data: { ...step, categoryId: topupCategory.id },
      });
    }
  }

  const orderCategory = await prisma.instructionCategory.upsert({
    where: { slug: "order" },
    update: {},
    create: {
      title: "Создание заказа",
      slug: "order",
      description: "Как разместить заказ на покупку товаров",
      sortOrder: 2,
    },
  });

  const orderSteps = [
    {
      title: "Найди товар",
      description:
        "Скопируй ссылку на товар с нужного маркетплейса (Amazon, eBay, Taobao и др.).",
      stepOrder: 1,
    },
    {
      title: "Создай заказ",
      description:
        'Перейди в раздел "Новый заказ" и вставь ссылку на товар. Заполни все необходимые поля.',
      stepOrder: 2,
    },
    {
      title: "Подтверди детали",
      description:
        "Проверь размер, цвет, количество и другие параметры. Убедись, что всё верно.",
      stepOrder: 3,
    },
    {
      title: "Оплати заказ",
      description:
        "Оплати заказ с баланса или другим доступным способом. Стоимость включает комиссию сервиса.",
      stepOrder: 4,
    },
    {
      title: "Отслеживай статус",
      description:
        'Следи за обновлениями в разделе "Мои заказы". Уведомления приходят в Telegram.',
      stepOrder: 5,
    },
  ];

  for (const step of orderSteps) {
    const existing = await prisma.instructionStep.findFirst({
      where: { categoryId: orderCategory.id, stepOrder: step.stepOrder },
    });
    if (!existing) {
      await prisma.instructionStep.create({
        data: { ...step, categoryId: orderCategory.id },
      });
    }
  }

  const testLoginCode = nanoid();
  const testUser = await prisma.user.upsert({
    where: { loginCode: "TESTUSER1" },
    update: {},
    create: {
      name: "Тестовый пользователь",
      phoneOrTelegram: "@testuser",
      loginCode: "TESTUSER1",
    },
  });

  console.log("✅ Seed complete");
  console.log("Admin credentials: admin / " + adminPassword);
  console.log("Test user login code: TESTUSER1");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
