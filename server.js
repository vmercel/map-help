const express = require("express");
const pug = require("pug");
const path = require("path");
const dotenv = require("dotenv").config({ path: "./config.env" });
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT;
const client = require("twilio")(process.env.ACCOUNTSID, process.env.AUTHTOKEN);

// app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

app.get("/maplocation", async (req, res) => {
  try {
    const phoneMessager = await client.messages
      .create({
        body: `We got your request. EMERGENCY is coming to your location in few mins. Stay calm`,
        from: "+13024054507",
        to: "+905338897286",
      })
      .done();

    const html = pug.renderFile(`${path.join(__dirname, "views/email.pug")}`, {
      googleHelpLink: `https://www.google.com/maps/@${req.query.location
        .split("-")
        .join(",")},15z`,
    });

    const emailMessenger = async function () {
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: '"EMERGENCY!" <helper@example.com>',
        to: "thepraiseworthy1@outlook.com",
        subject: "NEW HELP REQUEST. PLEASE RESPOND ASAP",
        html,
      });
    };

    await emailMessenger();

    setTimeout(() => {
      res.render("confirm");
    }, 2000);

    //
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "An error occurred. Please try again later",
      err,
    });
  }
});

app.get("/", async (req, res) => {
  res.render("homepages");
});

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECIEVED, Shutting down gracefully.");
  server.close(() => {
    console.log("Process terminated!");
  });
});
