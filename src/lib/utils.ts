import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function formatDate(date: Date | string): string {
  return format(new Date(date), "yyyy年M月d日", { locale: ja });
}
