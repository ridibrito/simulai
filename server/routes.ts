import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertSubjectSchema,
  insertMaterialSchema,
  insertExamSchema,
  insertExamAttemptSchema,
  insertQuestionAnswerSchema,
} from "@shared/schema";
import {
  generateQuestionsFromContent,
  evaluateEssayAnswer,
  generateStudyRecommendations,
  summarizeMaterial,
  explainQuestion,
} from "./gemini";
import {
  stripe,
  ensureStripeProductsExist,
  getMonthlyPriceId,
  getAnnualPriceId,
  SUBSCRIPTION_PLANS,
} from "./stripe";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  
  // Initialize Stripe products and prices
  try {
    await ensureStripeProductsExist();
  } catch (error) {
    console.error("Failed to initialize Stripe products:", error);
  }

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { studyArea, targetExam, studyGoal } = req.body;
      const user = await storage.updateUser(userId, { studyArea, targetExam, studyGoal });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/subjects", async (_req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", isAuthenticated, async (req, res) => {
    try {
      const data = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(data);
      res.json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.get("/api/questions", isAuthenticated, async (req, res) => {
    try {
      const subjectId = req.query.subjectId as string | undefined;
      const questions = await storage.getQuestions(subjectId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get("/api/questions/:id", isAuthenticated, async (req, res) => {
    try {
      const question = await storage.getQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  app.post("/api/questions/:id/explain", isAuthenticated, async (req, res) => {
    try {
      const question = await storage.getQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      const explanation = await explainQuestion(
        question.content,
        question.options as { letter: string; text: string }[] | null,
        question.correctAnswer
      );
      res.json({ explanation });
    } catch (error) {
      console.error("Error explaining question:", error);
      res.status(500).json({ message: "Failed to explain question" });
    }
  });

  app.get("/api/materials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const materials = await storage.getMaterials(userId);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.get("/api/materials/:id", isAuthenticated, async (req: any, res) => {
    try {
      const material = await storage.getMaterial(req.params.id);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      if (material.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(material);
    } catch (error) {
      console.error("Error fetching material:", error);
      res.status(500).json({ message: "Failed to fetch material" });
    }
  });

  app.post("/api/materials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertMaterialSchema.parse({ ...req.body, userId });
      const material = await storage.createMaterial(data);

      if (material.content) {
        const summary = await summarizeMaterial(material.content, material.title);
        await storage.updateMaterial(material.id, { summary });
        material.summary = summary;
      }

      res.json(material);
    } catch (error) {
      console.error("Error creating material:", error);
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  app.delete("/api/materials/:id", isAuthenticated, async (req: any, res) => {
    try {
      const material = await storage.getMaterial(req.params.id);
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      if (material.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteMaterial(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  app.post("/api/materials/:id/generate-questions", isAuthenticated, async (req: any, res) => {
    try {
      const material = await storage.getMaterial(req.params.id);
      if (!material || !material.content) {
        return res.status(404).json({ message: "Material not found or has no content" });
      }
      if (material.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { questionCount = 5, difficulty = "medium" } = req.body;
      const subject = material.subjectId ? await storage.getSubject(material.subjectId) : null;
      const subjectName = subject?.name || "Geral";

      const generatedQuestions = await generateQuestionsFromContent(
        material.content,
        subjectName,
        questionCount,
        difficulty
      );

      const questionsToInsert = generatedQuestions.map(q => ({
        subjectId: material.subjectId,
        content: q.content,
        type: q.type,
        difficulty: q.difficulty,
        options: q.options || null,
        correctAnswer: q.correctAnswer || null,
        explanation: q.explanation,
        source: `Material: ${material.title}`,
      }));

      const createdQuestions = await storage.createQuestions(questionsToInsert);
      res.json(createdQuestions);
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  app.get("/api/exams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exams = await storage.getExams(userId);
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.get("/api/exams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (exam.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.get("/api/exams/:id/questions", isAuthenticated, async (req: any, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (exam.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const examQuestions = await storage.getExamQuestions(req.params.id);
      res.json(examQuestions);
    } catch (error) {
      console.error("Error fetching exam questions:", error);
      res.status(500).json({ message: "Failed to fetch exam questions" });
    }
  });

  app.post("/api/exams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Check subscription limits for free tier (paid tiers have unlimited)
      // Also treat legacy "pro" tier as paid
      const isPaidTier = user?.subscriptionTier === "monthly" || user?.subscriptionTier === "annual" || user?.subscriptionTier === "pro";
      if (!isPaidTier) {
        const exams = await storage.getExams(userId);
        if (exams.length >= 1) {
          return res.status(403).json({ 
            message: "Limite de simulados atingido. Assine um plano para criar mais.",
            limitReached: true,
          });
        }
      }

      const data = insertExamSchema.parse({ ...req.body, userId });
      const exam = await storage.createExam(data);
      res.json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.post("/api/exams/:id/add-questions", isAuthenticated, async (req: any, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (exam.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { questionIds } = req.body;
      if (!Array.isArray(questionIds)) {
        return res.status(400).json({ message: "questionIds must be an array" });
      }

      const existingQuestions = await storage.getExamQuestions(req.params.id);
      const startIndex = existingQuestions.length;

      const examQuestionsData = questionIds.map((questionId: string, index: number) => ({
        examId: req.params.id,
        questionId,
        orderIndex: startIndex + index,
      }));

      const created = await storage.createExamQuestions(examQuestionsData);
      await storage.updateExam(req.params.id, { 
        status: "ready",
        questionCount: startIndex + questionIds.length
      });

      res.json(created);
    } catch (error) {
      console.error("Error adding questions to exam:", error);
      res.status(500).json({ message: "Failed to add questions" });
    }
  });

  app.delete("/api/exams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      if (exam.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteExam(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  app.get("/api/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getExamAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  app.get("/api/attempts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const attempt = await storage.getExamAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      if (attempt.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(attempt);
    } catch (error) {
      console.error("Error fetching attempt:", error);
      res.status(500).json({ message: "Failed to fetch attempt" });
    }
  });

  app.get("/api/attempts/:id/answers", isAuthenticated, async (req: any, res) => {
    try {
      const attempt = await storage.getExamAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      if (attempt.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const answers = await storage.getQuestionAnswers(req.params.id);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  app.post("/api/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertExamAttemptSchema.parse({ ...req.body, userId });
      const attempt = await storage.createExamAttempt(data);
      res.json(attempt);
    } catch (error) {
      console.error("Error creating attempt:", error);
      res.status(500).json({ message: "Failed to create attempt" });
    }
  });

  app.post("/api/attempts/:id/answer", isAuthenticated, async (req: any, res) => {
    try {
      const attempt = await storage.getExamAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      if (attempt.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { questionId, userAnswer } = req.body;
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      let isCorrect: boolean | null = null;
      let aiEvaluation: string | null = null;
      let aiScore: number | null = null;

      if (question.type === "objective") {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === "essay" && userAnswer) {
        const subject = question.subjectId ? await storage.getSubject(question.subjectId) : null;
        const evaluation = await evaluateEssayAnswer(
          question.content,
          userAnswer,
          subject?.name || "Geral"
        );
        aiScore = evaluation.score;
        aiEvaluation = evaluation.evaluation;
        isCorrect = aiScore >= 6;
      }

      const answer = await storage.createQuestionAnswer({
        attemptId: req.params.id,
        questionId,
        userAnswer,
        isCorrect,
        aiEvaluation,
        aiScore,
      });

      res.json(answer);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  app.post("/api/attempts/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const attempt = await storage.getExamAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      if (attempt.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const answers = await storage.getQuestionAnswers(req.params.id);
      const correctCount = answers.filter(a => a.isCorrect).length;
      const incorrectCount = answers.filter(a => a.isCorrect === false).length;
      const score = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

      const { timeSpent } = req.body;

      const updated = await storage.updateExamAttempt(req.params.id, {
        status: "completed",
        completedAt: new Date(),
        score,
        correctCount,
        incorrectCount,
        timeSpent,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error completing attempt:", error);
      res.status(500).json({ message: "Failed to complete attempt" });
    }
  });

  app.get("/api/performance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const performance = await storage.getUserPerformance(userId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance:", error);
      res.status(500).json({ message: "Failed to fetch performance" });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/recommendations/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const performance = await storage.getUserPerformance(userId);
      const subjects = await storage.getSubjects();

      const performanceData = performance.map(p => {
        const subject = subjects.find(s => s.id === p.subjectId);
        return {
          subjectName: subject?.name || "Desconhecido",
          averageScore: p.averageScore || 0,
          strengthLevel: p.strengthLevel || "unknown",
        };
      });

      const recommendations = await generateStudyRecommendations(
        performanceData,
        user?.targetExam || "Concurso Público"
      );

      const created = await Promise.all(
        recommendations.map(r =>
          storage.createRecommendation({
            userId,
            type: r.type,
            title: r.title,
            description: r.description,
            priority: r.priority,
          })
        )
      );

      res.json(created);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.patch("/api/recommendations/:id/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markRecommendationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking recommendation read:", error);
      res.status(500).json({ message: "Failed to mark recommendation read" });
    }
  });

  // Stripe endpoints
  app.get("/api/subscription/plans", async (_req, res) => {
    try {
      res.json({
        free: {
          name: "Gratuito",
          price: 0,
          priceFormatted: "R$ 0",
          simuladosLimit: 1,
          features: [
            "1 simulado gratuito",
            "Acesso a questões de exemplo",
            "Estatísticas básicas",
          ],
        },
        monthly: {
          name: "Mensal",
          price: 3900,
          priceFormatted: "R$ 39/mês",
          simuladosLimit: -1,
          priceId: getMonthlyPriceId(),
          features: [
            "Simulados ilimitados",
            "Questões geradas por IA",
            "Avaliação de redações por IA",
            "Recomendações personalizadas",
            "Estatísticas avançadas",
          ],
        },
        annual: {
          name: "Anual",
          price: 22800,
          priceFormatted: "R$ 19/mês (cobrado anualmente)",
          simuladosLimit: -1,
          priceId: getAnnualPriceId(),
          savings: "Economize R$ 240/ano",
          features: [
            "Simulados ilimitados",
            "Questões geradas por IA",
            "Avaliação de redações por IA",
            "Recomendações personalizadas",
            "Estatísticas avançadas",
            "Suporte prioritário",
          ],
        },
      });
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.post("/api/subscription/create-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { planType } = req.body;

      if (!planType || !["monthly", "annual"].includes(planType)) {
        return res.status(400).json({ message: "Invalid plan type" });
      }

      const priceId = planType === "monthly" ? getMonthlyPriceId() : getAnnualPriceId();
      if (!priceId) {
        return res.status(500).json({ message: "Stripe prices not initialized" });
      }

      // Get or create Stripe customer
      let customerId = user?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email || undefined,
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : process.env.REPLIT_DOMAINS
          ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
          : "http://localhost:5000";

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/subscription?success=true`,
        cancel_url: `${baseUrl}/subscription?canceled=true`,
        metadata: { userId, planType },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/subscription/create-portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : process.env.REPLIT_DOMAINS
          ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
          : "http://localhost:5000";

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/subscription`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  app.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      if (endpointSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          await storage.updateUser(userId, {
            stripeSubscriptionId: subscriptionId,
            subscriptionTier: planType === "annual" ? "annual" : "monthly",
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const customers = await stripe.customers.retrieve(customerId);
        const userId = (customers as any).metadata?.userId;

        if (userId) {
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          if (isActive) {
            // Get the full subscription with expanded price data to determine tier
            let priceId = subscription.items?.data?.[0]?.price?.id;
            
            // If price data is not expanded, fetch the subscription directly
            if (!priceId) {
              try {
                const fullSubscription = await stripe.subscriptions.retrieve(subscription.id, {
                  expand: ["items.data.price"],
                });
                priceId = fullSubscription.items?.data?.[0]?.price?.id;
              } catch (e) {
                console.error("Failed to retrieve subscription details:", e);
              }
            }
            
            const monthlyPriceId = getMonthlyPriceId();
            const annualPriceId = getAnnualPriceId();
            
            // Determine tier based on price ID, with fallback to monthly if unknown
            let tier: "monthly" | "annual" = "monthly";
            if (priceId === annualPriceId) {
              tier = "annual";
            } else if (priceId === monthlyPriceId) {
              tier = "monthly";
            }
            
            await storage.updateUser(userId, {
              subscriptionTier: tier,
              stripeSubscriptionId: subscription.id,
            });
          } else {
            await storage.updateUser(userId, {
              subscriptionTier: "free",
              stripeSubscriptionId: null,
            });
          }
        }
        break;
      }
    }

    res.json({ received: true });
  });

  // Check subscription limits
  app.get("/api/subscription/can-create-exam", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Paid tiers (monthly, annual, or legacy pro) have unlimited simulados
      if (user?.subscriptionTier === "monthly" || user?.subscriptionTier === "annual" || user?.subscriptionTier === "pro") {
        return res.json({ canCreate: true, remaining: -1 });
      }

      // Free tier: limit to 1 simulado
      const exams = await storage.getExams(userId);
      const canCreate = exams.length < 1;

      res.json({ 
        canCreate, 
        remaining: Math.max(0, 1 - exams.length),
        limit: 1,
        used: exams.length,
      });
    } catch (error) {
      console.error("Error checking subscription limits:", error);
      res.status(500).json({ message: "Failed to check limits" });
    }
  });

  return httpServer;
}
