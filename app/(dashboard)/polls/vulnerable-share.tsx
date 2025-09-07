"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Share2, Twitter, Facebook, Mail } from "lucide-react";
import { toast } from "sonner";

/**
 * @interface VulnerableShareProps
 * @description Defines the props required by the VulnerableShare component.
 */
interface VulnerableShareProps {
  pollId: string;
  pollTitle: string;
}

/**
 * A component for sharing a poll.
 *
 * @description This client-side component provides a user interface for sharing a specific poll
 * via a direct link or on various social media platforms. It encourages user engagement and
 * increases the reach of polls by making them easy to distribute.
 *
 * @param {VulnerableShareProps} { pollId, pollTitle } - The ID and title of the poll to be shared.
 *
 * @assumptions This component runs in a browser environment where `window.location.origin`,
 * `navigator.clipboard`, and `window.open` are available.
 *
 * @edgeCases
 * - The Clipboard API (`navigator.clipboard.writeText`) might fail if the page doesn't have the
 *   necessary permissions or is not served over HTTPS. An error toast is shown in this case.
 * - The user has a pop-up blocker that prevents `window.open` from working for social sharing.
 *
 * @returns {JSX.Element} The shareable poll component.
 */
export default function VulnerableShare({
  pollId,
  pollTitle,
}: VulnerableShareProps) {
  // State to hold the generated shareable URL.
  const [shareUrl, setShareUrl] = useState("");

  // Effect to generate the share URL once the component mounts on the client.
  useEffect(() => {
    // This code runs only on the client, ensuring `window` is available.
    const baseUrl = window.location.origin;
    const pollUrl = `${baseUrl}/polls/${pollId}`;
    setShareUrl(pollUrl);
  }, [pollId]); // Reruns if the pollId prop changes.

  /**
   * Copies the shareable URL to the user's clipboard.
   * @description Uses the browser's Clipboard API. Shows a success or error toast message.
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  /**
   * Opens a new window to share the poll on Twitter.
   */
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this poll: ${pollTitle}`);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank", // Opens in a new tab.
    );
  };

  /**
   * Opens a new window to share the poll on Facebook.
   */
  const shareOnFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
    );
  };

  /**
   * Opens the user's default email client to share the poll.
   */
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Poll: ${pollTitle}`);
    const body = encodeURIComponent(
      `Hi! I'd like to share this poll with you: ${shareUrl}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share This Poll
        </CardTitle>
        <CardDescription>
          Share your poll with others to gather votes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Display and Copy Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Shareable Link
          </label>
          <div className="flex space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
              placeholder="Generating link..."
            />
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Social Sharing Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Share on social media
          </label>
          <div className="flex space-x-2">
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              onClick={shareOnFacebook}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              onClick={shareViaEmail}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
