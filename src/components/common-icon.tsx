import { Badge } from '@/components/ui/badge.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { cn } from '@/utilities/cn.ts'
import { Snowflake, Zap } from 'lucide-react'
import type { ComponentType, FC, SVGProps } from 'react'
import ReactDOMServer from 'react-dom/server'

interface IconInfo {
  Component: ComponentType<SVGProps<SVGSVGElement>>
  colorClass: string
}

// Combine the icon and color information in a single map
const iconMap: Record<string, IconInfo> = {
  solid: { Component: IconBxCubeAlt, colorClass: 'text-(--color-solid)' },
  liquid: { Component: IconBxBxsDroplet, colorClass: 'text-(--color-liquid)' },
  gas: { Component: IconMaterialSymbolsCloud, colorClass: 'text-(--color-gas)' },
  electric: { Component: Zap, colorClass: 'text-(--color-electric)' },
  steam: { Component: IconMaterialSymbolsAir, colorClass: 'text-(--color-steam)' },
  heat: { Component: IconMaterialSymbolsLocalFireDepartmentRounded, colorClass: 'text-(--color-heat)' },
  cooling: { Component: Snowflake, colorClass: 'text-(--color-cooling)' },
} as const

interface CommonIconProps extends SVGProps<SVGSVGElement> {
  type: keyof typeof iconMap
}

export const CommonIcon: FC<CommonIconProps> = ({ type, className, ...others }) => {
  const { Component: IconComponent, colorClass } = iconMap[type] ?? null
  return <IconComponent {...others} className={cn(colorClass, className)} />
}

export const ChemicalSymbol = (symbol: keyof typeof _symbols) => _symbols[symbol]

export const ChemicalSymbolString = (symbol: keyof typeof _symbols) =>
  ReactDOMServer.renderToString(ChemicalSymbol(symbol))

export const ChemicalConvert = (symbol: string) => {
  const parts = symbol.split(/(\d+)/) // This splits by digits and keeps them as separate array elements

  return parts.map(
    (part, index) =>
      /\d/.test(part) ?
        <sub key={index}>{part}</sub> // Render digits as subscript
      : part, // Render letters as normal text
  )
}

const _symbols = {
  CO2: (
    <span>
      CO<sub>2</sub>
    </span>
  ),
  N2O: (
    <span>
      N<sub>2</sub>O
    </span>
  ),
  CH4: (
    <span>
      CH<sub>4</sub>
    </span>
  ),
  CO2E: (
    <span>
      CO<sub>2</sub>e
    </span>
  ),
  KGCO2E: (
    <span>
      <span className='lowercase'>kg</span>CO<sub>2</sub>e
    </span>
  ),
  TONCO2E: (
    <span>
      <span className='lowercase'>t</span>CO<sub>2</sub>e
    </span>
  ),
}

// current GWP using
export const gwp_symbols = ['CO2', 'CH4', 'N2O'] as const

export const StateBadge: FC<{
  type: 'solid' | 'liquid' | 'gas'
  unit: string
  className?: string
}> = ({ type, /*unit,*/ className }) => {
  // TEMP FIX
  // const displayUnit = type === 'gas' ? 'gj' : unit

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant='secondary' className={cn('flex gap-1', className)}>
          <CommonIcon type={type} className='size-5' />
          {/*{displayUnit === 'gj' ? 'GJ' : displayUnit}*/}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side='right'>
        {type}
        {/*{Unit[displayUnit].longName}*/}
      </TooltipContent>
    </Tooltip>
  )
}
