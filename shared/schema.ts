import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  studyArea: varchar("study_area"),
  targetExam: varchar("target_exam"),
  studyGoal: text("study_goal"),
  subscriptionTier: varchar("subscription_tier").default("free"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subject areas for questions
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions bank
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").references(() => subjects.id),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // 'objective' or 'essay'
  difficulty: varchar("difficulty").notNull(), // 'easy', 'medium', 'hard'
  options: jsonb("options"), // For objective questions: [{letter: 'A', text: '...'}]
  correctAnswer: varchar("correct_answer"), // Letter for objective, null for essay
  explanation: text("explanation"),
  source: varchar("source"), // e.g., "ENEM 2023", "Concurso TRF 2022"
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study materials (PDFs, notes)
export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  type: varchar("type").notNull(), // 'pdf', 'note', 'slide'
  fileName: varchar("file_name"),
  fileUrl: varchar("file_url"),
  content: text("content"), // Extracted text content
  summary: text("summary"), // AI-generated summary
  subjectId: varchar("subject_id").references(() => subjects.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exams (simulados)
export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  subjectIds: jsonb("subject_ids").$type<string[]>(),
  questionCount: integer("question_count").notNull(),
  timeLimit: integer("time_limit"), // in minutes
  difficulty: varchar("difficulty"),
  isFromMaterial: boolean("is_from_material").default(false),
  materialId: varchar("material_id").references(() => materials.id),
  status: varchar("status").default("draft"), // 'draft', 'ready', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Exam questions junction table
export const examQuestions = pgTable("exam_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").references(() => exams.id).notNull(),
  questionId: varchar("question_id").references(() => questions.id).notNull(),
  orderIndex: integer("order_index").notNull(),
});

// Exam attempts/results
export const examAttempts = pgTable("exam_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  examId: varchar("exam_id").references(() => exams.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: real("score"),
  correctCount: integer("correct_count"),
  incorrectCount: integer("incorrect_count"),
  timeSpent: integer("time_spent"), // in seconds
  status: varchar("status").default("in_progress"), // 'in_progress', 'completed', 'abandoned'
});

// Individual question answers
export const questionAnswers = pgTable("question_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptId: varchar("attempt_id").references(() => examAttempts.id).notNull(),
  questionId: varchar("question_id").references(() => questions.id).notNull(),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
  aiEvaluation: text("ai_evaluation"), // AI feedback for essay questions
  aiScore: real("ai_score"), // Score for essay questions (0-10)
  createdAt: timestamp("created_at").defaultNow(),
});

// User performance stats per subject
export const userPerformance = pgTable("user_performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  averageScore: real("average_score").default(0),
  lastStudied: timestamp("last_studied"),
  strengthLevel: varchar("strength_level").default("unknown"), // 'weak', 'medium', 'strong'
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-generated recommendations
export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'study_focus', 'material', 'exam'
  title: varchar("title").notNull(),
  description: text("description"),
  subjectId: varchar("subject_id").references(() => subjects.id),
  priority: integer("priority").default(1),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  materials: many(materials),
  exams: many(exams),
  examAttempts: many(examAttempts),
  performance: many(userPerformance),
  recommendations: many(aiRecommendations),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  questions: many(questions),
  materials: many(materials),
  performance: many(userPerformance),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [questions.subjectId],
    references: [subjects.id],
  }),
  examQuestions: many(examQuestions),
  answers: many(questionAnswers),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  user: one(users, {
    fields: [materials.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [materials.subjectId],
    references: [subjects.id],
  }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  user: one(users, {
    fields: [exams.userId],
    references: [users.id],
  }),
  material: one(materials, {
    fields: [exams.materialId],
    references: [materials.id],
  }),
  examQuestions: many(examQuestions),
  attempts: many(examAttempts),
}));

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, {
    fields: [examQuestions.examId],
    references: [exams.id],
  }),
  question: one(questions, {
    fields: [examQuestions.questionId],
    references: [questions.id],
  }),
}));

export const examAttemptsRelations = relations(examAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [examAttempts.userId],
    references: [users.id],
  }),
  exam: one(exams, {
    fields: [examAttempts.examId],
    references: [exams.id],
  }),
  answers: many(questionAnswers),
}));

export const questionAnswersRelations = relations(questionAnswers, ({ one }) => ({
  attempt: one(examAttempts, {
    fields: [questionAnswers.attemptId],
    references: [examAttempts.id],
  }),
  question: one(questions, {
    fields: [questionAnswers.questionId],
    references: [questions.id],
  }),
}));

export const userPerformanceRelations = relations(userPerformance, ({ one }) => ({
  user: one(users, {
    fields: [userPerformance.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [userPerformance.subjectId],
    references: [subjects.id],
  }),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [aiRecommendations.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [aiRecommendations.subjectId],
    references: [subjects.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true, createdAt: true });
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true, createdAt: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true, createdAt: true });
export const insertExamQuestionSchema = createInsertSchema(examQuestions).omit({ id: true });
export const insertExamAttemptSchema = createInsertSchema(examAttempts).omit({ id: true, startedAt: true });
export const insertQuestionAnswerSchema = createInsertSchema(questionAnswers).omit({ id: true, createdAt: true });
export const insertUserPerformanceSchema = createInsertSchema(userPerformance).omit({ id: true, updatedAt: true });
export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = z.infer<typeof insertExamQuestionSchema>;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type InsertExamAttempt = z.infer<typeof insertExamAttemptSchema>;
export type QuestionAnswer = typeof questionAnswers.$inferSelect;
export type InsertQuestionAnswer = z.infer<typeof insertQuestionAnswerSchema>;
export type UserPerformance = typeof userPerformance.$inferSelect;
export type InsertUserPerformance = z.infer<typeof insertUserPerformanceSchema>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
