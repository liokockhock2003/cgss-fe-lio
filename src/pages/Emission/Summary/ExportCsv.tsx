import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { type EmissionSummaryTableType, isScopeExist } from '@/pages/Emission/Summary/TableColumnDef.tsx'
import { format } from 'date-fns'
import { CsvOutput, download, mkConfig } from 'export-to-csv'

export const ExportCsv = ({ data }: { data: EmissionSummaryTableType[] }) => {
  const handleExport = () => {
    const title = `Emission-Summary-${format(new Date(), 'ddMMyyyy')}`
    const csvConfig = mkConfig({ fieldSeparator: ',', filename: title, decimalSeparator: '.', title })

    const fyColumns = new Set()
    data.forEach((item) => {
      if (isScopeExist(item)) Object.keys(item.scope).forEach((year) => fyColumns.add(year))
    })

    const sortedFyColumns = Array.from(fyColumns).sort() // ["FY2016", "FY2017", ..., "FY2026"]
    const csvHeader = ['Label', ...sortedFyColumns]

    const csvRows = data.flatMap((item) => {
      const ignoredKeys = ['Sub total', 'TOTAL'] // ignore in csv
      if (ignoredKeys.includes(item.label)) return []

      const subtitle = ['SCOPE1', 'SCOPE2', 'SCOPE3']
      if (subtitle.includes(item.label))
        return [
          ['SCOPE2', 'SCOPE3'].includes(item.label) ?
            [''] // add new empty row
          : [],
          [item.label],
        ]

      const row = [item.label]
      sortedFyColumns.forEach((year) => {
        // @ts-ignore
        row.push(item.scope?.[year] || 0)
      })
      return [row]
    })

    console.log(csvRows)
    const output = [csvHeader, ...csvRows].map((row) => row.join(',')).join('\n')
    download(csvConfig)(output as unknown as CsvOutput)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline' className='text-foreground hover:text-green-500' onClick={handleExport}>
          <IconMaterialSymbolsCsvRounded className='size-5!' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Export CSV</TooltipContent>
    </Tooltip>
  )
}
