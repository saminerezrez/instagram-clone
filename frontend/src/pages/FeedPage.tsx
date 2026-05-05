import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Auth } from "../App";

const API = "https://socialapp-u7hp.onrender.com";

type Post = {
  id: number;
  caption: string | null;
  image_url: string;
  username: string;
  created_at: string;
};

type Props = {
  auth: Auth;
  onLogout: () => void;
};

export default function FeedPage({ auth, onLogout }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [followInput, setFollowInput] = useState("");
  const [followMsg, setFollowMsg] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const authHeader = { Authorization: `Bearer ${auth.token}` };

  const fetchFeed = async () => {
    setFeedLoading(true);
    setFeedError("");
    try {
      const res = await fetch(`${API}/feed`, { headers: authHeader });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data);
    } catch {
      setFeedError("Could not load feed.");
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: authHeader,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setCreateError(data.message ?? "Failed to create post");
        return;
      }

      formRef.current?.reset();
      setShowCreate(false);
      fetchFeed();
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleFollow = async () => {
    const username = followInput.trim();
    if (!username) return;
    setFollowMsg("");

    try {
      const res = await fetch(`${API}/toggle-follow/${username}`, {
        method: "POST",
        headers: authHeader,
      });
      const data = await res.json();
      setFollowMsg(data.message ?? "Done");
      setFollowInput("");
    } catch {
      setFollowMsg("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 bg-blue-600 text-white border-b z-10 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">Sofie Socialapp</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            @{auth.user.username}
          </span>
          <Button size="sm" variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="flex flex-col gap-4 p-4 flex-1">
        {/* Toolbar */}
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            size="sm"
            variant={showCreate ? "secondary" : "default"}
            onClick={() => {
              setShowCreate((v) => !v);
              setCreateError("");
            }}
          >
            {showCreate ? "Cancel" : "+ Create post"}
          </Button>

          <div className="flex gap-2 items-center ml-auto">
            <Input
              className="h-8 w-40 text-sm"
              placeholder="username"
              value={followInput}
              onChange={(e) => setFollowInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleToggleFollow()}
            />
            <Button size="sm" variant="outline" onClick={handleToggleFollow}>
              Follow / Unfollow
            </Button>
          </div>
        </div>

        {followMsg && (
          <p className="text-sm text-muted-foreground -mt-2">{followMsg}</p>
        )}

        {/* Create post */}
        {showCreate && (
          <Card> <Card className="border-blue-200 shadow-lg bg-blue-50"></Card>
            <CardContent className="pt-5">
              <form
                ref={formRef}
                onSubmit={handleCreatePost}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    name="caption"
                    placeholder="Write a caption…"
                    rows={2}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="image">Image (JPEG or PNG)</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png"
                    required
                  />
                </div>
                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}
                <Button type="submit" disabled={creating}>
                  {creating ? "Posting…" : "Post"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Feed */}
        {feedLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading feed…
          </p>
        )}

        {feedError && (
          <p className="text-sm text-destructive text-center py-4">
            {feedError}
          </p>
        )}

        {!feedLoading && !feedError && posts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No posts yet — follow someone to see their posts here.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 flex-row items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                  {post.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="font-medium text-sm">@{post.username}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </CardHeader>
              <img
                src={post.image}
                alt={post.caption ?? "Post image"}
                className="w-full aspect-square object-cover"
              />
              {post.caption && (
                <CardContent className="py-3 px-4">
                  <p className="text-sm">
                    <span className="font-medium mr-1">@{post.username}</span>
                    {post.caption}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
