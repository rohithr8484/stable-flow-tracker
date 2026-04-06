import { useState } from "react";
import { Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSubmit: (hashes: { send: string; receive: string; liquidityPool: string }) => void;
  loading?: boolean;
}

const AddressInput = ({ onSubmit, loading }: Props) => {
  const [send, setSend] = useState("");
  const [receive, setReceive] = useState("");
  const [liquidityPool, setLiquidityPool] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ send, receive, liquidityPool });
  };

  const fields = [
    { label: "Send Transaction Hash (BTC / MUSD)", value: send, set: setSend, placeholder: "Enter send tx hash e.g. 0xc56cbb60c2..." },
    { label: "Receive Transaction Hash (BTC / MUSD)", value: receive, set: setReceive, placeholder: "Enter receive tx hash e.g. 0xa32f8bc91e..." },
    { label: "Liquidity Pool Hash", value: liquidityPool, set: setLiquidityPool, placeholder: "Enter liquidity pool tx hash..." },
  ];

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/15">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">Enter Transaction Hashes for Risk Analysis</h3>
          <p className="text-xs text-muted-foreground">Provide BTC and MUSD transaction hashes for send, receive, and liquidity pool operations</p>
        </div>
      </div>

      {fields.map((f) => (
        <div key={f.label}>
          <label className="text-sm font-medium text-foreground mb-1.5 block">{f.label}</label>
          <Input
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            placeholder={f.placeholder}
            className="bg-secondary border-border font-mono text-sm"
          />
        </div>
      ))}

      <Button type="submit" className="w-full gap-2" disabled={loading || !send}>
        <Search className="h-4 w-4" />
        {loading ? "Analyzing..." : "Analyze Risk"}
      </Button>
    </form>
  );
};

export default AddressInput;
