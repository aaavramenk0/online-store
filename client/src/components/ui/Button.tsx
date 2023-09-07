import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
	'inline-flex box-border items-center  gap-x-3 rounded-[0.5rem] justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none  disabled:pointer-events-none',
	{
		variants: {
			variant: {
				default:
					'text-white  bg-brand-accent focus-visible:shadow focus-visible:bg-brand-accent-darker  hover:shadow hover:bg-brand-accent-darker   disabled:bg-brand-disabled disabled:text-brand-gray',
				secondary:
					'bg-transparent text-brand-accent border border-brand-primary  hover:bg-brand-accent-darker hover:bg-opacity-5 focus-visible:bg-brand-accent-darker focus-visible:bg-opacity-5 focus-visible:border-brand-accent disabled:bg-brand-disabled disabled:text-brand-gray',
				text: ' border-none bg-transparent text-brand-accent hover:bg-brand-accent-darker hover:bg-opacity-5 hover:shadow-md hover:shadow-black/10 focus-visible:bg-brand-accent-darker focus-visible:bg-opacity-5 disabled:bg-transparent disabled:text-brand-gray',
				elevated:'text-brand-accent shadow-md shadow-black/10 bg-white hover:bg-brand-accent-darker hover:bg-opacity-5 focus-visible:bg-brand-accent-darker focus-visible:bg-opacity-5 disabled:bg-brand-disabled disabled:text-brand-gray',
        destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: ' px-5 py-4',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<Comp
				className={cn(
					buttonVariants({ variant, size, className }),
					'button-causten'
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'

export { Button, buttonVariants }
