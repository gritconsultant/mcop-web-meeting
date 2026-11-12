export interface Query {
  from: number;
  size: number;
  search?: string;
  order_by?: string;
  sort_by?: string;
  type?: string;
}
