"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PasteData {
  content: string
  createdAt: string
}

export default function ViewPastePage({ params }: { params: { code: string } | Promise<{ code: string }> }) {
  const [code, setCode] = useState<string>("");
  
  const [pasteData, setPasteData] = useState<PasteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Resolve params when component mounts
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params);
      setCode(resolvedParams.code);
    };
    
    resolveParams();
  }, [params]);

  // Only fetch paste when code is available
  useEffect(() => {
    if (!code) return;
    
    const fetchPaste = async () => {
      try {
        const response = await fetch(`/api/paste/${code}`)

        if (response.ok) {
          const data = await response.json()
          setPasteData(data)
        } else if (response.status === 404) {
          setError("Paste not found or expired")
        } else {
          setError("Failed to load paste")
        }
      } catch (err) {
        setError("An error occurred while loading the paste")
      } finally {
        setLoading(false)
      }
    }

    fetchPaste()
  }, [code])

  const copyToClipboard = async () => {
    if (!pasteData) return

    try {
      await navigator.clipboard.writeText(pasteData.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = pasteData.content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading paste...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Paste Code: {code}</span>
              {pasteData && (
                <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-lg">{error}</p>
                <p className="text-gray-600 mt-2">The paste may have expired or the code is invalid.</p>
              </div>
            ) : pasteData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content:</label>
                  <Textarea value={pasteData.content} readOnly className="min-h-[300px] resize-y bg-gray-50" />
                </div>
                <div className="text-sm text-gray-500">Created: {new Date(pasteData.createdAt).toLocaleString()}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
