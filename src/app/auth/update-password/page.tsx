'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            setIsLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
            return
        }

        setSuccess(true)
        setIsLoading(false)

        // Redirect after 2 seconds
        setTimeout(() => {
            router.push('/dashboard')
        }, 2000)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-background to-background"></div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-green-500/20 shadow-xl bg-background/50 backdrop-blur-sm">
                        <CardHeader className="text-center pb-2">
                            <div className="flex justify-center mb-6">
                                <div className="bg-green-500/10 p-4 rounded-full ring-8 ring-green-500/5">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Senha atualizada!</CardTitle>
                            <CardDescription className="text-base pt-2">
                                Sua senha foi alterada com sucesso.
                                <br />Redirecionando para o painel...
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

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
                        <CardTitle className="text-2xl font-bold tracking-tight">Nova Senha</CardTitle>
                        <CardDescription>
                            Digite sua nova senha abaixo
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdatePassword}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-10 bg-background/50 pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        Atualizando...
                                    </div>
                                ) : 'Alterar Senha'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}
