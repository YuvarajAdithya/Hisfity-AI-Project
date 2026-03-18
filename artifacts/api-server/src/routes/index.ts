import { Router, type IRouter } from "express";
import healthRouter from "./health";
import lessonsRouter from "./lessons/index";
import historyRouter from "./history/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(lessonsRouter);
router.use(historyRouter);

export default router;
