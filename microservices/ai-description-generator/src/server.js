import app from "./app.js";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`AI Description Service running on port ${PORT}`);
});
