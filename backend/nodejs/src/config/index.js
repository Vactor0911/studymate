import "dotenv/config";

export const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? "development",

  // JWT 설정
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES,
  },

  // 쿠키 설정
  cookie: {
    name: "refresh_token",
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7일
    path: "/api/auth",
  },

  // MariaDB 설정
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};
