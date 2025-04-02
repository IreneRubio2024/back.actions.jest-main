import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const PORT = 3001;

const pool = mysql.createPool({
  user: "root",
  password: "root",
  host: "process.env.HOST",
  database: "bank2",
  port: 8889,
});

async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

//Din kod här. skriv dina funktioner

async function getUsers(username, password) {
  const sql = "SELECT * FROM users WHERE username = ? and password = ?";
  const params = [username, password];
  return await query(sql, params);
}

async function getAccount(id) {
  const sql = "SELECT * FROM accounts WHERE id = ?";
  const params = [id];
  return await query(sql, params);
}

async function updateToken(token, id) {
  const sql = "UPDATE `accounts` SET `token` = ? WHERE id = ?";
  const params = [token, id];
  return await query(sql, params);
}

async function updateBalance(newBalance, id) {
  const sql = "UPDATE `accounts` SET `balance` = ? WHERE id = ?";
  const params = [newBalance, id];
  return await query(sql, params);
}

// Din kod här. Skriv dina arrayer

let session = [];

// Din kod här. Skriv dina routes:
app.post("/createAccount", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    const sql = "INSERT INTO users (username, password) VALUES (?,?)";
    const params = [username, password];
    const result = await query(sql, params);

    const user = await getUsers(username, password);
    const userId = user[0].id;

    const sql2 = "INSERT INTO accounts (id, balance, token) VALUES (?, ?, ?)";
    const params2 = [userId, 0, 0];
    const result2 = await query(sql2, params2);

    console.log("users", result, "account", result2);
    res.send("User Created");
  } catch (error) {
    res.status(500).send("Error creating user");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUsers(username, password);
    const token = generateOTP();
    const userId = user[0].id;
    user.push(token);
    console.log("user", user);
    await updateToken(token, userId);

    if (user.length > 0) {
      res.json(user);
    } else {
      res.status(401).send({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).send("Error login");
  }
});

app.post("/verifyLogin", async (req, res) => {
  const data = req.body;
  // user array
  const user = data[0];
  // token number
  const token = data[1];

  console.log("verify login data", user, token);

  //Get logged in useraccount
  const activeUserAccount = await getAccount(user.id);

  //create boolean to toggle results
  let verified = false;

  // Check if token is correct
  if (activeUserAccount[0].token == token) {
    verified = true;
  }

  if (verified) {
    res.json({
      id: activeUserAccount[0].id,
      amount: activeUserAccount[0].balance,
      username: user.username,
    });
  } else {
    res.status(401).send({ message: "Login required" });
  }
});

app.post("/deposit", async (req, res) => {
  const data = req.body;
  // get account before deposit
  const accountBefore = await getAccount(data.id);

  // get balance from account before deposit
  let balanceBefore = accountBefore[0].balance;

  if (balanceBefore == null) {
    balanceBefore = 0;
  }

  // calculate new balance
  const newBalance = parseInt(balanceBefore) + parseInt(data.amount);

  const updateThisAccount = data.id;
  await updateBalance(newBalance, updateThisAccount);

  const updatedAccount = await getAccount(updateThisAccount);
  res.json({
    updatedAccount,
  });
});

app.post("/logOut", async (req, res) => {
  const data = req.body;
  console.log(data);
  await updateToken(null, data[0].id);

  res.send({ message: "Logout successful" });
});
// Starta servern
app.listen(PORT, () => {
  console.log(`Bankens backend körs på http://localhost:${PORT}`);
});
