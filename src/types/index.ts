export type Event = {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  location: string;
  signupDeadline: string;
  highlights?: string[];
  prizes?: { rank: 'gold' | 'silver' | 'bronze'; text: string }[];
  registeredCount: number;
  maxParticipants?: number;
  bannerUrl?: string;
  description?: string;
  replayUrl?: string;
  surveyQuestions?: SurveyQuestion[];
};

export type SurveyQuestion = {
  id: number;
  question: string;
  options: string[];
  stats?: number[];
};

export type Registration = {
  id?: number;
  eventId: string;
  name: string;
  department: string;
  registeredAt?: string;
};