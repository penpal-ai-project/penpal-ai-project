const API_BASE_URL = "http://127.0.0.1:5000";

export type Letter = {
  letter_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
};

export type Trait = string | {
  label: string;
  score?: number;
};

export type SavedLetterAnalysis = {
  letter_id: number;
  emotion_label: string;
  emotion_score: number;
  traits: Trait[];
  embedding_length: number;
  message?: string;
};

export type MatchResult = {
  user_id: number;
  final_score: number;
  embedding_score: number;
  trait_score: number;
  matched_traits: Trait[];
  rank: number;
};

export type MatchResponse = {
  target_user_id: number;
  target_profile_exists?: boolean;
  matching_base: string;
  target_letter_count: number;
  preferred_gender: string;
  excluded_user_ids: number[];
  total_user_count?: number;
  total_profile_count?: number;
  candidate_count_before_filter?: number;
  candidate_count_after_gender_filter?: number;
  debug_message?: string;
  matches: MatchResult[];
};

export function getTraitLabel(trait: Trait): string {
  return typeof trait === "string" ? trait : trait.label;
}

export async function saveLetter(
  senderId: number,
  receiverId: number,
  content: string
): Promise<SavedLetterAnalysis> {
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

export async function getMatches(userId: number): Promise<MatchResponse | MatchResult[]> {
  const response = await fetch(`${API_BASE_URL}/match/${userId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "매칭 결과 조회 실패");
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

export async function signup(
nickname : string, 
gender : string,
preferred_gender : string,
handwriting_style : string | null
) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ nickname, gender, preferred_gender, handwriting_style }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "회원가입 실패");
  }

  return response.json(); 
}
