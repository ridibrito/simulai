// Types gerados a partir do schema do Supabase
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string | null
                    first_name: string | null
                    last_name: string | null
                    profile_image_url: string | null
                    study_area: string | null
                    target_exam: string | null
                    study_goal: string | null
                    subscription_tier: string
                    subscription_status: string
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    subscription_current_period_end: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    profile_image_url?: string | null
                    study_area?: string | null
                    target_exam?: string | null
                    study_goal?: string | null
                    subscription_tier?: string
                    subscription_status?: string
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    subscription_current_period_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    profile_image_url?: string | null
                    study_area?: string | null
                    target_exam?: string | null
                    study_goal?: string | null
                    subscription_tier?: string
                    subscription_status?: string
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    subscription_current_period_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            subjects: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                }
            }
            questions: {
                Row: {
                    id: string
                    subject_id: string | null
                    content: string
                    type: 'multiple_choice' | 'true_false' | 'essay'
                    difficulty: 'easy' | 'medium' | 'hard' | null
                    options: Json | null
                    correct_answer: string | null
                    explanation: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    subject_id?: string | null
                    content: string
                    type: 'multiple_choice' | 'true_false' | 'essay'
                    difficulty?: 'easy' | 'medium' | 'hard' | null
                    options?: Json | null
                    correct_answer?: string | null
                    explanation?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    subject_id?: string | null
                    content?: string
                    type?: 'multiple_choice' | 'true_false' | 'essay'
                    difficulty?: 'easy' | 'medium' | 'hard' | null
                    options?: Json | null
                    correct_answer?: string | null
                    explanation?: string | null
                    created_at?: string
                }
            }
            materials: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    content: string | null
                    summary: string | null
                    file_url: string | null
                    type: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    content?: string | null
                    summary?: string | null
                    file_url?: string | null
                    type?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    content?: string | null
                    summary?: string | null
                    file_url?: string | null
                    type?: string
                    created_at?: string
                }
            }
            exams: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    duration: number | null
                    total_questions: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    duration?: number | null
                    total_questions?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    duration?: number | null
                    total_questions?: number
                    created_at?: string
                }
            }
            exam_questions: {
                Row: {
                    id: string
                    exam_id: string
                    question_id: string
                    order_index: number
                }
                Insert: {
                    id?: string
                    exam_id: string
                    question_id: string
                    order_index: number
                }
                Update: {
                    id?: string
                    exam_id?: string
                    question_id?: string
                    order_index?: number
                }
            }
            exam_attempts: {
                Row: {
                    id: string
                    user_id: string
                    exam_id: string
                    status: 'in_progress' | 'completed' | 'abandoned'
                    score: number | null
                    correct_count: number
                    incorrect_count: number
                    time_spent: number
                    started_at: string
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    exam_id: string
                    status?: 'in_progress' | 'completed' | 'abandoned'
                    score?: number | null
                    correct_count?: number
                    incorrect_count?: number
                    time_spent?: number
                    started_at?: string
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    exam_id?: string
                    status?: 'in_progress' | 'completed' | 'abandoned'
                    score?: number | null
                    correct_count?: number
                    incorrect_count?: number
                    time_spent?: number
                    started_at?: string
                    completed_at?: string | null
                }
            }
            question_answers: {
                Row: {
                    id: string
                    attempt_id: string
                    question_id: string
                    user_answer: string | null
                    is_correct: boolean | null
                    time_spent: number
                    answered_at: string
                }
                Insert: {
                    id?: string
                    attempt_id: string
                    question_id: string
                    user_answer?: string | null
                    is_correct?: boolean | null
                    time_spent?: number
                    answered_at?: string
                }
                Update: {
                    id?: string
                    attempt_id?: string
                    question_id?: string
                    user_answer?: string | null
                    is_correct?: boolean | null
                    time_spent?: number
                    answered_at?: string
                }
            }
            user_performance: {
                Row: {
                    id: string
                    user_id: string
                    subject_id: string
                    total_questions: number
                    correct_answers: number
                    average_score: number
                    last_practice: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    subject_id: string
                    total_questions?: number
                    correct_answers?: number
                    average_score?: number
                    last_practice?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    subject_id?: string
                    total_questions?: number
                    correct_answers?: number
                    average_score?: number
                    last_practice?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            ai_recommendations: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    title: string
                    description: string | null
                    priority: 'low' | 'medium' | 'high'
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    title: string
                    description?: string | null
                    priority?: 'low' | 'medium' | 'high'
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: string
                    title?: string
                    description?: string | null
                    priority?: 'low' | 'medium' | 'high'
                    is_read?: boolean
                    created_at?: string
                }
            }
        }
    }
}
