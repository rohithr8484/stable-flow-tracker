import { useState } from "react";
import { Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSubmit: (addresses: { save: string; invest: string; borrow: string }) => void;
}

const AddressInput = ({ onSubmit }: Props) => {
  const [save, setSave] = useState("");
  const [invest, setInvest] = useState("");
  const [borrow, setBorrow] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ save, invest, borrow });
  };

  const fields = [
    { label: "Save Address (BTC / MUSD)", value: save, set: setSave, placeholder: "Enter BTC or MUSD save address..." },
    { label: "Invest Address (BTC / MUSD)", value: invest, set: setInvest, placeholder: "Enter BTC or MUSD invest address..." },
    { label: "Borrow Address (BTC / MUSD)", value: borrow, set: setBorrow, placeholder: "Enter BTC or MUSD borrow address..." },
  ];

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/15">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">Enter Addresses for Risk Analysis</h3>
          <p className="text-xs text-muted-foreground">Provide BTC and MUSD addresses for save, invest, and borrow operations</p>
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
