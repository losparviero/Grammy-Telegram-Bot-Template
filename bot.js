require('dotenv').config();
const { Bot, session, GrammyError, HttpError } = require("grammy");
const { run, sequentialize } = require("@grammyjs/runner");

// Create a bot
const bot = new Bot(process.env.BOT_TOKEN);

// Build a unique identifier for the `Context` object
function getSessionKey(ctx) {
  return ctx.chat?.id.toString();
}

// Sequentialize before accessing session data
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Measure response time (optional)

async function responseTime(ctx, next) {
  // take time before
  const before = Date.now(); // milliseconds
  // invoke downstream middleware
  await next(); // make sure to `await`!
  // take time after
  const after = Date.now(); // milliseconds
  // log difference
  console.log(`Response time: ${after - before} ms`);
}

bot.use(responseTime);

// Commands

bot.command("start", (ctx) => {
    ctx.reply("*Welcome!* ✨",{ parse_mode: "Markdown" } );
    console.log("New user added:", ctx.from);
    });
bot.command("help", (ctx) => ctx.reply("This is a template. By using you agree to ToS."));

// Messages

bot
  .on("msg", async (ctx) => {
    // Console
    console.log('from:', ctx.from.first_name, ctx.from.last_name, '(@' + ctx.from.username + ')', 'ID:', ctx.from.id);
    console.log("Message:", ctx.msg.text);
    // Logic
    await ctx.reply("Works!");
    });

// Error Handling

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  console.error("Details:");
  console.error("Query:", ctx.msg.text, "not found!");
  ctx.reply("Query: " + ctx.msg.text + " " + "not found!");
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Run it concurrently

console.log('Bot running. Please keep this window open or use a startup manager like PM2 to setup persistent execution and store logs.');
console.log('CTRL+C to terminate.');

run(bot);