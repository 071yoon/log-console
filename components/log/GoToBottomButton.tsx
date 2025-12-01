'use client'

import { ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface GoToBottomButtonProps {
  isVisible: boolean
  onClick: () => void
}

export function GoToBottomButton({ isVisible, onClick }: GoToBottomButtonProps) {
  if (!isVisible) {
    return null
  }

  return (
    <Button
      size="icon"
      className="absolute bottom-6 right-6 rounded-full"
      onClick={onClick}
    >
      <ArrowDown className="h-4 w-4" />
    </Button>
  )
}
