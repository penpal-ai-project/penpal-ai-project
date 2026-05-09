const API_BASE_URL = "http://127.0.0.1:5000";

export type Letter = {
  letter_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
};

export async function saveLetter(
  senderId: number,
  receiverId: number,
  content: string
) {
  const response = await fetch(`${API_BASE_URL}/letters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "편지 저장 실패");
  }

  return response.json();
}

export async function getReceivedLetters(receiverId: number): Promise<Letter[]> {
  const response = await fetch(`${API_BASE_URL}/letters/received/${receiverId}`);

  if (!response.ok) {
    throw new Error("받은 편지 조회 실패");
  }

  return response.json();
}