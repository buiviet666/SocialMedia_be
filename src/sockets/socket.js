const { Server } = require("socket.io");
const User = require("../models/User.model");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // ⚠ sửa khi deploy
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // User vào phòng riêng của họ
    socket.on("join", async (userId) => {
      try {
        console.log(`✅ User ${userId} joined socket room`);

        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true,
        });

        socket.join(userId.toString()); // Join private room theo userId

        socket.broadcast.emit("user_online_status", {
          userId,
          isOnline: true,
        });
      } catch (error) {
        console.error("❌ Lỗi khi join socket:", error);
      }
    });

    // Join phòng bài viết cụ thể
    socket.on("join_post_room", (postId) => {
      socket.join(`post_${postId}`);
      console.log(`📌 Joined post room: post_${postId}`);
    });

    // Leave phòng bài viết
    socket.on("leave_post_room", (postId) => {
      socket.leave(`post_${postId}`);
      console.log(`🚪 Left post room: post_${postId}`);
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

// Export socket instance để dùng emit từ backend
module.exports = {
  initSocket,
  getIO: () => io,
};
