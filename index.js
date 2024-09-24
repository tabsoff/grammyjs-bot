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
  database: "notes_app",
});

// Добавляем комманды в менюшку
bot.api.setMyCommands([
  {
    command: "start",
    description: "Запускает бота",
  },
  {
    command: "menu",
    description: "Выводит меню",
  },
  {
    command: "send",
    description: "aaa",
  },
  {
    command: "check",
    description: "dbchech",
  },
]);

// Слушатели
bot.command("start", async (ctx) => {
  await ctx.reply("Ого ого");
  console.log(ctx.msg);
});

// bot.command("check", async (ctx) => {
//   pool.query("SELECT * FROM notes", (err, res) => {
//     replyMsg = res.toString;
//     return res;
//   });
//   await ctx.reply(replyMsg);
// });

bot.command("check", async (ctx) => {
  pool.query("SELECT * FROM notes", (err, res) => {
    ctx.reply(res);
  });
});

bot.command("send", async (ctx) => {
  await bot.api.sendMessage(5042238964, "Hi!");
});

const menuKeyboard = new InlineKeyboard()
  .text("1", "button-1")
  .text("2", "button-2");
const backKeyboard = new InlineKeyboard().text("Back", "back");

bot.command("menu", async (ctx) => {
  await ctx.reply("Выберите пункт меню", { reply_markup: menuKeyboard });
});

bot.callbackQuery("button-1", async (ctx) => {
  await ctx.callbackQuery.message.editText("Заебумба 1", {
    reply_markup: backKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("back", async (ctx) => {
  await ctx.callbackQuery.message.editText("Выберите пункт меню", {
    reply_markup: menuKeyboard,
  });
  await ctx.answerCallbackQuery();
});

//

bot.command("mood", async (ctx) => {
  // const moodKeyboard = new Keyboard()
  //   .text("Хорошо")
  //   .row()
  //   .text("Норм")
  //   .row()
  //   .text("Плохо")
  //   .resized();

  const moodLabels = ["1", "2", "3", "4"];
  const rows = moodLabels.map((label) => {
    return [Keyboard.text(label)];
  });
  const moodKeyboard2 = Keyboard.from(rows).resized();
  await ctx.reply("Как настроение?", { reply_markup: moodKeyboard2 });
});

bot.command("inline_keyboard", async (ctx) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("1", "button-1")
    .text("2", "button-2")
    .text("3", "button-3");

  await ctx.reply("Выберете цифру", { reply_markup: inlineKeyboard });
});

// bot.on("callback_query:data", async (ctx) => {
//   await ctx.answerCallbackQuery();
//   await ctx.reply(`Вы нажали кнопку ${ctx.callbackQuery.data}`);
// });

// bot.callbackQuery("button-1", async (ctx) => {
//   await ctx.answerCallbackQuery("1234");
//   await ctx.reply("Йоу");
// });

bot.command("share", async (ctx) => {
  const shareKeyboard = new Keyboard()
    .requestLocation("геолокация")
    .requestContact("Контакт")
    .requestPoll("Опрос")
    .resized();
  await ctx.reply("Чем хочешь поделиться", { reply_markup: shareKeyboard });
});

bot.command("say", async (ctx) => {
  await ctx.reply("Hello");
});

bot.on("message", async (ctx) => {
  await ctx.reply("Мян", { reply_markup: { remove_keyboard: true } });
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
