const { Pool, Client } = require("pg");
const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser"),
  cons = require("consolidate"),
  dust = require("dustjs-helpers");
const nodemailer = require("nodemailer");
require("dotenv").config();
app = express();

const username = process.env.USER_NAME;
const password = process.env.PASSWORD;
const host = process.env.HOST;

// Assign Dust Engine To .dust files

app.engine("dust", cons.dust);

// Set default Ext .dust
app.set("view engine", "dust");
app.set("views", __dirname + "/views");

// Set public folder
app.use(express.static(path.join(__dirname, "public")));

// body parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// pool takes the object above -config- as parameter
// const connectionString = 'postgresql://David:66139868AH@localhost:5432/receipebookdb'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get("/here", (req, res, next) => {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }

    console.log("database connected");
    client.query("SELECT * FROM menus", function(err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      // res.status(200).send(result.rows);
      //console.log('RESULT HERE OOOOOO', result)

      res.render("index", { menus: result.rows });

      done();
    });
  });

  // pools will use environment variables
  // for connection information
  /*pool.query('SELECT * from menu', (err, res) => {
    console.log(res.rows)
    pool.end()
  })*/
});

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/add", function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }
    // console.log('databaseconnected')
    client.query(
      "INSERT INTO menus(name, ingredients, instructions) VALUES($1, $2, $3)",
      [req.body.name, req.body.ingredients, req.body.instructions]
    );
    done();
    res.redirect("/here");
  });
});

app.delete("/delete/:id", function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }
    // console.log('databaseconnected')
    client.query("DELETE FROM menus WHERE id = $1", [req.params.id]);
    done();
    res.send(200);
  });
});

app.post("/edit", function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("Can not connect to the DB" + err);
    }
    // console.log('databaseconnected')
    client.query(
      "UPDATE menus SET name=$1, ingredients=$2, instructions=$3 WHERE id = $4",
      [req.body.name, req.body.ingredients, req.body.instructions, req.body.id]
    );
    done();
    res.redirect("/here");
  });
});

app.post("/send", (req, res) => {
  const output = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone Number: ${req.body.text}</li>
      
      


      </ul>
      <h3>Message</h3>
      
      <p>${req.body.message}</p>

    `;

  // Generate SMTP service account from ethereal.email
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error("Failed to create a testing account");
      console.error(err);
      return process.exit(1);
    }

    console.log("Credentials obtained, sending message...");

    // NB! Store the account object values somewhere if you want
    // to re-use the same account for future mail deliveries

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport(
      {
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASSWORD
        },
        logger: true,
        debug: false // include SMTP traffic in the logs
      },
      {
        // default message fields

        // sender info
        from: "Nodemailer Contact <isaiah.lehner70@ethereal.email>"
      }
    );

    // Message object
    let message = {
      // Comma separated list of recipients
      to: "Nodemailer <davidezeugwa@gmail.com>,<ezeugwagerrard@gmail.com>",

      // Subject of the message
      subject: "Nodemailer Contact request",

      // plaintext body
      text: "Hello",

      // HTML body
      html: output
    };

    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log("Error occurred");
        console.log(error.message);
        return process.exit(1);
      }

     

      // only needed when using pooled connections
      transporter.close();
    });
    
    res.render("contact", { msg: "Email has been sent.." });
   
  });
});

const port = process.env.PORT || 3000;

// Server
app.listen(port, function() {
  console.log("server started on port 3000");
});
