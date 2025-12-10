export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            ai_recommendations: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    is_read: boolean | null
                    priority: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_read?: boolean | null
                    priority?: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_read?: boolean | null
                    priority?: string | null
                    title?: string
                    type?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ai_recommendations_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exam_attempts: {
                Row: {
                    completed_at: string | null
                    correct_count: number | null
                    exam_id: string
                    id: string
                    incorrect_count: number | null
                    score: number | null
                    started_at: string | null
                    status: string
                    time_spent: number | null
                    user_id: string
                }
                Insert: {
                    completed_at?: string | null
                    correct_count?: number | null
                    exam_id: string
                    id?: string
                    incorrect_count?: number | null
                    score?: number | null
                    started_at?: string | null
                    status?: string
                    time_spent?: number | null
                    user_id: string
                }
                Update: {
                    completed_at?: string | null
                    correct_count?: number | null
                    exam_id?: string
                    id?: string
                    incorrect_count?: number | null
                    score?: number | null
                    started_at?: string | null
                    status?: string
                    time_spent?: number | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "exam_attempts_exam_id_fkey"
                        columns: ["exam_id"]
                        isOneToOne: false
                        referencedRelation: "exams"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "exam_attempts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exam_questions: {
                Row: {
                    exam_id: string
                    id: string
                    order_index: number
                    question_id: string
                }
                Insert: {
                    exam_id: string
                    id?: string
                    order_index: number
                    question_id: string
                }
                Update: {
                    exam_id?: string
                    id?: string
                    order_index?: number
                    question_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "exam_questions_exam_id_fkey"
                        columns: ["exam_id"]
                        isOneToOne: false
                        referencedRelation: "exams"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "exam_questions_question_id_fkey"
                        columns: ["question_id"]
                        isOneToOne: false
                        referencedRelation: "questions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exams: {
                Row: {
                    created_at: string | null
                    description: string | null
                    duration: number | null
                    id: string
                    title: string
                    total_questions: number | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    duration?: number | null
                    id?: string
                    title: string
                    total_questions?: number | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    duration?: number | null
                    id?: string
                    title?: string
                    total_questions?: number | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "exams_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            materials: {
                Row: {
                    content: string | null
                    created_at: string | null
                    file_url: string | null
                    id: string
                    summary: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Insert: {
                    content?: string | null
                    created_at?: string | null
                    file_url?: string | null
                    id?: string
                    summary?: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Update: {
                    content?: string | null
                    created_at?: string | null
                    file_url?: string | null
                    id?: string
                    summary?: string | null
                    title?: string
                    type?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "materials_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            question_answers: {
                Row: {
                    answered_at: string | null
                    attempt_id: string
                    id: string
                    is_correct: boolean | null
                    question_id: string
                    time_spent: number | null
                    user_answer: string | null
                }
                Insert: {
                    answered_at?: string | null
                    attempt_id: string
                    id?: string
                    is_correct?: boolean | null
                    question_id: string
                    time_spent?: number | null
                    user_answer?: string | null
                }
                Update: {
                    answered_at?: string | null
                    attempt_id?: string
                    id?: string
                    is_correct?: boolean | null
                    question_id?: string
                    time_spent?: number | null
                    user_answer?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "question_answers_attempt_id_fkey"
                        columns: ["attempt_id"]
                        isOneToOne: false
                        referencedRelation: "exam_attempts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "question_answers_question_id_fkey"
                        columns: ["question_id"]
                        isOneToOne: false
                        referencedRelation: "questions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            questions: {
                Row: {
                    content: string
                    correct_answer: string | null
                    created_at: string | null
                    difficulty: string | null
                    explanation: string | null
                    id: string
                    options: string | null
                    subject_id: string | null
                    type: string
                }
                Insert: {
                    content: string
                    correct_answer?: string | null
                    created_at?: string | null
                    difficulty?: string | null
                    explanation?: string | null
                    id?: string
                    options?: string | null
                    subject_id?: string | null
                    type: string
                }
                Update: {
                    content?: string
                    correct_answer?: string | null
                    created_at?: string | null
                    difficulty?: string | null
                    explanation?: string | null
                    id?: string
                    options?: string | null
                    subject_id?: string | null
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "questions_subject_id_fkey"
                        columns: ["subject_id"]
                        isOneToOne: false
                        referencedRelation: "subjects"
                        referencedColumns: ["id"]
                    },
                ]
            }
            subjects: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            user_performance: {
                Row: {
                    average_score: number | null
                    average_time: number | null
                    id: string
                    last_updated: string | null
                    subject_id: string
                    total_attempts: number | null
                    total_correct: number | null
                    total_questions: number | null
                    user_id: string
                }
                Insert: {
                    average_score?: number | null
                    average_time?: number | null
                    id?: string
                    last_updated?: string | null
                    subject_id: string
                    total_attempts?: number | null
                    total_correct?: number | null
                    total_questions?: number | null
                    user_id: string
                }
                Update: {
                    average_score?: number | null
                    average_time?: number | null
                    id?: string
                    last_updated?: string | null
                    subject_id?: string
                    total_attempts?: number | null
                    total_correct?: number | null
                    total_questions?: number | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_performance_subject_id_fkey"
                        columns: ["subject_id"]
                        isOneToOne: false
                        referencedRelation: "subjects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_performance_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string | null
                    email: string
                    first_name: string | null
                    id: string
                    last_name: string | null
                    preferred_subjects: string[] | null
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    study_area: string | null
                    study_goal: string | null
                    subscription_current_period_end: string | null
                    subscription_status: string | null
                    subscription_tier: string | null
                    target_exam: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    first_name?: string | null
                    id: string
                    last_name?: string | null
                    preferred_subjects?: string[] | null
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    study_area?: string | null
                    study_goal?: string | null
                    subscription_current_period_end?: string | null
                    subscription_status?: string | null
                    subscription_tier?: string | null
                    target_exam?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    first_name?: string | null
                    id?: string
                    last_name?: string | null
                    preferred_subjects?: string[] | null
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    study_area?: string | null
                    study_goal?: string | null
                    subscription_current_period_end?: string | null
                    subscription_status?: string | null
                    subscription_tier?: string | null
                    target_exam?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
