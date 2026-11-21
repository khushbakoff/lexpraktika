import "server-only";

export const NO_AI_HEADER = "x-lexpraktika-no-ai";
export const NO_AI_ERROR = "AI o'chirilgan (Maxfiy rejim)";

/** Foydalanuvchi "Maxfiy rejim"ni yoqqan: hech narsa tashqi AI xizmatiga yuborilmaydi. */
export const aiDisabledByUser = (req: Request) => req.headers.get(NO_AI_HEADER) === "1";
