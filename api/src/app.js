import express from "express";
import morgan from "morgan";
import cors from "cors";

// import router from "./routes/index.js";
// import projectsRoutes from "./routes/projects.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// app.use("/api", router);
app.use("/", (req, res) => res.send("bienvenido al api portfolio"));

export default app;
