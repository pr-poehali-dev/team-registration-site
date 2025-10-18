export interface Team {
  id: number;
  team_name: string;
}

export interface Match {
  id: number;
  match_number: number;
  bracket_type: string;
  round_number: number;
  team1_id?: number;
  team2_id?: number;
  team1_name?: string;
  team2_name?: string;
  team1_placeholder?: string;
  team2_placeholder?: string;
  score1?: number;
  score2?: number;
  winner?: number;
  status: string;
  scheduled_time?: string;
}
