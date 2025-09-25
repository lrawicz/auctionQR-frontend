export type ContractState = {
  authority: string,
  new_content: string,
  old_content: string,
  end_timestamp: Date,
  highest_bid: number,
  highest_bidder: string,
  is_active: boolean
}

export interface MessageContent {
  amount: number;
  url: string;
  timestamp: Date;
  address: string;
}
export interface Message {
  content?: MessageContent;
  messages?: MessageContent[];
  meta: string;
  room: string;
}
