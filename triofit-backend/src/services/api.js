import axios from "axios";

const API_URL = "http://localhost:3001";

export async function sendChat(messages) {

  const res = await axios.post(`${API_URL}/chat`, {
    messages
  });

  return res.data.reply;
}
