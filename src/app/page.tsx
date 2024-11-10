"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { loyalAbi } from "@/lib/abi";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function LoyaltyProgram() {
  const [loading, setLoading] = useState(false);
  const { isConnected, address } = useAccount();

  // const contractId = "0x662c66962B02Ebd79Fdc204e21065b268A15e920"; // Base Sepolia
  const contractId = "0x6d1479e7FE48fcb9E0B50E2b52c1eA3630A30F4A"; // BFT Testnet

  // Read contract hooks
  const { data: pointsData } = useReadContract({
    address: contractId,
    abi: loyalAbi,
    functionName: "getPoints",
    args: [address],
  });

  const { data: streakData } = useReadContract({
    address: contractId,
    abi: loyalAbi,
    functionName: "getStreak",
    args: [address],
  });

  // Write contract hook
  const { writeContract, error, data: txHash, isPending } = useWriteContract();

  useEffect(() => {
    if (error) {
      let errorMessage = "Transaction failed. Please try again.";

      // Check for specific error messages
      if (error.message.includes("Wait 24 hours between claims")) {
        errorMessage = "Please wait 24 hours before claiming again";
      } else if (error.message.includes("reason:")) {
        // Extract the reason if present
        const reasonMatch = error.message.match(
          /reason:\s*(.*?)(?:\s*Contract Call:|$)/i
        );
        if (reasonMatch) {
          errorMessage = reasonMatch[1].trim();
        }
      }

      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          padding: "16px",
          borderRadius: "8px",
          background: "#FEE2E2",
          color: "#991B1B",
        },
        icon: "❌",
      });

      // Reset loading states if needed
      setLoading(false);
    }
  }, [error]);

  // Success handling useEffect
  useEffect(() => {
    if (txHash) {
      toast.success(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>Points claimed successfully!</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
              onClick={() => toast.dismiss(t.id)}
            >
              View on Explorer <ExternalLink size={14} />
            </a>
          </div>
        ),
        {
          duration: 5000,
          icon: "🎉",
        }
      );
    }
  }, [txHash]);

  // Claim points function
  const claimPoints = async () => {
    try {
      setLoading(true);
      await writeContract({
        abi: loyalAbi,
        address: contractId,
        functionName: "claimDailyPoints",
      });

      toast.loading("Transaction Submitted...", {
        duration: 5000,
      });
    } catch (error) {
      console.error("Error claiming points:", error);
      toast.error("Failed to claim points. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  console.log(error);

  // Show success toast when transaction is completed
  useEffect(() => {
    if (txHash) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>Points claimed successfully!</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
              onClick={() => toast.dismiss(t.id)}
            >
              View on Explorer <ExternalLink size={14} />
            </a>
          </div>
        ),
        {
          duration: 5000,
          icon: "🎉",
        }
      );
    }
  }, [txHash]);

  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center mb-4">
            Daily Login Rewards
          </CardTitle>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </CardHeader>

        <CardContent>
          {isConnected && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-2xl font-bold">
                    {pointsData ? Number(pointsData) : 0}
                  </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-2xl font-bold">
                    {streakData ? Number(streakData) : 0} days
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={claimPoints}
                disabled={loading || isPending}
              >
                {loading || isPending ? "Claiming..." : "Claim Daily Points"}
              </Button>

              {txHash && (
                <div className="mt-4 text-center">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1"
                  >
                    View Transaction <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
