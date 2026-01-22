"use client";

import { Card, CardBody, Button } from "@repo/ui";

export default function HomePage() {
  const features = [
    {
      title: "Secure Authentication",
      description: "Built with modern security practices and JWT tokens",
      icon: "🔐",
    },
    {
      title: "Monorepo Architecture",
      description: "Organized codebase with shared packages and modules",
      icon: "📦",
    },
    {
      title: "Type-Safe",
      description: "Full TypeScript support across the entire stack",
      icon: "✨",
    },
    {
      title: "Modern UI",
      description: "Beautiful components powered by NextUI and Tailwind",
      icon: "🎨",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-background py-20 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-default-600 mb-8 max-w-2xl mx-auto">
            A modern, secure, and scalable authentication starter template
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" color="primary" className="font-semibold">
              Get Started
            </Button>
            <Button size="lg" variant="bordered" className="font-semibold">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-none bg-gradient-to-br from-content1 to-content2 hover:scale-105 transition-transform duration-300"
                shadow="sm"
              >
                <CardBody className="text-center p-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-default-500">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-white/95 to-white/80">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                100%
              </h3>
              <p className="text-xl text-default-600">Type-Safe</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Fast
              </h3>
              <p className="text-xl text-default-600">Performance</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Secure
              </h3>
              <p className="text-xl text-default-600">by Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-none bg-gradient-to-br from-primary to-secondary p-8">
            <CardBody>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to build something amazing?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Start creating your next project with our powerful starter
                template
              </p>
              <Button size="lg" className="bg-white text-primary font-semibold">
                Start Building
              </Button>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-divider bg-background">
        <div className="max-w-6xl mx-auto text-center text-default-500">
          <p>&copy; 2025 MyApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
