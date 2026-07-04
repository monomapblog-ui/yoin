"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
}

export function FollowButton({ userId, initialFollowing, isLoggedIn }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${userId}/follow`, {
      method: following ? "DELETE" : "POST",
    });
    setLoading(false);
    if (res.ok) {
      setFollowing(!following);
      router.refresh();
    }
  }

  return (
    <Button
      onClick={toggle}
      loading={loading}
      variant={following ? "secondary" : "primary"}
      size="sm"
      className={following ? "" : "bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500"}
    >
      {following ? (
        <><UserMinus className="w-3.5 h-3.5" />フォロー中</>
      ) : (
        <><UserPlus className="w-3.5 h-3.5" />フォローする</>
      )}
    </Button>
  );
}
