import { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  borderColor?: string
  className?: string
  onClick?: () => void
}

export default function Card({ children, borderColor = '', className = '', onClick }: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow p-6'
  const cardClasses = `${baseStyles} ${borderColor} ${className}`

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  )
}
