import app from "./app.js";
import CONNECT_DB from "./config/DataBase.js";
// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  CONNECT_DB();
});
