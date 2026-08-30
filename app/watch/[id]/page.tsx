import { notFound } from "next/navigation";
import { getLecture } from "@/lib/seeds";
import Theater from "./Theater";

export default function WatchPage({ params }: { params: { id: string } }) {
  const lecture = getLecture(params.id);
  if (!lecture) notFound();
  return <Theater lecture={lecture} />;
}
