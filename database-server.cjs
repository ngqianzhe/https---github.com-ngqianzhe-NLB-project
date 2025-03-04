const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
oracledb.fetchAsString = [ oracledb.CLOB ];

const app = express();
app.use(cors()); // Enable CORS for all routes 
let message;
let requirements = `The customer id is 1, ignore this information if it is not relevant to the prompt. 
DO NOT OUTPUT THE CUSTOMER ID given above, only use it as helping information.
Keep your answer under 100 words. 
Try to make any queries case insensitive such as by using LIKE operators and converting them all to upper cases to ensure consistency.
Any output that contains a list of information should use bullet points to organise them.
Any questions regarding "loan" or "borrow" or "lend" are automatically associated with "book loans".
You are a cheerful library book agent for NLB that answers customer queries on details about your libraries, books, borrowing and more. Answer questions in a professional tone.
To find where a book is available at, you have to use BRANCHINVENTORY table.
Remove any "Sorry, unfortunately a valid SELECT statement could not be generated for your
natural language prompt. Here is some more information to help you further" from your output`;

app.get('/ask-my-library', async (req, res) => {
  if (req.query.message) {
    try {
          const connection = await oracledb.getConnection({
              user: "admin",
              password: "Qzlovesskibidi1",
              connectString: "nlbadb23ai_high"
          });
    let result; 
    //message = "tell me about the book inventories" + "/n" + requirements;
    message = req.query.message + "\n" + requirements;
    let plsql1 = "BEGIN\n"
        + "DBMS_CLOUD_AI.SET_PROFILE('OCI_LLAMA_405B');\n"
        + "END;"

    let plsql2 = `select ai narrate ${message}`;

    await connection.execute(plsql1);
    result = await connection.execute(plsql2);
    delete result.metaData;
    res.json({message: result.rows});
    await connection.close();
      } catch (err) {
      console.error(err);
          res.status(500).send(err.message);
      }
  } else {
    res.status(400).json({ error: 'Missing parameter', message: 'Error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/ask-my-library?message=${message}`);
})

  