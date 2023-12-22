import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    database: "Dan",
    password: "Prometheus86!",
    port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function getNotes() {
  const result = await db.query("SELECT * FROM items;");
  const items = result.rows.map((item) => item);
  return items;
}

app.get("/", async (req, res) => {
    const notes = await getNotes();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: notes
    });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;

  try{
    const result = db.query("INSERT INTO items (title) VALUES ($1);", [item]);
  res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

app.post("/edit", (req, res) => {

    const noteId = req.body.updatedItemId;
    const noteText = req.body.updatedItemTitle;

    try {
      const result = db.query("UPDATE items SET title = ($1) WHERE id = ($2);", [noteText, noteId]);
      res.redirect("/");
    } catch (err) {
      console.error("Error updating item:", err);
      res.status(500).send("Internal Server Error");
    }
  });

app.post("/delete", (req, res) => {

  const note = req.body.deleteItemId;

  try{
    const result = db.query("DELETE FROM items WHERE id = ($1);", [note]);
    res.redirect("/")
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
