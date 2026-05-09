import { Router } from "express";
import * as empresaController from "../controllers/empresa.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createEmpresaSchema, updateEmpresaSchema } from "../schemas/empresa.schema.js";

const router = Router();

router.get("/",       authMiddleware,                  empresaController.getAll);
router.post("/",      authMiddleware, roleMiddleware(1), validate(createEmpresaSchema), empresaController.create);
router.put("/:id",    authMiddleware, roleMiddleware(1), validate(updateEmpresaSchema), empresaController.update);
router.delete("/:id", authMiddleware, roleMiddleware(1), empresaController.remove);

export default router;
