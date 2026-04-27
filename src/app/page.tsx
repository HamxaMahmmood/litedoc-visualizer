'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            LiteDoc Visualization
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Interactive visualization of MoE expert pruning and token routing patterns
          </p>
        </div>

        <Tabs defaultValue="baseline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="baseline">Baseline (0% Pruned)</TabsTrigger>
            <TabsTrigger value="pruned40">40% Pruned</TabsTrigger>
            <TabsTrigger value="pruned80">80% Pruned</TabsTrigger>
          </TabsList>

          <TabsContent value="baseline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>DeepSeek-VL2 Tiny - Baseline Model</CardTitle>
                <CardDescription>
                  Full model with 64 experts per layer (3.37B parameters)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Visualizations will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pruned40" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>LiteDoc-60 - 40% Pruned Model</CardTitle>
                <CardDescription>
                  ~38 experts per layer (2.4B parameters, 1.4× compression)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Visualizations will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pruned80" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>LiteDoc-20 - 80% Pruned Model</CardTitle>
                <CardDescription>
                  ~13 experts per layer (1.4B parameters, 2.4× compression)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Visualizations will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}