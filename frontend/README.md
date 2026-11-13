This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Локальная демо-авторизация

Регистрация хранит аккаунты, избранные растения и даты полива в `localStorage` текущего браузера, а пароли — только в виде PBKDF2-хеша. Эти данные не синхронизируются между устройствами и не обеспечивают защиту серверных ресурсов; такой режим подходит только для демонстрации.

Расписание полива использует локальное избранное браузера и работает, пока сайт открыт. Уведомления отправляются в Telegram, а браузерное уведомление используется как запасной вариант. После закрытия сайта расписание не выполняется; для этого понадобятся серверное хранение данных и фоновая задача.

## Уведомления в Telegram

1. В Telegram откройте [@BotFather](https://t.me/BotFather), отправьте `/newbot` и следуйте инструкциям. Сохраните выданный токен.
2. Откройте созданного бота и нажмите «Запустить». Узнайте свой числовой Telegram ID, например через [@userinfobot](https://t.me/userinfobot).
3. В папке `frontend` скопируйте `.env.example` в новый файл `.env.local` и заполните `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`.
4. Перезапустите приложение. При добавлении Монстеры бот отправит сообщение сразу; напоминания о поливе отправляются, пока сайт открыт.

Токен хранится только в серверных переменных — не отправляйте его в чат и не добавляйте в исходный код. Маршрут отправляет только заранее заданные сообщения и ограничивает отправку одним сообщением в минуту в рамках одного процесса. Это ограничение рассчитано на демо, а не на многоэкземплярный production-сервер. Локальная демо-авторизация не защищает API-маршрут.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
