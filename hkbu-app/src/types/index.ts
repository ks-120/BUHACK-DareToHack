export interface UserProfile {
  uid: string;
  nickname: string;
  email: string;
  interests: string[];
  privacyConsent: boolean;
  points: number;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorNickname: string;
  content: string;
  tags: string[];
  createdAt: number;
  likes: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: number;
  location: string;
  organizer: string;
  rsvpCount: number;
  rsvpList: string[];
  isOfficial: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderNickname: string;
  text: string;
  createdAt: number;
}

export interface Match {
  uid: string;
  nickname: string;
  sharedInterests: string[];
  overlapPercent: number;
}

export type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  Login: undefined;
  Main: undefined;
  Match: undefined;
  Events: undefined;
  Feed: undefined;
  Chat: { matchId: string; partnerNickname: string };
  Leaderboard: undefined;
};
