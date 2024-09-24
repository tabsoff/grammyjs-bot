require("dotenv").config();
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");

const mysql = require("mysql2");

const { hydrate } = require("@grammyjs/hydrate");

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

// Настраиваем коннект к ДБ
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "esod_clients",
});

// Добавляем комманды в менюшку
bot.api.setMyCommands([
  {
    command: "start",
    description: "Запускает бота",
  },
]);

// Слушатели
bot.command("start", async (ctx) => {
  pool.query(`SELECT ${ctx.from.username} FROM notes`, (err, res) => {
    ctx.reply(res);
  });
  await ctx.reply("Ого ого");
  console.log(ctx.from.id);
});

bot.command("check", async (ctx) => {
  pool.query("SELECT * FROM notes", (err, res) => {
    ctx.reply(res);
  });
});

bot.on("message", async (ctx) => {
  await ctx.reply("Мяу", { reply_markup: { remove_keyboard: true } });
});

// Обработчик ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown Error:", e);
  }
});

// Запускаем бота
bot.start();
