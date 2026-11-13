import plants from "@/app/plants.json";

let lastTelegramMessageSentAt = 0;

const MESSAGE_COOLDOWN_MS = 60_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function getMessage(body: unknown): string | null {
  if (
    !isRecord(body) ||
    !isStringArray(body.plantIds) ||
    body.plantIds.length === 0 ||
    body.plantIds.length > plants.length ||
    new Set(body.plantIds).size !== body.plantIds.length
  ) {
    return null;
  }

  if (body.event === "monstera-added") {
    return body.plantIds.length === 1 && body.plantIds[0] === "1"
      ? "GreenHome: Монстера добавлена в избранное."
      : null;
  }

  if (body.event !== "watering-reminder") return null;

  const selectedPlants = body.plantIds.map((plantId) =>
    plants.find((plant) => plant.id === plantId),
  );
  if (!selectedPlants.every((plant) => plant !== undefined)) return null;

  const plantNames = selectedPlants
    .filter((plant): plant is (typeof plants)[number] => plant !== undefined)
    .map((plant) => plant.name);

  return `GreenHome: пора полить ${plantNames.join(", ")}.`;
}

function isTelegramSuccess(value: unknown): boolean {
  return isRecord(value) && value.ok === true;
}

function getTelegramErrorMessage(value: unknown): string {
  if (!isRecord(value)) return "Telegram вернул неизвестную ошибку.";

  if (value.error_code === 401 || value.error_code === 404) {
    return "Токен бота неверный или отозван.";
  }

  if (
    value.error_code === 400 &&
    typeof value.description === "string" &&
    value.description.toLowerCase().includes("chat not found")
  ) {
    return "Чат не найден. Откройте бота, нажмите «Запустить» и проверьте TELEGRAM_CHAT_ID.";
  }

  if (value.error_code === 400) {
    return "Telegram отклонил запрос. Проверьте TELEGRAM_CHAT_ID и убедитесь, что вы запустили бота.";
  }

  return "Telegram не принял сообщение. Проверьте настройки бота.";
}

export async function POST(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (!origin || origin !== requestOrigin) {
    return Response.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const message = getMessage(body);
  if (!message) {
    return Response.json(
      { error: "Некорректный запрос на отправку уведомления." },
      { status: 400 },
    );
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!botToken || !chatId) {
    return Response.json(
      { error: "Telegram не настроен. Проверьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env.local." },
      { status: 503 },
    );
  }

  const now = Date.now();
  if (now - lastTelegramMessageSentAt < MESSAGE_COOLDOWN_MS) {
    return Response.json(
      { error: "Сообщения можно отправлять не чаще одного раза в минуту." },
      { status: 429 },
    );
  }
  lastTelegramMessageSentAt = now;

  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
      cache: "no-store",
    });
  } catch {
    lastTelegramMessageSentAt = 0;
    console.error("Could not reach the Telegram Bot API.");
    return Response.json({ error: "Telegram временно недоступен." }, { status: 502 });
  }

  let telegramResult: unknown;
  try {
    telegramResult = await response.json();
  } catch (cause) {
    lastTelegramMessageSentAt = 0;
    console.error("Telegram returned an invalid response.", cause);
    return Response.json({ error: "Не удалось проверить ответ Telegram." }, { status: 502 });
  }

  if (!response.ok || !isTelegramSuccess(telegramResult)) {
    lastTelegramMessageSentAt = 0;
    const apiErrorCode = isRecord(telegramResult) ? telegramResult.error_code : "unknown";
    const description = isRecord(telegramResult) ? telegramResult.description : "unknown";
    console.error("Telegram rejected the message.", { status: response.status, apiErrorCode, description });
    return Response.json(
      { error: getTelegramErrorMessage(telegramResult) },
      { status: 502 },
    );
  }

  return Response.json({ message: "Сообщение отправлено в Telegram." }, { status: 202 });
}
