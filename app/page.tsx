"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [content, setContent] = useState("")
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewCode, setViewCode] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const { code } = await response.json()
        setGeneratedCode(code)
        setContent("")
      } else {
        alert("Failed to generate code. Please try again.")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (viewCode.trim() && /^\d{4}$/.test(viewCode)) {
      router.push(`/view/${viewCode.trim()}`)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyCode = () => copyToClipboard(generatedCode!)
  const copyViewUrl = () => copyToClipboard(`${window.location.origin}/view/${generatedCode}`)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Copy-Paste Online</CardTitle>
            <CardDescription>
              Share text content with a simple 4-digit code. Pastes expire after 30 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!generatedCode ? (
              <div className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your text content:
                    </label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste or type your content here..."
                      className="min-h-[200px] resize-y"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || !content.trim()} className="w-full">
                    {isLoading ? "Generating..." : "Generate Code"}
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-gray-500">OR</span>
                  </div>
                </div>
                
                <form onSubmit={handleViewCode} className="space-y-4">
                  <div>
                    <label htmlFor="viewCode" className="block text-sm font-medium text-gray-700 mb-2">
                      I have a code:
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="viewCode"
                        value={viewCode}
                        onChange={(e) => setViewCode(e.target.value)}
                        placeholder="Enter 4-digit code"
                        pattern="\d{4}"
                        maxLength={4}
                        className="font-mono text-center text-lg"
                      />
                      <Button type="submit" disabled={!viewCode.trim() || !/^\d{4}$/.test(viewCode)}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-green-600 mb-2">Code Generated!</h2>
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <div className="text-3xl font-mono font-bold text-gray-800 mb-2">{generatedCode}</div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={copyCode} variant="outline" size="sm" className="flex items-center gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy Code
                      </Button>
                      <Button onClick={copyViewUrl} variant="outline" size="sm" className="flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Share this code with others to let them view your content at:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">/view/{generatedCode}</code>
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setGeneratedCode(null)
                    setCopied(false)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Create Another Paste
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
