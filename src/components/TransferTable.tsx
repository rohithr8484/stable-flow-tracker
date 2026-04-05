import { ArrowDownCircle, ArrowUpCircle, CheckCircle } from "lucide-react";

interface Transfer {
  id: string;
  date: string;
  time: string;
  txHash: string;
  amount: string;
  direction: "in" | "out";
}

interface Props {
  transfers: Transfer[];
}

const TransferTable = ({ transfers }: Props) => (
  <div className="glass-card overflow-hidden">
    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
      <h3 className="font-heading font-semibold text-foreground">
        Transfers ({transfers.length})
      </h3>
      <span className="text-xs text-muted-foreground px-3 py-1 bg-secondary rounded-full">All</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left px-6 py-3 font-medium">Time</th>
            <th className="text-left px-6 py-3 font-medium">Transaction</th>
            <th className="text-right px-6 py-3 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
              <td className="px-6 py-3">
                <div className="text-foreground">{t.date}</div>
                <div className="text-xs text-muted-foreground">{t.time}</div>
              </td>
              <td className="px-6 py-3">
                <span className="text-primary font-mono text-xs">{t.txHash}</span>
              </td>
              <td className="px-6 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {t.direction === "in" ? (
                    <ArrowDownCircle className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowUpCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className={t.direction === "in" ? "text-success" : "text-foreground"}>
                    {t.direction === "out" ? "-" : "+"}
                    {t.amount}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TransferTable;
