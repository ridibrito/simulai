import {
  users,
  subjects,
  questions,
  materials,
  exams,
  examQuestions,
  examAttempts,
  questionAnswers,
  userPerformance,
  aiRecommendations,
  type User,
  type UpsertUser,
  type Subject,
  type InsertSubject,
  type Question,
  type InsertQuestion,
  type Material,
  type InsertMaterial,
  type Exam,
  type InsertExam,
  type ExamQuestion,
  type InsertExamQuestion,
  type ExamAttempt,
  type InsertExamAttempt,
  type QuestionAnswer,
  type InsertQuestionAnswer,
  type UserPerformance,
  type InsertUserPerformance,
  type AiRecommendation,
  type InsertAiRecommendation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(data: InsertSubject): Promise<Subject>;

  getQuestions(subjectId?: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  createQuestion(data: InsertQuestion): Promise<Question>;
  createQuestions(data: InsertQuestion[]): Promise<Question[]>;

  getMaterials(userId: string): Promise<Material[]>;
  getMaterial(id: string): Promise<Material | undefined>;
  createMaterial(data: InsertMaterial): Promise<Material>;
  updateMaterial(id: string, data: Partial<Material>): Promise<Material | undefined>;
  deleteMaterial(id: string): Promise<void>;

  getExams(userId: string): Promise<Exam[]>;
  getExam(id: string): Promise<Exam | undefined>;
  createExam(data: InsertExam): Promise<Exam>;
  updateExam(id: string, data: Partial<Exam>): Promise<Exam | undefined>;
  deleteExam(id: string): Promise<void>;

  getExamQuestions(examId: string): Promise<(ExamQuestion & { question: Question })[]>;
  createExamQuestions(data: InsertExamQuestion[]): Promise<ExamQuestion[]>;

  getExamAttempts(userId: string): Promise<ExamAttempt[]>;
  getExamAttempt(id: string): Promise<ExamAttempt | undefined>;
  createExamAttempt(data: InsertExamAttempt): Promise<ExamAttempt>;
  updateExamAttempt(id: string, data: Partial<ExamAttempt>): Promise<ExamAttempt | undefined>;

  getQuestionAnswers(attemptId: string): Promise<QuestionAnswer[]>;
  createQuestionAnswer(data: InsertQuestionAnswer): Promise<QuestionAnswer>;
  updateQuestionAnswer(id: string, data: Partial<QuestionAnswer>): Promise<QuestionAnswer | undefined>;

  getUserPerformance(userId: string): Promise<UserPerformance[]>;
  upsertUserPerformance(data: InsertUserPerformance): Promise<UserPerformance>;

  getRecommendations(userId: string): Promise<AiRecommendation[]>;
  createRecommendation(data: InsertAiRecommendation): Promise<AiRecommendation>;
  markRecommendationRead(id: string): Promise<void>;

  getUserStats(userId: string): Promise<{
    totalExams: number;
    completedExams: number;
    averageScore: number;
    totalQuestions: number;
    correctAnswers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(subjects.name);
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(data: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(data).returning();
    return subject;
  }

  async getQuestions(subjectId?: string): Promise<Question[]> {
    if (subjectId) {
      return await db.select().from(questions).where(eq(questions.subjectId, subjectId));
    }
    return await db.select().from(questions);
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(data: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(data).returning();
    return question;
  }

  async createQuestions(data: InsertQuestion[]): Promise<Question[]> {
    if (data.length === 0) return [];
    return await db.insert(questions).values(data).returning();
  }

  async getMaterials(userId: string): Promise<Material[]> {
    return await db
      .select()
      .from(materials)
      .where(eq(materials.userId, userId))
      .orderBy(desc(materials.createdAt));
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material;
  }

  async createMaterial(data: InsertMaterial): Promise<Material> {
    const [material] = await db.insert(materials).values(data).returning();
    return material;
  }

  async updateMaterial(id: string, data: Partial<Material>): Promise<Material | undefined> {
    const [material] = await db
      .update(materials)
      .set(data)
      .where(eq(materials.id, id))
      .returning();
    return material;
  }

  async deleteMaterial(id: string): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }

  async getExams(userId: string): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(eq(exams.userId, userId))
      .orderBy(desc(exams.createdAt));
  }

  async getExam(id: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }

  async createExam(data: InsertExam): Promise<Exam> {
    const [exam] = await db.insert(exams).values(data).returning();
    return exam;
  }

  async updateExam(id: string, data: Partial<Exam>): Promise<Exam | undefined> {
    const [exam] = await db
      .update(exams)
      .set(data)
      .where(eq(exams.id, id))
      .returning();
    return exam;
  }

  async deleteExam(id: string): Promise<void> {
    await db.delete(examQuestions).where(eq(examQuestions.examId, id));
    await db.delete(exams).where(eq(exams.id, id));
  }

  async getExamQuestions(examId: string): Promise<(ExamQuestion & { question: Question })[]> {
    const result = await db
      .select({
        id: examQuestions.id,
        examId: examQuestions.examId,
        questionId: examQuestions.questionId,
        orderIndex: examQuestions.orderIndex,
        question: questions,
      })
      .from(examQuestions)
      .innerJoin(questions, eq(examQuestions.questionId, questions.id))
      .where(eq(examQuestions.examId, examId))
      .orderBy(examQuestions.orderIndex);

    return result.map(r => ({
      id: r.id,
      examId: r.examId,
      questionId: r.questionId,
      orderIndex: r.orderIndex,
      question: r.question,
    }));
  }

  async createExamQuestions(data: InsertExamQuestion[]): Promise<ExamQuestion[]> {
    if (data.length === 0) return [];
    return await db.insert(examQuestions).values(data).returning();
  }

  async getExamAttempts(userId: string): Promise<ExamAttempt[]> {
    return await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.userId, userId))
      .orderBy(desc(examAttempts.startedAt));
  }

  async getExamAttempt(id: string): Promise<ExamAttempt | undefined> {
    const [attempt] = await db.select().from(examAttempts).where(eq(examAttempts.id, id));
    return attempt;
  }

  async createExamAttempt(data: InsertExamAttempt): Promise<ExamAttempt> {
    const [attempt] = await db.insert(examAttempts).values(data).returning();
    return attempt;
  }

  async updateExamAttempt(id: string, data: Partial<ExamAttempt>): Promise<ExamAttempt | undefined> {
    const [attempt] = await db
      .update(examAttempts)
      .set(data)
      .where(eq(examAttempts.id, id))
      .returning();
    return attempt;
  }

  async getQuestionAnswers(attemptId: string): Promise<QuestionAnswer[]> {
    return await db
      .select()
      .from(questionAnswers)
      .where(eq(questionAnswers.attemptId, attemptId));
  }

  async createQuestionAnswer(data: InsertQuestionAnswer): Promise<QuestionAnswer> {
    const [answer] = await db.insert(questionAnswers).values(data).returning();
    return answer;
  }

  async updateQuestionAnswer(id: string, data: Partial<QuestionAnswer>): Promise<QuestionAnswer | undefined> {
    const [answer] = await db
      .update(questionAnswers)
      .set(data)
      .where(eq(questionAnswers.id, id))
      .returning();
    return answer;
  }

  async getUserPerformance(userId: string): Promise<UserPerformance[]> {
    return await db
      .select()
      .from(userPerformance)
      .where(eq(userPerformance.userId, userId));
  }

  async upsertUserPerformance(data: InsertUserPerformance): Promise<UserPerformance> {
    const existing = await db
      .select()
      .from(userPerformance)
      .where(
        and(
          eq(userPerformance.userId, data.userId),
          eq(userPerformance.subjectId, data.subjectId)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userPerformance)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userPerformance.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(userPerformance).values(data).returning();
    return created;
  }

  async getRecommendations(userId: string): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .orderBy(aiRecommendations.priority, desc(aiRecommendations.createdAt));
  }

  async createRecommendation(data: InsertAiRecommendation): Promise<AiRecommendation> {
    const [recommendation] = await db.insert(aiRecommendations).values(data).returning();
    return recommendation;
  }

  async markRecommendationRead(id: string): Promise<void> {
    await db
      .update(aiRecommendations)
      .set({ isRead: true })
      .where(eq(aiRecommendations.id, id));
  }

  async getUserStats(userId: string): Promise<{
    totalExams: number;
    completedExams: number;
    averageScore: number;
    totalQuestions: number;
    correctAnswers: number;
  }> {
    const attempts = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.userId, userId));

    const completedAttempts = attempts.filter(a => a.status === "completed");
    const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const totalCorrect = completedAttempts.reduce((sum, a) => sum + (a.correctCount || 0), 0);
    const totalIncorrect = completedAttempts.reduce((sum, a) => sum + (a.incorrectCount || 0), 0);

    return {
      totalExams: attempts.length,
      completedExams: completedAttempts.length,
      averageScore: completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0,
      totalQuestions: totalCorrect + totalIncorrect,
      correctAnswers: totalCorrect,
    };
  }
}

export const storage = new DatabaseStorage();
