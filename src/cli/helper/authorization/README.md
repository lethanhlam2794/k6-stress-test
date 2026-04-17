# Authorization (bạn tự code)

Hướng dẫn gợi ý — không có implementation ở đây.

- Đồng bộ với `AuthorizationConfig` / `K6Config.authorization` trong `../interface.ts`.
- Khi mở rộng: map `type` (bearer, basic, header, …) → header thực tế + `tokenEnv` đọc từ `__ENV` trong script k6 (`../../../generator/index.ts`).
- Nhớ: giá trị nhạy cảm chỉ qua biến môi trường, không hardcode trong YAML nếu có thể.
