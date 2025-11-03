export interface ImportResponse {
  // distintos backends pueden usar nombres distintos; se incluyen variantes
  imported?: number;
  processed?: number;
  processedCount?: number;

  errors?: number;
  failed?: number;

  messages?: string[];
  errorsList?: string[];
  messagesList?: string[];
}
