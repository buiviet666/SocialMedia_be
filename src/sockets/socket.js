const { Server } = require("socket.io");
const User = require("../models/User.model");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // sửa lại khi deploy
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // Nhận userId từ client FE và cho vào room theo userId
    socket.on("join", async (userId) => {
      try {
        console.log(`✅ User ${userId} joined socket room`);

        // Cập nhật trạng thái online + lưu socketId
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true,
        });

        socket.join(userId.toString()); // Vào room riêng theo userId

        // 🔴 Gửi realtime cho tất cả người khác biết user online
        socket.broadcast.emit("user_online_status", {
          userId,
          isOnline: true,
        });
      } catch (error) {
        console.error("❌ Lỗi khi join socket:", error);
      }
    });

    // Khi client ngắt kết nối
    socket.on("disconnect", async () => {
      console.log("🔴 Client disconnected:", socket.id);
      try {
        const user = await User.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false, socketId: null },
          { new: true }
        );

        // 🔴 Gửi realtime cho tất cả người khác biết user offline
        if (user?._id) {
          socket.broadcast.emit("user_online_status", {
            userId: user._id.toString(),
            isOnline: false,
          });
        }
      } catch (error) {
        console.error("❌ Lỗi khi xử lý disconnect:", error);
      }
    });
  });
};

// Export socket instance để dùng emit ở nơi khác
module.exports = {
  initSocket,
  getIO: () => io,
};
