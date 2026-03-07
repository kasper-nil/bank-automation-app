import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back. Here&apos;s an overview of your finances.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-3xl">$24,563.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Monthly Income</CardDescription>
            <CardTitle className="text-3xl">$5,200.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Monthly Expenses</CardDescription>
            <CardTitle className="text-3xl">$3,140.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">-3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your last 5 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {[
              { name: "Grocery Store", amount: "-$84.20", date: "Mar 6" },
              { name: "Salary Deposit", amount: "+$5,200.00", date: "Mar 1" },
              { name: "Electric Bill", amount: "-$112.00", date: "Feb 28" },
              { name: "Netflix", amount: "-$15.99", date: "Feb 27" },
              { name: "Freelance Payment", amount: "+$800.00", date: "Feb 25" },
            ].map((tx) => (
              <li
                key={tx.name + tx.date}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{tx.name}</p>
                  <p className="text-muted-foreground text-xs">{tx.date}</p>
                </div>
                <span
                  className={
                    tx.amount.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : "text-foreground"
                  }
                >
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
