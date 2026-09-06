import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useVerification() {
  const { user } = useAuth();
  const [result, setResult] = useState({ data: null, forUserId: undefined });

  const fetchVerification = useCallback(async () => {
    if (!user) return; // no setState here — nothing to fetch

    const { data } = await supabase
      .from("verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setResult({ data, forUserId: user.id });
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- known false positive, see facebook/react#34743
    fetchVerification();
}, [fetchVerification]);

  const verification = user && result.forUserId === user.id ? result.data : null;
  const loading = Boolean(user) && result.forUserId !== user.id;

  return { verification, loading, refetch: fetchVerification };
}