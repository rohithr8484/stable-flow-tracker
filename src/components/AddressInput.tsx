import { useState } from "react";
import { Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSubmit: (addresses: { send: string; receive: string; liquidityPool: string }) => void;
}

const AddressInput = ({ onSubmit }: Props) => {
  const [send, setSend] = useState("");
  const [receive, setReceive] = useState("");
  const [liquidityPool, setLiquidityPool] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ send, receive, liquidityPool });
  };

  const fields = [
    { label: "Send Address (BTC / MUSD)", value: send, set: setSend, placeholder: "Enter BTC or MUSD send address..." },
    { label: "Receive Address (BTC / MUSD)", value: receive, set: setReceive, placeholder: "Enter BTC or MUSD receive address..." },
    { label: "Liquidity Pool Address", value: liquidityPool, set: setLiquidityPool, placeholder: "Enter liquidity pool contract address..." },
  ];

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/15">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">Enter Addresses for Risk Analysis</h3>
          <p className="text-xs text-muted-foreground">Provide BTC and MUSD addresses for send, receive, and liquidity pool operations</p>
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

      <Button type="submit" className="w-full gap-2">
        <Search className="h-4 w-4" />
        Analyze Risk
      </Button>
    </form>
  );
};

export default AddressInput;
