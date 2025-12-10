'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, ArrowLeft, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
            return
        }

        setSuccess(true)
        setIsLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-background to-background"></div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-blue-500/20 shadow-xl bg-background/50 backdrop-blur-sm">
                        <CardHeader className="text-center pb-2">
                            <div className="flex justify-center mb-6">
                                <div className="bg-blue-500/10 p-4 rounded-full ring-8 ring-blue-500/5">
                                    <Mail className="h-10 w-10 text-blue-500" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
                            <CardDescription className="text-base pt-2">
                                Enviamos um link de recuperação para <strong>{email}</strong>.
                                <br />Clique no link para redefinir sua senha.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-6">
                            <Button asChild className="w-full h-11 text-base" variant="ghost">
                                <Link href="/auth/login">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar para o login
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
            <div className="absolute top-[-10%] right-[-5%] -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px] opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-5%] -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px] opacity-40"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="rounded-lg bg-primary/10 p-1 group-hover:bg-primary/20 transition-colors">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">SimulAI</span>
                    </Link>
                </div>

                <Card className="border-border/50 shadow-xl bg-background/50 backdrop-blur-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">Recuperar Senha</CardTitle>
                        <CardDescription>
                            Digite seu email para receber um link de redefinição
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleReset}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-10 bg-background/50"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-10 font-semibold shadow-lg shadow-primary/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Enviando...
                                    </div>
                                ) : 'Enviar Link de Recuperação'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="mt-8 text-center">
                    <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o login
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
