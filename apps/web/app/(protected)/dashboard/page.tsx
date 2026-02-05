"use client";

import { Card, CardBody, CardHeader } from "@repo/ui";
import { useUserStore } from "~/store/user";
import { SendVerificationEmailButton } from "~/components/send-verification-email";

export default function DashboardPage() {
  const user = useUserStore((state) => state.user);

  const stats = [
    { label: "Total Users", value: "1,234", change: "+12.5%", trend: "up" },
    { label: "Active Sessions", value: "856", change: "+8.2%", trend: "up" },
    { label: "Revenue", value: "$45,678", change: "+23.1%", trend: "up" },
    {
      label: "Conversion Rate",
      value: "3.24%",
      change: "-2.4%",
      trend: "down",
    },
  ];

  const recentActivity = [
    { action: "New user registered", time: "2 minutes ago", type: "success" },
    { action: "Payment received", time: "15 minutes ago", type: "success" },
    { action: "Failed login attempt", time: "1 hour ago", type: "warning" },
    { action: "Database backup completed", time: "2 hours ago", type: "info" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-default text-3xl font-bold mb-2">
          Welcome back{`${user?.username ? `, ${user.username}` : ""}`}
        </h1>
        <p className="text-default-300">
          Here&apos;s what&apos;s happening with your app today.
        </p>
        {user?.isAdmin && (
          <div className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
            Admin Access
          </div>
        )}
      </div>

      {/* User Info Card */}
      <Card className="mb-8 border-none bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardBody className="p-6">
          <div className="text-default-400 flex items-start justify-between">
            <div>
              <h3 className="text-default text-lg font-bold mb-2">
                Your Profile
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-default">Email:</span>{" "}
                  <span className="font-semibold">{user?.email}</span>
                </p>
                <p>
                  <span className="text-default">Username:</span>{" "}
                  <span className="font-semibold">@{user?.username}</span>
                </p>
                <p>
                  <span className="text-default">User ID:</span>{" "}
                  <span className="font-mono text-xs">{user?.id}</span>
                </p>
                <p>
                  <span className="text-default">Member since:</span>{" "}
                  <span>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-none bg-gradient-to-br from-content1 to-content2"
          >
            <CardBody className="p-6">
              <p className="text-sm text-default-500 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <span
                  className={`text-sm font-semibold ${
                    stat.trend === "up" ? "text-success" : "text-danger"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-none bg-gradient-to-br from-content1 to-content2">
          <CardHeader className="pb-0 pt-6 px-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-divider last:border-0 last:pb-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "success"
                        ? "bg-success"
                        : activity.type === "warning"
                          ? "bg-warning"
                          : "bg-primary"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-default-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card className="border-none bg-gradient-to-br from-content1 to-content2">
          <CardHeader className="pb-0 pt-6 px-6">
            <h2 className="text-xl font-bold">Quick Actions</h2>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold">
                      Email Verification
                    </span>
                  </div>
                  <span className="text-xs text-default-500">
                    {user?.email ? user.email : "No email"}
                  </span>
                </div>
                <p className="text-xs text-default-600 mb-3">
                  {user?.emailVerified
                    ? "Your email has been verified successfully!"
                    : "Verify your email to access all features."}
                </p>
                {!user?.emailVerified && <SendVerificationEmailButton />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 rounded-lg border-2 border-dashed border-default-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="text-sm font-semibold">Add User</p>
                </button>
                <button className="p-6 rounded-lg border-2 border-dashed border-default-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-semibold">View Reports</p>
                </button>
                <button className="p-6 rounded-lg border-2 border-dashed border-default-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 text-center">
                  <div className="text-3xl mb-2">⚙️</div>
                  <p className="text-sm font-semibold">Settings</p>
                </button>
                <button className="p-6 rounded-lg border-2 border-dashed border-default-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 text-center">
                  <div className="text-3xl mb-2">📧</div>
                  <p className="text-sm font-semibold">Messages</p>
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
